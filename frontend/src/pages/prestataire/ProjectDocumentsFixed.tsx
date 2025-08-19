import { useState, useEffect } from 'react';
import { Plus, FileText, Upload, Download, Eye, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { Project, Document } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface ProjectDocumentsProps {
  project: Project;
  onClose: () => void;
}

interface FileUploadItem extends File {
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export const ProjectDocuments = ({ project, onClose }: ProjectDocumentsProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le token depuis localStorage
  const getToken = () => localStorage.getItem('auth_token');

  // Charger les documents du projet
  useEffect(() => {
    fetchProjectDocuments();
  }, [project.id]);

  const fetchProjectDocuments = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      const response = await fetch(`http://localhost:8000/api/projets/${project.id}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.data || []);
      } else {
        throw new Error('Erreur lors du chargement des documents');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Impossible de charger les documents du projet');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newUploadFiles: FileUploadItem[] = files.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadQueue(prev => [...prev, ...newUploadFiles]);
    processFileUploads(newUploadFiles);
  };

  const processFileUploads = async (filesToUpload: FileUploadItem[]) => {
    setUploading(true);

    for (const fileUpload of filesToUpload) {
      try {
        const formData = new FormData();
        formData.append('document', fileUpload);
        formData.append('nom', fileUpload.name);
        formData.append('description', `Document pour le projet ${project.title}`);
        formData.append('projet_id', project.id.toString());

        const token = getToken();
        const response = await fetch('http://localhost:8000/api/documents-techniques', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          body: formData,
        });

        if (response.ok) {
          setUploadQueue(prev => 
            prev.map(f => 
              f.id === fileUpload.id 
                ? { ...f, progress: 100, status: 'completed' }
                : f
            )
          );
          
          // Recharger la liste des documents
          await fetchProjectDocuments();
        } else {
          throw new Error('Erreur lors de l\'upload');
        }
      } catch (error) {
        console.error('Erreur upload:', error);
        setUploadQueue(prev => 
          prev.map(f => 
            f.id === fileUpload.id 
              ? { ...f, status: 'error' }
              : f
          )
        );
      }
    }

    setUploading(false);
    
    // Nettoyer les fichiers uploadés après 3 secondes
    setTimeout(() => {
      setUploadQueue(prev => prev.filter(f => f.status === 'uploading'));
    }, 3000);
  };

  const downloadDocument = async (document: Document) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/documents-techniques/${document.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.name || 'document';
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/documents-techniques/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return <FileText className="w-6 h-6 text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3">Chargement des documents...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Documents du projet
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {project.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Zone d'upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ajouter des documents
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
                id="document-upload"
                disabled={uploading}
              />
              <label
                htmlFor="document-upload"
                className="cursor-pointer flex flex-col items-center justify-center py-4"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Cliquez pour sélectionner des fichiers ou glissez-les ici
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PDF, DOC, DOCX, TXT, JPG, PNG (max 10MB)
                </span>
              </label>
            </div>
          </div>

          {/* Fichiers en cours d'upload */}
          {uploadQueue.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Upload en cours</h3>
              <div className="space-y-2">
                {uploadQueue.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-3">
                      {file.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : file.status === 'error' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                      )}
                      <span className="text-sm font-medium">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-700">
                Documents ({documents.length})
              </h3>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun document pour ce projet</p>
                <p className="text-sm text-gray-400">
                  Commencez par ajouter des documents ci-dessus
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {getFileIcon(document.name)}
                      <div>
                        <h4 className="font-medium text-gray-900">{document.name}</h4>
                        <p className="text-xs text-gray-400">
                          Ajouté le {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => downloadDocument(document)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDocument(document.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
      </div>
    </div>
  );
};
