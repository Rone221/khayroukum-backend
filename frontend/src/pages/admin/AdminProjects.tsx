
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Eye, 
  Check, 
  X, 
  Clock,
  MapPin,
  User,
  Calendar,
  Euro
} from 'lucide-react';
import { Project } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

const AdminProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'validated' | 'rejected'>('all');

  useEffect(() => {
    console.log('AdminProjects: Loading projects...');
    api
      .get('/projets')
      .then(res => {
        console.log('AdminProjects: API Response:', res.data);
        setProjects(res.data);
      })
      .catch(error => {
        console.error('AdminProjects: API Error:', error);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleValidateProject = (projectId: string) => {
    api.patch(`/projets/${projectId}/valider`).then(() => {
      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, status: 'validated' as const } : p
      ));
    });
  };

  const handleRejectProject = (projectId: string) => {
    api.delete(`/projets/${projectId}`).then(() => {
      setProjects(projects.map(p =>
        p.id === projectId ? { ...p, status: 'rejected' as const } : p
      ));
    });
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'funded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'rejected': return 'Rejeté';
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Projets</h1>
          <p className="text-gray-600 mt-1">Validez ou rejetez les projets soumis</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'pending', label: 'En attente' },
          { key: 'validated', label: 'Validés' },
          { key: 'rejected', label: 'Rejetés' }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key as 'all' | 'pending' | 'validated' | 'rejected')}
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

      {/* Projects List */}
      <div className="grid gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {project.village?.name || 'Village inconnu'}
                              {project.village?.region && `, ${project.village.region}`}
                            </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{project.prestataireName}</span>
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
              <p className="text-gray-700 mb-4">{project.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Euro className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Montant cible</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{typeof project.targetAmount === 'number' ? project.targetAmount.toLocaleString() : '0'}€</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Durée estimée</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{project.estimatedDuration} mois</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Population</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{project.village && typeof project.village.population === 'number' ? project.village.population.toLocaleString() : '0'}</p>
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

              {/* Actions */}
              <div className="flex space-x-3">
                <Link 
                  to={`/admin/projects/${project.id}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir détails</span>
                </Link>
                
                {project.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleValidateProject(project.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Valider</span>
                    </button>
                    
                    <button 
                      onClick={() => handleRejectProject(project.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Rejeter</span>
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600">Aucun projet ne correspond aux critères sélectionnés.</p>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
