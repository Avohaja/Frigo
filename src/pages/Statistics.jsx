import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_URL = 'http://localhost:5000/api';

export default function Statistics() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    fresh: 0,
    expiring: 0,
    expired: 0,
    low: 0,
    byCategory: [],
    byStatus: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      calculateStats();
    }
  }, [products]);

  const calculateStats = () => {
    const total = products.length;
    const fresh = products.filter(p => p.status === 'fresh').length;
    const expiring = products.filter(p => p.status === 'expiring').length;
    const expired = products.filter(p => p.status === 'expired').length;
    const low = products.filter(p => p.status === 'low').length;

    // Group by category
    const categoryCount = {};
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });

    const byCategory = Object.keys(categoryCount).map(category => ({
      name: category,
      value: categoryCount[category],
      percentage: Math.round((categoryCount[category] / total) * 100)
    }));

    // Status distribution
    const byStatus = [
      { name: 'Frais', value: fresh, color: '#22c55e' },
      { name: 'Bientôt périmés', value: expiring, color: '#eab308' },
      { name: 'Périmés', value: expired, color: '#ef4444' },
      { name: 'Stock faible', value: low, color: '#f97316' }
    ].filter(item => item.value > 0);

    setStats({
      total,
      fresh,
      expiring,
      expired,
      low,
      byCategory,
      byStatus
    });
  };

  // Simulated monthly waste data (you can track this by logging deleted expired items)
  const wasteData = [
    { month: 'Jan', value: 8 },
    { month: 'Fév', value: 12 },
    { month: 'Mar', value: 6 },
    { month: 'Avr', value: 15 },
    { month: 'Mai', value: 9 },
    { month: 'Juin', value: 4 }
  ];

  // Calculate estimated waste prevented (items consumed before expiration)
  const itemsConsumedOnTime = stats.total - stats.expired;
  const wastePreventedKg = itemsConsumedOnTime * 0.3; // Estimate 0.3kg per item
  const moneySaved = wastePreventedKg * 2; // Estimate €2 per kg

  const COLORS = ['#22c55e', '#eab308', '#ef4444', '#f97316', '#3b82f6'];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900">Statistiques d'Utilisation</h2>
        <p className="text-gray-600 mt-2">Analyse de votre gestion de réfrigérateur</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement des statistiques...</div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Products */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Total Produits</p>
          <p className="text-4xl font-bold text-blue-500">{stats.total}</p>
        </div>

        {/* Waste Prevented */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Gaspillage évité</p>
          <p className="text-4xl font-bold text-green-500">{wastePreventedKg.toFixed(1)} kg</p>
        </div>

        {/* Products Expiring */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Produits à risque</p>
          <p className="text-4xl font-bold text-yellow-500">{stats.expiring + stats.expired}</p>
        </div>

        {/* Money Saved */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Économies estimées</p>
          <p className="text-4xl font-bold text-green-500">{moneySaved.toFixed(0)} €</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Distribution par Statut</h3>
          {stats.byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>

        {/* Gaspillage évité par mois */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Gaspillage évité par mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#bbf7d0" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Distribution par Catégorie</h3>
        {stats.byCategory.length > 0 ? (
          <div className="space-y-6">
            {stats.byCategory.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900 font-medium">{category.name}</span>
                  <span className="text-gray-600 text-sm">
                    {category.value} produits ({category.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Aucun produit dans l'inventaire
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6">
          <p className="text-green-700 font-medium mb-2">Taux de fraîcheur</p>
          <p className="text-3xl font-bold text-green-600">
            {stats.total > 0 ? Math.round((stats.fresh / stats.total) * 100) : 0}%
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-6">
          <p className="text-yellow-700 font-medium mb-2">Produits à surveiller</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.expiring}</p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6">
          <p className="text-red-700 font-medium mb-2">Action requise</p>
          <p className="text-3xl font-bold text-red-600">{stats.expired}</p>
        </div>
      </div>
        </>
      )}
    </div>
  );
}