
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, 
  Droplets, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { Project } from '../../types';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    validatedProjects: 0,
    pendingProjects: 0,
    totalUsers: 0,
    totalFunding: 0,
    completedProjects: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    Promise.all([api.get('/stats'), api.get('/projets')])
      .then(([statsRes, projectsRes]) => {
        setStats({
          totalProjects: statsRes.data.nombre_projets,
          validatedProjects: statsRes.data.projets_valides,
          pendingProjects: statsRes.data.projets_en_cours,
          totalUsers: statsRes.data.total_donateurs + statsRes.data.total_villages,
          totalFunding: statsRes.data.montant_total_finance,
          completedProjects: 0,
        });
        setProjects(projectsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Projets',
      value: stats.totalProjects,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Projets Validés',
      value: stats.validatedProjects,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'En Attente',
      value: stats.pendingProjects,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Financements',
      value: `${stats.totalFunding.toLocaleString()}€`,
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    },
    {
      title: 'Complétés',
      value: stats.completedProjects,
      icon: AlertCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="h-40 rounded-lg overflow-hidden relative">
        <img src="https://images.unsplash.com/photo-1600423115367-3a1eacc5a476" alt="water" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="text-white text-3xl font-bold">Tableau de bord</h1>
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme HydroManager</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projets Récents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.slice(0, 3).map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{project.title}</h4>
                    <p className="text-sm text-gray-600">{project.village ? project.village.name : 'Village inconnu'}</p>
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
                  <p className="text-sm font-medium text-gray-900">Nouveau projet soumis</p>
                  <p className="text-xs text-gray-600">Station de traitement - Dinguiraye</p>
                </div>
                <span className="text-xs text-gray-500">Il y a 2h</span>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Projet financé</p>
                  <p className="text-xs text-gray-600">Réseau de distribution - Télimélé</p>
                </div>
                <span className="text-xs text-gray-500">Il y a 1j</span>
              </div>
              
              <div className="flex items-center space-x-3 p-4 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nouvel utilisateur</p>
                  <p className="text-xs text-gray-600">Inscription prestataire</p>
                </div>
                <span className="text-xs text-gray-500">Il y a 2j</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
