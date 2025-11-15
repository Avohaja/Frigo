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
    
    // Parse quantity if it's stored as JSON string
    const products = result.rows.map(product => {
      let quantity = product.quantity;
      
      // If quantity is a string, try to parse it as JSON
      if (typeof quantity === 'string') {
        try {
          quantity = JSON.parse(quantity);
        } catch (e) {
          // If parsing fails, keep it as string or convert to object
          quantity = { value: parseInt(quantity) || 0, unit: 'unité' };
        }
      }
      
      return {
        ...product,
        quantity: quantity
      };
    });
    
    res.json(products);
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
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    let product = result.rows[0];
    let quantity = product.quantity;
    
    // Parse quantity if it's stored as JSON string
    if (typeof quantity === 'string') {
      try {
        quantity = JSON.parse(quantity);
      } catch (e) {
        quantity = { value: parseInt(quantity) || 0, unit: 'unité' };
      }
    }
    
    product.quantity = quantity;
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE product
app.post('/api/products', async (req, res) => {
  try {
    const { name, category, expiration, quantity, status } = req.body;
    
    // Handle quantity as JSON object
    let quantityValue;
    if (typeof quantity === 'object' && quantity !== null) {
      quantityValue = quantity;
    } else {
      // If quantity is not an object, create one
      quantityValue = { value: parseInt(quantity) || 1, unit: 'unité' };
    }
    
    const result = await pool.query(
      'INSERT INTO products (name, category, expiration, quantity, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, category, expiration, quantityValue, status || 'fresh']
    );
    
    // Parse quantity for response
    let responseProduct = result.rows[0];
    if (typeof responseProduct.quantity === 'string') {
      try {
        responseProduct.quantity = JSON.parse(responseProduct.quantity);
      } catch (e) {
        responseProduct.quantity = quantityValue;
      }
    }
    
    res.json(responseProduct);
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
    
    // Handle quantity as JSON object
    let quantityValue;
    if (typeof quantity === 'object' && quantity !== null) {
      quantityValue = quantity;
    } else {
      quantityValue = { value: parseInt(quantity) || 1, unit: 'unité' };
    }
    
    const result = await pool.query(
      'UPDATE products SET name = $1, category = $2, expiration = $3, quantity = $4, status = $5 WHERE id = $6 RETURNING *',
      [name, category, expiration, quantityValue, status || 'fresh', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Parse quantity for response
    let responseProduct = result.rows[0];
    if (typeof responseProduct.quantity === 'string') {
      try {
        responseProduct.quantity = JSON.parse(responseProduct.quantity);
      } catch (e) {
        responseProduct.quantity = quantityValue;
      }
    }
    
    console.log(responseProduct);
    res.json(responseProduct);
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

// UPDATE product quantity only
app.patch('/api/products/:id/quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    
    console.log('PATCH /api/products/:id/quantity - ID:', id);
    console.log('Received quantity:', quantity);
    
    // Vérifiez que la quantité est un objet JSON valide
    if (!quantity || typeof quantity !== 'object') {
      return res.status(400).json({ error: 'Invalid quantity format' });
    }
    
    const result = await pool.query(
      'UPDATE products SET quantity = $1 WHERE id = $2 RETURNING *',
      [quantity, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Parse quantity for response
    let responseProduct = result.rows[0];
    if (typeof responseProduct.quantity === 'string') {
      try {
        responseProduct.quantity = JSON.parse(responseProduct.quantity);
      } catch (e) {
        responseProduct.quantity = quantity;
      }
    }
    
    console.log('Product updated:', responseProduct);
    res.json(responseProduct);
  } catch (err) {
    console.error('Error in PATCH /api/products/:id/quantity:', err);
    res.status(500).json({ error: 'Server error: ' + err.message });
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
        isUsed: recipe.is_used,
        availableIngredients: ingredients.rows.filter(i => i.is_available).map(i => ({ name: i.ingredient_name })),
        missingIngredients: ingredients.rows.filter(i => !i.is_available).map(i => ({ name: i.ingredient_name, quantity: '' })),
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
      'INSERT INTO recipes (title, image, type, time, difficulty, is_used) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, image, type, time, difficulty, false]
    );
    const recipeId = recipeResult.rows[0].id;

    // Insert available ingredients
    for (const ingredient of availableIngredients || []) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, is_available) VALUES ($1, $2, $3)',
        [recipeId, ingredient.name, true]
      );
    }

    // Insert missing ingredients
    for (const ingredient of missingIngredients || []) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, is_available) VALUES ($1, $2, $3)',
        [recipeId, ingredient.name, false]
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
    
    // Return the complete recipe
    const completeRecipe = {
      ...recipeResult.rows[0],
      isUsed: false,
      availableIngredients: availableIngredients || [],
      missingIngredients: missingIngredients || [],
      steps: steps || []
    };
    
    res.json(completeRecipe);
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
    const { title, image, type, time, difficulty, availableIngredients, missingIngredients, steps, isUsed } = req.body;

    // Update recipe
    const recipeResult = await client.query(
      'UPDATE recipes SET title = $1, image = $2, type = $3, time = $4, difficulty = $5, is_used = $6 WHERE id = $7 RETURNING *',
      [title, image || '', type, time, difficulty, isUsed, id]
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
        [id, ingredient.name, true]
      );
    }

    // Insert new missing ingredients
    for (const ingredient of missingIngredients || []) {
      await client.query(
        'INSERT INTO recipe_ingredients (recipe_id, ingredient_name, is_available) VALUES ($1, $2, $3)',
        [id, ingredient.name, false]
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
    
    // Return complete updated recipe
    const completeRecipe = {
      ...recipeResult.rows[0],
      isUsed: isUsed,
      availableIngredients: availableIngredients || [],
      missingIngredients: missingIngredients || [],
      steps: steps || []
    };
    
    console.log(completeRecipe);
    res.json(completeRecipe);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// TOGGLE recipe usage
app.patch('/api/recipes/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'UPDATE recipes SET is_used = NOT is_used WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Add these routes to your server.js file

const fs = require('fs');
const path = require('path');

const NOTIFICATIONS_FILE = path.join(__dirname, 'notifications.json');

// Helper function to read notifications from file
const readNotificationsFromFile = () => {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading notifications file:', error);
  }
  return [];
};

// Helper function to write notifications to file
const writeNotificationsToFile = (notifications) => {
  try {
    // Keep only the 30 most recent notifications
    const recentNotifications = notifications
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30);
    
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(recentNotifications, null, 2));
    return recentNotifications;
  } catch (error) {
    console.error('Error writing notifications file:', error);
    throw error;
  }
};

// ==================== NOTIFICATIONS ROUTES ====================

// GET all notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = readNotificationsFromFile();
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE or UPDATE notifications (this will be called by your frontend to generate notifications)
app.post('/api/notifications/generate', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products');
    
    const existingNotifications = readNotificationsFromFile();
    const now = new Date().toISOString();
    
    // Generate new notifications based on products
    const newNotifications = products.rows
      .map(product => {
        const today = new Date();
        const expirationDate = new Date(product.expiration);
        const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
        
        // Handle quantity as object or number
        const quantityValue = typeof product.quantity === 'object' 
          ? product.quantity.value 
          : parseInt(product.quantity) || 0;
        
        const notifications = [];
        
        // Expired notification
        if (daysUntilExpiration < 0) {
          notifications.push({
            id: `exp-${product.id}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            icon: 'alert',
            title: `${product.name} a expiré`,
            message: `Le produit ${product.name} a expiré le ${expirationDate.toLocaleDateString('fr-FR')}`,
            date: expirationDate.toLocaleDateString('fr-FR'),
            read: false,
            type: 'expired',
            priority: 3,
            createdAt: now,
            updatedAt: now
          });
        } 
        // Expiring soon notification
        else if (daysUntilExpiration <= 3) {
          notifications.push({
            id: `expiring-${product.id}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            icon: 'clock',
            title: `${product.name} expire bientôt`,
            message: `${product.name} expire dans ${daysUntilExpiration} jour${daysUntilExpiration > 1 ? 's' : ''}`,
            date: expirationDate.toLocaleDateString('fr-FR'),
            read: false,
            type: 'expiring',
            priority: 2,
            createdAt: now,
            updatedAt: now
          });
        }
        
        // Low stock notification
        if (quantityValue <= 2) {
          notifications.push({
            id: `stock-${product.id}-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            icon: 'package',
            title: `Stock faible - ${product.name}`,
            message: `Il ne reste que ${quantityValue} ${typeof product.quantity === 'object' ? product.quantity.unit : 'unité(s)'} de ${product.name}`,
            date: today.toLocaleDateString('fr-FR'),
            read: false,
            type: 'low-stock',
            priority: 1,
            createdAt: now,
            updatedAt: now
          });
        }
        
        return notifications;
      })
      .flat()
      .filter(Boolean);
    
    // Combine with existing notifications and keep only 30 most recent
    const allNotifications = [...newNotifications, ...existingNotifications];
    const updatedNotifications = writeNotificationsToFile(allNotifications);
    
    res.json(updatedNotifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// MARK notification as read
app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    
    const notifications = readNotificationsFromFile();
    const notificationIndex = notifications.findIndex(n => n.id === id);
    
    if (notificationIndex === -1) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    notifications[notificationIndex].read = read;
    notifications[notificationIndex].updatedAt = new Date().toISOString();
    
    const updatedNotifications = writeNotificationsToFile(notifications);
    res.json(updatedNotifications.find(n => n.id === id));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// MARK all notifications as read
app.patch('/api/notifications/read-all', async (req, res) => {
  try {
    const notifications = readNotificationsFromFile();
    
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true,
      updatedAt: new Date().toISOString()
    }));
    
    writeNotificationsToFile(updatedNotifications);
    res.json({ message: 'All notifications marked as read', count: updatedNotifications.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE notification
app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notifications = readNotificationsFromFile();
    const filteredNotifications = notifications.filter(n => n.id !== id);
    
    writeNotificationsToFile(filteredNotifications);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CLEAR all notifications
app.delete('/api/notifications', async (req, res) => {
  try {
    writeNotificationsToFile([]);
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});