import React from 'react';
import { ArrowLeft, Clock, Edit2, Trash2 } from 'lucide-react';
import { useRecipes } from './RecipeContext';

function RecipeDetail({ recipeId, onBack, onEdit }) {
  const { getRecipe, deleteRecipe } = useRecipes();
  const recipe = getRecipe(recipeId);

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Retour aux recettes
        </button>
        <div className="text-center py-12 text-gray-500">Recette non trouvée</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-700';
      case 'Moyen': return 'bg-yellow-100 text-yellow-700';
      case 'Difficile': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeft size={20} />
        Retour aux recettes
      </button>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        {recipe.image && (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${recipe.image})` }}
          />
        )}
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{recipe.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  {recipe.time}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {recipe.type}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(recipe.id)}
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium"
              >
                <Edit2 size={18} />
                Modifier
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.title}" ?`)) {
                    deleteRecipe(recipe.id);
                    onBack();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingrédients disponibles</h3>
              <ul className="space-y-2">
                {recipe.availableIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {recipe.missingIngredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingrédients manquants</h3>
                <ul className="space-y-2">
                  {recipe.missingIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Étapes de préparation</h3>
            <div className="space-y-4">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeDetail;