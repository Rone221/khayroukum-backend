import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import ImageUpload from "../../components/ImageUpload";
import api from "../../lib/api";
import {
  MapPin,
  Camera,
  Users,
  Building,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Map,
  FileText,
  Settings,
} from "lucide-react";
import "../../styles/village-create.css";

interface FormData {
  nom: string;
  region: string;
  departement: string;
  commune: string;
  population: number | "";
  lat: string;
  lng: string;
  photo: string;
  description: string;
  statut: string;
}

const REGIONS_SENEGAL = [
  "Dakar",
  "Thiès",
  "Diourbel",
  "Fatick",
  "Kaolack",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Tambacounda",
  "Kaffrine",
  "Kédougou",
  "Kolda",
  "Sédhiou",
  "Ziguinchor",
];

const PrestataireVillageCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    region: "",
    departement: "",
    commune: "",
    population: "",
    lat: "",
    lng: "",
    photo: "",
    description: "",
    statut: "actif",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [formProgress, setFormProgress] = useState(0);

  // Calcul du progrès du formulaire
  useEffect(() => {
    const requiredFields = ["nom", "region"];
    const optionalFields = [
      "departement",
      "commune",
      "population",
      "lat",
      "lng",
      "photo",
      "description",
    ];

    const filledRequired = requiredFields.filter(
      (field) => formData[field as keyof FormData] !== ""
    ).length;
    const filledOptional = optionalFields.filter(
      (field) => formData[field as keyof FormData] !== ""
    ).length;

    const requiredProgress = (filledRequired / requiredFields.length) * 60; // 60% pour les champs requis
    const optionalProgress = (filledOptional / optionalFields.length) * 40; // 40% pour les champs optionnels

    setFormProgress(Math.round(requiredProgress + optionalProgress));
  }, [formData]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    []
  );

  const handleGetLocation = useCallback(async () => {
    setLocationLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas supportée par ce navigateur.");
      setLocationLoading(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        }
      );

      setFormData((prev) => ({
        ...prev,
        lat: position.coords.latitude.toString(),
        lng: position.coords.longitude.toString(),
      }));
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      setError(`Impossible de récupérer la position: ${errorMessage}`);
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const validateForm = (): string | null => {
    if (!formData.nom.trim()) return "Le nom du village est requis";
    if (!formData.region.trim()) return "La région est requise";
    if (formData.population !== "" && formData.population < 0)
      return "La population doit être positive";
    if (formData.lat && isNaN(Number(formData.lat)))
      return "La latitude doit être un nombre valide";
    if (formData.lng && isNaN(Number(formData.lng)))
      return "La longitude doit être un nombre valide";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post("/villages", {
        nom: formData.nom,
        region: formData.region,
        departement: formData.departement || null,
        commune: formData.commune || null,
        population: formData.population === "" ? null : formData.population,
        coordinates:
          formData.lat && formData.lng
            ? {
                lat: Number(formData.lat),
                lng: Number(formData.lng),
              }
            : null,
        photo: formData.photo || null,
        description: formData.description || null,
        statut: formData.statut,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/prestataire/villages");
      }, 1500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error && err.message
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Erreur lors de la création du village.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="village-create-container">
      <div className="village-form-wrapper">
        {/* En-tête avec design moderne */}
        <div className="form-header">
          <button
            onClick={() => navigate("/prestataire/villages")}
            className="absolute top-4 left-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 z-10"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1>Nouveau Village</h1>
          <p>Enrichissez votre portfolio avec un nouveau village</p>

          {/* Barre de progression */}
          <div className="progress-bar mt-6">
            <div
              className="progress-fill"
              style={{ width: `${formProgress}%` }}
            ></div>
          </div>
          <span className="text-white/80 text-sm font-medium">
            Progression: {formProgress}%
          </span>
        </div>

        {/* Contenu du formulaire */}
        <div className="form-content">
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Nom du village */}
              <div className="form-group">
                <label className="form-label">
                  <Building className="w-4 h-4 inline mr-1" />
                  Nom du village *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  placeholder="Entrez le nom du village"
                  required
                />
              </div>

              {/* Région */}
              <div className="form-group">
                <label className="form-label">
                  <Map className="w-4 h-4 inline mr-1" />
                  Région *
                </label>
                <select
                  className="form-select"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  required
                >
                  <option value="">Sélectionnez une région</option>
                  {REGIONS_SENEGAL.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              {/* Département */}
              <div className="form-group">
                <label className="form-label">Département</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.departement}
                  onChange={(e) =>
                    handleInputChange("departement", e.target.value)
                  }
                  placeholder="Département (optionnel)"
                />
              </div>

              {/* Commune */}
              <div className="form-group">
                <label className="form-label">Commune</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.commune}
                  onChange={(e) => handleInputChange("commune", e.target.value)}
                  placeholder="Commune (optionnel)"
                />
              </div>

              {/* Population */}
              <div className="form-group form-grid-full">
                <label className="form-label">
                  <Users className="w-4 h-4 inline mr-1" />
                  Population
                </label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.population}
                  onChange={(e) =>
                    handleInputChange(
                      "population",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Nombre d'habitants (optionnel)"
                  min={0}
                />
              </div>
            </div>

            <div className="form-divider"></div>

            {/* Coordonnées GPS */}
            <div className="form-group">
              <label className="form-label">
                <MapPin className="w-4 h-4 inline mr-1" />
                Coordonnées GPS
              </label>
              <div className="coordinates-group">
                <div>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.lat}
                    onChange={(e) => handleInputChange("lat", e.target.value)}
                    placeholder="Latitude"
                    step="any"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.lng}
                    onChange={(e) => handleInputChange("lng", e.target.value)}
                    placeholder="Longitude"
                    step="any"
                  />
                </div>
                <button
                  type="button"
                  className="location-button"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  title="Utiliser ma position actuelle"
                >
                  {locationLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Photo */}
            <div className="form-group">
              <ImageUpload
                value={formData.photo}
                onChange={(value) => handleInputChange("photo", value)}
                label="Photo du village"
                preview={true}
                maxSize={5}
                allowUrl={true}
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                <FileText className="w-4 h-4 inline mr-1" />
                Description
              </label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Décrivez le village, ses particularités, son histoire... (optionnel)"
                maxLength={500}
              />
              <div className="character-count">
                {formData.description.length}/500 caractères
              </div>
            </div>

            {/* Statut */}
            <div className="form-group">
              <label className="form-label">
                <Settings className="w-4 h-4 inline mr-1" />
                Statut
              </label>
              <select
                className="form-select"
                value={formData.statut}
                onChange={(e) => handleInputChange("statut", e.target.value)}
              >
                <option value="actif">Actif</option>
                <option value="inactif">Inactif</option>
              </select>
            </div>

            {/* Messages d'erreur et de succès */}
            {error && (
              <div className="error-message">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            {success && (
              <div className="success-message">
                <CheckCircle className="w-5 h-5" />
                Village créé avec succès ! Redirection en cours...
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="submit-button"
              disabled={loading || success}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Création en cours...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Village créé !
                </>
              ) : (
                "Créer le village"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrestataireVillageCreate;
