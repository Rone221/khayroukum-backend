
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Heart,
  Droplets,
  Euro,
  TrendingUp,
  Users,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Project, Contribution } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const DonateurDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myContributions: 0,
    totalDonated: 0,
    projectsSupported: 0,
    impactedPeople: 0,
    availableProjects: 0
  });
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [myContributions, setMyContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    api
      .get('/projets')
      .then(res => {
        const available = res.data.filter((p: Project) => p.status === 'validated');
        setStats(s => ({
          ...s,
          availableProjects: available.length,
        }));
        setFeaturedProjects(available.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Mes Contributions',
      value: stats.myContributions,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Total Donné',
      value: `${stats.totalDonated.toLocaleString()}€`,
      icon: Euro,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Projets Soutenus',
      value: stats.projectsSupported,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Personnes Impactées',
      value: stats.impactedPeople.toLocaleString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Projets Disponibles',
      value: stats.availableProjects,
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50'
    }
  ];

  const myRecentContributions = myContributions.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Donateur</h1>
          <p className="text-gray-600 mt-1">Suivez vos contributions et découvrez de nouveaux projets</p>
        </div>
        
        <Link
          to="/donateur/projects"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Droplets className="w-4 h-4" />
          <span>Découvrir des projets</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Contributions & Featured Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mes Contributions Récentes</CardTitle>
            <Link 
              to="/donateur/contributions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myRecentContributions.map((contribution) => (
                <div key={contribution.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{contribution.projectTitle}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{contribution.amount.toLocaleString()}€</p>
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Confirmé
                    </span>
                  </div>
                </div>
              ))}
              
              {myRecentContributions.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">Aucune contribution encore</p>
                  <Link 
                    to="/donateur/projects"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Découvrir des projets
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projets à Découvrir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {featuredProjects.map((project) => (
                <div key={project.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 flex-1">{project.title}</h4>
                    <span className="text-sm text-green-600 font-medium ml-2">Validé</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{project.village.name}, {project.village.region}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-medium">
                        {project.currentAmount.toLocaleString()}€ / {project.targetAmount.toLocaleString()}€
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((project.currentAmount / project.targetAmount) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/donateur/projects/${project.id}`}
                    className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir le projet →
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Summary */}
      {stats.totalDonated > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Votre Impact</h3>
              <p className="text-gray-600 mb-4">
                Grâce à vos contributions de <span className="font-semibold text-blue-600">{stats.totalDonated.toLocaleString()}€</span>,
                vous avez aidé à améliorer l'accès à l'eau potable pour{' '}
                <span className="font-semibold text-green-600">{stats.impactedPeople.toLocaleString()} personnes</span>.
              </p>
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <Heart className="w-5 h-5 fill-current" />
                <span className="font-medium">Merci pour votre générosité !</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DonateurDashboard;
