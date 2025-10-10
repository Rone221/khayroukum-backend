import React, { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  FileText,
  Image,
  Video,
  File,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";

interface FileUploadItem {
  id: string;
  file: File;
  type: string;
  description: string;
  preview?: string;
  status: "waiting" | "uploading" | "success" | "error";
  error?: string;
  progress?: number;
}

interface MultipleDocumentUploadProps {
  onUpload: (files: FileUploadItem[]) => Promise<void>;
  projectId: string;
  maxFiles?: number;
  maxSize?: number; // en MB
  allowedTypes?: string[];
  onClose?: () => void;
}

const DOCUMENT_TYPES = [
  { value: "devis", label: "Devis", icon: FileText },
  { value: "facture", label: "Facture", icon: FileText },
  { value: "rapport", label: "Rapport", icon: FileText },
  { value: "photo", label: "Photo", icon: Image },
  { value: "video", label: "Vidéo", icon: Video },
  { value: "autre", label: "Autre", icon: File },
];

const MultipleDocumentUpload: React.FC<MultipleDocumentUploadProps> = ({
  onUpload,
  projectId,
  maxFiles = 10,
  maxSize = 10,
  allowedTypes = ["*"],
  onClose,
}) => {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.startsWith("video/")) return Video;
    return FileText;
  };

  const getPreview = useCallback((file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `Le fichier dépasse la taille maximale de ${maxSize}MB`;
    }

    if (allowedTypes[0] !== "*") {
      const fileType = file.type;
      const isAllowed = allowedTypes.some(
        (type) =>
          fileType.includes(type) || file.name.toLowerCase().endsWith(type)
      );
      if (!isAllowed) {
        return `Type de fichier non autorisé`;
      }
    }

    return null;
  };

  const handleFiles = async (fileList: FileList) => {
    if (files.length + fileList.length > maxFiles) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxFiles} fichiers`);
      return;
    }

    const newFiles: FileUploadItem[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const error = validateFile(file);
      const preview = await getPreview(file);

      newFiles.push({
        id: generateId(),
        file,
        type: "autre", // Type par défaut
        description: "",
        preview,
        status: error ? "error" : "waiting",
        error,
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id: string, updates: Partial<FileUploadItem>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const handleUpload = async () => {
    const validFiles = files.filter((f) => f.status !== "error");

    if (validFiles.length === 0) {
      alert("Veuillez ajouter au moins un fichier valide");
      return;
    }

    setIsUploading(true);

    try {
      // Marquer tous les fichiers comme en cours d'upload
      validFiles.forEach((file) => {
        updateFile(file.id, { status: "uploading", progress: 0 });
      });

      await onUpload(validFiles);

      // Marquer comme réussi
      validFiles.forEach((file) => {
        updateFile(file.id, { status: "success", progress: 100 });
      });

      // Fermer après 1 seconde
      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (error) {
      // Marquer comme échoué
      validFiles.forEach((file) => {
        updateFile(file.id, {
          status: "error",
          error: "Erreur lors du téléchargement",
        });
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: FileUploadItem["status"]) => {
    switch (status) {
      case "uploading":
        return <Loader className="w-4 h-4 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Zone de drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-blue-400"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />

        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Ajouter des documents
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Glissez vos fichiers ici ou cliquez pour sélectionner
        </p>
        <button
          type="button"
          onClick={openFileDialog}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Sélectionner des fichiers
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Maximum {maxFiles} fichiers, {maxSize}MB par fichier
        </p>
      </div>

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">
            Fichiers sélectionnés ({files.length})
          </h4>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((fileItem) => {
              const IconComponent = getFileIcon(fileItem.file.type);

              return (
                <div
                  key={fileItem.id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                >
                  {/* Preview ou icône */}
                  <div className="flex-shrink-0">
                    {fileItem.preview ? (
                      <img
                        src={fileItem.preview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Informations du fichier */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {fileItem.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(fileItem.status)}
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          disabled={isUploading}
                          className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* Type de document */}
                    <div className="flex items-center space-x-2 mb-2">
                      <select
                        value={fileItem.type}
                        onChange={(e) =>
                          updateFile(fileItem.id, { type: e.target.value })
                        }
                        disabled={isUploading}
                        className="text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                      >
                        {DOCUMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <input
                      type="text"
                      value={fileItem.description}
                      onChange={(e) =>
                        updateFile(fileItem.id, { description: e.target.value })
                      }
                      placeholder="Description du document"
                      disabled={isUploading}
                      className="w-full text-xs border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                    />

                    {/* Barre de progression */}
                    {fileItem.status === "uploading" &&
                      fileItem.progress !== undefined && (
                        <div className="mt-2">
                          <div className="bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${fileItem.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                    {/* Message d'erreur */}
                    {fileItem.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {fileItem.error}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setFiles([])}
              disabled={isUploading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Tout effacer
            </button>
            <button
              onClick={handleUpload}
              disabled={
                isUploading ||
                files.filter(
                  (f) => f.status !== "error" && f.description.trim()
                ).length === 0
              }
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin inline mr-2" />
                  Téléchargement...
                </>
              ) : (
                `Télécharger ${
                  files.filter(
                    (f) => f.status !== "error" && f.description.trim()
                  ).length
                } fichier(s)`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleDocumentUpload;
