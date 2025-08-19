import React, { useState } from 'react';
import { usePublicVillages } from '../../hooks/usePublicApi';
import { MapPin, Users, TrendingUp, Search, Filter } from 'lucide-react';

const VillagesPage: React.FC = () => {
    const { villages, loading, error } = usePublicVillages();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRegion, setSelectedRegion] = useState<string>('');

    const filteredVillages = villages?.filter(village => {
        const matchesSearch = village.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            village.region?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = !selectedRegion || village.region === selectedRegion;
        return matchesSearch && matchesRegion;
    }) || [];

    const uniqueRegions = Array.from(new Set(villages?.map(v => v.region).filter(Boolean))) || [];

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
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Nos Villages Partenaires
                        </h1>
                        <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
                            Découvrez les communautés rurales que nous accompagnons dans leur développement durable
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filtres et recherche */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Rechercher un village ou une région..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Toutes les régions</option>
                                {uniqueRegions.map(region => (
                                    <option key={region} value={region}>
                                        {region}
                                    </option>
                                ))}
                            </select>
                            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} className="animate-pulse">
                                <div className="bg-gray-200 rounded-lg h-64"></div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <div className="text-red-600 text-lg">
                            Erreur lors du chargement des villages
                        </div>
                        <p className="text-gray-500 mt-2">Veuillez réessayer plus tard</p>
                    </div>
                ) : filteredVillages.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-500 text-lg">
                            {searchTerm || selectedRegion ?
                                'Aucun village ne correspond à vos critères de recherche' :
                                'Aucun village disponible pour le moment'
                            }
                        </div>
                        {(searchTerm || selectedRegion) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedRegion('');
                                }}
                                className="mt-4 text-blue-600 hover:text-blue-800 underline"
                            >
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Résultats */}
                        <div className="mb-6">
                            <p className="text-gray-600">
                                {filteredVillages.length} village{filteredVillages.length !== 1 ? 's' : ''} trouvé{filteredVillages.length !== 1 ? 's' : ''}
                                {(searchTerm || selectedRegion) && (
                                    <span>
                                        {' '}pour "{searchTerm}"
                                        {selectedRegion && ` dans la région ${selectedRegion}`}
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Grid des villages */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredVillages.map((village) => (
                                <div
                                    key={village.id}
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                                >
                                    {/* Image placeholder */}
                                    <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white">
                                        <MapPin className="h-16 w-16 opacity-80" />
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                                    {village.nom}
                                                </h3>
                                                {village.region && (
                                                    <p className="text-sm text-gray-600 flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {village.region}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Statistiques du village */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    <span>Population</span>
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {village.population ? village.population.toLocaleString('fr-FR') : 'N/A'}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                    <span>Projets terminés</span>
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {village.projets_termines || 0}
                                                </div>
                                            </div>

                                            {village.derniere_activite && (
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">
                                                        Dernière activité
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {new Date(village.derniere_activite).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Coordonnées GPS si disponibles */}
                                        {village.coordonnees_gps && (
                                            <div className="mb-6">
                                                <p className="text-sm text-gray-600">
                                                    <MapPin className="inline h-4 w-4 mr-1" />
                                                    Coordonnées: {village.coordonnees_gps}
                                                </p>
                                            </div>
                                        )}

                                        {/* CTA */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <a
                                                href={`/projets?village=${village.nom}`}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center group-hover:underline"
                                            >
                                                Voir les projets
                                                <svg className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Section CTA */}
                <section className="mt-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl text-white p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Votre Village Souhaite Nous Rejoindre ?
                    </h2>
                    <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                        Nous sommes toujours à la recherche de nouvelles communautés à accompagner dans leur développement.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/contact"
                            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                        >
                            Nous contacter
                        </a>
                        <a
                            href="/projets"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
                        >
                            Découvrir nos projets
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default VillagesPage;
