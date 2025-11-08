import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, ShoppingCart, AlertTriangle, Clock } from "lucide-react";
import { useShoppingList } from '../context/ShoppingContext';

export default function ShoppingList() {
  const [manualItem, setManualItem] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [scrollPosition, setScrollPosition] = useState({ missing: 0, unused: 0 });
  const [shoppingList, setShoppingList] = useState([]);

  const { getMissingIngredients } = useShoppingList();
  const missingIngredients = getMissingIngredients();

  // Produits non consommés (exemple statique, à remplacer par tes données réelles)
  const unusedProducts = [
    {
      id: 201,
      name: "Riz basmati",
      quantity: "1 kg",
      image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=300&h=300&fit=crop",
      type: "unused",
    },
    {
      id: 202,
      name: "Lentilles",
      quantity: "500 g",
      image: "https://images.unsplash.com/photo-1603133872878-684f2b8bc379?w=300&h=300&fit=crop",
      type: "unused",
    },
  ];

  const addToList = (item) => {
    if (!shoppingList.find((i) => i.id === item.id)) {
      setShoppingList([...shoppingList, { ...item, added: true }]);
    }
  };

  const addManualItem = () => {
    if (manualItem.trim()) {
      const newItem = {
        id: Date.now(),
        name: manualItem,
        quantity: manualQuantity || "",
        manual: true,
      };
      setShoppingList([...shoppingList, newItem]);
      setManualItem("");
      setManualQuantity("");
    }
  };

  const removeFromList = (id) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  const scrollLeft = (section) => {
    setScrollPosition((prev) => ({ ...prev, [section]: prev[section] - 340 }));
  };

  const scrollRight = (section) => {
    setScrollPosition((prev) => ({ ...prev, [section]: prev[section] + 340 }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Liste de courses</h1>
              <p className="text-gray-600">Gérez vos achats intelligemment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-yellow-500" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">Ingrédients manquants</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollLeft("missing")}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => scrollRight("missing")}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
              {missingIngredients.length > 0 ? (
                <div
                  className="overflow-x-auto flex gap-4 pb-4"
                  style={{ scrollBehavior: "smooth", transform: `translateX(-${scrollPosition.missing}px)` }}
                >
                  {missingIngredients.map((ingredient, index) => (
                    <div
                      key={ingredient.id}
                      className="min-w-[320px] bg-yellow-50 rounded-3xl border-2 border-yellow-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative h-56 bg-yellow-100 rounded-t-3xl flex items-center justify-center">
                        <img
                          src={`https://via.placeholder.com/300?text=${encodeURIComponent(ingredient.name)}`}
                          alt={ingredient.name}
                          className="w-full h-full object-cover rounded-t-3xl"
                        />
                      </div>
                      <div className="p-5 bg-white rounded-b-3xl">
                        <h4 className="font-bold text-xl text-gray-900 mb-1">{ingredient.name}</h4>
                        <p className="text-gray-600 mb-4">{ingredient.quantity}</p>
                        <p className="text-sm text-gray-500 mb-4">Recette: {ingredient.recipeName}</p>
                        <button
                          onClick={() => addToList(ingredient)}
                          disabled={shoppingList.some((i) => i.id === ingredient.id)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
                            shoppingList.some((i) => i.id === ingredient.id)
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-yellow-400 text-white hover:bg-yellow-500 shadow-md"
                          }`}
                        >
                          <Plus size={18} />
                          {shoppingList.some((i) => i.id === ingredient.id) ? "Ajouté" : "Ajouter"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucun ingrédient manquant.</p>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-500" size={24} />
                  <h3 className="text-2xl font-bold text-gray-900">Produits non consommés</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollLeft("unused")}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => scrollRight("unused")}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
              <div
                className="overflow-x-auto flex gap-4 pb-4"
                style={{ scrollBehavior: "smooth", transform: `translateX(-${scrollPosition.unused}px)` }}
              >
                {unusedProducts.map((item) => (
                  <div
                    key={item.id}
                    className="min-w-[320px] bg-blue-50 rounded-3xl border-2 border-blue-200 overflow-hidden hover:shadow-lg transition-all"
                  >
                    <div className="relative h-56 bg-blue-100 rounded-t-3xl flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-t-3xl"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                          <img
                            src={`https://via.placeholder.com/80?text=${encodeURIComponent(
                              item.name.charAt(0)
                            )}`}
                            alt={item.name}
                            className="w-16 h-16"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-5 bg-white rounded-b-3xl">
                      <h4 className="font-bold text-xl text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-gray-600 mb-4">{item.quantity}</p>
                      <button
                        onClick={() => addToList(item)}
                        disabled={shoppingList.some((i) => i.id === item.id)}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
                          shoppingList.some((i) => i.id === item.id)
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-yellow-400 text-white hover:bg-yellow-500 shadow-md"
                        }`}
                      >
                        <Plus size={18} />
                        {shoppingList.some((i) => i.id === item.id) ? "Ajouté" : "Ajouter"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ajouter un article personnalisé</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'article</label>
                  <input
                    type="text"
                    placeholder="Ex: Pain complet"
                    value={manualItem}
                    onChange={(e) => setManualItem(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addManualItem()}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantité (optionnelle)</label>
                  <input
                    type="text"
                    placeholder="Ex: 1 unité, 500g, 2L"
                    value={manualQuantity}
                    onChange={(e) => setManualQuantity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addManualItem()}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={addManualItem}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-md"
                >
                  <Plus size={20} />
                  Ajouter à ma liste
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-24">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Ma liste
                  {shoppingList.length > 0 && (
                    <span className="ml-2 text-lg text-green-600">({shoppingList.length})</span>
                  )}
                </h3>
                {shoppingList.length > 0 && (
                  <button
                    onClick={() => setShoppingList([])}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    <X size={16} />
                    Vider
                  </button>
                )}
              </div>
              {shoppingList.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">Votre liste est vide</p>
                  <p className="text-sm text-gray-400 mt-1">Ajoutez des articles pour commencer</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {shoppingList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:border-green-300 transition-all"
                    >
                      {!item.manual && item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      {item.manual && (
                        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xl">{item.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                        {item.quantity && <p className="text-sm text-gray-600">{item.quantity}</p>}
                      </div>
                      <button
                        onClick={() => removeFromList(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {shoppingList.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-2xl transition-all shadow-md">
                    Exporter la liste
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
