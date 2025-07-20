
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Heart, 
  Calendar,
  Euro,
  MapPin,
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Contribution } from '../../types';

const DonateurContributions: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    projectsSupported: 0,
    peopleHelped: 0
  });

  useEffect(() => {
    setTimeout(() => {
      const mockContributions = [
        {
          id: '1',
          projectTitle: 'Station de traitement - Mamou',
          village: 'Mamou',
          region: 'Mamou',
          amount: 250,
          date: '2024-01-15',
          status: 'completed',
          progress: 100,
          peopleHelped: 15000
        },
        {
          id: '2',
          projectTitle: 'Réseau de distribution - Kindia',
          village: 'Kindia',
          region: 'Kindia',
          amount: 150,
          date: '2024-01-10',
          status: 'in_progress',
          progress: 75,
          peopleHelped: 12000
        },
        {
          id: '3',
          projectTitle: 'Forage - Dinguiraye',
          village: 'Dinguiraye',
          region: 'Faranah',
          amount: 100,
          date: '2024-01-05',
          status: 'funded',
          progress: 100,
          peopleHelped: 8000
        },
        {
          id: '4',
          projectTitle: 'Pompage solaire - Télimélé',
          village: 'Télimélé',
          region: 'Kindia',
          amount: 300,
          date: '2023-12-20',
          status: 'in_progress',
          progress: 45,
          peopleHelped: 10000
        }
      ];

      const totalAmount = mockContributions.reduce((sum, c) => sum + c.amount, 0);
      const totalPeople = mockContributions.reduce((sum, c) => sum + c.peopleHelped, 0);

      setContributions(mockContributions);
      setStats({
        totalDonations: mockContributions.length,
        totalAmount,
        projectsSupported: mockContributions.length,
        peopleHelped: totalPeople
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'funded': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in_progress': return 'En cours';
      case 'funded': return 'Financé';
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488590528505-98d2b5aba04b')] bg-cover bg-center opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Mes Contributions</h1>
          <p className="text-green-100 text-lg">Votre impact positif sur l'accès à l'eau potable</p>
        </div>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Donné</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalAmount.toLocaleString()}€</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Euro className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Projets Soutenus</p>
                <p className="text-2xl font-bold text-green-900">{stats.projectsSupported}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Personnes Aidées</p>
                <p className="text-2xl font-bold text-purple-900">{stats.peopleHelped.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Niveau Donateur</p>
                <p className="text-2xl font-bold text-orange-900">Gold</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contributions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Historique des contributions</span>
            <div className="text-sm text-gray-600">
              {contributions.length} contribution{contributions.length > 1 ? 's' : ''}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contributions.map((contribution) => (
              <div key={contribution.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {contribution.projectTitle}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{contribution.village}, {contribution.region}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(contribution.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{contribution.peopleHelped.toLocaleString()} personnes</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {contribution.amount}€
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(contribution.status)}`}>
                      {getStatusText(contribution.status)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression du projet</span>
                    <span className="text-sm text-gray-600">{contribution.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        contribution.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                      }`}
                      style={{ width: `${contribution.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Impact Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span>Votre contribution a aidé {contribution.peopleHelped.toLocaleString()} personnes</span>
                  </div>
                  <Link to={`/donateur/projects/${contribution.id}`}>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>Voir le projet</span>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Impact Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Impact mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: 'Janvier 2024', amount: 700, projects: 3 },
                { month: 'Décembre 2023', amount: 300, projects: 1 },
                { month: 'Novembre 2023', amount: 450, projects: 2 },
                { month: 'Octobre 2023', amount: 200, projects: 1 }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.month}</p>
                    <p className="text-sm text-gray-600">{item.projects} projet{item.projects > 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{item.amount}€</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Récompenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Donateur Gold</p>
                  <p className="text-sm text-gray-600">Plus de 1000€ de dons</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Champion de l'Eau</p>
                  <p className="text-sm text-gray-600">Aidé plus de 10,000 personnes</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fidèle Soutien</p>
                  <p className="text-sm text-gray-600">Soutenu 4+ projets</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DonateurContributions;
