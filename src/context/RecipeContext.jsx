import { createContext, useState, useContext, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const RecipeContext = createContext();
const API_URL = 'http://localhost:5000/api';
const DB_PATH = '../data/myDb.json';

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

// Fonction utilitaire pour lire le fichier JSON
const readJsonFile = async () => {
  try {
    const response = await fetch(DB_PATH);
    if (!response.ok) {
      throw new Error('Failed to read JSON file');
    }
    return await response.json();
  } catch (error) {
    console.error('Error reading JSON file:', error);
    return { recipes: [], recipe_ingredients: [], recipe_steps: [], products: [] };
  }
};

// Fonction utilitaire pour écrire dans le fichier JSON
const writeJsonFile = async (data) => {
  try {
    // En développement, vous devrez utiliser un endpoint backend pour écrire le fichier
    const response = await fetch(`${API_URL}/db/write`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to write to JSON file');
    }
    return true;
  } catch (error) {
    console.error('Error writing to JSON file:', error);
    throw error;
  }
};

export const RecipeProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/recipes`);
      const data = await response.json();
      setRecipes(data);
      enqueueSnackbar('Recipes loaded successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error fetching recipes:', error);
      enqueueSnackbar('Failed to load recipes.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Sync recipe with inventory
  const syncRecipeWithInventory = async (recipeId, products) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) {
        enqueueSnackbar('Recipe not found.', { variant: 'error' });
        return null;
      }

      const allIngredientNames = [
        ...(recipe.availableIngredients || []).map(ing => ing.name.toLowerCase()),
        ...(recipe.missingIngredients || []).map(ing => ing.name.toLowerCase())
      ];

      const updatedAvailableIngredients = [];
      const updatedMissingIngredients = [];

      allIngredientNames.forEach(ingredientName => {
        const productInInventory = products.find(p =>
          p.name.toLowerCase().includes(ingredientName) ||
          ingredientName.includes(p.name.toLowerCase())
        );

        if (productInInventory && productInInventory.quantity.value > 0) {
          const existingIngredient = recipe.availableIngredients?.find(ing =>
            ing.name.toLowerCase() === ingredientName
          ) || recipe.missingIngredients?.find(ing =>
            ing.name.toLowerCase() === ingredientName
          );

          updatedAvailableIngredients.push({
            name: existingIngredient?.name || ingredientName,
            quantity: existingIngredient?.quantity || productInInventory.quantity
          });
        } else {
          const existingIngredient = recipe.missingIngredients?.find(ing =>
            ing.name.toLowerCase() === ingredientName
          ) || recipe.availableIngredients?.find(ing =>
            ing.name.toLowerCase() === ingredientName
          );

          if (existingIngredient) {
            updatedMissingIngredients.push(existingIngredient);
          }
        }
      });

      const updatedRecipe = {
        ...recipe,
        availableIngredients: updatedAvailableIngredients,
        missingIngredients: updatedMissingIngredients
      };

      // 1. Enregistrer dans myDb.json
      const dbData = await readJsonFile();
      const recipeIndex = dbData.recipes.findIndex(r => r.id === recipeId);
      if (recipeIndex !== -1) {
        dbData.recipes[recipeIndex] = updatedRecipe;
        await writeJsonFile(dbData);
      }

      // 2. Envoyer au backend
      const response = await fetch(`${API_URL}/recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecipe)
      });

      if (!response.ok) {
        throw new Error('Failed to update recipe');
      }

      const savedRecipe = await response.json();
      setRecipes(prev => prev.map(r => r.id === recipeId ? savedRecipe : r));
      enqueueSnackbar('Recipe synced with inventory successfully!', { variant: 'success' });

      return {
        recipe: savedRecipe,
        changes: {
          addedToAvailable: updatedAvailableIngredients.filter(ing =>
            !recipe.availableIngredients?.some(oldIng => oldIng.name.toLowerCase() === ing.name.toLowerCase())
          ),
          movedToMissing: updatedMissingIngredients.filter(ing =>
            !recipe.missingIngredients?.some(oldIng => oldIng.name.toLowerCase() === ing.name.toLowerCase())
          )
        }
      };
    } catch (error) {
      console.error('Error syncing recipe with inventory:', error);
      enqueueSnackbar('Failed to sync recipe with inventory.', { variant: 'error' });
      throw error;
    }
  };

  // Add a new recipe
  const addRecipe = async (recipe) => {
    try {
      const newRecipe = { 
        ...recipe, 
        isUsed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // 1. Enregistrer dans myDb.json
      const dbData = await readJsonFile();
      const newId = Math.max(...dbData.recipes.map(r => r.id), 0) + 1;
      const recipeWithId = { ...newRecipe, id: newId };
      dbData.recipes.push(recipeWithId);
      await writeJsonFile(dbData);

      // 2. Envoyer au backend
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeWithId),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedRecipe = await response.json();
      await fetchRecipes();
      enqueueSnackbar('Recipe added successfully!', { variant: 'success' });
      return savedRecipe;
    } catch (error) {
      console.error('Error adding recipe:', error);
      enqueueSnackbar('Failed to add recipe.', { variant: 'error' });
      throw error;
    }
  };

  // Update a recipe
  const updateRecipe = async (id, updatedRecipe) => {
    try {
      const recipeWithTimestamp = {
        ...updatedRecipe,
        updated_at: new Date().toISOString()
      };

      // 1. Enregistrer dans myDb.json
      const dbData = await readJsonFile();
      const recipeIndex = dbData.recipes.findIndex(r => r.id === id);
      if (recipeIndex !== -1) {
        dbData.recipes[recipeIndex] = { ...dbData.recipes[recipeIndex], ...recipeWithTimestamp };
        await writeJsonFile(dbData);
      }

      // 2. Envoyer au backend
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeWithTimestamp),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updated = await response.json();
      await fetchRecipes();
      enqueueSnackbar('Recipe updated successfully!', { variant: 'success' });
      return updated;
    } catch (error) {
      console.error('Error updating recipe:', error);
      enqueueSnackbar('Failed to update recipe.', { variant: 'error' });
      throw error;
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id) => {
    try {
      // 1. Supprimer de myDb.json
      const dbData = await readJsonFile();
      dbData.recipes = dbData.recipes.filter(r => r.id !== id);
      dbData.recipe_ingredients = dbData.recipe_ingredients.filter(ri => ri.recipe_id !== id);
      dbData.recipe_steps = dbData.recipe_steps.filter(rs => rs.recipe_id !== id);
      await writeJsonFile(dbData);

      // 2. Supprimer du backend
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchRecipes();
      enqueueSnackbar('Recipe deleted successfully!', { variant: 'success' });
    } catch (error) {
      console.error('Error deleting recipe:', error);
      enqueueSnackbar('Failed to delete recipe.', { variant: 'error' });
      throw error;
    }
  };

  // Toggle recipe usage
  const toggleRecipeUsage = async (id) => {
    try {
      // 1. Mettre à jour dans myDb.json
      const dbData = await readJsonFile();
      const recipeIndex = dbData.recipes.findIndex(r => r.id === id);
      if (recipeIndex !== -1) {
        dbData.recipes[recipeIndex].is_used = !dbData.recipes[recipeIndex].is_used;
        dbData.recipes[recipeIndex].updated_at = new Date().toISOString();
        await writeJsonFile(dbData);
      }

      // 2. Envoyer au backend
      const response = await fetch(`${API_URL}/recipes/${id}/toggle`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updated = await response.json();
      await fetchRecipes();
      enqueueSnackbar('Recipe usage toggled successfully!', { variant: 'success' });
      return updated;
    } catch (error) {
      console.error('Error toggling recipe usage:', error);
      enqueueSnackbar('Failed to toggle recipe usage.', { variant: 'error' });
      throw error;
    }
  };

  // Get missing ingredients from used recipes
  const getUsedRecipesMissingIngredients = () => {
    const usedRecipes = recipes.filter((r) => r.isUsed);
    const allMissingIngredients = [];

    usedRecipes.forEach((recipe) => {
      if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
        recipe.missingIngredients.forEach((ingredient) => {
          if (
            !allMissingIngredients.some(
              (item) => item.name.toLowerCase() === ingredient.name.toLowerCase()
            )
          ) {
            allMissingIngredients.push({
              id: `${recipe.id}-${ingredient.name}`,
              name: ingredient.name,
              quantity: ingredient.quantity || "Quantité non spécifiée",
              recipeId: recipe.id,
              recipeName: recipe.title
            });
          }
        });
      }
    });

    return allMissingIngredients;
  };

  // Get a recipe by ID
  const getRecipe = (id) => {
    return recipes.find((r) => r.id === id);
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        loading,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipe,
        fetchRecipes,
        toggleRecipeUsage,
        getUsedRecipesMissingIngredients,
        syncRecipeWithInventory
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};