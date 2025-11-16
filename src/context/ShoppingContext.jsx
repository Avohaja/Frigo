import { createContext, useContext, useState } from 'react';
import { useSnackbar } from 'notistack';

const ShoppingContext = createContext();

export const ShoppingProvider = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  // Toggle recipe selection and show notification
  const toggleRecipe = (recipe) => {
    setSelectedRecipes(prevSelected => {
      const isSelected = prevSelected.some(r => r.id === recipe.id);
      if (isSelected) {
        enqueueSnackbar(`"${recipe.title}" removed from your shopping list`, {
          variant: 'info',
          autoHideDuration: 2000
        });
        return prevSelected.filter(r => r.id !== recipe.id);
      } else {
        enqueueSnackbar(`"${recipe.title}" added to your shopping list`, {
          variant: 'success',
          autoHideDuration: 2000
        });
        return [...prevSelected, recipe];
      }
    });
  };

  // Check if a recipe is selected
  const isRecipeSelected = (recipeId) => {
    return selectedRecipes.some(r => r.id === recipeId);
  };

  // Get missing ingredients from selected recipes
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

    // Show notification if missing ingredients are found
    if (missingIngredients.length > 0) {
      enqueueSnackbar(`Found ${missingIngredients.length} missing ingredient(s) for your selected recipes`, {
        variant: 'warning',
        autoHideDuration: 3000
      });
    } else if (selectedRecipes.length > 0) {
      enqueueSnackbar('All ingredients are available for your selected recipes!', {
        variant: 'success',
        autoHideDuration: 3000
      });
    }

    return missingIngredients;
  };

  // Clear all selected recipes
  const clearShoppingList = () => {
    if (selectedRecipes.length > 0) {
      setSelectedRecipes([]);
      enqueueSnackbar('Shopping list cleared', {
        variant: 'info',
        autoHideDuration: 2000
      });
    }
  };

  // Remove a specific recipe from the shopping list
  const removeRecipe = (recipeId) => {
    const recipeToRemove = selectedRecipes.find(r => r.id === recipeId);
    if (recipeToRemove) {
      setSelectedRecipes(prevSelected => prevSelected.filter(r => r.id !== recipeId));
      enqueueSnackbar(`"${recipeToRemove.title}" removed from your shopping list`, {
        variant: 'info',
        autoHideDuration: 2000
      });
    }
  };

  return (
    <ShoppingContext.Provider value={{
      selectedRecipes,
      toggleRecipe,
      isRecipeSelected,
      getMissingIngredients,
      clearShoppingList,
      removeRecipe
    }}>
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
