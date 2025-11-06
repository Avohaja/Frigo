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
      const recipeWithStatus = {
        ...recipe,
        isUsed: false // Par défaut, la recette n'est pas utilisée
      };
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeWithStatus)
      });
      const newRecipe = await response.json();
      setRecipes([...recipes, newRecipe]);
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
        body: JSON.stringify(updatedRecipe)
      });
      const updated = await response.json();
      setRecipes(recipes.map(r => r.id === id ? updated : r));
      return updated;
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const toggleRecipeUsage = async (id) => {
    try {
      const recipe = recipes.find(r => r.id === id);
      if (!recipe) return;

      const updatedRecipe = {
        ...recipe,
        isUsed: !recipe.isUsed
      };

      const response = await fetch(`${API_URL}/recipes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRecipe)
      });
      const updated = await response.json();
      setRecipes(recipes.map(r => r.id === id ? updated : r));
      return updated;
    } catch (error) {
      console.error('Error toggling recipe usage:', error);
      throw error;
    }
  };

  const deleteRecipe = async (id) => {
    try {
      await fetch(`${API_URL}/recipes/${id}`, { 
        method: 'DELETE' 
      });
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };

  const getRecipe = (id) => {
    return recipes.find(r => r.id === id);
  };

  // Obtenir les ingrédients manquants des recettes utilisées
  const getUsedRecipesMissingIngredients = () => {
    const usedRecipes = recipes.filter(r => r.isUsed);
    const allMissingIngredients = [];
    
    usedRecipes.forEach(recipe => {
      if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
        recipe.missingIngredients.forEach(ingredient => {
          if (!allMissingIngredients.some(item => item.name.toLowerCase() === ingredient.toLowerCase())) {
            allMissingIngredients.push({
              name: ingredient,
              recipeName: recipe.title
            });
          }
        });
      }
    });
    
    return allMissingIngredients;
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      loading,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      getRecipe,
      fetchRecipes,
      toggleRecipeUsage,
      getUsedRecipesMissingIngredients
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export default RecipeContext;