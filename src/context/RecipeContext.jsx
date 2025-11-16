import { createContext, useState, useContext, useEffect } from 'react';
import { useSnackbar } from 'notistack';

const RecipeContext = createContext();
const API_URL = 'http://localhost:5000/api';

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
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

      // Get all ingredient names from the recipe
      const allIngredientNames = [
        ...(recipe.availableIngredients || []).map(ing => ing.name.toLowerCase()),
        ...(recipe.missingIngredients || []).map(ing => ing.name.toLowerCase())
      ];

      // Check inventory for each ingredient
      const updatedAvailableIngredients = [];
      const updatedMissingIngredients = [];

      allIngredientNames.forEach(ingredientName => {
        const productInInventory = products.find(p =>
          p.name.toLowerCase().includes(ingredientName) ||
          ingredientName.includes(p.name.toLowerCase())
        );

        if (productInInventory && productInInventory.quantity.value > 0) {
          // Ingredient found in inventory
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
          // Ingredient not found in inventory
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

      // Update the recipe with new ingredient lists
      const updatedRecipe = {
        ...recipe,
        availableIngredients: updatedAvailableIngredients,
        missingIngredients: updatedMissingIngredients
      };

      // Save to backend
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
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recipe, isUsed: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newRecipe = await response.json();
      await fetchRecipes();
      enqueueSnackbar('Recipe added successfully!', { variant: 'success' });
      return newRecipe;
    } catch (error) {
      console.error('Error adding recipe:', error);
      enqueueSnackbar('Failed to add recipe.', { variant: 'error' });
      throw error;
    }
  };

  // Update a recipe
  const updateRecipe = async (id, updatedRecipe) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecipe),
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
