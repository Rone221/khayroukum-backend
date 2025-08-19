import React, { useState, useMemo, useCallback } from 'react';
import { usePublicProjects } from '../../hooks/usePublicApi';
import { MapPin, DollarSign, Users, Calendar, Filter, Search } from 'lucide-react';
import ProjectCard from '../../components/public/ProjectCard';

const ProjectsPage: React.FC = () => {
    const { projects, loading, error } = usePublicProjects(20); // Charger plus de projets
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // Fonction pour formater les montants
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0,
        }).format(amount);
    }, []);

    // Fonction pour formater les dates
    const formatDate = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    // Filtrage des projets
    const filteredProjects = useMemo(() => {
        if (!projects) return [];

        return projects.filter(project => {
            const matchesSearch = project.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.village_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'all' || project.statut === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [projects, searchTerm, filterStatus]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Nos Projets
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Découvrez tous les projets de développement rural en cours et réalisés dans nos villages partenaires.
                            Chaque projet contribue à améliorer la qualité de vie des communautés rurales.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtres et recherche */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Barre de recherche */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Rechercher par titre, village ou description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            />
                        </div>

                        {/* Filtre par statut */}
                        <div className="flex items-center space-x-2">
                            <Filter className="text-gray-400 h-5 w-5" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            >
                                <option value="all">Tous les projets</option>
                                <option value="terminé">Terminés</option>
                                <option value="en_cours">En cours</option>
                                <option value="planifié">Planifiés</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Résultats */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
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
                ) : error ? (
                    <div className="text-center py-12">
                        <div className="text-red-600 text-lg mb-4">
                            Erreur lors du chargement des projets
                        </div>
                        <p className="text-gray-500">
                            Veuillez réessayer plus tard ou contacter le support.
                        </p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg mb-4">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Aucun projet ne correspond à vos critères de recherche'
                                : 'Aucun projet disponible pour le moment'
                            }
                        </div>
                        {(searchTerm || filterStatus !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                }}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Compteur de résultats */}
                        <div className="mb-6">
                            <p className="text-gray-600">
                                <span className="font-semibold">{filteredProjects.length}</span> projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
                                {searchTerm && (
                                    <span> pour "{searchTerm}"</span>
                                )}
                            </p>
                        </div>

                        {/* Grille des projets */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* CTA Section */}
            <div className="bg-blue-600 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">
                        Vous avez un projet à proposer ?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Rejoignez notre réseau de prestataires et contribuez au développement rural durable.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/register"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Devenir prestataire
                        </a>
                        <a
                            href="/contact"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Nous contacter
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;
