import React, { useState } from 'react';
import { RecipeProvider } from '../../context/RecipeContext';
import RecipeList from './RecipeList';
import RecipeForm from './RecipeForm';
import RecipeDetail from './RecipeDetail';

function Recipes() {
  const [view, setView] = useState('list'); // 'list', 'add', 'edit', 'detail'
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  const handleAddRecipe = () => {
    setSelectedRecipeId(null);
    setView('add');
  };

  const handleEditRecipe = (id) => {
    setSelectedRecipeId(id);
    setView('edit');
  };

  const handleViewRecipe = (id) => {
    setSelectedRecipeId(id);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedRecipeId(null);
  };

  return (
    <RecipeProvider>
      <div className="min-h-screen bg-gray-50">
        {view === 'list' && (
          <RecipeList 
            onAddRecipe={handleAddRecipe}
            onEditRecipe={handleEditRecipe}
            onViewRecipe={handleViewRecipe}
          />
        )}
        {view === 'add' && (
          <RecipeForm 
            onBack={handleBack}
          />
        )}
        {view === 'edit' && (
          <RecipeForm 
            recipeId={selectedRecipeId}
            onBack={handleBack}
          />
        )}
        {view === 'detail' && (
          <RecipeDetail 
            recipeId={selectedRecipeId}
            onBack={handleBack}
            onEdit={handleEditRecipe}
          />
        )}
      </div>
    </RecipeProvider>
  );
}

export default Recipes;