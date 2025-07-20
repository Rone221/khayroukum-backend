
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

const PrestataireDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    approvedProjects: 0,
    totalVillages: 0,
    totalFunding: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.get<Project[]>('/projets'), api.get<Village[]>('/villages')])
      .then(([projectsRes, villagesRes]) => {
        const userProjects = projectsRes.data.filter((p) => p.prestataireId === user.id);
        setProjects(userProjects);
        const pendingProjects = userProjects.filter((p) => p.status === 'pending').length;
        const approvedProjects = userProjects.filter((p) => p.status === 'validated' || p.status === 'funded').length;
        const totalFunding = userProjects.reduce((sum: number, p) => sum + p.currentAmount, 0);

        setStats({
          totalProjects: userProjects.length,
          pendingProjects,
          approvedProjects,
          totalVillages: villagesRes.data.length,
          totalFunding
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const userProjects = projects;

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
        <Link to="/prestataire/villages/new" className="group">
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
              {userProjects.slice(0, 3).map((project) => (
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
                      project.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                      project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'validated' ? 'Validé' :
                       project.status === 'pending' ? 'En attente' :
                       project.status === 'funded' ? 'Financé' : project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Projet validé</p>
                  <p className="text-xs text-gray-600">Station de traitement approuvée</p>
                </div>
                <span className="text-xs text-gray-500">Il y a 2h</span>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Document téléchargé</p>
                  <p className="text-xs text-gray-600">Plans techniques ajoutés</p>
                </div>
                <span className="text-xs text-gray-500">Il y a 1j</span>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouveau village ajouté</p>
                  <p className="text-xs text-gray-600">Koundara référencé</p>
                </div>
                <span className="text-xs text-gray-500">Il y a 3j</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrestataireDashboard;
