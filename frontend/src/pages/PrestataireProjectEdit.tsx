import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiX, FiArrowLeft, FiEdit2, FiMapPin, FiDollarSign, FiCalendar, FiFileText, FiGlobe, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import '../styles/project-create.css';
import '../styles/project-actions.css';

interface Village {
  id: number;
  nom: string;
  population: number;
  latitude: number;
  longitude: number;
  chef_village: string;
  description: string;
}

interface Projet {
  id: number;
  titre: string;
  description: string;
  montant_objectif: number;
  duree_mois: number;
  statut: string;
  village_id: number;
  village: Village;
}

interface ProjectEditData {
  titre: string;
  description: string;
  montant_objectif: number;
  duree_mois: number;
  village_id: number;
}

const PrestataireProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [projet, setProjet] = useState<Projet | null>(null);
  const [villages, setVillages] = useState<Village[]>([]);
  const [formData, setFormData] = useState<ProjectEditData>({
    titre: '',
    description: '',
    montant_objectif: 0,
    duree_mois: 1,
    village_id: 0
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Charger les données du projet
  const loadProject = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/projets/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement du projet');
      }

      const data = await response.json();
      setProjet(data);
      
      // Préremplir le formulaire avec les données du projet
      setFormData({
        titre: data.titre,
        description: data.description,
        montant_objectif: data.montant_objectif,
        duree_mois: data.duree_mois,
        village_id: data.village_id
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du projet');
      navigate('/prestataire/projets');
    }
  }, [id, navigate]);

  // Charger les villages de l'utilisateur
  const loadVillages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/villages/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des villages');
      }

      const data = await response.json();
      setVillages(data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des villages');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProject(), loadVillages()]);
      setLoading(false);
    };

    loadData();
  }, [loadProject, loadVillages]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    } else if (formData.titre.length < 3) {
      newErrors.titre = 'Le titre doit contenir au moins 3 caractères';
    } else if (formData.titre.length > 255) {
      newErrors.titre = 'Le titre ne peut pas dépasser 255 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La description doit contenir au moins 10 caractères';
    }

    if (formData.montant_objectif <= 0) {
      newErrors.montant_objectif = 'Le montant objectif doit être supérieur à 0';
    } else if (formData.montant_objectif > 10000000) {
      newErrors.montant_objectif = 'Le montant objectif ne peut pas dépasser 10 000 000 FCFA';
    }

    if (formData.duree_mois < 1) {
      newErrors.duree_mois = 'La durée doit être d\'au moins 1 mois';
    } else if (formData.duree_mois > 120) {
      newErrors.duree_mois = 'La durée ne peut pas dépasser 120 mois';
    }

    if (!formData.village_id) {
      newErrors.village_id = 'Veuillez sélectionner un village';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'montant_objectif' || name === 'duree_mois' || name === 'village_id' 
        ? Number(value) 
        : value
    }));

    // Effacer l'erreur pour ce champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setUpdating(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/projets/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la modification du projet');
      }

      toast.success('Projet modifié avec succès !');
      navigate(`/prestataire/projets/${id}`);
    } catch (error) {
      console.error('Erreur:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erreur lors de la modification du projet');
      }
    } finally {
      setUpdating(false);
    }
  };

  const getSelectedVillage = () => {
    return villages.find(v => v.id === formData.village_id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  if (loading) {
    return (
      <div className="project-create-container">
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (!projet) {
    return (
      <div className="project-create-container">
        <div className="error-wrapper">
          <FiAlertCircle size={48} />
          <h2>Projet non trouvé</h2>
          <p>Le projet demandé n'existe pas ou vous n'avez pas l'autorisation de le modifier.</p>
          <button 
            className="action-button back"
            onClick={() => navigate('/prestataire/projets')}
          >
            <FiArrowLeft />
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="project-create-container">
      <div className="project-create-wrapper">
        {/* Header */}
        <div className="project-create-header">
          <button 
            className="back-button"
            onClick={() => navigate(`/prestataire/projets/${id}`)}
          >
            <FiArrowLeft />
            Retour aux détails
          </button>
          
          <div className="header-content">
            <div className="header-icon">
              <FiEdit2 size={32} />
            </div>
            <div>
              <h1>Modifier le projet</h1>
              <p>Modifiez les informations de votre projet</p>
            </div>
          </div>
        </div>

        {/* Informations du projet actuel */}
        <div className="current-project-info">
          <h3>
            <FiFileText />
            Projet actuel : {projet.titre}
          </h3>
          <div className="current-info-grid">
            <div className="current-info-item">
              <span className="label">Village :</span>
              <span className="value">{projet.village.nom}</span>
            </div>
            <div className="current-info-item">
              <span className="label">Statut :</span>
              <span className={`status-badge status-${projet.statut}`}>
                {projet.statut === 'pending' && 'En attente'}
                {projet.statut === 'validated' && 'Validé'}
                {projet.statut === 'funded' && 'Financé'}
                {projet.statut === 'completed' && 'Terminé'}
              </span>
            </div>
            <div className="current-info-item">
              <span className="label">Montant objectif :</span>
              <span className="value">{formatCurrency(projet.montant_objectif)} FCFA</span>
            </div>
            <div className="current-info-item">
              <span className="label">Durée :</span>
              <span className="value">{projet.duree_mois} mois</span>
            </div>
          </div>
        </div>

        {/* Formulaire de modification */}
        <div className="project-create-content">
          <form onSubmit={handleSubmit} className="project-form">
            {/* Titre */}
            <div className="form-group">
              <label htmlFor="titre">
                <FiEdit2 />
                Titre du projet *
              </label>
              <input
                type="text"
                id="titre"
                name="titre"
                value={formData.titre}
                onChange={handleInputChange}
                placeholder="Entrez le titre de votre projet"
                className={errors.titre ? 'error' : ''}
                maxLength={255}
              />
              {errors.titre && <span className="error-message">{errors.titre}</span>}
              <div className="char-count">
                {formData.titre.length}/255 caractères
              </div>
            </div>

            {/* Village */}
            <div className="form-group">
              <label htmlFor="village_id">
                <FiMapPin />
                Village concerné *
              </label>
              <select
                id="village_id"
                name="village_id"
                value={formData.village_id}
                onChange={handleInputChange}
                className={errors.village_id ? 'error' : ''}
              >
                <option value="">Sélectionnez un village</option>
                {villages.map(village => (
                  <option key={village.id} value={village.id}>
                    {village.nom} ({village.population} habitants)
                  </option>
                ))}
              </select>
              {errors.village_id && <span className="error-message">{errors.village_id}</span>}
              
              {getSelectedVillage() && (
                <div className="village-preview">
                  <div className="village-info">
                    <FiGlobe />
                    <div>
                      <strong>{getSelectedVillage()!.nom}</strong>
                      <p>Population: {getSelectedVillage()!.population} habitants</p>
                      <p>Chef: {getSelectedVillage()!.chef_village}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Montant et Durée */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="montant_objectif">
                  <FiDollarSign />
                  Montant objectif (FCFA) *
                </label>
                <input
                  type="number"
                  id="montant_objectif"
                  name="montant_objectif"
                  value={formData.montant_objectif || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 1000000"
                  min="1"
                  max="10000000"
                  className={errors.montant_objectif ? 'error' : ''}
                />
                {errors.montant_objectif && <span className="error-message">{errors.montant_objectif}</span>}
                {formData.montant_objectif > 0 && (
                  <div className="amount-preview">
                    Montant formaté: <strong>{formatCurrency(formData.montant_objectif)} FCFA</strong>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="duree_mois">
                  <FiCalendar />
                  Durée (mois) *
                </label>
                <input
                  type="number"
                  id="duree_mois"
                  name="duree_mois"
                  value={formData.duree_mois || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 12"
                  min="1"
                  max="120"
                  className={errors.duree_mois ? 'error' : ''}
                />
                {errors.duree_mois && <span className="error-message">{errors.duree_mois}</span>}
                {formData.duree_mois > 0 && (
                  <div className="duration-preview">
                    Soit <strong>{(formData.duree_mois / 12).toFixed(1)} année(s)</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">
                <FiFileText />
                Description du projet *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez votre projet en détail : objectifs, bénéficiaires, impact attendu..."
                rows={6}
                className={errors.description ? 'error' : ''}
                maxLength={2000}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
              <div className="char-count">
                {formData.description.length}/2000 caractères
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="form-actions">
              <button
                type="button"
                className="action-button cancel"
                onClick={() => navigate(`/prestataire/projets/${id}`)}
                disabled={updating}
              >
                <FiX />
                Annuler
              </button>
              
              <button
                type="submit"
                className="action-button submit"
                disabled={updating}
              >
                {updating ? (
                  <>
                    <div className="button-spinner"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrestataireProjectEdit;
