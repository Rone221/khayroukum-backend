import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiUpload, 
  FiFile, 
  FiDownload, 
  FiEye, 
  FiTrash2, 
  FiPlus,
  FiFileText,
  FiImage,
  FiFolder,
  FiCalendar,
  FiUser,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../../styles/project-documents.css';

interface Document {
  id: number;
  nom: string;
  type_document: string;
  taille_fichier: number;
  chemin_fichier: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  titre: string;
  description: string;
  statut: string;
  village: {
    nom: string;
  };
}

const ProjectDocuments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // États pour le formulaire d'upload
  const [uploadData, setUploadData] = useState({
    nom: '',
    type_document: 'devis',
    fichier: null as File | null
  });

  // Charger les données du projet et ses documents
  const loadProjectData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Charger le projet
      const projectResponse = await fetch(`http://localhost:8000/api/projets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!projectResponse.ok) {
        throw new Error('Erreur lors du chargement du projet');
      }

      const projectData = await projectResponse.json();
      setProject(projectData);

      // Charger les documents
      const documentsResponse = await fetch(`http://localhost:8000/api/projets/${id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData);
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id, loadProjectData]);

  // Gérer l'upload d'un document
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadData.fichier) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    if (!uploadData.nom.trim()) {
      toast.error('Veuillez saisir un nom pour le document');
      return;
    }

    setUploading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('nom', uploadData.nom);
      formData.append('type_document', uploadData.type_document);
      formData.append('fichier', uploadData.fichier);

      const response = await fetch(`http://localhost:8000/api/projets/${id}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const newDocument = await response.json();
      setDocuments(prev => [...prev, newDocument]);
      
      // Réinitialiser le formulaire
      setUploadData({
        nom: '',
        type_document: 'devis',
        fichier: null
      });
      setShowUploadForm(false);
      
      toast.success('Document ajouté avec succès');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout du document');
    } finally {
      setUploading(false);
    }
  };

  // Gérer la suppression d'un document
  const handleDelete = async (documentId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document supprimé');
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Gérer le téléchargement d'un document
  const handleDownload = async (documentId: number, documentName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  // Utilitaires
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'devis':
      case 'facture':
        return <FiFileText />;
      case 'image':
      case 'photo':
        return <FiImage />;
      default:
        return <FiFile />;
    }
  };

  const getDocumentTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'devis': 'Devis',
      'facture': 'Facture',
      'rapport': 'Rapport',
      'photo': 'Photo',
      'autre': 'Autre'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="project-documents-container">
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Chargement des documents...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-documents-container">
        <div className="error-wrapper">
          <FiAlertCircle size={48} />
          <h2>Projet non trouvé</h2>
          <p>Le projet demandé n'existe pas ou vous n'avez pas l'autorisation de le consulter.</p>
          <button 
            className="action-button cancel"
            onClick={() => navigate('/prestataire/projets')}
          >
            <FiArrowLeft />
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-documents-container">
      <div className="project-documents-wrapper">
        {/* Header */}
        <div className="project-documents-header">
          <Link 
            to={`/prestataire/projets/${id}`}
            className="back-button"
          >
            <FiArrowLeft />
            Retour au projet
          </Link>
          
          <div className="header-content">
            <div className="header-icon">
              <FiFolder size={32} />
            </div>
            <div className="header-text">
              <h1>Documents du projet</h1>
              <p className="project-name">{project.titre}</p>
              <p className="project-village">Village : {project.village?.nom}</p>
            </div>
          </div>

          <button 
            className="add-document-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            <FiPlus />
            Ajouter un document
          </button>
        </div>

        {/* Upload Form */}
        {showUploadForm && (
          <div className="upload-form-container">
            <div className="upload-form-card">
              <div className="upload-form-header">
                <h3>Ajouter un nouveau document</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowUploadForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="upload-form">
                <div className="form-group">
                  <label htmlFor="nom">
                    Nom du document *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    value={uploadData.nom}
                    onChange={(e) => setUploadData(prev => ({ ...prev, nom: e.target.value }))}
                    placeholder="Ex: Devis matériaux construction"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type_document">
                    Type de document *
                  </label>
                  <select
                    id="type_document"
                    value={uploadData.type_document}
                    onChange={(e) => setUploadData(prev => ({ ...prev, type_document: e.target.value }))}
                  >
                    <option value="devis">Devis</option>
                    <option value="facture">Facture</option>
                    <option value="rapport">Rapport</option>
                    <option value="photo">Photo</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="fichier">
                    Fichier *
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="fichier"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setUploadData(prev => ({ ...prev, fichier: file }));
                      }}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      required
                    />
                    {uploadData.fichier && (
                      <div className="file-info">
                        <FiFile />
                        <span>{uploadData.fichier.name}</span>
                        <span className="file-size">
                          ({formatFileSize(uploadData.fichier.size)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="action-button cancel"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="action-button submit"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <div className="spinner"></div>
                        Upload...
                      </>
                    ) : (
                      <>
                        <FiUpload />
                        Ajouter
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="documents-section">
          {documents.length === 0 ? (
            <div className="empty-state">
              <FiFolder size={64} />
              <h3>Aucun document</h3>
              <p>Ce projet n'a encore aucun document associé.</p>
              <button 
                className="action-button submit"
                onClick={() => setShowUploadForm(true)}
              >
                <FiPlus />
                Ajouter le premier document
              </button>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((document, index) => (
                <div key={document.id} className="document-card" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="document-header">
                    <div className="document-icon">
                      {getDocumentIcon(document.type_document)}
                    </div>
                    <div className="document-type-badge">
                      {getDocumentTypeLabel(document.type_document)}
                    </div>
                  </div>
                  
                  <div className="document-content">
                    <h4 className="document-name">{document.nom}</h4>
                    <div className="document-meta">
                      <div className="meta-item">
                        <FiCalendar size={14} />
                        <span>{new Date(document.created_at).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="meta-item">
                        <FiFile size={14} />
                        <span>{formatFileSize(document.taille_fichier || 0)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="document-actions">
                    <button 
                      className="action-btn view"
                      onClick={() => handleDownload(document.id, document.nom)}
                      title="Télécharger"
                    >
                      <FiDownload />
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDelete(document.id)}
                      title="Supprimer"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDocuments;
