import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, ShoppingCart } from "lucide-react";

export default function ShoppingList() {
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

  const removeFromList = (id) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
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
          {/* Left Column - Suggestions & Add Manual */}
          <div className="lg:col-span-2 space-y-6">
            {/* Suggestions Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Suggestions basées sur vos habitudes</h3>
                <div className="flex gap-2">
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {suggestions.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all">
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{item.quantity}</p>
                      <button
                        onClick={() => addToList(item)}
                        disabled={shoppingList.some(i => i.id === item.id)}
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-all ${
                          shoppingList.some(i => i.id === item.id)
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md'
                        }`}
                      >
                        <Plus size={18} />
                        {shoppingList.some(i => i.id === item.id) ? 'Ajouté' : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Add Section */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ajouter un article personnalisé</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'article</label>
                  <input
                    type="text"
                    placeholder="Ex: Pain complet"
                    value={manualItem}
                    onChange={(e) => setManualItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
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
                    onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
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

          {/* Right Column - Shopping List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
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
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-green-300 transition-all">
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
                  <button className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition-all shadow-md">
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