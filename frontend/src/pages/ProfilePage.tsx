import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { User } from '../types';
import { Edit, Save, X, Eye, EyeOff, Calendar, MapPin, Phone, Mail, Briefcase, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileData {
  user: User;
  stats: Array<{
    label: string;
    value: string | number;
    color: string;
  }>;
}

interface Activity {
  type: string;
  detail: string;
  date: string;
  color: string;
}

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    date_naissance: '',
    profession: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  });

  useEffect(() => {
    loadProfile();
    loadActivities();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfileData(response.data);
      setFormData({
        prenom: response.data.user.prenom || '',
        nom: response.data.user.nom || '',
        email: response.data.user.email || '',
        telephone: response.data.user.telephone || '',
        adresse: response.data.user.adresse || '',
        date_naissance: response.data.user.date_naissance || '',
        profession: response.data.user.profession || '',
        bio: response.data.user.bio || ''
      });
    } catch (error) {
      toast.error('Impossible de charger le profil');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const response = await api.get('/profile/activity');
      setActivities(response.data);
    } catch (error) {
      toast.error('Impossible de charger l\'activité');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSave = async () => {
    try {
      console.log('Données à envoyer:', formData);
      const response = await api.put('/profile', formData);
      console.log('Réponse reçue:', response.data);
      setProfileData(prev => prev ? { ...prev, user: response.data.user } : null);
      updateUser(response.data.user);
      setIsEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      if (error instanceof Error && 'response' in error && error.response) {
        console.log('Détails de l\'erreur:', (error.response as { data: unknown }).data);
      }
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      await api.put('/profile/password', passwordData);
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
      setIsChangingPassword(false);
      toast.success('Mot de passe mis à jour avec succès');
    } catch (error: unknown) {
      const message = error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && 
        typeof error.response.data === 'object' && error.response.data !== null &&
        'message' in error.response.data 
        ? String(error.response.data.message) 
        : 'Erreur lors du changement de mot de passe';
      toast.error(message);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrateur': return 'bg-red-100 text-red-700';
      case 'prestataire': return 'bg-blue-100 text-blue-700';
      case 'donateur': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'yellow': return 'text-yellow-600';
      case 'purple': return 'text-purple-600';
      case 'red': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Impossible de charger le profil</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header du profil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {profileData.user.prenom} {profileData.user.nom}
              </h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start items-center mb-4">
                <span className={`px-3 py-1 text-sm rounded-full font-medium capitalize ${getRoleColor(profileData.user.role)}`}>
                  {profileData.user.role}
                </span>
                {profileData.user.is_verified && (
                  <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
                    ✓ Vérifié
                  </span>
                )}
              </div>
              {profileData.user.bio && (
                <p className="text-gray-600 max-w-2xl">
                  {profileData.user.bio}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                {isEditing ? 'Annuler' : 'Modifier'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {profileData.stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold mb-1 ${getStatColor(stat.color)}`}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations personnelles */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations personnelles</CardTitle>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.user.prenom || 'Non renseigné'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.user.nom || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.user.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Téléphone
                    </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profileData.user.telephone || 'Non renseigné'}</p>
                  )}
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date de naissance
                    </label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.date_naissance}
                      onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">
                      {profileData.user.date_naissance 
                        ? new Date(profileData.user.date_naissance).toLocaleDateString('fr-FR')
                        : 'Non renseigné'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Adresse
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.user.adresse || 'Non renseigné'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Profession
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.profession}
                    onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.user.profession || 'Non renseigné'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">À propos de moi</label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Parlez-nous de vous..."
                  />
                ) : (
                  <p className="text-gray-900">{profileData.user.bio || 'Aucune description'}</p>
                )}
              </div>

              {/* Section changement de mot de passe */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Sécurité</h3>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {isChangingPassword ? 'Annuler' : 'Changer le mot de passe'}
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.password}
                        onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.password_confirmation}
                        onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handlePasswordChange}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mettre à jour le mot de passe
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activité récente */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingActivities ? (
                <div className="flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 rounded-full bg-${activity.color}-500 mt-2 flex-shrink-0`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{activity.type}</p>
                        <p className="text-sm text-gray-600">{activity.detail}</p>
                        <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
