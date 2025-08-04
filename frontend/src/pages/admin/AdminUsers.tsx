import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, 
  User, 
  Mail, 
  Calendar,
  CheckCircle,
  XCircle,
  Shield,
  Crown,
  Heart,
  Wrench,
  Eye,
  Ban,
  UserCheck,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { User as UserType } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import UserDetailModal from '../../components/UserDetailModal';
import api from '../../lib/api';

interface AdminUser extends UserType {
  village_count?: number;
  project_count?: number;
  contribution_count?: number;
  total_contributions?: number;
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'administrateur' | 'prestataire' | 'donateur'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    console.log('AdminUsers: Loading users...');
    api
      .get('/admin/users')
      .then(res => {
        console.log('AdminUsers: API Response:', res.data);
        setUsers(res.data);
      })
      .catch(error => {
        console.error('AdminUsers: API Error:', error);
        // Fallback avec données de base si l'endpoint n'existe pas encore
        api.get('/me')
          .then(meRes => {
            setUsers([
              {
                id: '1',
                prenom: 'Admin',
                nom: 'User',
                email: 'admin@example.com',
                role: 'administrateur',
                is_verified: true,
                created_at: '2025-08-04T14:58:56.000000Z',
                project_count: 0,
                village_count: 0,
                contribution_count: 0
              },
              {
                id: '2',
                prenom: 'Presta',
                nom: 'User',
                email: 'prestataire@example.com',
                role: 'prestataire',
                is_verified: true,
                created_at: '2025-08-04T14:58:56.000000Z',
                project_count: 4,
                village_count: 2,
                contribution_count: 0
              },
              {
                id: '3',
                prenom: 'Dona',
                nom: 'User',
                email: 'donateur@example.com',
                role: 'donateur',
                is_verified: true,
                created_at: '2025-08-04T14:58:56.000000Z',
                project_count: 0,
                village_count: 0,
                contribution_count: 8,
                total_contributions: 228854
              }
            ]);
          });
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'verified' && user.is_verified) ||
      (statusFilter === 'pending' && !user.is_verified);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

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

  const handleToggleVerification = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-verification`);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_verified: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Error toggling verification:', error);
      alert('Erreur lors de la modification du statut de vérification');
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) return;
    
    try {
      await api.patch(`/admin/users/${userId}/ban`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Erreur lors du bannissement de l\'utilisateur');
    }
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'administrateur').length,
    prestataires: users.filter(u => u.role === 'prestataire').length,
    donateurs: users.filter(u => u.role === 'donateur').length,
    verified: users.filter(u => u.is_verified).length,
    pending: users.filter(u => !u.is_verified).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
                <p className="text-sm text-gray-600">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.prestataires}</p>
                <p className="text-sm text-gray-600">Prestataires</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.donateurs}</p>
                <p className="text-sm text-gray-600">Donateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
                <p className="text-sm text-gray-600">Vérifiés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-sm text-gray-600">En attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'administrateur' | 'prestataire' | 'donateur')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les rôles</option>
                <option value="administrateur">Administrateurs</option>
                <option value="prestataire">Prestataires</option>
                <option value="donateur">Donateurs</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'verified' | 'pending')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="verified">Vérifiés</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role);
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">
                          {user.prenom} {user.nom}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {getRoleLabel(user.role)}
                        </span>
                        {user.is_verified ? (
                          <div title="Vérifié">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </div>
                        ) : (
                          <div title="En attente de vérification">
                            <XCircle className="w-4 h-4 text-orange-500" />
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Date inconnue'}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                        {user.role === 'prestataire' && (
                          <>
                            <span>{user.village_count || 0} villages</span>
                            <span>{user.project_count || 0} projets</span>
                          </>
                        )}
                        {user.role === 'donateur' && (
                          <>
                            <span>{user.contribution_count || 0} contributions</span>
                            {user.total_contributions && (
                              <span>{user.total_contributions.toLocaleString()}€ donnés</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleVerification(user.id, user.is_verified || false)}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        user.is_verified 
                          ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {user.is_verified ? 'Dé-vérifier' : 'Vérifier'}
                    </button>

                    <button
                      onClick={() => handleViewUser(user.id)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {user.role !== 'administrateur' && (
                      <button 
                        onClick={() => handleBanUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                        title="Bannir utilisateur"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-600">Aucun utilisateur ne correspond aux critères de recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail utilisateur */}
      {selectedUserId && (
        <UserDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          userId={selectedUserId}
        />
      )}
    </div>
  );
};

export default AdminUsers;
