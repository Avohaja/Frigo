import React, { useState, useEffect } from 'react';
import { Clock, Package, AlertCircle, Filter, RefreshCw, Trash2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/notifications`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/notifications/generate`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Failed to generate notifications');
      const data = await response.json();
      setNotifications(data);
      alert(`${data.length} notifications générées`);
    } catch (error) {
      console.error('Error generating notifications:', error);
      alert('Erreur lors de la génération des notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAsUnread = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: false })
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, read: false } : notif
        ));
      }
    } catch (error) {
      console.error('Error marking notification as unread:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, read: true })));
        alert('Toutes les notifications marquées comme lues');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Supprimer cette notification ?')) return;
    
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(notifications.filter(notif => notif.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm('Supprimer toutes les notifications ?')) return;
    
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications([]);
        alert('Toutes les notifications ont été supprimées');
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getIcon = (iconType) => {
    switch(iconType) {
      case 'clock': return <Clock size={20} className="text-amber-600" />;
      case 'package': return <Package size={20} className="text-blue-600" />;
      case 'alert': return <AlertCircle size={20} className="text-red-600" />;
      default: return <Clock size={20} className="text-gray-600" />;
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications;
    return notifications.filter(notif => notif.type === filter);
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = getFilteredNotifications();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={32} className="animate-spin text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-500 mt-1">
            {notifications.length} notification{notifications.length > 1 ? 's' : ''} 
            {unreadCount > 0 && ` • ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateNotifications}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <RefreshCw size={16} />
            Générer
          </button>
          {notifications.length > 0 && (
            <button 
              onClick={clearAllNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              <Trash2 size={16} />
              Tout supprimer
            </button>
          )}
        </div>
      </div>

      {/* Stats and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4 text-sm">
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
            Expirés: {notifications.filter(n => n.type === 'expired').length}
          </span>
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
            Expirent: {notifications.filter(n => n.type === 'expiring').length}
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            Stock faible: {notifications.filter(n => n.type === 'low-stock').length}
          </span>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Marquer tout comme lu
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        <Filter size={20} className="text-gray-400 flex-shrink-0" />
        
        {['all', 'expired', 'expiring', 'low-stock'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              filter === filterType 
                ? {
                    'all': 'bg-green-600 text-white',
                    'expired': 'bg-red-600 text-white',
                    'expiring': 'bg-amber-600 text-white',
                    'low-stock': 'bg-blue-600 text-white'
                  }[filterType]
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {{
              'all': `Tout (${notifications.length})`,
              'expired': `Expirés (${notifications.filter(n => n.type === 'expired').length})`,
              'expiring': `Expirent (${notifications.filter(n => n.type === 'expiring').length})`,
              'low-stock': `Stock faible (${notifications.filter(n => n.type === 'low-stock').length})`
            }[filterType]}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune notification</h3>
          <p className="text-gray-500 mb-4">Cliquez sur "Générer" pour créer des notifications basées sur votre inventaire</p>
          <button 
            onClick={generateNotifications}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Générer les notifications
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`flex items-start gap-4 p-5 rounded-xl transition-all group ${
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
                <p className={`text-sm mb-1 ${
                  notification.read ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-400">
                  Créé le {new Date(notification.createdAt).toLocaleDateString('fr-FR')} à {new Date(notification.createdAt).toLocaleTimeString('fr-FR')}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {notification.read ? (
                  <button
                    onClick={() => markAsUnread(notification.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Marquer comme non lu"
                  >
                    ●
                  </button>
                ) : (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-1 text-green-500 hover:text-green-600 transition-colors"
                    title="Marquer comme lu"
                  >
                    ●
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
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