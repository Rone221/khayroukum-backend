
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
import api from '../../lib/api';

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
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get('/contributions')
      .then(res => {
        setContributions(res.data);
        setStats({
          totalDonations: res.data.length,
          totalAmount: res.data.reduce((sum: number, c: any) => sum + c.amount, 0),
          projectsSupported: new Set(res.data.map((c: any) => c.projectTitle)).size,
          peopleHelped: res.data.reduce((sum: number, c: any) => sum + (c.peopleHelped || 0), 0)
        });
      })
      .catch(() => setError("Impossible de charger vos contributions."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">{error}</div>
      ) : (
        <>
          {/* Statistiques et impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* ...statistiques, impact, récompenses... (reprendre le JSX existant ici) */}
          </div>
          {/* Historique des contributions */}
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
                    {/* ...JSX contribution... */}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Monthly Impact Chart et Récompenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* ...Monthly Impact Chart et Récompenses JSX... */}
          </div>
        </>
      )}
    </div>
  );
}

export default DonateurContributions;
