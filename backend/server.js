/* eslint-disable no-undef */
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ==================== PRODUCTS ROUTES ====================

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY expiration ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET one product
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE product
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, expiration, quantity, status } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, category, expiration, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category, expiration, quantity, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, expiration, quantity, status } = req.body;
    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, expiration = $3, quantity = $4, status = $5 WHERE id = $6 RETURNING *',
      [name, category, expiration, quantity, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== RECIPES ROUTES ====================

// GET all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM recipes ORDER BY created_at DESC');
    
    // Get ingredients and steps for each recipe
    const recipes = await Promise.all(result.rows.map(async (recipe) => {
      const ingredients = await pool.query(
        'SELECT ingredient_name, is_available FROM recipe_ingredients WHERE recipe_id = $1',
        [recipe.id]
      );
      const steps = await pool.query(
        'SELECT description FROM recipe_steps WHERE recipe_id = $1 ORDER BY step_number',
        [recipe.id]
      );
      
      return {
        ...recipe,
        availableIngredients: ingredients.rows.filter(i => i.is_available).map(i => i.ingredient_name),
        missingIngredients: ingredients.rows.filter(i => !i.is_available).map(i => i.ingredient_name),
        steps: steps.rows.map(s => s.description)
      };
    }));
    
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE recipe
app.post('/api/recipes', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { title, image, type, time, difficulty, availableIngredients, missingIngredients, steps } = req.body;
    
    // Insert recipe
    const recipeResult = await client.query(
      'INSERT INTO recipes (title, image, type, time, difficulty) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, image, type, time, difficulty]
    );
    const recipeId = recipeResult.rows[0].id;
    
    // Insert available ingredients
    for (const ingredient of availableIngredients || []) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, is_available) VALUES ($1, $2, $3)',
        [recipeId, ingredient, true]
      );
    }
    
    // Insert missing ingredients
    for (const ingredient of missingIngredients || []) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, is_available) VALUES ($1, $2, $3)',
        [recipeId, ingredient, false]
      );
    }
    
    // Insert steps
    for (let i = 0; i < (steps || []).length; i++) {
      await client.query(
        'INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES ($1, $2, $3)',
        [recipeId, i + 1, steps[i]]
      );
    }
    
    await client.query('COMMIT');
    res.json(recipeResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// UPDATE recipe
app.put('/api/recipes/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { title, image, type, time, difficulty, availableIngredients, missingIngredients, steps } = req.body;
    
    // Update recipe
    const recipeResult = await client.query(
      'UPDATE recipes SET title = $1, image = $2, type = $3, time = $4, difficulty = $5 WHERE id = $6 RETURNING *',
      [title, image || '', type, time, difficulty, id]
    );
    
    if (recipeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Delete old ingredients and steps
    await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [id]);
    await client.query('DELETE FROM recipe_steps WHERE recipe_id = $1', [id]);
    
    // Insert new available ingredients
    for (const ingredient of availableIngredients || []) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, is_available) VALUES ($1, $2, $3)',
        [id, ingredient, true]
      );
    }
    
    // Insert new missing ingredients
    for (const ingredient of missingIngredients || []) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, is_available) VALUES ($1, $2, $3)',
        [id, ingredient, false]
      );
    }
    
    // Insert new steps
    for (let i = 0; i < (steps || []).length; i++) {
      await client.query(
        'INSERT INTO recipe_steps (recipe_id, step_number, description) VALUES ($1, $2, $3)',
        [id, i + 1, steps[i]]
      );
    }
    
    await client.query('COMMIT');
    res.json(recipeResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// DELETE recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM recipes WHERE id = $1', [id]);
    res.json({ message: 'Recipe deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});