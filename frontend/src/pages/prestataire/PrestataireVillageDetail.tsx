import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Users, 
  Phone, 
  Building, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import '../../styles/village-actions.css';

interface Village {
  id: number;
  nom: string;
  region: string;
  description: string;
  population: number;
  latitude: number;
  longitude: number;
  telephone?: string;
  statut: 'actif' | 'inactif';
  date_creation: string;
  photo?: string;
}

const PrestataireVillageDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [village, setVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchVillage = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/api/villages/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Village non trouvé');
        }

        const data = await response.json();
        setVillage(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVillage();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!village) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/villages/${village.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      // Redirection vers la liste des villages
      navigate('/prestataire/villages');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="village-detail-container">
        <div className="village-detail-wrapper">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="village-detail-container">
        <div className="village-detail-wrapper">
          <div className="text-center py-12">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link 
              to="/prestataire/villages"
              className="action-button back"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux villages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!village) {
    return (
      <div className="village-detail-container">
        <div className="village-detail-wrapper">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Village non trouvé</h2>
            <p className="text-gray-600 mb-6">Le village demandé n'existe pas ou a été supprimé.</p>
            <Link 
              to="/prestataire/villages"
              className="action-button back"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour aux villages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="village-detail-container">
      <div className="village-detail-wrapper">
        <div className="village-detail-content">
          {/* Section Hero */}
          <div 
            className="village-hero"
            style={{
              backgroundImage: village.photo 
                ? `url(${village.photo})` 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <div className="village-hero-content">
              <h1 className="text-4xl font-bold mb-2">{village.nom}</h1>
              <div className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5" />
                <span>{village.region}</span>
              </div>
            </div>
          </div>

          {/* Grille d'informations */}
          <div className="village-info-grid">
            <div className="info-card">
              <div className="info-label">
                <Users className="w-4 h-4" />
                Population
              </div>
              <div className="info-value">
                <div className="population-counter">
                  <div className="population-icon">
                    <Users className="w-5 h-5" />
                  </div>
                  <span>{village.population.toLocaleString()} habitants</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <div className="info-label">
                <Building className="w-4 h-4" />
                Région
              </div>
              <div className="info-value">{village.region}</div>
            </div>

            <div className="info-card">
              <div className="info-label">
                <Calendar className="w-4 h-4" />
                Date de création
              </div>
              <div className="info-value">{formatDate(village.date_creation)}</div>
            </div>

            <div className="info-card">
              <div className="info-label">
                {village.statut === 'actif' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                Statut
              </div>
              <div className="info-value">
                <span className={`status-badge ${village.statut}`}>
                  {village.statut === 'actif' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {village.statut}
                </span>
              </div>
            </div>

            {village.telephone && (
              <div className="info-card">
                <div className="info-label">
                  <Phone className="w-4 h-4" />
                  Téléphone
                </div>
                <div className="info-value">{village.telephone}</div>
              </div>
            )}

            <div className="info-card">
              <div className="info-label">
                <MapPin className="w-4 h-4" />
                Coordonnées GPS
              </div>
              <div className="info-value">
                <div className="coordinates-map">
                  <div>Latitude: {village.latitude}°</div>
                  <div>Longitude: {village.longitude}°</div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {village.description && (
            <div className="village-description">
              <h3 className="text-xl font-bold mb-4 text-gray-900">Description</h3>
              <p className="description-text">{village.description}</p>
            </div>
          )}

          {/* Boutons d'actions */}
          <div className="action-buttons">
            <Link 
              to="/prestataire/villages"
              className="action-button back"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </Link>
            
            <Link 
              to={`/prestataire/villages/${village.id}/edit`}
              className="action-button edit"
            >
              <Edit className="w-5 h-5" />
              Modifier
            </Link>
            
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="action-button delete"
            >
              <Trash2 className="w-5 h-5" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le village "{village.nom}" ? 
              Cette action est irréversible.
            </p>
            <div className="delete-modal-buttons">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="modal-button cancel"
                disabled={deleting}
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete}
                className="modal-button confirm"
                disabled={deleting}
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestataireVillageDetail;
