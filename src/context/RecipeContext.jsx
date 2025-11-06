import { createContext, useState, useEffect, useContext } from "react";

const RecipeContext = createContext();
const API_URL = "http://localhost:5000/api";

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) throw new Error("useRecipes must be used within a RecipeProvider");
  return context;
};

export const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  // Fetch all recipes from backend
  const fetchRecipes = async () => {
    try {
      const res = await fetch(`${API_URL}/recipes`);
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("Error fetching recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new recipe
  const addRecipe = async (recipe) => {
    try {
      const res = await fetch(`${API_URL}/recipes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      const newRecipe = await res.json();
      // Refetch pour obtenir la recette complète avec tous les détails
      await fetchRecipes();
    } catch (err) {
      console.error("Error adding recipe:", err);
    }
  };

  // Update a recipe
  const updateRecipe = async (id, updatedRecipe) => {
    try {
      const res = await fetch(`${API_URL}/recipes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecipe),
      });
      const updated = await res.json();
      // Refetch pour obtenir toutes les recettes mises à jour
      await fetchRecipes();
    } catch (err) {
      console.error("Error updating recipe:", err);
    }
  };

  // Delete a recipe
  const deleteRecipe = async (id) => {
    try {
      await fetch(`${API_URL}/recipes/${id}`, { method: "DELETE" });
      setRecipes(recipes.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting recipe:", err);
    }
  };

  // Get one recipe (already loaded)
  const getRecipe = (id) => recipes.find((r) => r.id === parseInt(id));

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        getRecipe,
        loading
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};