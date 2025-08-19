import React from 'react';
import { MapPin, DollarSign, Users, Calendar } from 'lucide-react';
import { PublicProject } from '../../services/publicApi';

interface ProjectCardProps {
    project: PublicProject;
    formatCurrency: (amount: number) => string;
    formatDate: (dateString: string) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = React.memo(({
    project,
    formatCurrency,
    formatDate
}) => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-48 flex items-center justify-center">
                <div className="text-white text-center p-4">
                    <div className="text-sm opacity-90 mb-2">Projet terminé</div>
                    <div className="text-lg font-semibold">{project.type_financement}</div>
                </div>
            </div>
            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.village_nom}
                    </div>
                    <div className="text-sm text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                        ✓ Terminé
                    </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {project.titre}
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {project.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Budget: {formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{project.beneficiaires_estimes} bénéficiaires</span>
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Terminé: {formatDate(project.date_fin)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;
