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
    Bell,
    Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

const MobileSidebar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();

    const getMenuItems = (role: UserRole) => {
        switch (role) {
            case 'administrateur':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
                    { icon: FolderCheck, label: 'Projets', path: '/admin/projects' },
                    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
                    { icon: Globe, label: 'Site Vitrine', path: '/admin/cms' },
                    { icon: Bell, label: 'Notifications', path: '/notifications' },
                ];
            case 'prestataire':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/prestataire/dashboard' },
                    { icon: MapPin, label: 'Villages', path: '/prestataire/villages' },
                    { icon: FileText, label: 'Projets', path: '/prestataire/projets' },
                    { icon: Upload, label: 'Documents', path: '/prestataire/documents' },
                ];
            case 'donateur':
                return [
                    { icon: LayoutDashboard, label: 'Dashboard', path: '/donateur/dashboard' },
                    { icon: FileText, label: 'Projets', path: '/donateur/projects' },
                    { icon: Heart, label: 'Contributions', path: '/donateur/contributions' },
                    { icon: Bell, label: 'Notifications', path: '/notifications' },
                ];
            default:
                return [];
        }
    };

    const menuItems = user ? getMenuItems(user.role) : [];

    return (
        <div className="flex justify-around items-center h-16 px-2">
            {menuItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={`
              flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors duration-200
              ${isActive
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-500 hover:text-gray-700'
                            }
            `}
                    >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium truncate max-w-16">{item.label}</span>
                    </NavLink>
                );
            })}
        </div>
    );
};

export default MobileSidebar;
