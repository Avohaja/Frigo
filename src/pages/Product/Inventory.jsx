import React, { useState } from 'react';
import { Search, Edit2, Trash2, ChevronDown, Plus, Minus } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export default function Inventory({ onAddProduct, onEditProduct }) {
  const { products, deleteProduct, updateQ } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      fresh: { label: 'Frais', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
      expiring: { label: 'Bientôt périmé', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
      expired: { label: 'Périmé', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
      low: { label: 'Stock faible', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' }
    };
    return configs[status];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleQuantity = async (product, change) => {
    const newQuantity = Math.max(0, product.quantity + change);

    if (newQuantity === 0) {
      if (window.confirm(`La quantité sera à 0. Voulez-vous supprimer ${product.name} ?`)) {
        await deleteProduct(product.id);
      }
      return;
    }

    await updateQ(product.id, newQuantity);
  };

  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
    
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'date-asc': return new Date(a.expiration) - new Date(b.expiration);
        case 'date-desc': return new Date(b.expiration) - new Date(a.expiration);
        case 'quantity-asc': return a.quantity - b.quantity;
        case 'quantity-desc': return b.quantity - a.quantity;
        case 'status':
          const order = { expired: 0, expiring: 1, low: 2, fresh: 3 };
          return order[a.status] - order[b.status];
        default: return 0;
      }
    });
    return sorted;
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name': return 'Nom (A-Z)';
      case 'date-asc': return 'Date (plus proche)';
      case 'date-desc': return 'Date (plus loin)';
      case 'quantity-asc': return 'Quantité (croissant)';
      case 'quantity-desc': return 'Quantité (décroissant)';
      case 'status': return 'Statut (urgent)';
      default: return 'Trier par';
    }
  };

  const filteredProducts = getFilteredAndSortedProducts();

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Inventaire</h2>
          <p className="text-gray-600 text-sm sm:text-base">Gérez vos produits et réduisez le gaspillage.</p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
          <div className="w-full sm:flex-1 sm:max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2">

              {/* CATEGORY FILTER */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center justify-between gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
                >
                  <span className="text-gray-700 truncate">
                    {filterCategory === 'all' ? 'Catégories' : filterCategory}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 w-full sm:w-48">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setFilterCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                          filterCategory === category ? 'bg-green-50 text-green-700' : 'text-gray-700'
                        }`}
                      >
                        {category === 'all' ? 'Toutes' : category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* SORT */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowCategoryDropdown(false);
                  }}
                  className="flex items-center justify-between gap-2 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm"
                >
                  <span className="text-gray-700 truncate">
                    {getSortLabel()}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {showSortDropdown && (
                  <div className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20 w-full sm:w-48">
                    {[
                      { value: 'name', label: 'Nom (A-Z)' },
                      { value: 'date-asc', label: 'Date (plus proche)' },
                      { value: 'date-desc', label: 'Date (plus loin)' },
                      { value: 'quantity-asc', label: 'Quantité (croissant)' },
                      { value: 'quantity-desc', label: 'Quantité (décroissant)' },
                      { value: 'status', label: 'Statut (urgent)' }
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                          sortBy === option.value ? 'bg-green-50 text-green-700' : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <button
              onClick={onAddProduct}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"
            >
              <Plus size={16} />
              Ajouter Produit
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-fixed w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">

                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 w-[180px]">Produit</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 w-[140px]">Catégorie</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 w-[130px]">Péremption</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 w-[90px]">Quantité</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 w-[130px] text-center">Statut</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 w-[100px]">Quantité +/-</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 w-[120px]">Actions</th>

                </tr>
              </thead>

              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-6 text-center text-gray-500 text-sm">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const statusConfig = getStatusConfig(product.status);

                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">

                        <td className="py-3 px-4 text-gray-900 text-sm w-[180px]">{product.name}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm w-[140px]">{product.category}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm w-[130px]">{formatDate(product.expiration)}</td>

                        <td className="py-3 px-4 text-center text-gray-900 font-medium text-sm w-[90px]">
                          {product.quantity}
                        </td>

                        <td className="py-3 px-4 w-[130px] text-center">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${statusConfig.color} text-xs`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                            <span className="font-medium">{statusConfig.label}</span>
                          </div>
                        </td>

                        {/* Quantity controls */}
                        <td className="py-3 px-4 w-[140px]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantity(product, -1)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Minus size={16} />
                            </button>

                            <span className="text-gray-900 font-medium text-sm min-w-[30px] text-center">
                              {product.quantity}
                            </span>

                            <button
                              onClick={() => handleQuantity(product, 1)}
                              className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 w-[120px]">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEditProduct(product.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            >
                              <Edit2 size={16} />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${product.name} ?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 text-xs sm:text-sm text-gray-600">
          {filteredProducts.length} produit(s) affiché(s) sur {products.length} total
        </div>
      </main>
    </div>
  );
}
