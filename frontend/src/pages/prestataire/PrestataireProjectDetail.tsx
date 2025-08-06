import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  ArrowLeft,
  MapPin,
  Users,
  Euro,
  Calendar,
  Clock,
  FileText,
  Upload,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import '../../styles/project-actions.css';

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  village: {
    id: string;
    name: string;
    region: string;
    population: number;
    coordinates: { lat: number; lng: number };
  };
  prestataireId: string;
  prestataireName: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  estimatedDuration: number;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const PrestataireProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/projets/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
      setError('Impossible de charger les détails du projet');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await api.delete(`/projets/${id}`);
      navigate('/prestataire/projects');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du projet');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          text: 'En attente de validation',
          icon: Clock,
          class: 'status-pending'
        };
      case 'validated':
        return {
          text: 'Validé',
          icon: CheckCircle,
          class: 'status-validated'
        };
      case 'funded':
        return {
          text: 'Financé',
          icon: Euro,
          class: 'status-funded'
        };
      case 'completed':
        return {
          text: 'Terminé',
          icon: CheckCircle,
          class: 'status-completed'
        };
      default:
        return {
          text: status,
          icon: AlertTriangle,
          class: 'status-default'
        };
    }
  };

  const progressPercentage = project ? Math.min((project.currentAmount / project.targetAmount) * 100, 100) : 0;
  const statusInfo = project ? getStatusInfo(project.status) : null;
  const StatusIcon = statusInfo?.icon || Clock;

  if (loading) {
    return (
      <div className="project-detail-container">
        <div className="project-detail-wrapper">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail-container">
        <div className="project-detail-wrapper">
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error || 'Projet introuvable'}</div>
            <Link to="/prestataire/projects" className="action-button back">
              <ArrowLeft className="w-4 h-4" />
              Retour aux projets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-container">
      <div className="project-detail-wrapper">
        {/* Header */}
        <div className="project-detail-header">
          <Link to="/prestataire/projects" className="back-button">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux projets</span>
          </Link>
          
          <div className="project-hero">
            <div className="project-hero-content">
              <div className="project-title-section">
                <h1 className="project-title">{project.title}</h1>
                <div className={`status-badge ${statusInfo?.class}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span>{statusInfo?.text}</span>
                </div>
              </div>
              
              <div className="project-meta">
                <div className="meta-item">
                  <MapPin className="w-4 h-4" />
                  <span>{project.village.name}, {project.village.region}</span>
                </div>
                <div className="meta-item">
                  <Calendar className="w-4 h-4" />
                  <span>Créé le {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <Users className="w-4 h-4" />
                  <span>{project.village.population?.toLocaleString()} habitants</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="project-detail-content">
          {/* Stats Grid */}
          <div className="project-stats-grid">
            <div className="stat-card target-amount">
              <div className="stat-icon">
                <Euro className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Montant cible</div>
                <div className="stat-value">{project.targetAmount.toLocaleString()}€</div>
              </div>
            </div>

            <div className="stat-card current-amount">
              <div className="stat-icon">
                <Euro className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Montant collecté</div>
                <div className="stat-value">{project.currentAmount.toLocaleString()}€</div>
              </div>
            </div>

            <div className="stat-card progress">
              <div className="stat-icon">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Progression</div>
                <div className="stat-value">{progressPercentage.toFixed(1)}%</div>
              </div>
            </div>

            <div className="stat-card duration">
              <div className="stat-icon">
                <Clock className="w-6 h-6" />
              </div>
              <div className="stat-content">
                <div className="stat-label">Durée estimée</div>
                <div className="stat-value">{project.estimatedDuration} mois</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-header">
              <h3>Progression du financement</h3>
              <span>{progressPercentage.toFixed(1)}% complété</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="progress-amounts">
              <span>{project.currentAmount.toLocaleString()}€ collectés</span>
              <span>{project.targetAmount.toLocaleString()}€ objectif</span>
            </div>
          </div>

          {/* Description */}
          <div className="project-description">
            <h3>Description du projet</h3>
            <p className="description-text">{project.description}</p>
          </div>

          {/* Village Information */}
          <div className="village-info-section">
            <h3>Informations du village</h3>
            <div className="village-info-grid">
              <div className="info-card">
                <div className="info-icon">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="info-content">
                  <div className="info-label">Localisation</div>
                  <div className="info-value">{project.village.region}</div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <Users className="w-5 h-5" />
                </div>
                <div className="info-content">
                  <div className="info-label">Population</div>
                  <div className="info-value">{project.village.population?.toLocaleString()} habitants</div>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="info-content">
                  <div className="info-label">Coordonnées</div>
                  <div className="info-value coordinates">
                    {project.village.coordinates?.lat.toFixed(3)}, {project.village.coordinates?.lng.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents */}
          {project.documents.length > 0 && (
            <div className="documents-section">
              <h3>Documents du projet</h3>
              <div className="documents-grid">
                {project.documents.map((doc) => (
                  <div key={doc.id} className="document-card">
                    <div className="document-icon">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="document-content">
                      <div className="document-name">{doc.name}</div>
                      <div className="document-meta">
                        <span className="document-type">{doc.type}</span>
                        <span className="document-date">
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="document-actions">
                      <button className="document-action-btn view">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="document-action-btn download">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="action-buttons">
            <Link to={`/prestataire/projects/${project.id}/edit`} className="action-button edit">
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
            </Link>
            
            <Link to={`/prestataire/projects/${project.id}/documents`} className="action-button documents">
              <Upload className="w-4 h-4" />
              <span>Gérer les documents</span>
            </Link>
            
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="action-button delete"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3>Supprimer le projet</h3>
            <p>
              Êtes-vous sûr de vouloir supprimer le projet "{project.title}" ? 
              Cette action est irréversible et supprimera également tous les documents associés.
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
                {deleting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrestataireProjectDetail;
