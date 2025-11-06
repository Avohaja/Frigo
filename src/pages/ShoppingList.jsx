import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, X, ChefHat } from "lucide-react";
import { RecipeProvider, useRecipes } from "../context/RecipeContext";

function ShoppingListContent() {
  const { getMissingIngredientsFromInUseRecipes } = useRecipes();
  const [manualItem, setManualItem] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  
  const suggestions = [
    {
      id: 1,
      name: "Carottes",
      quantity: "1 kg",
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Tomates",
      quantity: "500 g",
      image: "https://images.unsplash.com/photo-1546470427-227b2f7f5a8e?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Pommes de terre",
      quantity: "1 kg",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Lait",
      quantity: "1 L",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop"
    }
  ];
  
  const [shoppingList, setShoppingList] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);

  useEffect(() => {
    const missingIngredients = getMissingIngredientsFromInUseRecipes();
    setRecipeIngredients(missingIngredients);
  }, [getMissingIngredientsFromInUseRecipes]);

  const addToList = (item) => {
    if (!shoppingList.find(i => i.id === item.id)) {
      setShoppingList([...shoppingList, { ...item, added: true }]);
    }
  };

  const addManualItem = () => {
    if (manualItem.trim()) {
      const newItem = {
        id: Date.now(),
        name: manualItem,
        quantity: manualQuantity || "",
        manual: true
      };
      setShoppingList([...shoppingList, newItem]);
      setManualItem("");
      setManualQuantity("");
    }
  };

  const addRecipeIngredient = (ingredient) => {
    const newItem = {
      id: `recipe-${Date.now()}`,
      name: ingredient.name,
      quantity: "",
      fromRecipe: true,
      recipeName: ingredient.recipeName
    };
    setShoppingList([...shoppingList, newItem]);
  };

  const removeFromList = (id) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  return (
    <div className="bg-gray-50 py-4 sm:py-6">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Liste de courses</h2>
          <p className="text-gray-600 text-sm sm:text-base">Ajoutez des articles à votre liste et organisez vos achats.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          {/* Ingrédients manquants des recettes en cours */}
          {recipeIngredients.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <ChefHat className="text-orange-600" size={24} />
                <h3 className="text-xl font-bold text-gray-900">Ingrédients manquants pour vos recettes</h3>
              </div>
              <div className="space-y-2">
                {recipeIngredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ingredient.name}</p>
                      <p className="text-sm text-orange-600">Pour la recette: {ingredient.recipeName}</p>
                    </div>
                    {!shoppingList.find(item => item.name === ingredient.name) && (
                      <button
                        onClick={() => addRecipeIngredient(ingredient)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm transition-colors"
                      >
                        Ajouter
                      </button>
                    )}
                    {shoppingList.find(item => item.name === ingredient.name) && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg font-medium text-sm">
                        ✓ Ajouté
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
              <h3 className="text-xl font-bold text-gray-900">Suggestions</h3>
              <div className="flex gap-2">
                <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
                <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                  <ChevronRight size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {suggestions.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-24 sm:h-32 bg-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h4 className="font-medium sm:font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">{item.quantity}</p>
                    <button
                      onClick={() => addToList(item)}
                      disabled={shoppingList.some(i => i.id === item.id)}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                        shoppingList.some(i => i.id === item.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <Plus size={16} />
                      <span className="sm:inline hidden">Ajouter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Add Section */}
          <div className="border-t border-gray-200 pt-4 sm:pt-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Ajouter manuellement</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Nom de l'article"
                  value={manualItem}
                  onChange={(e) => setManualItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Quantité (ex: 1 kg, 2 L)"
                  value={manualQuantity}
                  onChange={(e) => setManualQuantity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={addManualItem}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
              >
                Ajouter
              </button>
            </div>
          </div>

          {/* Shopping List */}
          {shoppingList.length > 0 && (
            <div className="border-t border-gray-200 pt-4 sm:pt-6 mt-4 sm:mt-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Ma liste ({shoppingList.length})</h3>
                <button
                  onClick={() => setShoppingList([])}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                >
                  <X size={16} />
                  <span>Tout effacer</span>
                </button>
              </div>
              <div className="space-y-2">
                {shoppingList.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3 mb-2 sm:mb-0">
                      {!item.manual && !item.fromRecipe && item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                        />
                      )}
                      {item.fromRecipe && (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                          <ChefHat className="text-orange-600" size={20} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium sm:font-semibold text-gray-900 text-sm sm:text-base">{item.name}</p>
                        {item.quantity && <p className="text-xs sm:text-sm text-gray-600">{item.quantity}</p>}
                        {item.fromRecipe && <p className="text-xs text-orange-600">De: {item.recipeName}</p>}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromList(item.id)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-xs sm:text-sm transition-colors"
                    >
                      Retirer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ShoppingList() {
  return (
    <RecipeProvider>
      <ShoppingListContent />
    </RecipeProvider>
  );
}