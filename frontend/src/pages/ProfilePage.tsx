import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    api.get('/me')
      .then(res => setProfile(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        <p className="text-gray-600 mt-1">Informations personnelles de votre compte</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Prénom:</span> {profile.prenom}</p>
          <p><span className="font-medium">Nom:</span> {profile.nom}</p>
          <p><span className="font-medium">Email:</span> {profile.email}</p>
          <p><span className="font-medium">Rôle:</span> {profile.role}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
