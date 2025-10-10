import React from "react";
import ImageUpload from "./ImageUpload";
import { User } from "lucide-react";

interface AvatarUploadProps {
  value?: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  showInitials?: boolean;
  userName?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  value = "",
  onChange,
  size = "md",
  showInitials = true,
  userName = "",
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const getInitials = (name: string): string => {
    if (!name) return "";
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Avatar actuel ou placeholder */}
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-gray-200 bg-gray-100 flex items-center justify-center`}
      >
        {value ? (
          <img
            src={value}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            {showInitials && userName ? (
              <span className="text-white font-bold text-lg">
                {getInitials(userName)}
              </span>
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
        )}
      </div>

      {/* Composant d'upload */}
      <div className="w-full max-w-sm">
        <ImageUpload
          value={value}
          onChange={onChange}
          label="Photo de profil"
          preview={false} // On utilise l'aperçu ci-dessus
          maxSize={2} // 2MB pour les avatars
          allowUrl={false} // Seulement l'upload pour les avatars
        />
      </div>
    </div>
  );
};

export default AvatarUpload;
