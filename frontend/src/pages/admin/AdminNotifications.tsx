import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Bell, 
  Check, 
  X, 
  AlertCircle, 
  FileText, 
  Users, 
  Heart,
  Filter,
  Search,
  Calendar,
  ChevronRight,
  CheckCircle,
  XCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: {
    user_id?: string;
    project_id?: string;
    amount?: number;
    user_name?: string;
    project_title?: string;
  };
}

const AdminNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'project' | 'user' | 'donation' | 'system'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');

  useEffect(() => {
    console.log('AdminNotifications: Loading notifications...');
    
    // Simuler les notifications puisque l'endpoint n'existe pas encore
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'project',
        title: 'Nouveau projet soumis',
        message: 'Un nouveau projet "Puits de Kédougou" a été soumis par Presta User et attend votre validation.',
        read: false,
        created_at: '2025-08-04T15:30:00Z',
        data: {
          user_id: '2',
          project_id: '1',
          user_name: 'Presta User',
          project_title: 'Puits de Kédougou'
        }
      },
      {
        id: '2',
        type: 'user',
        title: 'Nouvel utilisateur inscrit',
        message: 'Un nouveau prestataire s\'est inscrit sur la plateforme et attend la vérification de son compte.',
        read: false,
        created_at: '2025-08-04T14:15:00Z',
        data: {
          user_id: '4',
          user_name: 'Jean Dupont'
        }
      },
      {
        id: '3',
        type: 'donation',
        title: 'Nouveau don important',
        message: 'Un don de 5,000€ a été effectué pour le projet "École de Tambacounda".',
        read: true,
        created_at: '2025-08-04T12:45:00Z',
        data: {
          user_id: '3',
          project_id: '2',
          amount: 5000,
          project_title: 'École de Tambacounda'
        }
      },
      {
        id: '4',
        type: 'system',
        title: 'Mise à jour du système',
        message: 'Le système de paiement a été mis à jour avec succès. Toutes les fonctionnalités sont opérationnelles.',
        read: true,
        created_at: '2025-08-04T10:00:00Z'
      },
      {
        id: '5',
        type: 'project',
        title: 'Projet financé à 100%',
        message: 'Le projet "Château d\'eau de Ziguinchor" a atteint son objectif de financement.',
        read: false,
        created_at: '2025-08-04T09:30:00Z',
        data: {
          project_id: '3',
          project_title: 'Château d\'eau de Ziguinchor'
        }
      },
      {
        id: '6',
        type: 'user',
        title: 'Compte suspendu',
        message: 'Le compte de l\'utilisateur "Spam User" a été automatiquement suspendu pour activité suspecte.',
        read: true,
        created_at: '2025-08-04T08:15:00Z',
        data: {
          user_id: '5',
          user_name: 'Spam User'
        }
      }
    ];

    // Simuler un délai de chargement
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'read' && notification.read) ||
      (statusFilter === 'unread' && !notification.read);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'project': return FileText;
      case 'user': return Users;
      case 'donation': return Heart;
      case 'system': return AlertCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'project': return 'text-blue-600 bg-blue-100';
      case 'user': return 'text-green-600 bg-green-100';
      case 'donation': return 'text-pink-600 bg-pink-100';
      case 'system': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case 'project': return 'Projet';
      case 'user': return 'Utilisateur';
      case 'donation': return 'Donation';
      case 'system': return 'Système';
      default: return type;
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      // await api.patch(`/notifications/${notificationId}/marquer-lu`);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // await api.patch('/notifications/marquer-tous-lu');
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette notification ?')) return;
    
    try {
      // await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    projects: notifications.filter(n => n.type === 'project').length,
    users: notifications.filter(n => n.type === 'user').length,
    donations: notifications.filter(n => n.type === 'donation').length,
    system: notifications.filter(n => n.type === 'system').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centre de Notifications</h1>
          <p className="text-gray-600 mt-1">Gérez toutes les notifications de la plateforme</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Tout marquer comme lu</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.unread}</p>
                <p className="text-sm text-gray-600">Non lues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.projects}</p>
                <p className="text-sm text-gray-600">Projets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                <p className="text-sm text-gray-600">Utilisateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.donations}</p>
                <p className="text-sm text-gray-600">Donations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.system}</p>
                <p className="text-sm text-gray-600">Système</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher dans les notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'project' | 'user' | 'donation' | 'system')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="project">Projets</option>
                <option value="user">Utilisateurs</option>
                <option value="donation">Donations</option>
                <option value="system">Système</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'read' | 'unread')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.type);
              return (
                <div 
                  key={notification.id} 
                  className={`flex items-start space-x-4 p-4 rounded-lg border transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                  }`}
                >
                  {/* Icon */}
                  <div className={`p-3 rounded-full ${getNotificationColor(notification.type)}`}>
                    <NotificationIcon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getNotificationColor(notification.type)}`}>
                            {getNotificationLabel(notification.type)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className={`text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(notification.created_at).toLocaleDateString('fr-FR')} à{' '}
                              {new Date(notification.created_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          {notification.data?.amount && (
                            <span className="text-green-600 font-medium">
                              {notification.data.amount.toLocaleString()}€
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification trouvée</h3>
              <p className="text-gray-600">Aucune notification ne correspond aux critères de recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
