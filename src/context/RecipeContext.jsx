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
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export default RecipeContext;
