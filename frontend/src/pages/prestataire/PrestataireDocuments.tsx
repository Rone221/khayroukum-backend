
import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ProjectViewModal from '../../components/ProjectViewModal';
import ToastContainer from '../../components/ui/ToastNotification';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Upload,
  FileText,
  Image,
  FileCheck,
  Calendar,
  Download,
  Trash2,
  Plus,
  Eye,
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

// Interface pour typer les documents
interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  projectName: string;
  projet: {
    id: number;
    titre: string;
  };
  status: string;
  url?: string;
  created_at: string;
}

// Interface pour les projets groupés
interface ProjectGroup {
  id: number;
  name: string;
  documents: Document[];
  totalSize: string;
}

const PrestataireDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>([]);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [selectedProject, setSelectedProject] = useState<ProjectGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toasts, removeToast, success, error: showError } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  // Fonction pour grouper les documents par projet
  const groupDocumentsByProject = (docs: Document[]): ProjectGroup[] => {
    const groupsMap = new Map<number, ProjectGroup>();

    docs.forEach(doc => {
      const projectId = doc.projet.id;

      if (!groupsMap.has(projectId)) {
        groupsMap.set(projectId, {
          id: projectId,
          name: doc.projet.titre,
          documents: [],
          totalSize: ''
        });
      }

      groupsMap.get(projectId)!.documents.push(doc);
    });

    // Calculer la taille totale pour chaque projet
    const groups = Array.from(groupsMap.values()).map(group => ({
      ...group,
      totalSize: calculateTotalSize(group.documents)
    }));

    return groups.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Calculer la taille totale des documents d'un projet
  const calculateTotalSize = (docs: Document[]): string => {
    // Pour l'instant, on retourne juste le nombre de documents
    // Plus tard on pourra calculer la vraie taille totale
    return `${docs.length} document${docs.length > 1 ? 's' : ''}`;
  };

  // Toggle l'expansion d'un projet
  const toggleProject = (projectId: number) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // Ouvrir le modal pour un projet
  const openProjectModal = (project: ProjectGroup) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Fermer le modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  // Callback après suppression d'un document
  const handleDocumentDeleted = async () => {
    try {
      // Recharger tous les documents depuis l'API
      const updatedDocuments = await loadDocuments();

      // Si un projet est sélectionné dans le modal, mettre à jour ses données
      if (selectedProject && updatedDocuments) {
        // Recréer les groupes de projets avec les nouvelles données
        const newProjectGroups = groupDocumentsByProject(updatedDocuments);

        // Trouver le projet mis à jour
        const updatedProject = newProjectGroups.find(p => p.id === selectedProject.id);

        if (updatedProject) {
          setSelectedProject(updatedProject);
        }
      }

      success('Actualisation', 'La liste des documents a été mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  // Fonction pour charger les documents
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    console.log('🔄 Chargement des documents prestataire...');

    try {
      // Utiliser l'endpoint pour récupérer tous les documents du prestataire
      const res = await api.get('/prestataire/documents');
      console.log('📄 Réponse API documents:', res.data);

      // La réponse contient { documents: [...], total: number }
      const documentsData = res.data.documents || [];
      console.log('📋 Documents extraits:', documentsData);

      setDocuments(documentsData);

      // Grouper les documents par projet
      const grouped = groupDocumentsByProject(documentsData);
      setProjectGroups(grouped);

      return documentsData; // Retourner les données pour utilisation externe
    } catch (err) {
      console.error('❌ Erreur lors du chargement des documents:', err);
      setError("Impossible de charger les documents.");
      showError('Erreur de chargement', 'Impossible de charger les documents');
      return [];
    } finally {
      console.log('✅ Chargement terminé');
      setLoading(false);
    }
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'images':
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-5 h-5 text-blue-500" />;
      default: return <FileCheck className="w-5 h-5 text-gray-500" />;
    }
  };

  const getProjectIcon = (isExpanded: boolean, documentCount: number) => {
    if (isExpanded) {
      return <FolderOpen className="w-6 h-6 text-blue-500" />;
    }
    return <Folder className="w-6 h-6 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mes Documents</h1>
        <p className="text-gray-600 mt-2">Gérez vos documents techniques et administratifs par projet</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Projects</p>
                <p className="text-2xl font-bold text-blue-900">{projectGroups.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-200">
                <Folder className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Documents</p>
                <p className="text-2xl font-bold text-green-900">{documents.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-200">
                <FileCheck className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Approuvés</p>
                <p className="text-2xl font-bold text-purple-900">
                  {documents.filter(doc => doc.status === 'approved').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-200">
                <FileCheck className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">En attente</p>
                <p className="text-2xl font-bold text-orange-900">
                  {documents.filter(doc => doc.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-200">
                <Upload className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects with Documents */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800">Documents par Projet</h2>

        {projectGroups.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-12 text-center">
              <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
              <p className="text-gray-600">Vos documents apparaîtront ici une fois ajoutés à vos projets.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projectGroups.map((project) => (
              <div
                key={project.id}
                className="group cursor-pointer"
                onClick={() => openProjectModal(project)}
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 overflow-hidden bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-0">
                    {/* Header avec gradient */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                            <Folder className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg line-clamp-1">
                              {project.name}
                            </h3>
                            <p className="text-blue-100 text-sm">
                              {project.totalSize}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-6">
                      {/* Statistiques */}
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {project.documents.length}
                          </div>
                          <div className="text-xs text-gray-500">Documents</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {project.documents.filter(d => d.status === 'approved').length}
                          </div>
                          <div className="text-xs text-gray-500">Approuvés</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {project.documents.filter(d => d.status === 'pending').length}
                          </div>
                          <div className="text-xs text-gray-500">En attente</div>
                        </div>
                      </div>

                      {/* Types de fichiers */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from(new Set(project.documents.map(d => d.type))).map(type => (
                          <div key={type} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                            {type?.toLowerCase() === 'pdf' ? (
                              <FileText className="w-3 h-3 text-red-500" />
                            ) : (
                              <Image className="w-3 h-3 text-blue-500" />
                            )}
                            <span className="capitalize font-medium">{type}</span>
                          </div>
                        ))}
                      </div>

                      {/* Date du dernier document */}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>
                          Dernière mise à jour: {' '}
                          {new Date(
                            Math.max(...project.documents.map(d => new Date(d.created_at).getTime()))
                          ).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Barre de progression (simulée) */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progression</span>
                          <span>
                            {Math.round((project.documents.filter(d => d.status === 'approved').length / project.documents.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(project.documents.filter(d => d.status === 'approved').length / project.documents.length) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Footer avec bouton action */}
                    <div className="px-6 pb-6">
                      <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
                        <span className="text-sm text-gray-600 group-hover:text-blue-600">
                          Cliquer pour explorer
                        </span>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ProjectViewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        project={selectedProject}
        onDocumentDeleted={handleDocumentDeleted}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default PrestataireDocuments;
