// Service pour les API publiques avec optimisations
const API_BASE_URL = 'http://127.0.0.1:8000/api/public';

// Cache simple en mémoire pour éviter les requêtes répétées
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export interface PublicStats {
    total_projects: number;
    total_villages: number;
    total_beneficiaires: number;
    active_prestataires: number;
    projects_in_progress: number;
    completed_projects: number;
    last_updated?: string;
}

export interface PublicProject {
    id: number;
    titre: string;
    description: string;
    village_nom: string;
    budget: number;
    date_debut: string;
    date_fin: string;
    type_financement: string;
    statut: string;
    beneficiaires_estimes: number;
}

export interface PublicVillage {
    id: number;
    nom: string;
    region: string;
    population: number;
    coordonnees_gps?: string;
    projets_termines: number;
    derniere_activite: string | null;
}

export interface AboutData {
    mission: string;
    vision: string;
    founded_year: number;
    achievements: {
        villages_served: number;
        projects_completed: number;
        total_investment: number;
        beneficiaires: number;
    };
    key_figures: {
        active_partnerships: number;
        success_rate: number;
        average_project_duration: number;
    };
}

class PublicApiService {
    private async fetchApi<T>(endpoint: string, ttl: number = 300000): Promise<T> {
        // Vérifier le cache d'abord (TTL par défaut: 5 minutes)
        const cacheKey = `${API_BASE_URL}${endpoint}`;
        const cached = cache.get(cacheKey);

        if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
            return cached.data;
        }

        try {
            const response = await fetch(cacheKey, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Erreur API');
            }

            // Mettre en cache la réponse
            cache.set(cacheKey, {
                data: result.data,
                timestamp: Date.now(),
                ttl: ttl
            });

            return result.data;
        } catch (error) {
            console.error(`Erreur lors de l'appel API ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Vider le cache (utile pour forcer le rechargement)
     */
    clearCache(): void {
        cache.clear();
    }

    /**
     * Récupérer les statistiques générales (cache 15 min)
     */
    async getStats(): Promise<PublicStats> {
        return this.fetchApi<PublicStats>('/stats', 900000); // 15 minutes
    }

    /**
     * Récupérer les projets terminés (cache 30 min)
     */
    async getProjects(limit: number = 6): Promise<PublicProject[]> {
        return this.fetchApi<PublicProject[]>(`/projects?limit=${limit}`, 1800000); // 30 minutes
    }

    /**
     * Récupérer les villages (cache 1 heure)
     */
    async getVillages(limit: number = 8): Promise<PublicVillage[]> {
        return this.fetchApi<PublicVillage[]>(`/villages?limit=${limit}`, 3600000); // 1 heure
    }

    /**
     * Récupérer les informations sur l'organisation (cache 2 heures)
     */
    async getAboutData(): Promise<AboutData> {
        return this.fetchApi<AboutData>('/about', 7200000); // 2 heures
    }

    /**
     * Soumettre un message de contact
     */
    async submitContact(contactData: {
        nom: string;
        email: string;
        telephone?: string;
        sujet: string;
        message: string;
    }): Promise<{
        success: boolean;
        message: string;
        data?: { id: number; created_at: string };
    }> {
        try {
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(contactData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || `HTTP error! status: ${response.status}`);
            }

            return result;
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message de contact:', error);
            throw error;
        }
    }
}

// Export singleton
export const publicApiService = new PublicApiService();
export default publicApiService;
