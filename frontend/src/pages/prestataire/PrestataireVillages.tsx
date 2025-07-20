
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
    <div className="space-y-6 px-0 md:px-2 lg:px-4">
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

      <div className="flex flex-col gap-10 py-8 items-center w-full">
        {villages.map((village) => (
          <Card key={village.id} className="w-full max-w-xl shadow-2xl rounded-3xl overflow-hidden bg-white border border-gray-100 transition-transform duration-200 hover:scale-[1.03] hover:shadow-blue-200">
            <div className="h-72 relative">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt={village.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-800 via-blue-600/70 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white drop-shadow-xl">
                <h3 className="text-3xl font-extrabold tracking-tight mb-1">{village.name}</h3>
                <p className="text-lg opacity-90 font-medium">{village.region}</p>
              </div>
            </div>
            <CardContent className="p-10">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Users className="w-6 h-6 text-blue-600" />
                    <span className="text-lg text-gray-700 fo                    php artisan migrate:refresh --seed                    php artisan migrate:refresh --seednt-semibold">Population</span>
                  </div>
                  <span className="font-bold text-xl text-gray-900">{
                    typeof village.population === 'number' && !isNaN(village.population)
                      ? village.population.toLocaleString()
                      : 'N/A'
                  }</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    <span className="text-lg text-gray-700 font-semibold">Coordonnées</span>
                  </div>
                  <span className="text-lg text-gray-700">
                    {village.coordinates && typeof village.coordinates.lat === 'number' && typeof village.coordinates.lng === 'number'
                      ? `${village.coordinates.lat.toFixed(2)}, ${village.coordinates.lng.toFixed(2)}`
                      : 'N/A'}
                  </span>
                </div>
                <div className="pt-8 border-t border-gray-100">
                  <div className="flex flex-row gap-4 justify-center items-center">
                    <Link to={`/prestataire/villages/${village.id}`} className="w-full md:w-auto">
                      <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg w-full justify-center">
                        <Eye className="w-6 h-6" />
                        <span className="text-base">Voir</span>
                      </button>
                    </Link>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold shadow-lg w-full md:w-auto justify-center">
                      <Edit className="w-6 h-6" />
                      <span className="text-base">Modifier</span>
                    </button>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-semibold shadow-lg w-full md:w-auto justify-center">
                      <Trash2 className="w-6 h-6" />
                      <span className="text-base">Supprimer</span>
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
