import React, { useState, useEffect } from 'react';
import { Clock, Package, AlertCircle, Filter } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, expired, expiring, low

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      const products = await response.json();
      
      // Générer des notifications basées sur les produits
      const generatedNotifications = products
        .map(product => {
          const today = new Date();
          const expirationDate = new Date(product.expiration);
          const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
          
          let notification = null;
          
          // Notification pour expiration
          if (daysUntilExpiration < 0) {
            notification = {
              id: `exp-${product.id}`,
              productId: product.id,
              icon: 'alert',
              title: `${product.name} a expiré`,
              date: new Date(product.expiration).toLocaleDateString('fr-FR'),
              read: false,
              type: 'expired',
              priority: 3
            };
          } else if (daysUntilExpiration <= 3) {
            notification = {
              id: `exp-${product.id}`,
              productId: product.id,
              icon: 'clock',
              title: `${product.name} expire dans ${daysUntilExpiration} jour${daysUntilExpiration > 1 ? 's' : ''}`,
              date: new Date(product.expiration).toLocaleDateString('fr-FR'),
              read: false,
              type: 'expiring',
              priority: 2
            };
          }
          
          // Notification pour stock faible
          if (product.quantity <= 2) {
            const stockNotif = {
              id: `stock-${product.id}`,
              productId: product.id,
              icon: 'package',
              title: `Le stock de ${product.name} est faible (${product.quantity} restant${product.quantity > 1 ? 's' : ''})`,
              date: new Date().toLocaleDateString('fr-FR'),
              read: false,
              type: 'low-stock',
              priority: 1
            };
            
            // Si on a déjà une notification d'expiration, retourner les deux
            return notification ? [notification, stockNotif] : [stockNotif];
          }
          
          return notification ? [notification] : [];
        })
        .flat()
        .filter(Boolean)
        .sort((a, b) => b.priority - a.priority); // Trier par priorité
      
      setNotifications(generatedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'clock':
        return <Clock size={20} className="text-amber-600" />;
      case 'package':
        return <Package size={20} className="text-blue-600" />;
      case 'alert':
        return <AlertCircle size={20} className="text-red-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    return notifications.filter(notif => notif.type === filter);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-gray-500 mt-1">{unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</p>
          )}
        </div>
        <button 
          onClick={markAllAsRead}
          className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          Marquer tout comme lu
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        <Filter size={20} className="text-gray-400 flex-shrink-0" />
        
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
            filter === 'all' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tout ({notifications.length})
        </button>
        
        <button
          onClick={() => setFilter('expired')}
          className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
            filter === 'expired' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expirés ({notifications.filter(n => n.type === 'expired').length})
        </button>
        
        <button
          onClick={() => setFilter('expiring')}
          className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
            filter === 'expiring' 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expire bientôt ({notifications.filter(n => n.type === 'expiring').length})
        </button>
        
        <button
          onClick={() => setFilter('low-stock')}
          className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
            filter === 'low-stock' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Stock faible ({notifications.filter(n => n.type === 'low-stock').length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune notification</h3>
          <p className="text-gray-500">Vous n'avez pas de notifications pour le moment</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`flex items-start gap-4 p-5 rounded-xl transition-all ${
                notification.read 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-white border-2 border-gray-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Icon */}
              <div className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
                notification.type === 'expired' ? 'bg-red-50' :
                notification.type === 'expiring' ? 'bg-amber-50' :
                notification.type === 'low-stock' ? 'bg-blue-50' :
                'bg-gray-100'
              }`}>
                {getIcon(notification.icon)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold mb-1 ${
                  notification.read ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {notification.title}
                </h3>
                <p className={`text-sm ${
                  notification.read ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {notification.date}
                </p>
              </div>

              {/* Unread indicator */}
              {!notification.read && (
                <div className="flex-shrink-0 w-2.5 h-2.5 bg-green-500 rounded-full mt-2"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}