
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Users, 
  Droplets, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertCircle,
  MapPin,
  Euro,
  Eye,
  BarChart3,
  Activity,
  UserCheck,
  Bell,
  Filter,
  Calendar,
  Search
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { Project } from '../../types';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d'); // '7d', '30d', '90d', 'year'
  const [stats, setStats] = useState({
    totalProjects: 0,
    validatedProjects: 0,
    pendingProjects: 0,
    totalUsers: 0,
    totalFunding: 0,
    completedProjects: 0
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [activity, setActivity] = useState<{
    type: string;
    title: string;
    detail: string;
    user: string;
    date: string;
    color: string;
  }[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [errorActivity, setErrorActivity] = useState<string | null>(null);

  useEffect(() => {
    console.log('AdminDashboard: Starting API calls...');
    
    // Charger les stats
    api.get('/stats')
      .then(statsRes => {
        console.log('API Stats Response:', statsRes.data);
        setStats({
          totalProjects: statsRes.data.nombre_projets,
          validatedProjects: statsRes.data.projets_valides,
          pendingProjects: statsRes.data.projets_en_cours,
          totalUsers: statsRes.data.total_donateurs + statsRes.data.total_villages,
          totalFunding: statsRes.data.montant_total_finance,
          completedProjects: 0,
        });
      })
      .catch(error => {
        console.error('Stats API Error:', error);
      });

    // Charger les projets séparément
    api.get('/projets')
      .then(projectsRes => {
        console.log('API Projects Response:', projectsRes.data);
        console.log('Projects count:', projectsRes.data.length);
        console.log('First project:', projectsRes.data[0]);
        setProjects(projectsRes.data);
        console.log('Projects state updated:', projectsRes.data);
      })
      .catch(error => {
        console.error('Projects API Error:', error);
      })
      .finally(() => setLoading(false));

    api.get('/admin/activity')
      .then(res => setActivity(res.data))
      .catch(() => setErrorActivity("Impossible de charger l'activité récente."))
      .finally(() => setLoadingActivity(false));
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
      {/* Enhanced Header Section */}
      <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 1000\"%3E%3Cpath d=\"M100,200 Q200,100 300,200 T500,200 T700,200 T900,200\" stroke=\"white\" stroke-width=\"2\" fill=\"none\" opacity=\"0.3\"/%3E%3Cpath d=\"M100,400 Q200,300 300,400 T500,400 T700,400 T900,400\" stroke=\"white\" stroke-width=\"2\" fill=\"none\" opacity=\"0.2\"/%3E%3Cpath d=\"M100,600 Q200,500 300,600 T500,600 T700,600 T900,600\" stroke=\"white\" stroke-width=\"2\" fill=\"none\" opacity=\"0.1\"/%3E%3C/svg%3E')"
          }}
        ></div>
        <div className="absolute inset-0">
          <div className="flex items-center justify-between h-full p-8">
            <div>
              <h1 className="text-white text-4xl font-bold mb-2">Dashboard Administrateur</h1>
              <p className="text-blue-100 text-lg">Vue d'ensemble de la plateforme Khayroukoum</p>
              <div className="mt-4 flex items-center space-x-4 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Dernière mise à jour: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex space-x-3">
              <Link 
                to="/admin/projects"
                className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Voir tous les projets</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Aperçu des statistiques</h2>
          <p className="text-gray-600">Données en temps réel de la plateforme</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 group cursor-pointer border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      {stats.totalProjects > 0 && <TrendingUp className="w-3 h-3 text-green-500" />}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects - Larger */}
        <Card className="lg:col-span-2 shadow-md border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span>Projets Récents</span>
              </CardTitle>
              <Link 
                to="/admin/projects"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>Voir tout</span>
                <Eye className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                console.log('Rendering projects section, projects:', projects);
                console.log('Projects length:', projects.length);
                return null;
              })()}
              {projects.length === 0 ? (
                <div className="text-gray-600 text-center py-8">
                  <Droplets className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>Aucun projet disponible</p>
                  <p className="text-sm text-gray-500 mt-2">Vérifiez la console pour les logs API</p>
                </div>
              ) : (
                projects.slice(0, 4).map((project) => {
                  console.log('Rendering project:', project);
                  return (
                  <div key={project.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Droplets className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {project.title || 'Projet sans titre'}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>
                              {project.village?.name || 'Village non spécifié'}
                              {project.village?.region && `, ${project.village.region}`}
                            </span>
                          </div>
                          {project.targetAmount && (
                            <div className="flex items-center space-x-1">
                              <Euro className="w-3 h-3" />
                              <span>{project.targetAmount.toLocaleString()}€</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'validated' ? 'bg-green-100 text-green-800' :
                        project.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'validated' ? 'Validé' :
                         project.status === 'pending' ? 'En attente' :
                         project.status === 'funded' ? 'Financé' : 
                         project.status || 'Statut inconnu'}
                      </span>
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="shadow-md border-0">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Activité Récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingActivity ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : errorActivity ? (
              <div className="text-red-600 text-center py-8 text-sm">{errorActivity}</div>
            ) : (
              <div className="space-y-3">
                {activity.length === 0 && (
                  <div className="text-gray-600 text-center py-8 text-sm">
                    Aucune activité récente
                  </div>
                )}
                {activity.slice(0, 6).map((act, idx) => (
                  <div key={idx} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-2 ${act.color || 'bg-gray-400'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{act.title}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{act.detail}</p>
                      <p className="text-xs text-gray-500 mt-1">{act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Actions Rapides</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              to="/admin/projects" 
              className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gérer les Projets</p>
                <p className="text-sm text-gray-600">Valider & superviser</p>
              </div>
            </Link>

            <Link 
              to="/admin/users" 
              className="flex items-center space-x-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Gérer les Utilisateurs</p>
                <p className="text-sm text-gray-600">Prestataires & donateurs</p>
              </div>
            </Link>

            <Link 
              to="/admin/notifications" 
              className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group"
            >
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-600">Centre de messages</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
