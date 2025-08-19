
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');

    console.log('🔍 Vérification token au démarrage:', token ? 'présent' : 'absent');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsLoading(false);

        // Verify token is still valid
        api
          .get('/me')
          .then(res => {
            console.log('✅ Token valide, utilisateur connecté');
            setUser(res.data);
            localStorage.setItem('currentUser', JSON.stringify(res.data));
          })
          .catch((error) => {
            console.log('❌ Token invalide ou expiré, déconnexion');
            console.log('Erreur détaillée:', error.response?.status);
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
            setUser(null);
          });
      } catch (error) {
        console.log('❌ Erreur de parsing, nettoyage du localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setIsLoading(false);
      }
    } else {
      console.log('🔓 Aucun token/utilisateur sauvegardé');
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('Attempting login...');
      const { data } = await api.post('/login', { email, password });
      console.log('Login successful, token received');
      localStorage.setItem('token', data.token);

      const me = await api.get('/me');
      console.log('User data received:', me.data);
      console.log('User role:', me.data.role);
      console.log('Full user object:', JSON.stringify(me.data, null, 2));
      setUser(me.data);
      localStorage.setItem('currentUser', JSON.stringify(me.data));
      console.log('User state updated');
      return true;
    } catch (err: unknown) {
      console.error('Login error:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: unknown } };
        if (axiosError.response?.data) {
          console.error('Error details:', axiosError.response.data);
        }
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const [prenom, ...rest] = name.split(' ');
      const nom = rest.join(' ');
      await api.post('/register', { prenom, nom, email, password, role });
      return await login(email, password);
    } catch (err) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
