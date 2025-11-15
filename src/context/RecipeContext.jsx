import { createContext, useState, useContext, useEffect } from 'react';

const RecipeContext = createContext();
const API_URL = 'http://localhost:5000/api';
const JSON_URL = 'http://localhost:5001';

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

  // Fetch recipes from API on mount
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
    //ajout dans le fichier json local

    console.log("Ajout de la recette dans le fichier json de la base local : ", recipe);
    console.log("Ingrédient manquant de la recette : ", recipe.missingIngredients);
    console.log("Ingrédient disponible de la recette : ", recipe.availableIngredients);
    console.log("Étapes de la recette : ", recipe.steps);

    try {
      const res = await fetch(`${JSON_URL}/recipes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(recipe)
      });

      const saved = await res.json();
      console.log("Recette ajoutée dans le fichier json : ", saved);
    } catch (err) {
      console.log("Ërreur lors de l'ajout de la recette dans le fichier json : ", err)
    };

    //ajout dans la base de données
    try {
      const response = await fetch(`${API_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe)
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

  return (
    <RecipeContext.Provider value={{
      recipes,
      loading,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      getRecipe,
      fetchRecipes
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export default RecipeContext;