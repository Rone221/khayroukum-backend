
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index: React.FC = () => {
  const { user } = useAuth();
  
  console.log('Index page - User:', user);
  console.log('Index page - User role:', user?.role);
  
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('User role for switch:', user.role);
  
  switch (user.role) {
    case 'administrateur':
      console.log('Redirecting to admin dashboard');
      return <Navigate to="/admin/dashboard" replace />;
    case 'prestataire':
      console.log('Redirecting to prestataire dashboard');
      return <Navigate to="/prestataire/dashboard" replace />;
    case 'donateur':
      console.log('Redirecting to donateur dashboard');
      return <Navigate to="/donateur/dashboard" replace />;
    default:
      console.log('Unknown role, redirecting to login. Role was:', user.role);
      return <Navigate to="/login" replace />;
  }
};

export default Index;
