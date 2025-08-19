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
  MoreVertical,
  Plus,
  X
} from 'lucide-react';
import DocumentPreviewModal from '../../components/ui/DocumentPreviewModal';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import '../../styles/project-actions.css';
import '../../styles/project-documents.css';

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

  // États pour la gestion des documents
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<any>(null);
  const [showDeleteDocumentModal, setShowDeleteDocumentModal] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState(false);
  const { toasts, removeToast, success, error: showError } = useToast();

  // Form data pour l'upload
  const [uploadData, setUploadData] = useState({
    nom: '',
    type_document: 'devis',
    fichier: null as File | null
  });

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
    if (id) {
      loadDocuments();
    }
  }, [fetchProject, id]);

  // Charger les documents du projet
  const loadDocuments = async () => {
    if (!id) return;

    setLoadingDocuments(true);
    try {
      const response = await api.get(`/projets/${id}/documents`);
      console.log('📄 Documents chargés:', response.data);

      // Extraire le tableau de documents de la structure {data: [...], total: X}
      const documentsArray = response.data.data || response.data || [];
      console.log('📋 Documents extraits:', documentsArray);

      // Vérifier que c'est bien un tableau
      if (!Array.isArray(documentsArray)) {
        console.error('⚠️ Les documents ne sont pas dans un format tableau:', documentsArray);
        setDocuments([]);
        return;
      }

      setDocuments(documentsArray);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      showError('Erreur', 'Impossible de charger les documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Upload de document
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadData(prev => ({ ...prev, fichier: file }));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadData.fichier || !id) return;

    const formData = new FormData();
    formData.append('fichier', uploadData.fichier);
    formData.append('nom', uploadData.nom);
    formData.append('type_document', uploadData.type_document);

    setUploading(true);
    try {
      console.log('⬆️ Upload en cours...', uploadData);
      await api.post(`/projets/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      success('Document ajouté', 'Le document a été ajouté avec succès');

      // Reset form
      setUploadData({ nom: '', type_document: 'devis', fichier: null });
      setShowUploadForm(false);

      // Recharger les documents
      await loadDocuments();

    } catch (error: any) {
      console.error('❌ Erreur upload:', error);
      const message = error.response?.data?.message || 'Erreur lors de l\'ajout du document';
      showError('Erreur d\'upload', message);
    } finally {
      setUploading(false);
    }
  };

  // Suppression de document
  const handleDeleteDocument = (document: any) => {
    setDocumentToDelete(document);
    setShowDeleteDocumentModal(true);
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    try {
      setDeletingDocument(true);
      console.log('🗑️ Suppression du document:', documentToDelete.id);
      await api.delete(`/documents/${documentToDelete.id}`);

      // Retirer de la liste locale
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));

      success('Document supprimé', 'Le document a été supprimé avec succès');
      setShowDeleteDocumentModal(false);
      setDocumentToDelete(null);

    } catch (error: any) {
      console.error('❌ Erreur suppression:', error);
      const message = error.response?.data?.message || 'Erreur lors de la suppression';
      showError('Erreur de suppression', message);
    } finally {
      setDeletingDocument(false);
    }
  };

  // Téléchargement de document
  const handleDownload = async (document: any) => {
    try {
      console.log('⬇️ Téléchargement du document:', document.name || document.nom);

      const response = await api.get(`/documents/${document.id}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.name || document.nom;
      link.style.display = 'none';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Téléchargement réussi:', document.name || document.nom);

    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      showError('Erreur', 'Impossible de télécharger le document');
    }
  };

  // Prévisualisation de document
  const handlePreview = (document: any) => {
    console.log('👁️ Prévisualisation du document:', document);

    // Adapter le document pour qu'il soit compatible avec DocumentPreviewModal
    const adaptedDocument = {
      id: document.id,
      name: document.name || document.nom,
      type: document.type || document.type_document,
      size: document.size || `${Math.round(document.taille_fichier / 1024)} KB`,
      status: document.status,
      url: document.url,
      extension: document.extension,
      created_at: document.created_at,
      projectName: project?.title,
      projet: {
        id: project?.id,
        titre: project?.title
      }
    };

    console.log('👁️ Document adapté pour prévisualisation:', adaptedDocument);
    setSelectedDocument(adaptedDocument);
    setShowPreviewModal(true);
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await api.delete(`/projets/${id}`);
      navigate('/prestataire/projets');
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
            <Link to="/prestataire/projets" className="action-button back">
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
          <Link to="/prestataire/projets" className="back-button">
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

          {/* Documents - Section complète et interactive */}
          <div className="documents-section">
            <div className="documents-header">
              <div className="documents-header-content">
                <h3>Documents du projet</h3>
                <div className="documents-stats">
                  {documents.length > 0 && (
                    <span className="text-sm text-gray-500">
                      Total: {documents.length} • Approuvés: {documents.filter(d => d.status === 'approved').length} • En attente: {documents.filter(d => d.status === 'pending').length}
                    </span>
                  )}
                </div>
              </div>

              <div className="documents-actions">
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un document</span>
                </button>
              </div>
            </div>

            {/* Formulaire d'upload */}
            {showUploadForm && (
              <div className="upload-form-container">
                <div className="upload-form">
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du document *
                        </label>
                        <input
                          id="nom"
                          type="text"
                          value={uploadData.nom}
                          onChange={(e) => setUploadData(prev => ({ ...prev, nom: e.target.value }))}
                          placeholder="Ex: Devis forage puits"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Type de document *
                        </label>
                        <select
                          id="type"
                          value={uploadData.type_document}
                          onChange={(e) => setUploadData(prev => ({ ...prev, type_document: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="devis">📋 Devis</option>
                          <option value="facture">🧾 Facture</option>
                          <option value="rapport">📊 Rapport</option>
                          <option value="photo">📷 Photo</option>
                          <option value="autre">📄 Autre</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="fichier" className="block text-sm font-medium text-gray-700 mb-1">
                        Fichier *
                      </label>
                      <input
                        id="fichier"
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Formats acceptés: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (max 10MB)
                      </p>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUploadForm(false);
                          setUploadData({ nom: '', type_document: 'devis', fichier: null });
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={uploading || !uploadData.nom || !uploadData.fichier}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {uploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Upload...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Ajouter</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Liste des documents */}
            <div className="documents-content">
              {loadingDocuments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Chargement des documents...</span>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
                  <p className="text-gray-600 mb-6">Ce projet n'a encore aucun document technique associé.</p>
                  <button
                    onClick={() => setShowUploadForm(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Ajouter le premier document</span>
                  </button>
                </div>
              ) : (
                <div className="documents-grid">
                  {documents.map((document) => (
                    <div key={document.id} className="document-card">
                      <div className="document-header">
                        <div className="document-info">
                          <div className="document-icon">
                            {document.type_document === 'photo' ? (
                              <div className="icon-photo">📷</div>
                            ) : document.type_document === 'devis' ? (
                              <div className="icon-devis">📋</div>
                            ) : document.type_document === 'facture' ? (
                              <div className="icon-facture">🧾</div>
                            ) : document.type_document === 'rapport' ? (
                              <div className="icon-rapport">📊</div>
                            ) : (
                              <FileText className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                        </div>

                        <div className="document-status">
                          <span className={`status-badge ${document.status === 'approved' ? 'status-approved' :
                            document.status === 'rejected' ? 'status-rejected' :
                              'status-pending'
                            }`}>
                            {document.status === 'pending' ? 'En attente' :
                              document.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                          </span>
                        </div>
                      </div>

                      <div className="document-content">
                        <h4 className="document-name">{document.name || document.nom}</h4>

                        <div className="document-meta">
                          <span className="document-type">{document.type_document}</span>
                          <span className="document-size">{document.size || `${Math.round(document.taille_fichier / 1024)} KB`}</span>
                          <span className="document-date">
                            {new Date(document.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        {document.rejection_reason && (
                          <div className="rejection-reason">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">{document.rejection_reason}</span>
                          </div>
                        )}
                      </div>

                      <div className="document-actions">
                        <button
                          onClick={() => handlePreview(document)}
                          className="action-btn preview"
                          title="Prévisualiser"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownload(document)}
                          className="action-btn download"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDocument(document)}
                          className="action-btn delete"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="action-buttons">
            <Link to={`/prestataire/projets/${project.id}/edit`} className="action-button edit">
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
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

      {/* Delete Document Modal */}
      {showDeleteDocumentModal && documentToDelete && (
        <div className="delete-modal">
          <div className="delete-modal-content">
            <div className="delete-modal-icon">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3>Supprimer le document</h3>
            <p>
              Êtes-vous sûr de vouloir supprimer le document "{documentToDelete.name || documentToDelete.nom}" ?
              Cette action est irréversible.
            </p>
            <div className="delete-modal-buttons">
              <button
                onClick={() => {
                  setShowDeleteDocumentModal(false);
                  setDocumentToDelete(null);
                }}
                className="modal-button cancel"
                disabled={deletingDocument}
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteDocument}
                className="modal-button confirm"
                disabled={deletingDocument}
              >
                {deletingDocument ? (
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

      {/* Modal de prévisualisation */}
      {showPreviewModal && selectedDocument && (
        <DocumentPreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument}
          onDownload={() => handleDownload(selectedDocument)}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[60] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ${toast.type === 'error'
              ? 'border-l-4 border-red-500'
              : toast.type === 'success'
                ? 'border-l-4 border-green-500'
                : 'border-l-4 border-blue-500'
              }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  ) : toast.type === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  {toast.message && (
                    <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={() => removeToast(toast.id)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrestataireProjectDetail;
