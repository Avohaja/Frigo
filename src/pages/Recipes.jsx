import React, { useState } from 'react';
import { Search, Clock, ChefHat, ChevronDown } from 'lucide-react';

export default function Recipes() {
  const [searchTerm, setSearchTerm] = useState('');

  const recipes = [
    {
      id: 1,
      title: 'Soupe de Légumes',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=300&fit=crop',
      availableIngredients: ['Carottes', 'Pommes de terre', 'Oignons'],
      missingIngredients: ['Poireaux (manquant)', 'Bouillon de légumes (manquant)'],
      time: '30 min',
      difficulty: 'Facile'
    },
    {
      id: 2,
      title: 'Salade de Quinoa et Légumes',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500&h=300&fit=crop',
      availableIngredients: ['Quinoa', 'Concombre', 'Tomates'],
      missingIngredients: ['Poivron (manquant)', 'Vinaigrette citron (manquante)'],
      time: '25 min',
      difficulty: 'Facile'
    },
    {
      id: 3,
      title: 'Quiche Lorraine',
      image: 'https://images.unsplash.com/photo-1476124369491-b79d2aedb8f6?w=500&h=300&fit=crop',
      availableIngredients: ['Pâte brisée', 'Lardons', 'Œufs', 'Crème'],
      missingIngredients: [],
      time: '45 min',
      difficulty: 'Moyen'
    },
    {
      id: 4,
      title: 'Omelette aux champignons',
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&h=300&fit=crop',
      availableIngredients: ['Œufs', 'Champignons'],
      missingIngredients: ['Fromage râpé (manquant)'],
      time: '10 min',
      difficulty: 'Facile'
    }
  ];

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Recettes suggérées</h2>
        <p className="text-gray-600">Basées sur les ingrédients que vous avez dans votre frigo.</p>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-8">
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
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
          <span className="text-gray-700">Type de plat</span>
          <ChevronDown size={18} className="text-gray-500" />
        </button>
        <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
          <span className="text-gray-700">Temps de préparation</span>
          <ChevronDown size={18} className="text-gray-500" />
        </button>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Recipe Image */}
            <div className="relative h-48 bg-gray-900">
              <img 
                src={recipe.image} 
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Recipe Content */}
            <div className="p-5">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{recipe.title}</h3>

              {/* Available Ingredients */}
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {recipe.missingIngredients.length === 0 ? 'Ingrédients disponibles :' : 'Ingrédients :'}
                </p>
                <div className="space-y-1">
                  {recipe.availableIngredients.map((ingredient, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span className="text-gray-700">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing Ingredients */}
              {recipe.missingIngredients.length > 0 && (
                <div className="mb-4">
                  <div className="space-y-1">
                    {recipe.missingIngredients.map((ingredient, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-orange-600 mt-0.5">✗</span>
                        <span className="text-orange-600">{ingredient}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time and Difficulty */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{recipe.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ChefHat size={16} />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>

              {/* CTA Button */}
              <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
                Voir la recette
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}