
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  MapPin, 
  Users, 
  Plus,
  Edit,
  Eye,
  Trash2
} from 'lucide-react';
import { Village } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { Link } from 'react-router-dom';

const PrestataireVillages: React.FC = () => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/villages')
      .then(res => setVillages(res.data))
      .finally(() => setLoading(false));
  }, []);

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
          <h1 className="text-2xl font-bold text-gray-900">Mes Villages</h1>
          <p className="text-gray-600 mt-1">Gérez vos villages et leurs informations</p>
        </div>
        <Link to="/prestataire/villages/new">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouveau Village</span>
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {villages.map((village) => (
          <Card key={village.id} className="hover:shadow-lg transition-shadow duration-200">
            <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 rounded-t-lg relative overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt={village.name}
                className="w-full h-full object-cover mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-xl font-bold">{village.name}</h3>
                <p className="text-sm opacity-90">{village.region}</p>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Population</span>
                  </div>
                  <span className="font-semibold text-gray-900">{village.population.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Coordonnées</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {village.coordinates.lat.toFixed(2)}, {village.coordinates.lng.toFixed(2)}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Voir</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit className="w-4 h-4" />
                      <span className="text-sm">Modifier</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PrestataireVillages;
