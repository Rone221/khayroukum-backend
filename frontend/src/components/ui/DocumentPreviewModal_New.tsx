import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, AlertTriangle, Loader } from 'lucide-react';
import api from '../../lib/api';

interface Document {
    id: number;
    name: string;
    type: string;
    size: string;
    status: string;
    url?: string;
    extension?: string;
    created_at: string;
    projectName?: string;
    projet?: {
        id: number;
        titre: string;
    };
}

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: Document | null;
    onDownload?: (doc: Document) => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    isOpen,
    onClose,
    document,
    onDownload
}) => {
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'unsupported'>('unsupported');

    useEffect(() => {
        if (isOpen && document) {
            loadDocumentPreview();
        } else {
            // Nettoyer l'URL quand le modal se ferme
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl('');
            }
            setError('');
        }

        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [isOpen, document]);

    const loadDocumentPreview = async () => {
        if (!document) return;

        setLoading(true);
        setError('');

        console.log('📄 Document à prévisualiser:', document);

        try {
            // Déterminer le type de prévisualisation basé sur l'extension
            // Utiliser l'extension fournie par le backend si disponible
            let extension = document.extension || getFileExtension(document.name);
            extension = extension.toLowerCase();

            console.log('🔍 Extension finale:', extension, 'depuis backend:', document.extension, 'depuis nom:', document.name, 'type doc:', document.type);

            // Seuls PDF et images sont supportés pour prévisualisation
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(extension)) {
                setPreviewType('image');
            } else if (extension === 'pdf') {
                setPreviewType('pdf');
            } else {
                console.log('⚠️  Type de fichier non prévisualisable:', extension);
                console.log('📋 Types supportés pour prévisualisation : Images (JPG, PNG, etc.) et PDF uniquement');
                console.log('📄 Documents Office (Word, Excel, PowerPoint) : Affichage informatif + téléchargement');
                setPreviewType('unsupported');
                setLoading(false);
                return;
            }

            // Télécharger le document pour prévisualisation
            let downloadUrl = `/documents/${document.id}/download`;
            console.log('🌐 URL de téléchargement finale:', downloadUrl);

            const response = await api.get(downloadUrl, {
                responseType: 'blob'
            });

            console.log('✅ Réponse reçue:', {
                status: response.status,
                headers: response.headers,
                dataSize: response.data.size
            });

            // Créer une URL pour le blob
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || getDefaultMimeType(extension)
            });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);

            console.log('🎯 URL de prévisualisation créée pour type:', previewType);

        } catch (err: any) {
            console.error('❌ Erreur lors du chargement de la prévisualisation:', err);
            console.error('❌ Détails de l\'erreur:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data
            });

            if (err.response?.status === 404) {
                setError('Document non trouvé');
            } else if (err.response?.status === 403) {
                setError('Accès non autorisé à ce document');
            } else {
                setError('Impossible de charger la prévisualisation du document');
            }
        } finally {
            setLoading(false);
        }
    };

    const getFileExtension = (filename: string): string => {
        return filename.split('.').pop() || '';
    };

    const getDefaultMimeType = (extension: string): string => {
        const mimeTypes: Record<string, string> = {
            // Documents PDF
            'pdf': 'application/pdf',

            // Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'ico': 'image/x-icon',
        };
        return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
    };

    const getFileIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'pdf':
                return <FileText className="w-12 h-12 text-red-500" />;
            case 'images':
            case 'image':
            case 'jpg':
            case 'jpeg':
            case 'png':
                return <Image className="w-12 h-12 text-blue-500" />;
            default:
                return <FileText className="w-12 h-12 text-gray-500" />;
        }
    };

    const renderPreview = () => {
        if (loading) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600">Chargement de la prévisualisation...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 font-medium mb-2">Erreur de prévisualisation</p>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            );
        }

        if (previewType === 'unsupported') {
            const extension = document.extension || getFileExtension(document?.name || '');
            const isOfficeFile = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension.toLowerCase());
            const isArchive = ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension.toLowerCase());

            let message = "Ce type de fichier ne peut pas être prévisualisé dans le navigateur.";
            let icon = <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />;

            if (isOfficeFile) {
                message = `Document ${extension.toUpperCase()} - ${document.size}`;
                // Icône spécifique selon le type
                if (['doc', 'docx'].includes(extension.toLowerCase())) {
                    icon = <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">DOC</span>
                    </div>;
                } else if (['xls', 'xlsx'].includes(extension.toLowerCase())) {
                    icon = <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">XLS</span>
                    </div>;
                } else if (['ppt', 'pptx'].includes(extension.toLowerCase())) {
                    icon = <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 font-bold text-sm">PPT</span>
                    </div>;
                }
            } else if (isArchive) {
                message = `Archive ${extension.toUpperCase()} - ${document.size}`;
                icon = <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">ZIP</span>
                </div>;
            }

            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        {icon}
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{document.name}</h3>
                        <p className="text-gray-600 mb-4">{message}</p>

                        {isOfficeFile && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-blue-800 mb-2">📋 Informations du document</h4>
                                <div className="text-sm text-blue-700 space-y-1">
                                    <p><span className="font-medium">Type:</span> {extension.toUpperCase()} (Microsoft Office)</p>
                                    <p><span className="font-medium">Taille:</span> {document.size}</p>
                                    <p><span className="font-medium">Projet:</span> {document.projectName || 'Non spécifié'}</p>
                                    <p><span className="font-medium">Statut:</span>
                                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${document.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                document.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {document.status === 'pending' ? 'En attente' :
                                                document.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <p className="text-sm text-gray-500 mb-6">
                            {isOfficeFile ? (
                                <>
                                    <span className="block mb-2">💡 <strong>Pour ouvrir ce document :</strong></span>
                                    <span className="block">• Microsoft Office (Word, Excel, PowerPoint)</span>
                                    <span className="block">• LibreOffice (gratuit)</span>
                                    <span className="block">• Google Docs/Sheets/Slides (en ligne)</span>
                                </>
                            ) : (
                                <>
                                    ✅ <strong>Formats supportés pour prévisualisation :</strong><br />
                                    Images (JPG, PNG, SVG), PDF<br />
                                    ⬇️  <strong>Téléchargement requis :</strong> Office, Archives, Autres
                                </>
                            )}
                        </p>

                        <button
                            onClick={() => {
                                console.log('🔽 Bouton téléchargement cliqué pour document:', document.name);
                                console.log('🔗 Fonction onDownload disponible:', !!onDownload);
                                onDownload?.(document!);
                            }}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Download className="w-5 h-5" />
                            <span>Télécharger le document</span>
                        </button>
                    </div>
                </div>
            );
        }

        if (!previewUrl) return null;

        switch (previewType) {
            case 'image':
                return (
                    <div className="flex-1 flex items-center justify-center p-4">
                        <img
                            src={previewUrl}
                            alt={document?.name}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                            style={{ maxHeight: '70vh' }}
                        />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="flex-1">
                        <iframe
                            src={previewUrl}
                            title={document?.name}
                            className="w-full h-full border-0 rounded-lg"
                            style={{ height: '70vh' }}
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{document?.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                            <span>Type: {document?.type}</span>
                            <span>Taille: {document?.size}</span>
                            <span>Ajouté le: {document?.created_at ? new Date(document.created_at).toLocaleDateString('fr-FR') : 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {document && (
                            <button
                                onClick={() => onDownload?.(document)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Télécharger"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                {renderPreview()}
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
