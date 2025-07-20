import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { CheckCircle, Circle } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { Notification } from '../../types';
import toast from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications')
      .then(res => setNotifications(res.data))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = (id: string) => {
    api.patch(`/notifications/${id}/marquer-lu`).then(() => {
      setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
      toast.success('Notification marquée comme lue');
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Notifications</h1>
        <p className="text-gray-600 mt-1">Suivez les dernières activités sur vos projets</p>
      </div>
      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{notif.title}</CardTitle>
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
              <p className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
