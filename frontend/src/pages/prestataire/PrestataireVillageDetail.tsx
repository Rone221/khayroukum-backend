import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Village } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

const PrestataireVillageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/villages/${id}`)
      .then(res => setVillage(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (!village) {
    return <div className="text-center text-red-600">Village introuvable.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <Link to="/prestataire/villages" className="text-blue-600 hover:underline mb-4 inline-block">← Retour à la liste</Link>
      <div className="bg-white shadow-xl rounded-3xl p-8">
        <h1 className="text-3xl font-bold mb-2">{village.name}</h1>
        <p className="text-gray-700 mb-4">{village.description}</p>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <span className="font-semibold">Région:</span> {village.region}
          </div>
          <div>
            <span className="font-semibold">Département:</span> {village.departement || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Commune:</span> {village.commune || 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Population:</span> {typeof village.population === 'number' ? village.population.toLocaleString() : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Coordonnées:</span> {village.coordinates ? `${village.coordinates.lat}, ${village.coordinates.lng}` : 'N/A'}
          </div>
          <div>
            <span className="font-semibold">Statut:</span> {village.statut}
          </div>
        </div>
        {village.photo && (
          <img src={village.photo} alt={village.name} className="w-full h-64 object-cover rounded-xl mb-6" />
        )}
        <div className="text-sm text-gray-500">Créé par: {village.created_by || 'N/A'}</div>
      </div>
    </div>
  );
};

export default PrestataireVillageDetail;
