import React, { useState } from 'react';
import { Search, Edit2, Trash2, ChevronDown, Plus, Clock, Check } from 'lucide-react';
import { useRecipes } from '../../context/RecipeContext';

function RecipeList({ onAddRecipe, onEditRecipe, onViewRecipe }) {
  const { recipes, deleteRecipe, toggleRecipeUsage } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  const types = ['all', ...new Set(recipes.map(r => r.type))];
  const difficulties = ['all', 'Facile', 'Moyen', 'Difficile'];

  const getFilteredRecipes = () => {
    return recipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || r.difficulty === filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-700';
      case 'Moyen': return 'bg-yellow-100 text-yellow-700';
      case 'Difficile': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleToggleUsage = async (e, recipeId) => {
    e.stopPropagation();
    try {
      await toggleRecipeUsage(recipeId);
    } catch (error) {
      alert('Erreur lors de la mise à jour de la recette');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Recettes</h2>
          <p className="text-gray-600">Découvrez et gérez vos recettes favorites. Cochez celles que vous utilisez pour ajouter automatiquement les ingrédients manquants à votre liste de courses.</p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowDifficultyDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {filterType === 'all' ? 'Tous les types' : filterType}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              
              {showTypeDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setShowTypeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        filterType === type ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {type === 'all' ? 'Tous les types' : type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowDifficultyDropdown(!showDifficultyDropdown);
                  setShowTypeDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {filterDifficulty === 'all' ? 'Toutes difficultés' : filterDifficulty}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              
              {showDifficultyDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => {
                        setFilterDifficulty(difficulty);
                        setShowDifficultyDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        filterDifficulty === difficulty ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {difficulty === 'all' ? 'Toutes difficultés' : difficulty}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={onAddRecipe}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            <Plus size={20} />
            Ajouter Recette
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredRecipes().length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              Aucune recette trouvée
            </div>
          ) : (
            getFilteredRecipes().map((recipe) => (
              <div 
                key={recipe.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all ${
                  recipe.isUsed ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div 
                  className="h-48 bg-cover bg-center cursor-pointer relative"
                  style={{ backgroundImage: `url(${recipe.image})` }}
                  onClick={() => onViewRecipe(recipe.id)}
                >
                  {recipe.isUsed && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Check size={14} />
                      En cours
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {/* Checkbox pour marquer comme utilisé */}
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={(e) => handleToggleUsage(e, recipe.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                        recipe.isUsed 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        recipe.isUsed ? 'border-white bg-white' : 'border-gray-400'
                      }`}>
                        {recipe.isUsed && <Check size={12} className="text-green-500" />}
                      </div>
                      {recipe.isUsed ? 'Utilisée' : 'Utiliser'}
                    </button>
                  </div>

                  <h3 
                    className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-green-600"
                    onClick={() => onViewRecipe(recipe.id)}
                  >
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {recipe.time}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{recipe.type}</p>
                  
                  {/* Afficher les ingrédients manquants si la recette est utilisée */}
                  {recipe.isUsed && recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-xs font-semibold text-orange-700 mb-1">Ingrédients manquants ajoutés à la liste de courses:</p>
                      <p className="text-xs text-orange-600">{recipe.missingIngredients.slice(0, 3).join(', ')}{recipe.missingIngredients.length > 3 ? '...' : ''}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onViewRecipe(recipe.id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"
                    >
                      Voir détails
                    </button>
                    <button 
                      onClick={() => onEditRecipe(recipe.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.title}" ?`)) {
                          deleteRecipe(recipe.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          {getFilteredRecipes().length} recette(s) affichée(s) sur {recipes.length} total
          {recipes.filter(r => r.isUsed).length > 0 && (
            <span className="ml-4 text-green-600 font-medium">
              • {recipes.filter(r => r.isUsed).length} recette(s) en cours d'utilisation
            </span>
          )}
        </div>
      </main>
    </div>
  );
}

export default RecipeList;