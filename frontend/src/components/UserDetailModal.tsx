import React, { useState, useEffect } from 'react';
import Modal from './ui/Modal';
import { 
  User, 
  Mail, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Crown, 
  Heart, 
  Wrench,
  MapPin,
  FileText,
  Euro,
  Activity
} from 'lucide-react';
import api from '../lib/api';
import LoadingSpinner from './ui/LoadingSpinner';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface UserDetail {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  role: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  villages?: Array<{
    id: string;
    nom: string;
    region: string;
    created_at: string;
  }>;
  projets?: Array<{
    id: string;
    titre: string;
    statut: string;
    montant_cible: number;
    created_at: string;
  }>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, userId }) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      
      api.get(`/admin/users/${userId}`)
        .then(res => {
          console.log('User detail response:', res.data);
          setUser(res.data);
        })
        .catch(err => {
          console.error('Error fetching user details:', err);
          setError('Erreur lors du chargement des détails utilisateur');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'administrateur': return Crown;
      case 'prestataire': return Wrench;
      case 'donateur': return Heart;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrateur': return 'text-purple-600 bg-purple-100';
      case 'prestataire': return 'text-blue-600 bg-blue-100';
      case 'donateur': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrateur': return 'Administrateur';
      case 'prestataire': return 'Prestataire';
      case 'donateur': return 'Donateur';
      default: return role;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'validated':
      case 'valide': 
        return 'text-green-600 bg-green-100';
      case 'pending':
      case 'en_attente': 
        return 'text-orange-600 bg-orange-100';
      case 'funded':
      case 'finance': 
        return 'text-blue-600 bg-blue-100';
      default: 
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'validated':
      case 'valide': 
        return 'Validé';
      case 'pending':
      case 'en_attente': 
        return 'En attente';
      case 'funded':
      case 'finance': 
        return 'Financé';
      default: 
        return statut || 'Inconnu';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Détails de l'utilisateur" size="lg">
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      ) : user ? (
        <div className="space-y-6">
          {/* Header utilisateur */}
          <div className="flex items-center space-x-4 p-6 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">
                  {user.prenom} {user.nom}
                </h2>
                {(() => {
                  const RoleIcon = getRoleIcon(user.role);
                  return (
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role)}`}>
                      <RoleIcon className="w-4 h-4 mr-1" />
                      {getRoleLabel(user.role)}
                    </span>
                  );
                })()}
                {user.is_verified ? (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Vérifié
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Non vérifié
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Inscrit le {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-3 gap-4">
            {user.role === 'prestataire' && (
              <>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{user.villages?.length || 0}</p>
                  <p className="text-sm text-gray-600">Villages gérés</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{user.projets?.length || 0}</p>
                  <p className="text-sm text-gray-600">Projets créés</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">
                    {user.projets?.filter(p => p.statut === 'validated' || p.statut === 'valide').length || 0}
                  </p>
                  <p className="text-sm text-gray-600">Projets validés</p>
                </div>
              </>
            )}
            {user.role === 'donateur' && (
              <>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">8</p>
                  <p className="text-sm text-gray-600">Contributions</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Euro className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">40,725€</p>
                  <p className="text-sm text-gray-600">Total donné</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">5,090€</p>
                  <p className="text-sm text-gray-600">Moyenne par don</p>
                </div>
              </>
            )}
          </div>

          {/* Villages (pour les prestataires) */}
          {user.role === 'prestataire' && user.villages && user.villages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                Villages gérés ({user.villages.length})
              </h3>
              <div className="space-y-3">
                {user.villages.map(village => (
                  <div key={village.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{village.nom}</h4>
                      <p className="text-sm text-gray-600">{village.region}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Créé le</p>
                      <p>{new Date(village.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projets (pour les prestataires) */}
          {user.role === 'prestataire' && user.projets && user.projets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-green-600" />
                Projets créés ({user.projets.length})
              </h3>
              <div className="space-y-3">
                {user.projets.map(projet => (
                  <div key={projet.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{projet.titre}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(projet.statut)}`}>
                          {getStatusLabel(projet.statut)}
                        </span>
                        <span className="text-sm text-gray-600 flex items-center">
                          <Euro className="w-3 h-3 mr-1" />
                          {projet.montant_cible?.toLocaleString()}€
                        </span>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Créé le</p>
                      <p>{new Date(projet.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message si aucune donnée */}
          {user.role === 'prestataire' && (!user.villages || user.villages.length === 0) && (!user.projets || user.projets.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>Aucune activité enregistrée pour ce prestataire</p>
            </div>
          )}

          {user.role === 'administrateur' && (
            <div className="text-center py-8 bg-purple-50 rounded-lg">
              <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-900 mb-2">Administrateur</h3>
              <p className="text-purple-700">Cet utilisateur a tous les privilèges administrateur sur la plateforme.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Utilisateur non trouvé</p>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;
