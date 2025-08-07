import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  Save, 
  ArrowLeft, 
  MapPin, 
  Users, 
  Euro, 
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Village } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import '../../styles/project-create.css';

interface ProjectFormData {
  village_id: string;
  titre: string;
  description: string;
  montant_total: string;
  date_debut: string;
  date_fin: string;
}

const PrestataireProjectCreate: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProjectFormData>({
    village_id: '',
    titre: '',
    description: '',
    montant_total: '',
    date_debut: '',
    date_fin: ''
  });

  const [errors, setErrors] = useState<Partial<ProjectFormData>>({});

  const fetchVillages = useCallback(async () => {
    try {
      setVillagesLoading(true);
      const response = await api.get<Village[]>('/villages');
      // Filtrer les villages créés par le prestataire connecté
      const userVillages = response.data.filter((village: Village) => village.created_by === user?.id);
      setVillages(userVillages);
    } catch (error) {
      console.error('Erreur lors du chargement des villages:', error);
    } finally {
      setVillagesLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ProjectFormData> = {};

    if (!formData.village_id) {
      newErrors.village_id = 'Veuillez sélectionner un village';
    }

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    } else if (formData.titre.trim().length < 5) {
      newErrors.titre = 'Le titre doit contenir au moins 5 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'La description doit contenir au moins 20 caractères';
    }

    if (!formData.montant_total) {
      newErrors.montant_total = 'Le montant est requis';
    } else if (parseFloat(formData.montant_total) <= 0) {
      newErrors.montant_total = 'Le montant doit être supérieur à 0';
    } else if (parseFloat(formData.montant_total) > 1000000) {
      newErrors.montant_total = 'Le montant ne peut pas dépasser 1 000 000€';
    }

    if (!formData.date_debut) {
      newErrors.date_debut = 'La date de début est requise';
    } else if (new Date(formData.date_debut) < new Date()) {
      newErrors.date_debut = 'La date de début ne peut pas être dans le passé';
    }

    if (!formData.date_fin) {
      newErrors.date_fin = 'La date de fin est requise';
    } else if (formData.date_debut && new Date(formData.date_fin) <= new Date(formData.date_debut)) {
      newErrors.date_fin = 'La date de fin doit être postérieure à la date de début';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name as keyof ProjectFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const projectData = {
        ...formData,
        montant_total: parseFloat(formData.montant_total)
      };

      await api.post('/projets', projectData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/prestataire/projets');
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      const axiosError = error as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError.response?.data?.message || 'Une erreur est survenue lors de la création du projet';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedVillage = villages.find(v => v.id === formData.village_id);

  if (villagesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="project-create-container">
        <div className="project-create-wrapper">
          <Card className="success-card">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Projet créé avec succès !</h2>
              <p className="text-gray-600 mb-4">Votre projet a été enregistré et sera examiné par notre équipe.</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Redirection en cours...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="project-create-container">
      <div className="project-create-wrapper">
        {/* Header */}
        <div className="project-create-header">
          <Link to="/prestataire/projets" className="back-button">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour aux projets</span>
          </Link>
          <div className="header-content">
            <h1 className="header-title">Nouveau Projet</h1>
            <p className="header-subtitle">Créez un nouveau projet hydraulique pour votre village</p>
          </div>
        </div>

        {/* Form */}
        <Card className="project-form-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Informations du projet</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="error-message">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Sélection du village */}
              <div className="form-group">
                <label className="form-label">
                  <MapPin className="w-4 h-4" />
                  Village concerné *
                </label>
                <select
                  name="village_id"
                  value={formData.village_id}
                  onChange={handleInputChange}
                  className={`form-select ${errors.village_id ? 'error' : ''}`}
                  required
                >
                  <option value="">Sélectionnez un village</option>
                  {villages && villages.length > 0 && villages.map(village => (
                    <option key={village.id} value={village.id}>
                      {village.name} - {village.region}
                    </option>
                  ))}
                </select>
                {errors.village_id && <span className="error-text">{errors.village_id}</span>}
                
                {villages.length === 0 && (
                  <div className="info-message">
                    <AlertCircle className="w-4 h-4" />
                    <span>Vous devez d'abord créer un village. <Link to="/prestataire/villages/create" className="text-blue-600 hover:text-blue-700">Créer un village</Link></span>
                  </div>
                )}
              </div>

              {/* Informations du village sélectionné */}
              {selectedVillage && (
                <div className="village-info-card">
                  <h3 className="village-info-title">Informations du village sélectionné</h3>
                  <div className="village-info-grid">
                    <div className="village-info-item">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>{selectedVillage.region}</span>
                    </div>
                    <div className="village-info-item">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{selectedVillage.population ? selectedVillage.population.toLocaleString() : 'N/A'} habitants</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Titre du projet */}
              <div className="form-group">
                <label className="form-label">
                  <FileText className="w-4 h-4" />
                  Titre du projet *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  className={`form-input ${errors.titre ? 'error' : ''}`}
                  placeholder="Ex: Construction d'un puits dans le village de..."
                  required
                />
                {errors.titre && <span className="error-text">{errors.titre}</span>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">
                  <FileText className="w-4 h-4" />
                  Description du projet *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  rows={5}
                  placeholder="Décrivez en détail votre projet hydraulique, les besoins identifiés, les objectifs et l'impact attendu..."
                  required
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
                <div className="character-count">
                  {formData.description.length} caractères (minimum 20)
                </div>
              </div>

              {/* Montant */}
              <div className="form-group">
                <label className="form-label">
                  <Euro className="w-4 h-4" />
                  Montant total du projet *
                </label>
                <div className="amount-input-wrapper">
                  <input
                    type="number"
                    name="montant_total"
                    value={formData.montant_total}
                    onChange={handleInputChange}
                    className={`form-input amount-input ${errors.montant_total ? 'error' : ''}`}
                    placeholder="0"
                    min="1"
                    max="1000000"
                    step="0.01"
                    required
                  />
                  <span className="currency-symbol">€</span>
                </div>
                {errors.montant_total && <span className="error-text">{errors.montant_total}</span>}
                {formData.montant_total && (
                  <div className="amount-display">
                    Montant: {parseFloat(formData.montant_total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <Calendar className="w-4 h-4" />
                    Date de début prévue *
                  </label>
                  <input
                    type="date"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleInputChange}
                    className={`form-input ${errors.date_debut ? 'error' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                  {errors.date_debut && <span className="error-text">{errors.date_debut}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar className="w-4 h-4" />
                    Date de fin prévue *
                  </label>
                  <input
                    type="date"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleInputChange}
                    className={`form-input ${errors.date_fin ? 'error' : ''}`}
                    min={formData.date_debut || new Date().toISOString().split('T')[0]}
                    required
                  />
                  {errors.date_fin && <span className="error-text">{errors.date_fin}</span>}
                </div>
              </div>

              {/* Duration calculation */}
              {formData.date_debut && formData.date_fin && (
                <div className="duration-info">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>
                    Durée estimée: {Math.ceil((new Date(formData.date_fin).getTime() - new Date(formData.date_debut).getTime()) / (1000 * 60 * 60 * 24))} jours
                  </span>
                </div>
              )}

              {/* Submit buttons */}
              <div className="form-actions">
                <Link to="/prestataire/projets" className="btn-cancel">
                  Annuler
                </Link>
                <button
                  type="submit"
                  disabled={loading || villages.length === 0}
                  className="btn-submit"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Créer le projet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrestataireProjectCreate;
