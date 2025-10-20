import React, { useState } from 'react';
import { Search, Bell, Settings, BarChart3, Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Lait',
      category: 'Produits laitiers',
      expiration: '15/07/2024',
      quantity: 1,
      status: 'fresh'
    },
    {
      id: 2,
      name: 'Yaourt',
      category: 'Produits laitiers',
      expiration: '10/07/2024',
      quantity: 4,
      status: 'expiring'
    },
    {
      id: 3,
      name: 'Pommes',
      category: 'Fruits & Légumes',
      expiration: '20/07/2024',
      quantity: 5,
      status: 'fresh'
    },
    {
      id: 4,
      name: 'Poulet',
      category: 'Viandes',
      expiration: '05/07/2024',
      quantity: 1,
      status: 'expired'
    },
    {
      id: 5,
      name: 'Carottes',
      category: 'Fruits & Légumes',
      expiration: '12/07/2024',
      quantity: 2,
      status: 'low'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inventaire');

  const getStatusConfig = (status) => {
    const configs = {
      fresh: { label: 'Frais', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
      expiring: { label: 'Bientôt périmé', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
      expired: { label: 'Périmé', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
      low: { label: 'Stock faible', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' }
    };
    return configs[status];
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Inventaire</h2>
          <p className="text-gray-600">Gérez vos produits et réduisez le gaspillage.</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
              <span className="text-gray-700">Filtrer par catégorie</span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
            <button className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50">
              <span className="text-gray-700">Trier par date</span>
              <ChevronDown size={18} className="text-gray-500" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
            <Plus size={20} />
            Ajouter Produit
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Produit</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Catégorie</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Péremption</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quantité</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((product) => {
                  const statusConfig = getStatusConfig(product.status);
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-5 px-6 text-gray-900 font-medium">{product.name}</td>
                      <td className="py-5 px-6 text-gray-600">{product.category}</td>
                      <td className="py-5 px-6 text-gray-600">{product.expiration}</td>
                      <td className="py-5 px-6 text-gray-900 font-medium">{product.quantity}</td>
                      <td className="py-5 px-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                          <span className="text-sm font-medium">{statusConfig.label}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}