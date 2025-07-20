import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import api from '../../lib/api';
import { MapPin } from 'lucide-react';

const PrestataireVillageCreate: React.FC = () => {
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
        },
        (error) => {
          setError("Impossible de récupérer la position : " + error.message);
        }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
    }
  };
  const [nom, setNom] = useState('');
  const [region, setRegion] = useState('');
  const [departement, setDepartement] = useState('');
  const [commune, setCommune] = useState('');
  const [population, setPopulation] = useState<number | ''>('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [photo, setPhoto] = useState('');
  const [description, setDescription] = useState('');
  const [statut, setStatut] = useState('actif');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/villages', {
        nom,
        region,
        departement,
        commune,
        population: population === '' ? null : population,
        coordinates: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
        photo,
        description,
        statut,
      });
      navigate('/prestataire/villages');
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de la création du village.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-lg shadow-xl rounded-3xl overflow-hidden bg-white border border-gray-100">
        <CardContent className="p-10">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Créer un nouveau village</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nom du village</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={nom}
                onChange={e => setNom(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Région</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={region}
                onChange={e => setRegion(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Département</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={departement}
                onChange={e => setDepartement(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Commune</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={commune}
                onChange={e => setCommune(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Population</label>
              <input
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={population}
                onChange={e => setPopulation(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2">Latitude</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  step="any"
                />
              </div>
              <div className="flex-1">
                <label className="block text-gray-700 font-medium mb-2">Longitude</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  step="any"
                />
              </div>
              <button
                type="button"
                className="flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-500 rounded-full p-1 ml-2 shadow-sm transition-colors"
                title="Utiliser ma position"
                style={{ height: '32px', width: '32px', boxShadow: '0 2px 8px 0 rgba(30, 64, 175, 0.10)', marginTop: '8px' }}
                onClick={handleGetLocation}
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Photo (URL)</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={photo}
                onChange={e => setPhoto(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Statut</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statut}
                onChange={e => setStatut(e.target.value)}
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Création...' : 'Créer le village'}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrestataireVillageCreate;
