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
        console.log('🔍 Propriétés du document:', {
            id: document.id,
            name: document.name,
            type: document.type,
            size: document.size,
            extension: document.extension,
            status: document.status,
            projet: document.projet
        });

        try {
            // Déterminer le type de prévisualisation basé sur l'extension
            // Utiliser l'extension fournie par le backend si disponible
            let extension = document.extension || getFileExtension(document.name);
            extension = extension.toLowerCase();

            console.log('🔍 Extension finale:', extension, 'depuis backend:', document.extension, 'depuis nom:', document.name, 'type doc:', document.type);

            // Seuls PDF et images sont supportés pour prévisualisation
            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(extension)) {
                setPreviewType('image');
                console.log('🖼️ Type détecté: IMAGE');
            } else if (extension === 'pdf') {
                setPreviewType('pdf');
                console.log('📕 Type détecté: PDF');
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
            return (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center max-w-md">
                        <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />

                        <h3 className="text-xl font-bold text-gray-800 mb-2">Format non pris en charge</h3>

                        <p className="text-gray-600 mb-6">
                            Il n'est pas possible de prévisualiser ce type de document dans le navigateur.<br />
                            <strong>Veuillez télécharger le document</strong> pour le consulter.
                        </p>

                        <button
                            onClick={() => {
                                console.log('🔽 Bouton téléchargement cliqué pour document:', document?.name);
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
