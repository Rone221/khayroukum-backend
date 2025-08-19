import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSiteSettings } from '../hooks/usePublicApi';

interface SiteConfig {
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    branding: {
        name: string;
        tagline: string;
        description: string;
    };
    contact: {
        email: string;
        phone: string;
        address: string;
    };
    social: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
    };
    loading: boolean;
}

const defaultConfig: SiteConfig = {
    colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
    },
    branding: {
        name: 'Khayroukum',
        tagline: 'Plateforme de développement rural participatif',
        description: 'Une plateforme dédiée au développement rural durable et participatif au Mali',
    },
    contact: {
        email: 'contact@khayroukum.ml',
        phone: '+223 70 00 00 00',
        address: 'Hamdallaye ACI 2000, Bamako, Mali',
    },
    social: {},
    loading: false,
};

const SiteConfigContext = createContext<SiteConfig>(defaultConfig);

export const useSiteConfig = () => {
    const context = useContext(SiteConfigContext);
    if (!context) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider');
    }
    return context;
};

interface SiteConfigProviderProps {
    children: React.ReactNode;
}

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({ children }) => {
    const { settings, loading } = useSiteSettings();
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);

    useEffect(() => {
        if (!loading && settings) {
            setConfig({
                colors: {
                    primary: settings.primary_color?.color || defaultConfig.colors.primary,
                    secondary: settings.secondary_color?.color || defaultConfig.colors.secondary,
                    accent: settings.accent_color?.color || defaultConfig.colors.accent,
                },
                branding: {
                    name: settings.site_name?.text || defaultConfig.branding.name,
                    tagline: settings.site_tagline?.text || defaultConfig.branding.tagline,
                    description: settings.site_description?.text || defaultConfig.branding.description,
                },
                contact: {
                    email: settings.contact_email?.email || defaultConfig.contact.email,
                    phone: settings.contact_phone?.phone || defaultConfig.contact.phone,
                    address: settings.contact_address?.text || defaultConfig.contact.address,
                },
                social: {
                    facebook: settings.facebook_url?.url,
                    twitter: settings.twitter_url?.url,
                    linkedin: settings.linkedin_url?.url,
                    youtube: settings.youtube_url?.url,
                },
                loading,
            });

            // Appliquer les couleurs CSS personnalisées
            if (typeof document !== 'undefined') {
                const root = document.documentElement;
                root.style.setProperty('--color-primary', settings.primary_color?.color || defaultConfig.colors.primary);
                root.style.setProperty('--color-secondary', settings.secondary_color?.color || defaultConfig.colors.secondary);
                root.style.setProperty('--color-accent', settings.accent_color?.color || defaultConfig.colors.accent);
            }
        }
    }, [settings, loading]);

    return (
        <SiteConfigContext.Provider value={config}>
            {children}
        </SiteConfigContext.Provider>
    );
};
