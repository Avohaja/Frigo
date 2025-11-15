import { createContext, useState, useContext, useEffect } from 'react';

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
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Sync recipe with inventory
  const syncRecipeWithInventory = async (recipeId, products) => {
    try {
      const recipe = recipes.find(r => r.id === recipeId);
      if (!recipe) return null;

      // Get all ingredient names from the recipe (both available and missing)
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
      
      // Update local state
      setRecipes(prev => prev.map(r => r.id === recipeId ? savedRecipe : r));
      
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
      throw error;
    }
  };

  // Rest of your existing functions (addRecipe, updateRecipe, deleteRecipe, etc.)
  const addRecipe = async (recipe) => {
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...recipe, isUsed: false }),
      });
      const newRecipe = await response.json();
      await fetchRecipes();
      return newRecipe;
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  };

  const updateRecipe = async (id, updatedRecipe) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecipe),
      });
      const updated = await response.json();
      await fetchRecipes();
      return updated;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await fetch(`${API_URL}/recipes/${id}`, {
        method: 'DELETE',
      });
      await fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };

  const getRecipe = (id) => {
    return recipes.find((r) => r.id === id);
  };

  const toggleRecipeUsage = async (id) => {
    try {
      const response = await fetch(`${API_URL}/recipes/${id}/toggle`, {
        method: 'PATCH',
      });
      const updated = await response.json();
      await fetchRecipes();
      return updated;
    } catch (error) {
      console.error('Error toggling recipe usage:', error);
      throw error;
    }
  };

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
        syncRecipeWithInventory // NEW: Add the sync function
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};