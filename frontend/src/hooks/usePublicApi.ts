import { useState, useEffect, useCallback, useMemo } from 'react';
import { publicApiService, PublicStats, PublicProject, PublicVillage, AboutData } from '../services/publicApi';

// Types pour le CMS
export interface HomepageData {
    hero: {
        title: { text: string } | string;
        subtitle: { text: string } | string;
        cta_primary: { text: string; url: string; style: string };
        cta_secondary: { text: string; url: string; style: string };
    };
    stats: {
        villages_served: number;
        projects_completed: number;
        total_investment: number;
        beneficiaires: number;
        active_partnerships: number;
        success_rate: number;
        average_project_duration: number;
    };
    testimonials: {
        testimonials: Array<{
            name: string;
            role: string;
            content: string;
            rating: number;
            project: string;
        }>;
    };
    settings: {
        primary_color: { color: string };
        secondary_color: { color: string };
        site_name: { text: string };
        site_tagline: { text: string };
    };
}

export interface ContentSection {
    [key: string]: any;
}

export interface SiteSettings {
    [key: string]: {
        text?: string;
        color?: string;
        url?: string;
        email?: string;
        phone?: string;
        schedule?: any;
    };
}

// Hook pour les statistiques avec optimisations
export const usePublicStats = () => {
    const [stats, setStats] = useState<PublicStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fallbackStats = useMemo((): PublicStats => ({
        total_projects: 24,
        total_villages: 8,
        total_beneficiaires: 15000,
        active_prestataires: 12,
        projects_in_progress: 6,
        completed_projects: 18
    }), []);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await publicApiService.getStats();
            setStats(data);
        } catch (err) {
            setError('Erreur lors du chargement des statistiques');
            console.error(err);
            // Données de fallback pour développement
            setStats(fallbackStats);
        } finally {
            setLoading(false);
        }
    }, [fallbackStats]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const refresh = useCallback(() => {
        publicApiService.clearCache();
        fetchStats();
    }, [fetchStats]);

    return { stats, loading, error, refresh };
};

// Hook pour les projets
export const usePublicProjects = (limit: number = 6) => {
    const [projects, setProjects] = useState<PublicProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await publicApiService.getProjects(limit);
                setProjects(data);
            } catch (err) {
                setError('Erreur lors du chargement des projets');
                console.error(err);
                // Données de fallback pour développement
                setProjects([
                    {
                        id: 1,
                        titre: "Système d'irrigation moderne",
                        description: "Installation d'un système d'irrigation goutte-à-goutte pour améliorer l'agriculture locale.",
                        village_nom: "Kountia",
                        budget: 2500000,
                        date_debut: "2024-01-15",
                        date_fin: "2024-06-30",
                        type_financement: "subvention",
                        statut: "terminé",
                        beneficiaires_estimes: 1200
                    },
                    {
                        id: 2,
                        titre: "Centre de formation agricole",
                        description: "Construction et équipement d'un centre de formation pour les techniques agricoles modernes.",
                        village_nom: "Banconi",
                        budget: 4200000,
                        date_debut: "2023-08-01",
                        date_fin: "2024-03-15",
                        type_financement: "prêt",
                        statut: "terminé",
                        beneficiaires_estimes: 800
                    },
                    {
                        id: 3,
                        titre: "Électrification solaire",
                        description: "Installation de panneaux solaires pour alimenter l'école et le dispensaire du village.",
                        village_nom: "Sirakoro",
                        budget: 1800000,
                        date_debut: "2024-02-01",
                        date_fin: "2024-05-20",
                        type_financement: "don",
                        statut: "terminé",
                        beneficiaires_estimes: 600
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [limit]);

    return { projects, loading, error };
};

// Hook pour les villages
export const usePublicVillages = (limit: number = 8) => {
    const [villages, setVillages] = useState<PublicVillage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVillages = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await publicApiService.getVillages(limit);
                setVillages(data);
            } catch (err) {
                setError('Erreur lors du chargement des villages');
                console.error(err);
                // Données de fallback pour développement
                setVillages([
                    {
                        id: 1,
                        nom: "Kountia",
                        region: "Koulikoro",
                        population: 1200,
                        coordonnees_gps: "12.3456,-7.8910",
                        projets_termines: 3,
                        derniere_activite: "2024-06-30"
                    },
                    {
                        id: 2,
                        nom: "Banconi",
                        region: "Bamako",
                        population: 800,
                        projets_termines: 2,
                        derniere_activite: "2024-03-15"
                    },
                    {
                        id: 3,
                        nom: "Sirakoro",
                        region: "Kayes",
                        population: 600,
                        projets_termines: 1,
                        derniere_activite: "2024-05-20"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchVillages();
    }, [limit]);

    return { villages, loading, error };
};

// Hook pour les données À propos
export const useAboutData = () => {
    const [aboutData, setAboutData] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAboutData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await publicApiService.getAboutData();
                setAboutData(data);
            } catch (err) {
                setError('Erreur lors du chargement des informations');
                console.error(err);
                // Données de fallback pour développement
                setAboutData({
                    mission: "Accompagner le développement rural durable à travers des projets participatifs et l'accès au financement.",
                    vision: "Un développement rural inclusif et durable pour tous.",
                    founded_year: 2020,
                    achievements: {
                        villages_served: 8,
                        projects_completed: 18,
                        total_investment: 45000000,
                        beneficiaires: 15000
                    },
                    key_figures: {
                        active_partnerships: 12,
                        success_rate: 85.5,
                        average_project_duration: 8.2
                    }
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAboutData();
    }, []);

    return { aboutData, loading, error };
};

// Hook pour récupérer le contenu complet de la homepage
export const useHomepageContent = () => {
    const [data, setData] = useState<HomepageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHomepageContent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/public/homepage');

            if (!response.ok) {
                throw new Error('Erreur lors du chargement du contenu');
            }

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                throw new Error(result.message || 'Erreur inconnue');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
            console.error('Erreur homepage content:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHomepageContent();
    }, [fetchHomepageContent]);

    return { data, loading, error, refetch: fetchHomepageContent };
};

// Hook pour récupérer le contenu d'une section spécifique
export const useContentSection = (section: string) => {
    const [data, setData] = useState<ContentSection | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContent = useCallback(async () => {
        if (!section) return;

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/public/content/${section}`);

            if (!response.ok) {
                throw new Error('Erreur lors du chargement du contenu');
            }

            const result = await response.json();
            if (result.success) {
                setData(result.data);
            } else {
                throw new Error(result.message || 'Erreur inconnue');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
            console.error(`Erreur section ${section}:`, err);
        } finally {
            setLoading(false);
        }
    }, [section]);

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    return { data, loading, error, refetch: fetchContent };
};

// Hook pour récupérer les paramètres publics du site
export const useSiteSettings = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/public/settings');

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des paramètres');
            }

            const result = await response.json();
            if (result.success) {
                setSettings(result.data);
            } else {
                throw new Error(result.message || 'Erreur inconnue');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
            console.error('Erreur settings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return { settings, loading, error, refetch: fetchSettings };
};
