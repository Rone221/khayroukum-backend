import React, { useState, useEffect } from 'react';
import {
    Upload,
    FileText,
    Download,
    Trash2,
    X,
    AlertCircle,
    CheckCircle,
    Plus,
    File,
    Image,
    FileCheck
} from 'lucide-react';
import { Project, Document } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ProjectDocumentsModalProps {
    project: Project;
    onClose: () => void;
}

interface FileUploadItem {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

export const ProjectDocumentsModal: React.FC<ProjectDocumentsModalProps> = ({ project, onClose }) => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadQueue, setUploadQueue] = useState<FileUploadItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Récupérer le token depuis localStorage
    const getToken = () => localStorage.getItem('auth_token');

    // Charger les documents du projet
    useEffect(() => {
        fetchProjectDocuments();
    }, [project.id]);

    const fetchProjectDocuments = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = getToken();

            const response = await fetch(`http://localhost:8000/api/projets/${project.id}/documents`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📄 Documents reçus du backend:', data);
                console.log('📄 Nombre de documents:', Array.isArray(data) ? data.length : 'Pas un tableau');
                console.log('📄 Type de data:', typeof data);
                const documentsArray = Array.isArray(data) ? data : (data.data || []);
                console.log('📄 Documents après traitement:', documentsArray);
                setDocuments(documentsArray);
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

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            handleFiles(files);
        }
    };

    const handleFiles = (files: File[]) => {
        const validFiles = files.filter(file => {
            // Vérifier la taille (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
                return false;
            }
            return true;
        });

        const newUploadFiles: FileUploadItem[] = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            progress: 0,
            status: 'uploading'
        }));

        setUploadQueue(prev => [...prev, ...newUploadFiles]);
        processFileUploads(newUploadFiles);
    };

    const processFileUploads = async (filesToUpload: FileUploadItem[]) => {
        setUploading(true);

        for (const fileUpload of filesToUpload) {
            try {
                const formData = new FormData();
                formData.append('fichier', fileUpload.file);
                formData.append('nom', fileUpload.file.name);
                formData.append('type_document', 'autre'); // Type par défaut

                console.log('Upload de fichier:', fileUpload.file.name);

                const token = getToken();
                const response = await fetch(`http://localhost:8000/api/projets/${project.id}/documents`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    },
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Upload réussi:', result);
                    setUploadQueue(prev =>
                        prev.map(f =>
                            f.id === fileUpload.id
                                ? { ...f, progress: 100, status: 'completed' }
                                : f
                        )
                    );

                    // Recharger la liste des documents
                    console.log('🔄 Rechargement des documents après upload...');
                    await fetchProjectDocuments();
                    console.log('✅ Rechargement terminé');
                } else {
                    const errorData = await response.json();
                    console.error('Erreur upload:', errorData);
                    throw new Error(errorData.message || 'Erreur lors de l\'upload');
                }
            } catch (error) {
                console.error('Erreur upload:', error);
                setUploadQueue(prev =>
                    prev.map(f =>
                        f.id === fileUpload.id
                            ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Erreur inconnue' }
                            : f
                    )
                );
            }
        }

        setUploading(false);

        // Nettoyer les fichiers uploadés avec succès après 3 secondes
        setTimeout(() => {
            setUploadQueue(prev => prev.filter(f => f.status !== 'completed'));
        }, 3000);
    };

    const downloadDocument = async (document: Document) => {
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8000/api/documents/${document.id}/download`, {
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
            } else {
                throw new Error('Erreur lors du téléchargement');
            }
        } catch (error) {
            console.error('Erreur téléchargement:', error);
            alert('Erreur lors du téléchargement du document');
        }
    };

    const deleteDocument = async (documentId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;

        try {
            const token = getToken();
            const response = await fetch(`http://localhost:8000/api/documents/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression du document');
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
        switch (extension) {
            case 'pdf':
                return <FileText className="w-6 h-6 text-red-500" />;
            case 'doc':
            case 'docx':
                return <FileText className="w-6 h-6 text-blue-500" />;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Image className="w-6 h-6 text-green-500" />;
            default:
                return <File className="w-6 h-6 text-gray-500" />;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <FileCheck className="w-6 h-6 text-blue-600" />
                            <span>Documents du projet</span>
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">{project.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Zone d'upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Ajouter des documents
                        </label>
                        <div
                            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${dragActive
                                ? 'border-blue-400 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                multiple
                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.xls,.xlsx"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="document-upload"
                                disabled={uploading}
                            />
                            <label
                                htmlFor="document-upload"
                                className="cursor-pointer flex flex-col items-center justify-center text-center"
                            >
                                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                <span className="text-lg font-medium text-gray-700 mb-1">
                                    Glissez vos fichiers ici ou cliquez pour sélectionner
                                </span>
                                <span className="text-sm text-gray-500">
                                    PDF, DOC, DOCX, TXT, JPG, PNG, XLS, XLSX (max 10MB par fichier)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Fichiers en cours d'upload */}
                    {uploadQueue.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Upload en cours</h3>
                            <div className="space-y-3">
                                {uploadQueue.map((fileUpload) => (
                                    <div key={fileUpload.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center space-x-3">
                                            {fileUpload.status === 'completed' ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : fileUpload.status === 'error' ? (
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                            ) : (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                            )}
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">{fileUpload.file.name}</span>
                                                {fileUpload.status === 'error' && fileUpload.error && (
                                                    <p className="text-xs text-red-600">{fileUpload.error}</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {formatFileSize(fileUpload.file.size)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Liste des documents */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                Documents liés ({documents.length})
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Chargement des documents...</span>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h4>
                                <p className="text-gray-600">
                                    Ce projet n'a pas encore de documents.
                                    Commencez par en ajouter ci-dessus.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {documents.map((document) => (
                                    <div
                                        key={document.id}
                                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            {getFileIcon(document.name)}
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{document.name}</h4>
                                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                    <span>Type: {document.type}</span>
                                                    <span>•</span>
                                                    <span>Ajouté le {new Date(document.uploadedAt).toLocaleDateString('fr-FR')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => downloadDocument(document)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Télécharger"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteDocument(document.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

export default ProjectDocumentsModal;
