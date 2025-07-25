
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderCheck, 
  Users, 
  MapPin, 
  FileText, 
  Upload,
  Heart,
  User,
  Bell,
  LogOut,
  Droplets
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getMenuItems = (role: UserRole) => {
    switch (role) {
      case 'administrateur':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: FolderCheck, label: 'Projets à valider', path: '/admin/projects' },
          { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
          { icon: Bell, label: 'Notifications', path: '/notifications' },
        ];
      case 'prestataire':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/prestataire/dashboard' },
          { icon: MapPin, label: 'Mes villages', path: '/prestataire/villages' },
          { icon: FileText, label: 'Mes projets', path: '/prestataire/projects' },
          { icon: Upload, label: 'Documents', path: '/prestataire/documents' },
          { icon: Bell, label: 'Notifications', path: '/notifications' },
        ];
      case 'donateur':
        return [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/donateur/dashboard' },
          { icon: Droplets, label: 'Projets disponibles', path: '/donateur/projects' },
          { icon: Heart, label: 'Mes contributions', path: '/donateur/contributions' },
          { icon: Bell, label: 'Notifications', path: '/notifications' },
        ];
      default:
        return [];
    }
  };

  const menuItems = user ? getMenuItems(user.role) : [];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:shadow-none
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-800">HydroManager</h1>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                        ${isActive 
                          ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User section and logout */}
          <div className="p-4 border-t border-gray-200">
            <NavLink
              to="/profile"
              onClick={onClose}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 mb-2"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profil</span>
            </NavLink>
            
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
