import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Image, Download, Trash2, Eye, Plus, AlertTriangle, Loader, Calendar, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../lib/api';
import DocumentPreviewModal from './ui/DocumentPreviewModal';
import { useToast } from '../hooks/useToast';
import { Project, Document as GlobalDocument } from '../types';

// Interface pour les documents internes (API response)
interface InternalDocument {
    id: number;
    name: string;
    nom: string;
    type: string;
    type_document: string;
    size: string;
    taille_fichier: number;
    status: 'pending' | 'approved' | 'rejected';
    url?: string;
    extension?: string;
    created_at: string;
    projectName?: string;
    projet?: {
        id: number;
        titre: string;
    };
    rejection_reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;
}

interface ProjectDocumentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    onDocumentAdded?: () => void;
    onDocumentDeleted?: () => void;
}

const ProjectDocumentsModal: React.FC<ProjectDocumentsModalProps> = ({
    isOpen,
    onClose,
    project,
    onDocumentAdded,
    onDocumentDeleted
}) => {
    const [documents, setDocuments] = useState<InternalDocument[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<InternalDocument | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<InternalDocument | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { toasts, removeToast, success, error: showError } = useToast();

    // Form data pour l'upload
    const [uploadData, setUploadData] = useState({
        nom: '',
        type_document: 'devis',
        fichier: null as File | null
    });

    // Fonction pour adapter InternalDocument vers le format DocumentPreviewModal
    const adaptDocumentForPreview = (document: InternalDocument) => {
        return {
            id: document.id,
            name: document.name || document.nom,
            type: document.type || document.type_document,
            size: document.size || `${Math.round(document.taille_fichier / 1024)} KB`,
            status: document.status,
            url: document.url,
            extension: document.extension,
            created_at: document.created_at,
            projectName: document.projectName || document.projet?.titre,
            projet: document.projet
        };
    };

    // Helper functions pour éviter les erreurs de filtre
    const getDocumentsArray = (): InternalDocument[] => {
        return Array.isArray(documents) ? documents : [];
    };

    const getApprovedCount = () => {
        return getDocumentsArray().filter(d => d.status === 'approved').length;
    };

    const getPendingCount = () => {
        return getDocumentsArray().filter(d => d.status === 'pending').length;
    };

    // Charger les documents quand le projet change
    useEffect(() => {
        if (isOpen && project) {
            loadDocuments();
        }
    }, [isOpen, project]);

    const loadDocuments = async () => {
        if (!project) return;

        setLoading(true);
        try {
            const response = await api.get(`/projets/${project.id}/documents`);
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
            setLoading(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validation taille (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showError('Fichier trop volumineux', 'La taille maximale est de 10MB');
                return;
            }

            // Validation type de fichier
            const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'];
            const extension = '.' + file.name.split('.').pop()?.toLowerCase();
            if (!allowedTypes.includes(extension)) {
                showError('Type de fichier non supporté', 'Formats acceptés : PDF, DOC, DOCX, JPG, PNG, GIF');
                return;
            }

            setUploadData(prev => ({ ...prev, fichier: file }));

            // Auto-remplir le nom si vide
            if (!uploadData.nom) {
                setUploadData(prev => ({ ...prev, nom: file.name.replace(/\.[^/.]+$/, '') }));
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!uploadData.fichier) {
            showError('Fichier requis', 'Veuillez sélectionner un fichier');
            return;
        }

        if (!uploadData.nom.trim()) {
            showError('Nom requis', 'Veuillez saisir un nom pour le document');
            return;
        }

        if (!project) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('nom', uploadData.nom);
            formData.append('type_document', uploadData.type_document);
            formData.append('fichier', uploadData.fichier);

            console.log('🚀 Upload en cours...', {
                nom: uploadData.nom,
                type: uploadData.type_document,
                fichier: uploadData.fichier.name,
                size: uploadData.fichier.size
            });

            const response = await api.post(`/projets/${project.id}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ Document uploadé:', response.data);

            // Actualiser la liste
            await loadDocuments();

            // Réinitialiser le formulaire
            setUploadData({
                nom: '',
                type_document: 'devis',
                fichier: null
            });
            setShowUploadForm(false);

            success('Document ajouté', 'Le document a été ajouté avec succès');
            onDocumentAdded?.();

        } catch (error: any) {
            console.error('❌ Erreur upload:', error);
            const message = error.response?.data?.message || 'Erreur lors de l\'ajout du document';
            showError('Erreur d\'upload', message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = (document: InternalDocument) => {
        setDocumentToDelete(document);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!documentToDelete) return;

        try {
            setDeleting(true);
            console.log('🗑️ Suppression du document:', documentToDelete.id);
            await api.delete(`/documents/${documentToDelete.id}`);

            // Retirer de la liste locale
            setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id));

            success('Document supprimé', 'Le document a été supprimé avec succès');
            onDocumentDeleted?.();

            // Fermer la modal
            setShowDeleteModal(false);
            setDocumentToDelete(null);

        } catch (error: any) {
            console.error('❌ Erreur suppression:', error);
            const message = error.response?.data?.message || 'Erreur lors de la suppression';
            showError('Erreur de suppression', message);
        } finally {
            setDeleting(false);
        }
    };

    const handleDownload = async (document: InternalDocument) => {
        try {
            console.log('⬇️ Téléchargement du document:', document.name);

            const response = await api.get(`/documents/${document.id}/download`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = window.document.createElement('a');
            link.href = url;
            link.download = document.name || document.nom;
            window.document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            console.log('✅ Téléchargement réussi');

        } catch (error) {
            console.error('❌ Erreur téléchargement:', error);
            showError('Erreur', 'Impossible de télécharger le document');
        }
    };

    const handlePreview = (document: InternalDocument) => {
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
            projectName: document.projectName || document.projet?.titre,
            projet: document.projet
        };

        console.log('👁️ Document adapté pour prévisualisation:', adaptedDocument);
        setSelectedDocument(document);
        setShowPreviewModal(true);
    };

    const getDocumentIcon = (type: string) => {
        switch (type?.toLowerCase()) {
            case 'devis':
                return <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">DEV</span>
                </div>;
            case 'facture':
                return <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xs">FAC</span>
                </div>;
            case 'rapport':
                return <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xs">RAP</span>
                </div>;
            case 'photo':
                return <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Image className="w-5 h-5 text-orange-600" />
                </div>;
            default:
                return <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                </div>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Clock className="w-5 h-5 text-orange-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Approuvé';
            case 'rejected': return 'Rejeté';
            default: return 'En attente';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-orange-50 text-orange-700 border-orange-200';
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!isOpen || !project) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">Documents du Projet</h2>
                                <p className="text-blue-100 mt-1">{project.title}</p>
                                <div className="flex items-center space-x-4 mt-2 text-sm text-blue-200">
                                    <span className="flex items-center space-x-1">
                                        <FileText className="w-4 h-4" />
                                        <span>{getDocumentsArray().length} document{getDocumentsArray().length !== 1 ? 's' : ''}</span>
                                    </span>
                                    <span className="flex items-center space-x-1">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{getApprovedCount()} approuvé{getApprovedCount() !== 1 ? 's' : ''}</span>
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {/* Action Bar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Gestion des Documents
                                </h3>
                                {getDocumentsArray().length > 0 && (
                                    <span className="text-sm text-gray-500">
                                        Total: {getDocumentsArray().length} • En attente: {getPendingCount()}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => setShowUploadForm(!showUploadForm)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Ajouter un document</span>
                            </button>
                        </div>

                        {/* Upload Form */}
                        {showUploadForm && (
                            <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-medium text-gray-900">Nouveau Document</h4>
                                    <button
                                        onClick={() => setShowUploadForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleUpload} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Nom du document */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom du document *
                                            </label>
                                            <input
                                                type="text"
                                                value={uploadData.nom}
                                                onChange={(e) => setUploadData(prev => ({ ...prev, nom: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Ex: Devis forage village..."
                                                required
                                            />
                                        </div>

                                        {/* Type de document */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type de document *
                                            </label>
                                            <select
                                                value={uploadData.type_document}
                                                onChange={(e) => setUploadData(prev => ({ ...prev, type_document: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="devis">📄 Devis</option>
                                                <option value="facture">💰 Facture</option>
                                                <option value="rapport">📊 Rapport</option>
                                                <option value="photo">📸 Photo</option>
                                                <option value="autre">📁 Autre</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Zone de sélection de fichier */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fichier *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
                                            <input
                                                type="file"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                id="document-upload"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                                            />
                                            <label
                                                htmlFor="document-upload"
                                                className="cursor-pointer flex flex-col items-center justify-center"
                                            >
                                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-600 font-medium">
                                                    {uploadData.fichier ? uploadData.fichier.name : 'Cliquez pour sélectionner un fichier'}
                                                </span>
                                                <span className="text-xs text-gray-400 mt-1">
                                                    {uploadData.fichier
                                                        ? `${formatFileSize(uploadData.fichier.size)} - ${uploadData.fichier.type}`
                                                        : 'PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)'
                                                    }
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowUploadForm(false)}
                                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader className="w-4 h-4 animate-spin" />
                                                    <span>Upload en cours...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4" />
                                                    <span>Ajouter le document</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Documents List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader className="w-8 h-8 animate-spin text-blue-600" />
                                <span className="ml-3 text-gray-600">Chargement des documents...</span>
                            </div>
                        ) : getDocumentsArray().length === 0 ? (
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
                            <div className="grid grid-cols-1 gap-4">
                                {getDocumentsArray().map((document) => (
                                    <div
                                        key={document.id}
                                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-start space-x-4">
                                            {/* Icône du document */}
                                            <div className="flex-shrink-0">
                                                {getDocumentIcon(document.type_document)}
                                            </div>

                                            {/* Informations du document */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-medium text-gray-900 truncate">
                                                            {document.name || document.nom}
                                                        </h4>
                                                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                                            <span className="capitalize">{document.type_document}</span>
                                                            <span>•</span>
                                                            <span>{document.size || formatFileSize(document.taille_fichier || 0)}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center space-x-1">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{new Date(document.created_at).toLocaleDateString('fr-FR')}</span>
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Statut */}
                                                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                                                        {getStatusIcon(document.status)}
                                                        <span>{getStatusText(document.status)}</span>
                                                    </div>
                                                </div>

                                                {/* Raison de rejet */}
                                                {document.status === 'rejected' && document.rejection_reason && (
                                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                        <div className="flex items-start space-x-2">
                                                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-medium text-red-800">Document rejeté</p>
                                                                <p className="text-sm text-red-600 mt-1">{document.rejection_reason}</p>
                                                                {document.reviewed_by && (
                                                                    <p className="text-xs text-red-500 mt-1">
                                                                        Par {document.reviewed_by} le {new Date(document.reviewed_at!).toLocaleDateString('fr-FR')}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center space-x-2 mt-4">
                                                    <button
                                                        onClick={() => handlePreview(document)}
                                                        className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>Prévisualiser</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(document)}
                                                        className="flex items-center space-x-1 px-3 py-1.5 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-sm"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        <span>Télécharger</span>
                                                    </button>
                                                    {document.status !== 'approved' && (
                                                        <button
                                                            onClick={() => handleDelete(document)}
                                                            className="flex items-center space-x-1 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Supprimer</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de prévisualisation */}
            {showPreviewModal && selectedDocument && (
                <DocumentPreviewModal
                    isOpen={showPreviewModal}
                    onClose={() => {
                        setShowPreviewModal(false);
                        setSelectedDocument(null);
                    }}
                    document={adaptDocumentForPreview(selectedDocument)}
                    onDownload={(doc) => handleDownload(selectedDocument)}
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
                                        <XCircle className="h-5 w-5 text-red-400" />
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

            {/* Modal de suppression */}
            {showDeleteModal && documentToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                            Supprimer le document
                        </h3>

                        <p className="text-gray-600 text-center mb-6">
                            Êtes-vous sûr de vouloir supprimer le document "{documentToDelete.name || documentToDelete.nom}" ?
                            Cette action est irréversible.
                        </p>

                        <div className="flex space-x-3 justify-end">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDocumentToDelete(null);
                                }}
                                disabled={deleting}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                            >
                                {deleting ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        <span>Suppression...</span>
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        <span>Supprimer</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProjectDocumentsModal;
