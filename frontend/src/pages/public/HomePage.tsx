import React, { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, MapPin, Users, Calendar, DollarSign, Target, TrendingUp } from 'lucide-react';
import { usePublicStats, usePublicProjects, useHomepageContent } from '../../hooks/usePublicApi';
import StatCard from '../../components/public/StatCard';
import ProjectCard from '../../components/public/ProjectCard';

const HomePage: React.FC = () => {
    const { stats, loading: statsLoading } = usePublicStats();
    const { projects, loading: projectsLoading } = usePublicProjects(3);
    const { data: homepageData, loading: homepageLoading } = useHomepageContent();

    // Fonction pour formater les montants - Mémorisée pour éviter les recalculs
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(amount);
    }, []);

    // Fonction pour formater les dates - Mémorisée pour éviter les recalculs
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    // Calculs mémorisés des statistiques affichées
    const displayStats = useMemo(() => {
        // Utiliser les stats du CMS en priorité, sinon fallback vers les stats classiques
        const cmsStats = homepageData?.stats;
        const publicStats = stats;

        if (!cmsStats && !publicStats) return null;

        return [
            {
                value: cmsStats?.projects_completed || publicStats?.completed_projects || 18,
                label: "Projets terminés"
            },
            {
                value: cmsStats?.beneficiaires ?
                    (cmsStats.beneficiaires / 1000).toFixed(0) + 'k+' :
                    publicStats?.total_beneficiaires ?
                        (publicStats.total_beneficiaires / 1000).toFixed(0) + 'k+' : '15k+',
                label: "Personnes impactées"
            },
            {
                value: cmsStats?.villages_served || publicStats?.total_villages || 8,
                label: "Villages partenaires"
            },
            {
                value: publicStats?.projects_in_progress || 6,
                label: "Projets en cours"
            }
        ];
    }, [stats, homepageData]);

    // Extraction des données hero avec fallbacks
    const heroData = useMemo(() => {
        const hero = homepageData?.hero;

        return {
            title: typeof hero?.title === 'object' ? hero.title.text : hero?.title || "L'eau potable pour tous",
            subtitle: typeof hero?.subtitle === 'object' ? hero.subtitle.text : hero?.subtitle || "Des projets hydrauliques durables pour améliorer la vie dans les villages ruraux",
            ctaPrimary: hero?.cta_primary || { text: "Découvrir nos projets", url: "/projets" },
            ctaSecondary: hero?.cta_secondary || { text: "Participer", url: "/login" }
        };
    }, [homepageData]);

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            {heroData.title}
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100">
                            {heroData.subtitle}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to={heroData.ctaPrimary.url}
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center justify-center"
                            >
                                {heroData.ctaPrimary.text}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                to={heroData.ctaSecondary.url}
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                            >
                                {heroData.ctaSecondary.text}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {(statsLoading || homepageLoading) ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map((i) => (
                                <StatCard key={i} value="" label="" loading={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {displayStats?.map((stat, index) => (
                                <StatCard
                                    key={index}
                                    value={stat.value}
                                    label={stat.label}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Notre Mission
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Khayroukum œuvre pour améliorer l'accès à l'eau potable dans les zones rurales.
                                Nous développons des infrastructures hydrauliques durables en collaboration avec
                                les communautés locales et des partenaires techniques qualifiés.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                                    <span className="text-gray-700">Solutions techniques adaptées au terrain</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                                    <span className="text-gray-700">Accompagnement des communautés locales</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                                    <span className="text-gray-700">Maintenance et suivi à long terme</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-200 h-64 lg:h-80 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">Photo mission (à remplacer)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Projects Preview */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Nos Derniers Projets
                        </h2>
                        <p className="text-lg text-gray-600">
                            Découvrez les projets récemment terminés qui transforment la vie des communautés rurales
                        </p>
                    </div>

                    {projectsLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                                    <div className="bg-gray-200 h-48"></div>
                                    <div className="p-6">
                                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                        <div className="h-6 bg-gray-200 rounded mb-3"></div>
                                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-3 bg-gray-200 rounded"></div>
                                            <div className="h-3 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {projects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    )}

                    <div className="text-center">
                        <Link
                            to="/projets"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                        >
                            Voir tous les projets
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            {homepageData?.testimonials?.testimonials && homepageData.testimonials.testimonials.length > 0 && (
                <section className="py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Témoignages
                            </h2>
                            <p className="text-lg text-gray-600">
                                Ce que disent nos partenaires et bénéficiaires
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {homepageData.testimonials.testimonials.slice(0, 3).map((testimonial, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                                    <div className="flex items-center mb-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <span className="text-blue-600 font-semibold text-sm">
                                                    {testimonial.name.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{testimonial.name}</p>
                                            <p className="text-sm text-gray-500">{testimonial.role}</p>
                                        </div>
                                        <div className="ml-auto flex">
                                            {[...Array(testimonial.rating || 5)].map((_, i) => (
                                                <span key={i} className="text-yellow-400">★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <blockquote className="text-gray-600 italic mb-3">
                                        "{testimonial.content}"
                                    </blockquote>
                                    <p className="text-xs text-gray-400">Projet: {testimonial.project}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-16 bg-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Rejoignez-nous dans cette mission
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Participez au financement des projets ou proposez vos services techniques
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Créer un compte
                        </Link>
                        <Link
                            to="/contact"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
