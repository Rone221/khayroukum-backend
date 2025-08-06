
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  FolderCheck, 
  Clock,
  CheckCircle,
  Euro,
  Calendar,
  MapPin,
  User,
  Plus,
  Eye,
  Edit,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Project } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const PrestataireProjects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'funded' | 'completed'>('all');

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    api
      .get('/projets')
      .then(res => setProjects(res.data.filter((p: Project) => p.prestataireId === user.id)))
      .catch(() => setError("Impossible de charger les projets."))
      .finally(() => setLoading(false));
  }, [user]);

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'funded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'funded': return 'Financé';
      case 'completed': return 'Terminé';
      default: return status;
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
    return <div className="text-red-600 text-center py-8">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600 mt-1">Gérez vos projets hydrauliques</p>
        </div>
        <Link to="/prestataire/projets/nouveau">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouveau Projet</span>
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'En attente' },
          { key: 'validated', label: 'Validés' },
          { key: 'funded', label: 'Financés' },
          { key: 'completed', label: 'Terminés' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as 'all' | 'pending' | 'validated' | 'funded' | 'completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === filterOption.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <Link to={`/prestataire/projets/${project.id}`} className="block">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FolderCheck className="w-5 h-5 text-blue-600" />
                      <span>{project.title}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{project.village.name}, {project.village.region}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="mb-4">
                  <p className="text-gray-700">{project.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Euro className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-600 font-medium">Montant cible</span>
                    </div>
                    <p className="text-xl font-bold text-blue-900">{project.targetAmount.toLocaleString()}€</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Euro className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Montant collecté</span>
                    </div>
                    <p className="text-xl font-bold text-green-900">{project.currentAmount.toLocaleString()}€</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-600" />
                      <span className="text-sm text-purple-600 font-medium">Durée estimée</span>
                    </div>
                    <p className="text-xl font-bold text-purple-900">{project.estimatedDuration} mois</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression du financement</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((project.currentAmount / project.targetAmount) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((project.currentAmount / project.targetAmount) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Documents */}
                {project.documents.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Documents joints</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.documents.map((doc) => (
                        <span key={doc.id} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                          {doc.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Link>

            {/* Actions - En dehors du Link pour éviter les liens imbriqués */}
            <CardContent className="pt-0">
              <div className="flex space-x-3" onClick={(e) => e.stopPropagation()}>
                <Link 
                  to={`/prestataire/projets/${project.id}`} 
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir détails</span>
                </Link>
                
                <Link 
                  to={`/prestataire/projets/${project.id}/edit`} 
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </Link>
                
                <Link 
                  to={`/prestataire/projets/${project.id}/documents`} 
                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Documents</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600 mb-4">Aucun projet ne correspond aux critères sélectionnés.</p>
          <Link to="/prestataire/projets/nouveau">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Créer votre premier projet
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default PrestataireProjects;
