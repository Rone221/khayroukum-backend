
import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  // Prop gardée pour compatibilité mais non utilisée
  onMenuToggle?: () => void;
}

const Header: React.FC<HeaderProps> = () => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Bienvenue, {user ? `${user.prenom} ${user.nom}` : ''}
          </h2>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={handleNotificationClick}
          className={`relative p-2 rounded-lg transition-colors ${unreadCount > 0
              ? 'hover:bg-blue-50 text-blue-600'
              : 'hover:bg-gray-100 text-gray-600'
            }`}
          title={`${unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''} notification${unreadCount > 1 ? 's' : ''}` : 'Aucune nouvelle notification'}`}
        >
          <Bell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-800">{user ? `${user.prenom} ${user.nom}` : ''}</p>
            <p className="text-xs text-gray-600 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
