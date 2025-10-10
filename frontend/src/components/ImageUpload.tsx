import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, Link, Image } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  preview?: boolean;
  maxSize?: number; // en MB
  allowUrl?: boolean; // permettre aussi les URLs
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = "",
  onChange,
  label = "Image",
  preview = true,
  maxSize = 5,
  allowUrl = true,
}) => {
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return /\.(jpeg|jpg|gif|png|bmp|webp)$/i.test(url);
    } catch {
      return false;
    }
  };

  const isUrlValue = (val: string): boolean => {
    return val.startsWith("http://") || val.startsWith("https://");
  };

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError("");
      setIsUploading(true);

      // Validation du type de fichier
      if (!file.type.startsWith("image/")) {
        setError("Veuillez sélectionner un fichier image valide");
        setIsUploading(false);
        return;
      }

      // Validation de la taille
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        setError(`La taille du fichier ne doit pas dépasser ${maxSize}MB`);
        setIsUploading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("http://localhost:8000/api/upload/image", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors du téléchargement");
        }

        const result = await response.json();

        if (result.success) {
          onChange(result.data.url);
        } else {
          throw new Error(result.message || "Erreur lors du téléchargement");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors du téléchargement"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [maxSize, onChange]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>

        {allowUrl && (
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              type="button"
              onClick={() => setUploadMode("upload")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                uploadMode === "upload"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              <Upload className="w-3 h-3 inline mr-1" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                uploadMode === "url"
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 hover:text-blue-500"
              }`}
            >
              <Link className="w-3 h-3 inline mr-1" />
              URL
            </button>
          </div>
        )}
      </div>

      {uploadMode === "upload" && (
        <div className="space-y-3">
          {!value && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={openFileDialog}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <p className="text-sm text-gray-600">
                    Téléchargement en cours...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">
                    Cliquez ou glissez une image ici
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF jusqu'à {maxSize}MB
                  </p>
                </div>
              )}
            </div>
          )}

          {value && !isUrlValue(value) && preview && (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Aperçu"
                className="w-32 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {uploadMode === "url" && allowUrl && (
        <div className="space-y-3">
          <div className="relative">
            <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {value && isUrlValue(value) && preview && isValidUrl(value) && (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Aperçu"
                className="w-32 h-32 object-cover rounded-lg border"
                onError={() =>
                  setError("Impossible de charger l'image depuis cette URL")
                }
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
