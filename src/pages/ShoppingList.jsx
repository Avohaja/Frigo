import { useState, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, X, ShoppingCart, AlertTriangle, Clock, Package, Edit, Download } from "lucide-react";
import { useProducts } from "../context/ProductContext";
import { useShoppingList } from "../context/ShoppingContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ShoppingList() {
  const { products } = useProducts();
  const [manualItem, setManualItem] = useState("");
  const [manualQuantity, setManualQuantity] = useState("");
  const [manualUnit, setManualUnit] = useState("unité");
  const [scrollPosition, setScrollPosition] = useState({ expired: 0, lowStock: 0, missing: 0 });
  const [shoppingList, setShoppingList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const { getMissingIngredients } = useShoppingList();
  const missingIngredients = getMissingIngredients();
  const shoppingListRef = useRef();

  // Unit options
  const unitOptions = [
    "unité", "kg", "g", "L", "mL", 
    "cuillère à soupe", "cuillère à café", "pincée",
    "tasse", "verre", "sachet", "boîte", "bouteille"
  ];

  // Filtrer les produits périmés ou bientôt périmés
  const expiredProducts = useMemo(() => {
    return products.filter(p => p.status === 'expired' || p.status === 'expiring' || p.status === 'low')
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        category: p.category,
        status: p.status,
        type: 'expired',
        image: p.image || `https://via.placeholder.com/300?text=${encodeURIComponent(p.name)}`
      }));
  }, [products]);

  // Filtrer les produits à stock faible
  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.status === 'low')
      .map(p => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        category: p.category,
        status: p.status,
        type: 'lowStock',
        image: p.image || `https://via.placeholder.com/300?text=${encodeURIComponent(p.name)}`
      }));
  }, [products]);

  const addToList = (item) => {
    if (!shoppingList.find((i) => i.id === item.id)) {
      setShoppingList([...shoppingList, { 
        ...item, 
        added: true,
        quantity: typeof item.quantity === 'object' ? item.quantity : { value: item.quantity, unit: 'unité' }
      }]);
    }
  };

  const addManualItem = () => {
    if (manualItem.trim()) {
      const newItem = {
        id: Date.now(),
        name: manualItem,
        quantity: { 
          value: manualQuantity || "1", 
          unit: manualUnit 
        },
        manual: true,
      };
      setShoppingList([...shoppingList, newItem]);
      setManualItem("");
      setManualQuantity("");
      setManualUnit("unité");
    }
  };

  const removeFromList = (id) => {
    setShoppingList(shoppingList.filter((item) => item.id !== id));
  };

  const updateQuantity = (itemId, change) => {
    setShoppingList(prevList => 
      prevList.map(item => {
        if (item.id === itemId) {
          const currentValue = parseInt(item.quantity.value) || 0;
          const newValue = Math.max(0, currentValue + change);
          
          return {
            ...item,
            quantity: {
              ...item.quantity,
              value: newValue.toString()
            }
          };
        }
        return item;
      })
    );
  };

  const updateUnit = (itemId, newUnit) => {
    setShoppingList(prevList => 
      prevList.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              quantity: { 
                ...item.quantity, 
                unit: newUnit 
              } 
            } 
          : item
      )
    );
    setEditingItem(null);
  };

  const startEditing = (itemId) => {
    setEditingItem(itemId);
  };

  const scrollLeft = (section) => {
    setScrollPosition((prev) => ({ ...prev, [section]: Math.max(0, prev[section] - 340) }));
  };

  const scrollRight = (section) => {
    setScrollPosition((prev) => ({ ...prev, [section]: prev[section] + 340 }));
  };

  // Helper function to format quantity display
  const formatQuantity = (quantity) => {
    if (typeof quantity === 'object' && quantity !== null) {
      return `${quantity.value} ${quantity.unit}`;
    }
    return quantity;
  };

  // Export to PDF function
  const exportToPDF = async () => {
    if (!shoppingListRef.current) return;

    try {
      const canvas = await html2canvas(shoppingListRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the content
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(0, 0, 0);
      pdf.text('MA LISTE DE COURSES', pdfWidth / 2, 20, { align: 'center' });
      
      // Add date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Générée le ${new Date().toLocaleDateString('fr-FR')}`, pdfWidth / 2, 30, { align: 'center' });

      pdf.save('ma-liste-de-courses.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erreur lors de la génération du PDF');
    }
  };

  // Export as text file (alternative)
  const exportAsText = () => {
    const content = `MA LISTE DE COURSES\nGénérée le ${new Date().toLocaleDateString('fr-FR')}\n\n` +
      shoppingList.map(item => `• ${item.name}: ${formatQuantity(item.quantity)}`).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ma-liste-de-courses.txt';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
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

        {/* Ingrédients manquants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Ajout manuel */}
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantité</label>
                    <input
                      type="text"
                      placeholder="Ex: 1, 500, 2"
                      value={manualQuantity}
                      onChange={(e) => setManualQuantity(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addManualItem()}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unité</label>
                    <select
                      value={manualUnit}
                      onChange={(e) => setManualUnit(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {unitOptions.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
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

            {/* Ingrédients manquants des recettes */}
            {missingIngredients.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-yellow-500" size={24} />
                    <h3 className="text-2xl font-bold text-gray-900">Ingrédients manquants des recettes</h3>
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
                <div
                  className="overflow-x-auto flex gap-4 pb-4"
                  style={{ scrollBehavior: "smooth", transform: `translateX(-${scrollPosition.missing}px)` }}
                >
                  {missingIngredients.map((ingredient) => (
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
                        <p className="text-gray-600 mb-2">{formatQuantity(ingredient.quantity)}</p>
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
              </div>
            )}

            {/* Produits périmés */}
            {expiredProducts.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={24} />
                    <h3 className="text-2xl font-bold text-gray-900">Produits périmés</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollLeft("expired")}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => scrollRight("expired")}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                <div
                  className="overflow-x-auto flex gap-4 pb-4"
                  style={{ scrollBehavior: "smooth", transform: `translateX(-${scrollPosition.expired}px)` }}
                >
                  {expiredProducts.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-[320px] bg-red-50 rounded-3xl border-2 border-red-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative h-56 bg-red-100 rounded-t-3xl flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-t-3xl"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-red-200 rounded-full flex items-center justify-center">
                            <AlertTriangle className="text-red-600" size={48} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 bg-white rounded-b-3xl">
                        <h4 className="font-bold text-xl text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-gray-600 mb-2">{item.category}</p>
                        <p className="text-sm text-red-600 mb-2">
                          {item.status === 'expired' ? '❌ Périmé' : '⚠️ Expire bientôt'}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          {formatQuantity(item.quantity)}
                        </p>
                        <button
                          onClick={() => addToList(item)}
                          disabled={shoppingList.some((i) => i.id === item.id)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
                            shoppingList.some((i) => i.id === item.id)
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-red-500 text-white hover:bg-red-600 shadow-md"
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
            )}

            {/* Produits à stock faible */}
            {lowStockProducts.length > 0 && (
              <div className="bg-white rounded-3xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Package className="text-orange-500" size={24} />
                    <h3 className="text-2xl font-bold text-gray-900">Produits à stock faible</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => scrollLeft("lowStock")}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={() => scrollRight("lowStock")}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
                <div
                  className="overflow-x-auto flex gap-4 pb-4"
                  style={{ scrollBehavior: "smooth", transform: `translateX(-${scrollPosition.lowStock}px)` }}
                >
                  {lowStockProducts.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-[320px] bg-orange-50 rounded-3xl border-2 border-orange-200 overflow-hidden hover:shadow-lg transition-all"
                    >
                      <div className="relative h-56 bg-orange-100 rounded-t-3xl flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-t-3xl"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-orange-200 rounded-full flex items-center justify-center">
                            <Package className="text-orange-600" size={48} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 bg-white rounded-b-3xl">
                        <h4 className="font-bold text-xl text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-gray-600 mb-2">{item.category}</p>
                        <p className="text-sm text-orange-600 mb-2">
                          📦 Restant: {formatQuantity(item.quantity)}
                        </p>
                        <button
                          onClick={() => addToList(item)}
                          disabled={shoppingList.some((i) => i.id === item.id)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-medium transition-all ${
                            shoppingList.some((i) => i.id === item.id)
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-orange-500 text-white hover:bg-orange-600 shadow-md"
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
            )}
          </div>

          {/* Ma liste */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg p-6 sticky top-24" ref={shoppingListRef}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Ma liste
                  {shoppingList.length > 0 && (
                    <span className="ml-2 text-lg text-green-600">({shoppingList.length})</span>
                  )}
                </h3>
                <div className="flex gap-2">
                  {shoppingList.length > 0 && (
                    <>
                      <button
                        onClick={exportToPDF}
                        className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 font-medium"
                        title="Exporter en PDF"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => setShoppingList([])}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        <X size={16} />
                        Vider
                      </button>
                    </>
                  )}
                </div>
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
                        <div className="flex items-center gap-2 mt-1">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-colors"
                          >
                            -
                          </button>
                          <span className="text-sm text-gray-700 font-medium min-w-[60px] text-center">
                            {item.quantity.value}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-xs font-bold transition-colors"
                          >
                            +
                          </button>
                          
                          {editingItem === item.id ? (
                            <select
                              value={item.quantity.unit}
                              onChange={(e) => updateUnit(item.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                              autoFocus
                              onBlur={() => setEditingItem(null)}
                            >
                              {unitOptions.map(unit => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              onClick={() => startEditing(item.id)}
                              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <span>{item.quantity.unit}</span>
                              <Edit size={12} />
                            </button>
                          )}
                        </div>
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
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                  <button 
                    onClick={exportToPDF}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-2xl transition-all shadow-md"
                  >
                    <Download size={18} />
                    Exporter en PDF
                  </button>
                  <button 
                    onClick={exportAsText}
                    className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-all"
                  >
                    Exporter en texte
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