import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CheckCircle, Circle, Bell, AlertCircle, CheckIcon, InfoIcon } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { Notification } from '../../types';
import toast from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, loading, error, refetch } = useNotifications();

  const markAsRead = (id: string) => {
    api.patch(`/notifications/${id}/marquer-lu`)
      .then(() => {
        refetch(); // Recharger les notifications
        toast.success('Notification marquée comme lue');
      })
      .catch(() => toast.error("Impossible de marquer la notification comme lue."));
  };

  const markAllAsRead = () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    if (unreadNotifications.length === 0) {
      toast.success('Aucune notification non lue');
      return;
    }

    Promise.all(
      unreadNotifications.map(notif => 
        api.patch(`/notifications/${notif.id}/marquer-lu`)
      )
    )
    .then(() => {
      refetch();
      toast.success(`${unreadNotifications.length} notification${unreadNotifications.length > 1 ? 's' : ''} marquée${unreadNotifications.length > 1 ? 's' : ''} comme lue${unreadNotifications.length > 1 ? 's' : ''}`);
    })
    .catch(() => {
      toast.error("Impossible de marquer toutes les notifications comme lues");
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <InfoIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationBorder = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-green-500';
      case 'warning':
        return 'border-l-4 border-yellow-500';
      case 'error':
        return 'border-l-4 border-red-500';
      default:
        return 'border-l-4 border-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Notifications</h1>
            <p className="text-gray-600 mt-1">Suivez les dernières activités sur vos projets</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Marquer toutes comme lues
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
          <p className="text-gray-500">Vous n'avez aucune notification pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.id} className={`${getNotificationBorder(notif.type)} ${!notif.read ? 'bg-blue-50' : 'bg-white'} hover:shadow-md transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getNotificationIcon(notif.type)}
                  <CardTitle className={`${!notif.read ? 'font-bold' : 'font-medium'}`}>
                    {notif.title}
                  </CardTitle>
                </div>
                <button
                  onClick={() => markAsRead(notif.id)}
                  disabled={notif.read}
                  className={`text-sm flex items-center space-x-1 ${notif.read ? 'text-gray-400' : 'text-blue-600 hover:text-blue-800'}`}
                >
                  {notif.read ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  <span>{notif.read ? 'Lue' : 'Marquer comme lue'}</span>
                </button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">{notif.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
