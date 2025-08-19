import React, { useState } from 'react';
import {
    FileText,
    Image,
    FileCheck,
    Calendar,
    Download,
    Eye,
    Grid3X3,
    List,
    X,
    Trash2,
    AlertTriangle,
    Check,
    CheckSquare,
    Square,
    Upload,
    Plus,
    File
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import ConfirmDialog from './ui/ConfirmDialog';
import ToastContainer from './ui/ToastNotification';
import DocumentPreviewModal from './ui/DocumentPreviewModal';
import { useToast } from '../hooks/useToast';
import api from '../lib/api';

interface Document {
    id: number;
    name: string;
    type: string;
    size: string;
    status: string;
    url?: string;
    created_at: string;
}

interface ProjectViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        id: number;
        name: string;
        documents: Document[];
    } | null;
    onDocumentDeleted?: () => void; // Callback pour rafraîchir la liste après suppression
}

const ProjectViewModal: React.FC<ProjectViewModalProps> = ({
    isOpen,
    onClose,
    project,
    onDocumentDeleted
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(new Set());
    const [isMultiDeleteMode, setIsMultiDeleteMode] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [documentToPreview, setDocumentToPreview] = useState<Document | null>(null);
    const [previewLoading, setPreviewLoading] = useState<number | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        nom: '',
        type_document: 'autre' as 'devis' | 'facture' | 'rapport' | 'photo' | 'autre',
        fichier: null as File | null
    });
    const [isNameManuallySet, setIsNameManuallySet] = useState(false);
    const { toasts, removeToast, success, error } = useToast();

    if (!isOpen || !project) return null;

    const handleDownload = async (doc: Document) => {
        try {
            console.log('🔽 Téléchargement du document:', doc.name, '(ID:', doc.id, ')');

            // Utiliser l'API pour télécharger le document
            const response = await api.get(`/documents/${doc.id}/download`, {
                responseType: 'blob'  // Important pour les fichiers
            });

            console.log('📦 Réponse téléchargement:', {
                status: response.status,
                contentType: response.headers['content-type'],
                contentDisposition: response.headers['content-disposition']
            });

            // Extraire le nom de fichier du header Content-Disposition si disponible
            let fileName = doc.name;
            const contentDisposition = response.headers['content-disposition'];
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (fileNameMatch) {
                    fileName = fileNameMatch[1].replace(/['"]/g, '');
                }
            }

            console.log('📄 Nom de fichier pour téléchargement:', fileName);

            // Créer une URL temporaire pour le blob avec le bon type MIME
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/octet-stream'
            });
            const url = window.URL.createObjectURL(blob);

            // Créer un lien temporaire pour télécharger
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Nettoyer l'URL temporaire
            window.URL.revokeObjectURL(url);

            success('Téléchargement démarré', `Le document "${fileName}" est en cours de téléchargement`);
        } catch (err: any) {
            console.error('❌ Erreur lors du téléchargement:', err);
            const errorMessage = err.response?.data?.message || 'Impossible de télécharger le document';
            error('Erreur de téléchargement', errorMessage);
        }
    };

    const handlePreview = (doc: Document) => {
        setPreviewLoading(doc.id);
        setDocumentToPreview(doc);
        setShowPreviewModal(true);
        // Le loading sera géré par le DocumentPreviewModal lui-même
        setTimeout(() => setPreviewLoading(null), 500); // Reset après un court délai
    };

    const handleClosePreview = () => {
        setShowPreviewModal(false);
        setDocumentToPreview(null);
        setPreviewLoading(null);
    };

    const handleDeleteClick = (doc: Document) => {
        setDocumentToDelete(doc);
        setShowConfirmDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!documentToDelete) return;

        try {
            setDeleteLoading(documentToDelete.id);

            // Utiliser la route spécifique prestataire : /api/prestataire/documents/{id}
            const response = await api.delete(`/prestataire/documents/${documentToDelete.id}`);

            if (response.status === 200) {
                success('Document supprimé', `Le document "${documentToDelete.name}" a été supprimé avec succès`);
                onDocumentDeleted?.(); // Callback pour rafraîchir
                onClose(); // Fermer le modal
            }
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            error('Erreur de suppression', 'Impossible de supprimer le document');
        } finally {
            setDeleteLoading(null);
            setShowConfirmDialog(false);
            setDocumentToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowConfirmDialog(false);
        setDocumentToDelete(null);
    };

    // Fonctions pour la sélection multiple
    const toggleDocumentSelection = (docId: number) => {
        const newSelected = new Set(selectedDocuments);
        if (newSelected.has(docId)) {
            newSelected.delete(docId);
        } else {
            newSelected.add(docId);
        }
        setSelectedDocuments(newSelected);
    };

    const selectAllDocuments = () => {
        if (selectedDocuments.size === project.documents.length) {
            setSelectedDocuments(new Set());
        } else {
            setSelectedDocuments(new Set(project.documents.map(doc => doc.id)));
        }
    };

    const enterMultiSelectMode = () => {
        setIsMultiDeleteMode(true);
        setSelectedDocuments(new Set());
    };

    const exitMultiSelectMode = () => {
        setIsMultiDeleteMode(false);
        setSelectedDocuments(new Set());
    };

    const handleBulkDelete = () => {
        if (selectedDocuments.size > 0) {
            setShowBulkDeleteConfirm(true);
        }
    };

    const confirmBulkDelete = async () => {
        if (selectedDocuments.size === 0) return;

        try {
            setDeleteLoading(-1); // Indicateur pour suppression multiple

            const selectedIds = Array.from(selectedDocuments);

            // Utiliser la nouvelle route pour suppression multiple
            const response = await api.post('/prestataire/documents/bulk-delete', {
                document_ids: selectedIds
            });

            if (response.status === 200 || response.status === 207) {
                const data = response.data;
                success(
                    'Documents supprimés',
                    data.message
                );

                // Afficher les erreurs s'il y en a
                if (data.errors && data.errors.length > 0) {
                    data.errors.forEach((errorMsg: string) => {
                        error('Erreur partielle', errorMsg);
                    });
                }
            }

            onDocumentDeleted?.();
            exitMultiSelectMode();
            onClose();
        } catch (err: any) {
            console.error('Erreur lors de la suppression multiple:', err);
            const errorMessage = err.response?.data?.message || 'Impossible de supprimer certains documents';
            error('Erreur de suppression', errorMessage);
        } finally {
            setDeleteLoading(null);
            setShowBulkDeleteConfirm(false);
        }
    };

    const cancelBulkDelete = () => {
        setShowBulkDeleteConfirm(false);
    };

    // Fonctions pour l'upload de fichiers
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            // Extraire le nom du fichier sans l'extension
            const fileName = file.name.replace(/\.[^/.]+$/, "");

            setUploadForm(prev => ({
                ...prev,
                fichier: file,
                // Préremplir le nom avec le nom du fichier seulement si l'utilisateur n'a pas encore modifié le nom
                nom: isNameManuallySet ? prev.nom : fileName
            }));
        }
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setUploadForm(prev => ({ ...prev, nom: value }));

        // Marquer le nom comme manuellement défini si l'utilisateur tape quelque chose
        if (value.trim() !== '' && !isNameManuallySet) {
            setIsNameManuallySet(true);
        } else if (value.trim() === '') {
            setIsNameManuallySet(false);
        }
    }; const handleUploadSubmit = async () => {
        if (!uploadForm.fichier) {
            error('Erreur', 'Veuillez sélectionner un fichier');
            return;
        }

        if (!uploadForm.nom.trim()) {
            error('Erreur', 'Veuillez saisir un nom pour le document');
            return;
        }

        try {
            setUploadLoading(true);

            const formData = new FormData();
            formData.append('nom', uploadForm.nom);
            formData.append('type_document', uploadForm.type_document);
            formData.append('fichier', uploadForm.fichier);

            await api.post(`/projets/${project.id}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            success(
                'Document ajouté',
                `Le document "${uploadForm.nom}" a été ajouté avec succès`
            );

            // Réinitialiser le formulaire
            setUploadForm({ nom: '', type_document: 'autre', fichier: null });
            setIsNameManuallySet(false);
            setShowUploadModal(false);

            // Rafraîchir la liste
            onDocumentDeleted?.(); // Réutiliser le callback pour rafraîchir

        } catch (err: any) {
            console.error('Erreur lors de l\'upload:', err);
            const errorMessage = err.response?.data?.message || 'Erreur lors de l\'ajout du document';
            error('Erreur d\'upload', errorMessage);
        } finally {
            setUploadLoading(false);
        }
    };

    const cancelUpload = () => {
        setShowUploadModal(false);
        setUploadForm({ nom: '', type_document: 'autre', fichier: null });
        setIsNameManuallySet(false);
    };

    const getFileIcon = (type: string, size: string = 'w-6 h-6') => {
        const iconClass = `${size}`;
        switch (type?.toLowerCase()) {
            case 'pdf':
                return <FileText className={`${iconClass} text-red-500`} />;
            case 'images':
            case 'image':
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <Image className={`${iconClass} text-blue-500`} />;
            default:
                return <FileCheck className={`${iconClass} text-gray-500`} />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'approved': return 'Approuvé';
            case 'pending': return 'En attente';
            case 'rejected': return 'Rejeté';
            default: return status;
        }
    };

    const renderGridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.documents.map((doc) => (
                <Card key={doc.id} className={`group hover:shadow-lg transition-all duration-300 border-2 relative ${selectedDocuments.has(doc.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:border-blue-200'
                    }`}>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Checkbox en mode sélection multiple */}
                            {isMultiDeleteMode && (
                                <div className="absolute top-2 left-2">
                                    <button
                                        onClick={() => toggleDocumentSelection(doc.id)}
                                        className="p-1 hover:bg-white/80 rounded"
                                    >
                                        {selectedDocuments.has(doc.id) ? (
                                            <CheckSquare className="w-5 h-5 text-blue-600" />
                                        ) : (
                                            <Square className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            )}

                            {/* Icon */}
                            <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                                {getFileIcon(doc.type, 'w-12 h-12')}
                            </div>

                            {/* Document Info */}
                            <div className="space-y-2 w-full">
                                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                    {doc.name}
                                </h3>

                                {/* Status Badge */}
                                <div className="flex justify-center">
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                                        {getStatusText(doc.status)}
                                    </span>
                                </div>

                                {/* Metadata */}
                                <div className="text-xs text-gray-500 space-y-1">
                                    <div className="flex items-center justify-center space-x-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="font-medium">{doc.size}</div>
                                    <div className="capitalize bg-gray-100 px-2 py-0.5 rounded text-xs">
                                        {doc.type}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            {!isMultiDeleteMode && (
                                <div className="flex space-x-2 w-full justify-center">
                                    {doc.url && (
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Télécharger"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handlePreview(doc)}
                                        disabled={previewLoading === doc.id}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Voir"
                                    >
                                        {previewLoading === doc.id ? (
                                            <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(doc)}
                                        disabled={deleteLoading === doc.id}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        title="Supprimer"
                                    >
                                        {deleteLoading === doc.id ? (
                                            <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="space-y-3">
            {project.documents.map((doc) => (
                <Card key={doc.id} className={`hover:shadow-md transition-shadow ${selectedDocuments.has(doc.id)
                        ? 'border-blue-500 bg-blue-50'
                        : ''
                    }`}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                                {/* Checkbox en mode sélection multiple */}
                                {isMultiDeleteMode && (
                                    <div>
                                        <button
                                            onClick={() => toggleDocumentSelection(doc.id)}
                                            className="p-1 hover:bg-white/80 rounded"
                                        >
                                            {selectedDocuments.has(doc.id) ? (
                                                <CheckSquare className="w-5 h-5 text-blue-600" />
                                            ) : (
                                                <Square className="w-5 h-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                )}

                                <div className="p-2 bg-gray-50 rounded-lg">
                                    {getFileIcon(doc.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 text-sm">{doc.name}</h3>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                                        </span>
                                        <span>{doc.size}</span>
                                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded">
                                            {doc.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(doc.status)}`}>
                                    {getStatusText(doc.status)}
                                </span>
                                {!isMultiDeleteMode && (
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => handleDownload(doc)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Télécharger"
                                        >
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handlePreview(doc)}
                                            disabled={previewLoading === doc.id}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Voir"
                                        >
                                            {previewLoading === doc.id ? (
                                                <div className="w-4 h-4 border-2 border-green-300 border-t-green-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(doc)}
                                            disabled={deleteLoading === doc.id}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Supprimer"
                                        >
                                            {deleteLoading === doc.id ? (
                                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl max-h-[90vh] w-full overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {project.name}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {project.documents.length} document{project.documents.length > 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* View Mode Toggle */}
                        <div className="flex items-center space-x-2">
                            {!isMultiDeleteMode && (
                                <>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                        title="Ajouter des documents"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Ajouter</span>
                                    </button>
                                    <button
                                        onClick={enterMultiSelectMode}
                                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                        title="Mode sélection multiple"
                                    >
                                        Sélectionner
                                    </button>
                                    <div className="bg-gray-100 rounded-lg p-1 flex">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            title="Vue grille"
                                        >
                                            <Grid3X3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded transition-colors ${viewMode === 'list'
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                            title="Vue liste"
                                        >
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Fermer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Barre d'actions pour sélection multiple */}
                {isMultiDeleteMode && (
                    <div className="px-6 py-4 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={selectAllDocuments}
                                className="flex items-center space-x-2 text-sm font-medium text-blue-700 hover:text-blue-800"
                            >
                                {selectedDocuments.size === project.documents.length ? (
                                    <CheckSquare className="w-4 h-4" />
                                ) : (
                                    <Square className="w-4 h-4" />
                                )}
                                <span>
                                    {selectedDocuments.size === project.documents.length
                                        ? 'Tout désélectionner'
                                        : 'Tout sélectionner'
                                    }
                                </span>
                            </button>
                            <span className="text-sm text-gray-600">
                                {selectedDocuments.size} document{selectedDocuments.size > 1 ? 's' : ''} sélectionné{selectedDocuments.size > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleBulkDelete}
                                disabled={selectedDocuments.size === 0 || deleteLoading === -1}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {deleteLoading === -1 ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                                <span>Supprimer ({selectedDocuments.size})</span>
                            </button>
                            <button
                                onClick={exitMultiSelectMode}
                                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {project.documents.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="max-w-sm mx-auto">
                                <div className="p-4 bg-gray-100 rounded-full inline-flex mb-4">
                                    <FileText className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document</h3>
                                <p className="text-gray-600 mb-6">Ce projet ne contient pas encore de documents.</p>
                                <button
                                    onClick={() => setShowUploadModal(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span>Ajouter le premier document</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {viewMode === 'grid' ? renderGridView() : renderListView()}
                        </>
                    )}
                </div>
            </div>

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onClose={removeToast} />

            {/* Modal d'upload de documents */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Upload className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Ajouter des documents
                                    </h3>
                                </div>
                                <button
                                    onClick={cancelUpload}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Projet: <span className="font-medium">{project.name}</span>
                            </p>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Nom du document */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom du document <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={uploadForm.nom}
                                        onChange={handleNameChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Saisir le nom du document..."
                                    />
                                </div>

                                {/* Type de document */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type de document <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={uploadForm.type_document}
                                        onChange={(e) => setUploadForm(prev => ({
                                            ...prev,
                                            type_document: e.target.value as 'devis' | 'facture' | 'rapport' | 'photo' | 'autre'
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="autre">Autre</option>
                                        <option value="devis">Devis</option>
                                        <option value="facture">Facture</option>
                                        <option value="rapport">Rapport</option>
                                        <option value="photo">Photo</option>
                                    </select>
                                </div>

                                {/* Zone de drop */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fichier <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                        />
                                        <label
                                            htmlFor="file-upload"
                                            className="cursor-pointer flex flex-col items-center space-y-2"
                                        >
                                            <div className="p-3 bg-gray-100 rounded-full">
                                                <File className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    Cliquez pour sélectionner un fichier
                                                </span>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    PDF, DOC, DOCX, JPG, PNG, TXT (max 10MB)
                                                </p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Fichier sélectionné */}
                                {uploadForm.fichier && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            Fichier sélectionné
                                        </h4>
                                        <div className="flex items-center space-x-2 text-sm text-gray-700 bg-gray-50 rounded p-3">
                                            <File className="w-4 h-4 text-gray-500" />
                                            <span className="flex-1 truncate">{uploadForm.fichier.name}</span>
                                            <span className="text-xs text-gray-500">
                                                {(uploadForm.fichier.size / 1024 / 1024).toFixed(2)} MB
                                            </span>
                                            <button
                                                onClick={() => setUploadForm(prev => ({ ...prev, fichier: null, nom: isNameManuallySet ? prev.nom : '' }))}
                                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                title="Supprimer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 flex space-x-3">
                            <button
                                onClick={cancelUpload}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleUploadSubmit}
                                disabled={!uploadForm.fichier || !uploadForm.nom.trim() || uploadLoading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors flex items-center justify-center space-x-2"
                            >
                                {uploadLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Upload className="w-4 h-4" />
                                )}
                                <span>
                                    {uploadLoading ? 'Ajout...' : 'Ajouter le document'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog pour suppression simple */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Confirmer la suppression"
                message={`Êtes-vous sûr de vouloir supprimer le document "${documentToDelete?.name}" ? Cette action est irréversible.`}
                type="danger"
                confirmText="Supprimer"
                cancelText="Annuler"
                loading={deleteLoading !== null && deleteLoading !== -1}
            />

            {/* Confirm Dialog pour suppression multiple */}
            <ConfirmDialog
                isOpen={showBulkDeleteConfirm}
                onClose={cancelBulkDelete}
                onConfirm={confirmBulkDelete}
                title="Confirmer la suppression multiple"
                message={`Êtes-vous sûr de vouloir supprimer ${selectedDocuments.size} document${selectedDocuments.size > 1 ? 's' : ''} ? Cette action est irréversible.`}
                type="danger"
                confirmText={`Supprimer ${selectedDocuments.size} document${selectedDocuments.size > 1 ? 's' : ''}`}
                cancelText="Annuler"
                loading={deleteLoading === -1}
            />

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={showPreviewModal}
                onClose={handleClosePreview}
                document={documentToPreview}
                onDownload={handleDownload}
            />
        </div>
    );
};

export default ProjectViewModal;
