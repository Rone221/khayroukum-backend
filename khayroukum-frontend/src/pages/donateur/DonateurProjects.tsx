
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  MapPin,
  Users,
  Calendar,
  Euro,
  Eye,
  Heart,
  Filter,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';

const DonateurProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'urgent' | 'progress'>('newest');

  useEffect(() => {
    api
      .get('/projets')
      .then(res => setProjects(res.data.filter((p: Project) => p.status === 'validated')))
      .finally(() => setLoading(false));
  }, []);

  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.village.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case 'urgent': {
          const progressA = a.currentAmount / a.targetAmount;
          const progressB = b.currentAmount / b.targetAmount;
          return progressA - progressB;
        }
        case 'progress': {
          const progressA2 = a.currentAmount / a.targetAmount;
          const progressB2 = b.currentAmount / b.targetAmount;
          return progressB2 - progressA2;
        }
        default:
          return 0;
      }
    });

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'well': return 'Forage';
      case 'pump': return 'Pompage';
      case 'distribution': return 'Distribution';
      case 'treatment': return 'Traitement';
      default: return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'well': return 'bg-blue-100 text-blue-800';
      case 'pump': return 'bg-green-100 text-green-800';
      case 'distribution': return 'bg-purple-100 text-purple-800';
      case 'treatment': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projets Disponibles</h1>
        <p className="text-gray-600 mt-1">Découvrez et soutenez des projets d'accès à l'eau potable</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les catégories</option>
              <option value="well">Forage</option>
              <option value="pump">Pompage</option>
              <option value="distribution">Distribution</option>
              <option value="treatment">Traitement</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'urgent' | 'progress')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="newest">Plus récents</option>
            <option value="urgent">Plus urgents</option>
            <option value="progress">Mieux financés</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map((project) => {
          const progressPercentage = Math.min((project.currentAmount / project.targetAmount) * 100, 100);

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{project.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{project.village.name}, {project.village.region}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{project.village.population.toLocaleString()} hab.</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(project.category)}`}>
                    {getCategoryLabel(project.category)}
                  </span>
                </div>
              </CardHeader>

              <img src="https://images.unsplash.com/photo-1504904126293-481cc6e3d43d" alt="water" className="h-40 w-full object-cover" />

              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{project.description}</p>
                
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Financement</span>
                    <span className="text-sm text-gray-600">
                      {progressPercentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">
                      {project.currentAmount.toLocaleString()}€ collectés
                    </span>
                    <span className="font-medium text-gray-900">
                      Objectif: {project.targetAmount.toLocaleString()}€
                    </span>
                  </div>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Durée: {project.estimatedDuration} mois</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Euro className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Besoin: {(project.targetAmount - project.currentAmount).toLocaleString()}€</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <Link
                    to={`/donateur/projects/${project.id}`}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Voir détails</span>
                  </Link>
                  
                  <Link
                    to={`/donateur/projects/${project.id}/contribute`}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Contribuer</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet trouvé</h3>
          <p className="text-gray-600">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Aucun projet ne correspond à vos critères de recherche.'
              : 'Aucun projet disponible pour le moment.'
            }
          </p>
          {(searchTerm || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DonateurProjects;
