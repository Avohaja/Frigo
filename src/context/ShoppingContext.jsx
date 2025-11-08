import { createContext, useContext, useState } from 'react';

const ShoppingContext = createContext();

export const ShoppingProvider = ({ children }) => {
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  const toggleRecipe = (recipe) => {
    setSelectedRecipes(prevSelected => {
      const isSelected = prevSelected.some(r => r.id === recipe.id);
      if (isSelected) {
        return prevSelected.filter(r => r.id !== recipe.id);
      } else {
        return [...prevSelected, recipe];
      }
    });
  };

  const isRecipeSelected = (recipeId) => {
    return selectedRecipes.some(r => r.id === recipeId);
  };

  const getMissingIngredients = () => {
    const missingIngredients = [];
    selectedRecipes.forEach(recipe => {
      if (recipe.missingIngredients && recipe.missingIngredients.length > 0) {
        recipe.missingIngredients.forEach(ingredient => {
          if (!missingIngredients.some(item => item.name === ingredient.name)) {
            missingIngredients.push({
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
    return missingIngredients;
  };

  return (
    <ShoppingContext.Provider value={{ selectedRecipes, toggleRecipe, isRecipeSelected, getMissingIngredients }}>
      {children}
    </ShoppingContext.Provider>
  );
};

export const useShoppingList = () => {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShoppingList must be used within ShoppingProvider');
  }
  return context;
};
