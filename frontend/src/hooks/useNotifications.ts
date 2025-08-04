import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Notification } from '../types';

interface UseNotificationsResult {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

let globalRefetchCallbacks: (() => void)[] = [];

export const useNotifications = (): UseNotificationsResult => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Ajouter ce callback à la liste globale
    globalRefetchCallbacks.push(fetchNotifications);
    
    // Nettoyer au démontage
    return () => {
      globalRefetchCallbacks = globalRefetchCallbacks.filter(cb => cb !== fetchNotifications);
    };
  }, [fetchNotifications]);

  const refetch = useCallback(async () => {
    await fetchNotifications();
    // Déclencher la mise à jour de tous les autres hooks useNotifications
    globalRefetchCallbacks.forEach(cb => {
      if (cb !== fetchNotifications) {
        cb();
      }
    });
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refetch
  };
};
