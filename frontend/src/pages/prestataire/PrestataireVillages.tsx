
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  MapPin, 
  Users, 
  Plus,
  Edit,
  Eye,
  Trash2,
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  MoreVertical,
  FolderOpen,
  Building2
} from 'lucide-react';
import { Village } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/villages.css';

const PrestataireVillages: React.FC = () => {
  const { user } = useAuth();
  const [villages, setVillages] = useState<Village[]>([]);
  const [filteredVillages, setFilteredVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [regionFilter, setRegionFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  const fetchVillages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get<Village[]>('/villages');
      // Filtrer les villages créés par le prestataire connecté
      const userVillages = response.data.filter((village: Village) => village.created_by === user?.id);
      setVillages(userVillages);
    } catch (error) {
      console.error('Erreur lors du chargement des villages:', error);
      setError('Impossible de charger les villages');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const filterVillages = useCallback(() => {
    let filtered = villages;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(village =>
        village.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        village.region?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par région
    if (regionFilter !== 'all') {
      filtered = filtered.filter(village => village.region === regionFilter);
    }

    setFilteredVillages(filtered);
  }, [villages, searchTerm, regionFilter]);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  useEffect(() => {
    filterVillages();
  }, [filterVillages]);

  const getUniqueRegions = () => {
    const regions = villages.map(village => village.region).filter(Boolean);
    return [...new Set(regions)];
  };

  const handleDelete = async (villageId: string | number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce village ?')) {
      try {
        console.log('Tentative de suppression du village:', villageId);
        console.log('Token utilisé:', localStorage.getItem('token'));
        console.log('Utilisateur connecté:', user);
        
        const response = await api.delete(`/villages/${villageId}`);
        console.log('Suppression réussie:', response.data);
        setVillages(villages.filter(v => v.id !== villageId.toString()));
        alert('Village supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        const axiosError = error as { response?: { data?: { error?: string; message?: string }; status?: number }; message?: string };
        console.log('Status de l\'erreur:', axiosError.response?.status);
        console.log('Données de l\'erreur:', axiosError.response?.data);
        const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.message || axiosError.message || 'Erreur inconnue';
        alert(`Erreur lors de la suppression: ${errorMessage}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchVillages}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Villages</h1>
          <p className="text-gray-600 mt-1">Gérez vos villages et leurs informations</p>
        </div>
        <Link to="/prestataire/villages/create">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg">
            <Plus className="w-5 h-5" />
            <span>Nouveau Village</span>
          </button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un village..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Region Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                <option value="all">Toutes les régions</option>
                {getUniqueRegions().map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>Total: <strong className="text-gray-900">{villages.length}</strong> villages</span>
              <span>Affichés: <strong className="text-gray-900">{filteredVillages.length}</strong></span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Eye className="w-4 h-4" />
              <span>Cliquez sur un village pour voir ses détails</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredVillages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || regionFilter !== 'all' ? 'Aucun village trouvé' : 'Aucun village'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || regionFilter !== 'all' 
              ? 'Essayez de modifier vos critères de recherche' 
              : 'Commencez par créer votre premier village'
            }
          </p>
          {!searchTerm && regionFilter === 'all' && (
            <Link to="/prestataire/villages/create">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Créer un village
              </button>
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <VillageGridView villages={filteredVillages} onDelete={handleDelete} />
      ) : (
        <VillageListView villages={filteredVillages} onDelete={handleDelete} />
      )}
    </div>
  );
};

// Composant pour la vue en grille
const VillageGridView: React.FC<{ villages: Village[]; onDelete: (id: string) => void }> = ({ villages, onDelete }) => (
  <div className="village-grid">
    {villages.map((village, index) => (
      <Card key={village.id} className={`village-card overflow-hidden hover:shadow-xl transition-all duration-300 group animation-delay-${index} cursor-pointer`}>
        <div className="relative">
          <Link 
            to={`/prestataire/villages/${village.id}`} 
            className="block"
            title={`Voir les détails de ${village.name}`}
            aria-label={`Voir les détails du village ${village.name} situé à ${village.region}`}
          >
            <div className="h-48 relative overflow-hidden">
              <img 
                src={village.photo || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"}
                alt={village.name}
                className="village-image w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold mb-1 drop-shadow-lg flex items-center gap-2">
                  {village.name}
                  <Eye className="w-4 h-4 opacity-80" />
                </h3>
                <p className="text-sm opacity-90 drop-shadow">{village.region}</p>
              </div>
            </div>
          </Link>
          
          {/* Actions dropdown */}
          <div className="absolute top-4 right-4 z-10">
            <div className="relative group/dropdown">
              <button 
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all duration-200 btn-transition"
                onClick={(e) => e.preventDefault()}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <div className="dropdown-menu absolute right-0 top-10 group-hover/dropdown:opacity-100 group-hover/dropdown:visible group-hover/dropdown:translate-y-0 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-44 z-10">
                <Link 
                  to={`/prestataire/villages/${village.id}`}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir détails</span>
                </Link>
                <Link 
                  to={`/prestataire/villages/${village.id}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  onClick={() => onDelete(village.id)}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Population</span>
              </div>
              <span className="font-semibold text-gray-900">
                {village.population ? village.population.toLocaleString() : 'N/A'}
              </span>
            </div>
            
            {village.coordinates && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Coordonnées</span>
                </div>
                <span className="text-sm text-gray-600 font-mono">
                  {village.coordinates.lat.toFixed(3)}, {village.coordinates.lng.toFixed(3)}
                </span>
              </div>
            )}

            {village.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 line-clamp-2">{village.description}</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <span className="status-badge inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {village.statut || 'Actif'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Composant pour la vue en liste
const VillageListView: React.FC<{ villages: Village[]; onDelete: (id: string) => void }> = ({ villages, onDelete }) => (
  <div className="village-table bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Village</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Population</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordonnées</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {villages.map((village, index) => (
            <tr key={village.id} className={`table-row hover:bg-blue-50 transition-all duration-300 animation-delay-${index} cursor-pointer group`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/prestataire/villages/${village.id}`} 
                  className="flex items-center"
                  title={`Voir les détails de ${village.name}`}
                  aria-label={`Voir les détails du village ${village.name} situé à ${village.region}`}
                >
                  <div className="h-14 w-14 flex-shrink-0">
                    <img 
                      className="h-14 w-14 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300" 
                      src={village.photo || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"} 
                      alt={village.name} 
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {village.name}
                    </div>
                    {village.departement && (
                      <div className="text-sm text-gray-500 mt-1">{village.departement}</div>
                    )}
                    {village.description && (
                      <div className="text-xs text-gray-400 mt-1 line-clamp-1 max-w-xs">
                        {village.description}
                      </div>
                    )}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/prestataire/villages/${village.id}`} 
                  className="flex items-center"
                  title={`Voir les détails de ${village.name} - Région: ${village.region}`}
                >
                  <MapPin className="w-4 h-4 text-green-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{village.region}</div>
                    {village.commune && (
                      <div className="text-sm text-gray-500">{village.commune}</div>
                    )}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/prestataire/villages/${village.id}`} 
                  className="flex items-center"
                  title={`Population de ${village.name}: ${village.population ? village.population.toLocaleString() : 'Non définie'} habitants`}
                >
                  <Users className="w-4 h-4 text-blue-600 mr-2" />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {village.population ? village.population.toLocaleString() : 'N/A'}
                    </span>
                    {village.population && (
                      <div className="text-xs text-gray-500">habitants</div>
                    )}
                  </div>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/prestataire/villages/${village.id}`} 
                  className="block"
                  title={village.coordinates ? `Coordonnées de ${village.name}: ${village.coordinates.lat.toFixed(3)}, ${village.coordinates.lng.toFixed(3)}` : `Coordonnées de ${village.name} non définies`}
                >
                  {village.coordinates ? (
                    <div className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                      {village.coordinates.lat.toFixed(3)}, {village.coordinates.lng.toFixed(3)}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Non défini</span>
                  )}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Link 
                  to={`/prestataire/villages/${village.id}`} 
                  className="block"
                  title={`Statut de ${village.name}: ${village.statut || 'Actif'}`}
                >
                  <span className={`status-badge inline-flex px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                    village.statut === 'actif' 
                      ? 'bg-green-100 text-green-800 group-hover:bg-green-200' 
                      : 'bg-yellow-100 text-yellow-800 group-hover:bg-yellow-200'
                  }`}>
                    {village.statut || 'Actif'}
                  </span>
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-3">
                  <Link 
                    to={`/prestataire/villages/${village.id}`}
                    className="btn-transition p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-200"
                    title="Voir détails"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link 
                    to={`/prestataire/villages/${village.id}/edit`}
                    className="btn-transition p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => onDelete(village.id)}
                    className="btn-transition p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PrestataireVillages;
