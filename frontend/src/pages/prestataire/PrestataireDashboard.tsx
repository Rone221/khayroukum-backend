
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  MapPin, 
  FolderCheck, 
  Upload,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  FileText
} from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Project, Village } from '../../types';

interface PrestataireDashboardStats {
  totalProjects: number;
  pendingProjects: number;
  approvedProjects: number;
  totalFunding: number;
  totalVillages: number;
}

interface Activity {
  type: string;
  title: string;
  description: string;
  time: string;
  color: string;
  status?: string;
}

const PrestataireDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PrestataireDashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get<{stats: PrestataireDashboardStats, recentProjects: Project[]}>('/prestataire/stats'),
          api.get<{activities: Activity[]}>('/prestataire/activity')
        ]);
        
        setStats(statsRes.data.stats);
        setRecentProjects(statsRes.data.recentProjects);
        setActivities(activityRes.data.activities);
      } catch (error) {
        console.error('Error fetching prestataire data:', error);
        setError("Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

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
  
  if (!stats) {
    return <div className="text-gray-600 text-center py-8">Aucune donnée disponible</div>;
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Bienvenue, {user ? `${user.prenom} ${user.nom}` : ''}</h1>
          <p className="text-blue-100 text-lg">Gérez vos projets hydrauliques et contribuez à l'accès à l'eau potable</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mes Projets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <FolderCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Attente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingProjects}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approuvés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedProjects}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Financements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalFunding.toLocaleString()}€</p>
              </div>
              <div className="p-3 rounded-lg bg-cyan-50">
                <MapPin className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/prestataire/villages/create" className="group">
          <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Nouveau Village</h3>
              <p className="text-sm text-gray-600">Ajouter un nouveau village à votre portfolio</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/prestataire/projects/new" className="group">
          <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <FolderCheck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Nouveau Projet</h3>
              <p className="text-sm text-gray-600">Créer un nouveau projet hydraulique</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/prestataire/documents" className="group">
          <Card className="hover:shadow-lg transition-all duration-200 group-hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <Upload className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
              <p className="text-sm text-gray-600">Gérer vos documents techniques</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Mes Projets Récents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Mes Projets Récents</span>
              <Link to="/prestataire/projects" className="text-sm text-blue-600 hover:text-blue-800">
                Voir tous
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects && recentProjects.length > 0 ? (
                recentProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <FolderCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{project.title}</h4>
                        <p className="text-sm text-gray-600">{project.village.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'validated' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'validated' ? 'Validé' :
                         project.status === 'completed' ? 'Terminé' :
                         project.status === 'pending' ? 'En attente' :
                         project.status === 'in_progress' ? 'En cours' :
                         project.status === 'funded' ? 'Financé' : project.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm">Aucun projet récent</p>
                  <p className="text-xs text-gray-400 mt-1">Créez votre premier projet pour commencer</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                    <div className={`w-2 h-2 rounded-full bg-${activity.color}-400`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Aucune activité récente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrestataireDashboard;
