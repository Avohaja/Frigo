import { TrendingUp, AlertTriangle, Package, Calendar, ShoppingCart, Lightbulb, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { daysUntilExpiration } from '../utils/dateUtils';
import SmartAssistant from './SmartAssistant';

export default function Dashboard() {
  const { products } = useProducts();

  // Analyse des produits
  const analyzeProducts = () => {
    const expired = products.filter(p => daysUntilExpiration(p.expiration) < 0);
    const expiringSoon = products.filter(p => {
      const days = daysUntilExpiration(p.expiration);
      return days >= 0 && days <= 3;
    });
    const lowStock = products.filter(p => p.quantity <= 2);
    
    return {
      total: products.length,
      expired: expired.length,
      expiringSoon: expiringSoon.length,
      lowStock: lowStock.length,
      expiredProducts: expired,
      expiringSoonProducts: expiringSoon
    };
  };

  const stats = analyzeProducts();

  // Produits urgents (périmés + bientôt périmés)
  const urgentProducts = [
    ...stats.expiredProducts.map(p => ({
      name: p.name,
      expiration: new Date(p.expiration).toLocaleDateString('fr-FR'),
      status: 'expired',
      days: Math.abs(daysUntilExpiration(p.expiration))
    })),
    ...stats.expiringSoonProducts.map(p => ({
      name: p.name,
      expiration: new Date(p.expiration).toLocaleDateString('fr-FR'),
      status: 'expiring',
      days: daysUntilExpiration(p.expiration)
    }))
  ].slice(0, 5); // Afficher seulement les 5 premiers

  // Suggestions de recettes basées sur les catégories disponibles
  const categories = [...new Set(products.map(p => p.category))];
  const suggestions = [
    { icon: '🥗', text: 'Salade composée avec vos légumes frais', available: categories.includes('Fruits & Légumes') },
    { icon: '🍳', text: 'Omelette aux légumes', available: categories.includes('Produits laitiers') },
    { icon: '🥘', text: 'Soupe de légumes du jardin', available: categories.includes('Fruits & Légumes') },
  ].filter(s => s.available).slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue dans votre réfrigérateur intelligent</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-blue-600" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Total Produits</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="text-yellow-600" size={24} />
              </div>
              <AlertTriangle className="text-yellow-600" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Bientôt périmés</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.expiringSoon}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Périmés</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.expired}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <ShoppingCart className="text-orange-600" size={24} />
              </div>
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Stock faible</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.lowStock}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Produits urgents */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-red-500" size={24} />
                Produits urgents
              </h2>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                Voir tout
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {urgentProducts.length > 0 ? (
                urgentProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${product.status === 'expired' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">Exp: {product.expiration}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === 'expired' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.status === 'expired' ? `Périmé (${product.days}j)` : `${product.days} jour(s)`}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-2xl mb-2">🎉</p>
                  <p>Aucun produit urgent !</p>
                </div>
              )}
            </div>
          </div>

          {/* Suggestions de recettes */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lightbulb className="text-yellow-500" size={24} />
                Suggestions de recettes
              </h2>
              <button className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1">
                Voir plus
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{suggestion.icon}</span>
                      <p className="text-gray-800 font-medium">{suggestion.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-2xl mb-2">🍽️</p>
                  <p>Ajoutez des produits pour voir des suggestions</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl hover:shadow-lg transition-all">
              <Package className="text-green-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Ajouter produit</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl hover:shadow-lg transition-all">
              <Lightbulb className="text-blue-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Recettes</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl hover:shadow-lg transition-all">
              <ShoppingCart className="text-purple-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Liste courses</p>
            </button>
            <button className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl hover:shadow-lg transition-all">
              <Calendar className="text-orange-700 mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">Statistiques</p>
            </button>
          </div>
        </div>
      </main>

      {/* Assistant IA Intelligent */}
      <SmartAssistant />
    </div>
  );
}