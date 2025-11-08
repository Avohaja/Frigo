import { createContext, useState, useContext } from 'react';

const ShoppingContext = createContext();

export const useShoppingList = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingProvider');
  }
  return context;
};

export const ShoppingProvider = ({ children }) => {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [manualItems, setManualItems] = useState([]);

  const toggleRecipe = (recipe) => {
    setSelectedRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id);
      if (exists) {
        return prev.filter(r => r.id !== recipe.id);
      } else {
        return [...prev, recipe];
      }
    });
  };

  const isRecipeSelected = (recipeId) => {
    return selectedRecipes.some(r => r.id === recipeId);
  };

  const getMissingIngredients = () => {
    const ingredients = [];
    selectedRecipes.forEach(recipe => {
      (recipe.missingIngredients || []).forEach(ingredient => {
        if (!ingredients.find(i => i.name.toLowerCase() === ingredient.toLowerCase())) {
          ingredients.push({
            id: `${recipe.id}-${ingredient}`,
            name: ingredient,
            recipeId: recipe.id,
            recipeName: recipe.title
          });
        }
      });
    });
    return ingredients;
  };

  const addManualItem = (item) => {
    setManualItems(prev => [...prev, { ...item, id: Date.now(), manual: true }]);
  };

  const removeManualItem = (id) => {
    setManualItems(prev => prev.filter(item => item.id !== id));
  };

  const clearAll = () => {
    setSelectedRecipes([]);
    setManualItems([]);
  };

  return (
    <ShoppingContext.Provider value={{
      selectedRecipes,
      manualItems,
      toggleRecipe,
      isRecipeSelected,
      getMissingIngredients,
      addManualItem,
      removeManualItem,
      clearAll
    }}>
      {children}
    </ShoppingContext.Provider>
  );
};