import React, { useState } from 'react';
import { Search, Edit2, Trash2, ChevronDown, Plus, Menu, X } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';

export default function Inventory({ onAddProduct, onEditProduct }) {
  const { products, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      fresh: { label: 'Frais', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
      expiring: { label: 'Bientôt périmé', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
      expired: { label: 'Périmé', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
      low: { label: 'Stock faible', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' }
    };
    if (!configs[status]) {
      console.warn(`Invalid status: ${status}, defaulting to 'fresh'`);
    }
    return configs[status] || configs.fresh;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const getFilteredAndSortedProducts = () => {
    let filtered = products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .map(p => ({
        ...p,
        status: p.status || 'fresh' // Default to 'fresh' if status is missing
      }));

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date-asc':
          return new Date(a.expiration) - new Date(b.expiration);
        case 'date-desc':
          return new Date(b.expiration) - new Date(a.expiration);
        case 'quantity-asc':
          return a.quantity - b.quantity;
        case 'quantity-desc':
          return b.quantity - a.quantity;
        case 'status':
          const statusOrder = { expired: 0, expiring: 1, low: 2, fresh: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
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

  return (
    <div className="bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Inventaire</h2>
          <p className="text-gray-600 text-sm sm:text-base">Gérez vos produits et réduisez le gaspillage.</p>
        </div>
        {/* Search and Actions Bar - Responsive */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
          <div className="w-full sm:flex-1 sm:max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
          {/* Filters and Sort - Stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              {/* Filter by Category Dropdown - Responsive */}
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
              {/* Sort Dropdown - Responsive */}
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
                    <button
                      onClick={() => {
                        setSortBy('name');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                        sortBy === 'name' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      Nom (A-Z)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('date-asc');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                        sortBy === 'date-asc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      Date (plus proche)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('date-desc');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                        sortBy === 'date-desc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      Date (plus loin)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('quantity-asc');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                        sortBy === 'quantity-asc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      Quantité (croissant)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('quantity-desc');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                        sortBy === 'quantity-desc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      Quantité (décroissant)
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('status');
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 text-sm ${
                        sortBy === 'status' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      Statut (urgent)
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* Add Product Button - Responsive */}
            <button
              onClick={onAddProduct}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"
            >
              <Plus size={16} />
              <span className="whitespace-nowrap">Ajouter Produit</span>
            </button>
          </div>
        </div>
        {/* Table - Responsive */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Produit</th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Catégorie</th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Péremption</th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Quantité</th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Statut</th>
                  <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedProducts().length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-gray-500 text-sm">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  getFilteredAndSortedProducts().map((product) => {
                    const statusConfig = getStatusConfig(product.status);
                    return (
                      <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 font-medium text-sm">{product.name}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{product.category}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(product.expiration)}</td>
                        <td className="py-3 px-4 text-gray-900 font-medium text-sm">{product.quantity}</td>
                        <td className="py-3 px-4">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${statusConfig.color} text-xs`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></div>
                            <span className="font-medium">{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
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
        {/* Results count - Responsive */}
        <div className="mt-3 text-xs sm:text-sm text-gray-600">
          {getFilteredAndSortedProducts().length} produit(s) affiché(s) sur {products.length} total
        </div>
      </main>
    </div>
  );
}
