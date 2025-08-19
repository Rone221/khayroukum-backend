import React from 'react';
import { useAboutData } from '../../hooks/usePublicApi';
import { Target, Eye, Users, Award, TrendingUp, MapPin } from 'lucide-react';

const AboutPage: React.FC = () => {
    const { aboutData, loading, error } = useAboutData();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            À propos de Khayroukum
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                            Une plateforme dédiée au développement rural durable et participatif au Mali
                        </p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                </div>
            ) : error ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="text-red-600 text-lg">
                        Erreur lors du chargement des informations
                    </div>
                </div>
            ) : (
                <>
                    {/* Mission & Vision */}
                    <section className="py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div>
                                    <div className="flex items-center mb-6">
                                        <Target className="h-8 w-8 text-blue-600 mr-3" />
                                        <h2 className="text-3xl font-bold text-gray-900">Notre Mission</h2>
                                    </div>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {aboutData?.mission || "Accompagner le développement rural durable à travers des projets participatifs et l'accès au financement."}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex items-center mb-6">
                                        <Eye className="h-8 w-8 text-blue-600 mr-3" />
                                        <h2 className="text-3xl font-bold text-gray-900">Notre Vision</h2>
                                    </div>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        {aboutData?.vision || "Un développement rural inclusif et durable pour tous."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Statistiques */}
                    <section className="py-20 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Nos Réalisations
                                </h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Depuis {aboutData?.founded_year || 2020}, nous avons accompagné de nombreuses communautés rurales dans leur développement.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-8 shadow-lg">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            {aboutData?.achievements.villages_served || 8}
                                        </div>
                                        <div className="text-lg font-medium text-gray-900 mb-2">Villages Servis</div>
                                        <div className="text-sm text-gray-600">Communautés accompagnées</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-8 shadow-lg">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            {aboutData?.achievements.projects_completed || 18}
                                        </div>
                                        <div className="text-lg font-medium text-gray-900 mb-2">Projets Réalisés</div>
                                        <div className="text-sm text-gray-600">Initiatives terminées</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-8 shadow-lg">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            {aboutData?.achievements.total_investment
                                                ? (aboutData.achievements.total_investment / 1000000).toFixed(0) + 'M'
                                                : '45M'
                                            }
                                        </div>
                                        <div className="text-lg font-medium text-gray-900 mb-2">Investissement Total</div>
                                        <div className="text-sm text-gray-600">Francs CFA mobilisés</div>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="bg-white rounded-lg p-8 shadow-lg">
                                        <div className="text-4xl font-bold text-blue-600 mb-2">
                                            {aboutData?.achievements.beneficiaires
                                                ? (aboutData.achievements.beneficiaires / 1000).toFixed(0) + 'k+'
                                                : '15k+'
                                            }
                                        </div>
                                        <div className="text-lg font-medium text-gray-900 mb-2">Bénéficiaires</div>
                                        <div className="text-sm text-gray-600">Personnes impactées</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Indicateurs clés */}
                    <section className="py-20">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Indicateurs de Performance
                                </h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Notre engagement se mesure par l'efficacité et l'impact de nos actions sur le terrain.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center p-8 border rounded-lg">
                                    <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                    <div className="text-2xl font-bold text-gray-900 mb-2">
                                        {aboutData?.key_figures.active_partnerships || 12}
                                    </div>
                                    <div className="text-lg font-medium text-gray-700 mb-2">
                                        Partenariats Actifs
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Prestataires et organisations partenaires
                                    </div>
                                </div>

                                <div className="text-center p-8 border rounded-lg">
                                    <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                    <div className="text-2xl font-bold text-gray-900 mb-2">
                                        {aboutData?.key_figures.success_rate || 85.5}%
                                    </div>
                                    <div className="text-lg font-medium text-gray-700 mb-2">
                                        Taux de Réussite
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Projets menés à terme avec succès
                                    </div>
                                </div>

                                <div className="text-center p-8 border rounded-lg">
                                    <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                    <div className="text-2xl font-bold text-gray-900 mb-2">
                                        {aboutData?.key_figures.average_project_duration || 8.2} mois
                                    </div>
                                    <div className="text-lg font-medium text-gray-700 mb-2">
                                        Durée Moyenne
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Temps moyen de réalisation des projets
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notre Approche */}
                    <section className="py-20 bg-blue-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-16">
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                    Notre Approche
                                </h2>
                                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                    Nous privilégions une approche participative et durable qui place les communautés au cœur de leur développement.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white p-8 rounded-lg shadow-sm">
                                    <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                                        <Users className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Approche Participative
                                    </h3>
                                    <p className="text-gray-600">
                                        Nous impliquons activement les communautés dans la conception, la mise en œuvre et le suivi de leurs projets de développement.
                                    </p>
                                </div>

                                <div className="bg-white p-8 rounded-lg shadow-sm">
                                    <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                                        <Target className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Impact Durable
                                    </h3>
                                    <p className="text-gray-600">
                                        Nos projets sont conçus pour créer un impact à long terme, en renforçant les capacités locales et en favorisant l'autonomie.
                                    </p>
                                </div>

                                <div className="bg-white p-8 rounded-lg shadow-sm">
                                    <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6">
                                        <TrendingUp className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        Transparence Totale
                                    </h3>
                                    <p className="text-gray-600">
                                        Nous garantissons une transparence complète sur l'utilisation des fonds et l'avancement des projets grâce à notre plateforme.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* CTA */}
                    <section className="py-20 bg-blue-600 text-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Rejoignez notre Mission
                            </h2>
                            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                                Ensemble, construisons un avenir meilleur pour les communautés rurales du Mali.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/register"
                                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                                >
                                    Devenir partenaire
                                </a>
                                <a
                                    href="/contact"
                                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                                >
                                    Nous contacter
                                </a>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default AboutPage;
