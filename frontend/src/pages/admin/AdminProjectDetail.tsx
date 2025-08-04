import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Euro,
  Clock,
  Droplets,
  FileText,
  Download,
  Check,
  X,
  Eye,
  Users,
  Target,
  TrendingUp
} from 'lucide-react';
import { Project } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { downloadDocument } from '../../lib/downloadUtils';

const AdminProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      api
        .get(`/projets/${id}`)
        .then(res => setProject(res.data))
        .catch(error => {
          console.error('Error loading project:', error);
          navigate('/admin/projects');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handleValidateProject = async () => {
    if (!project || actionLoading) return;
    
    setActionLoading(true);
    try {
      await api.patch(`/projets/${project.id}/valider`);
      setProject({ ...project, status: 'validated' });
    } catch (error) {
      console.error('Error validating project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProject = async () => {
    if (!project || actionLoading) return;
    
    setActionLoading(true);
    try {
      await api.delete(`/projets/${project.id}`);
      setProject({ ...project, status: 'rejected' });
    } catch (error) {
      console.error('Error rejecting project:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDocument = async (docId: string, docName: string) => {
    setDownloadingDocId(docId);
    const success = await downloadDocument(docId, docName);
    if (!success) {
      alert('Erreur lors du téléchargement du document');
    }
    setDownloadingDocId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'funded': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'rejected': return 'Rejeté';
      case 'funded': return 'Financé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Projet non trouvé</h3>
        <p className="text-gray-600 mb-4">Le projet demandé n'existe pas ou a été supprimé.</p>
        <button
          onClick={() => navigate('/admin/projects')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour aux projets
        </button>
      </div>
    );
  }

  const progressPercentage = project.targetAmount > 0 
    ? Math.min((project.currentAmount / project.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/projects')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-600">Détails du projet</p>
          </div>
        </div>
        <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
          {getStatusText(project.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <span>Aperçu du Projet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Objectif de financement</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {project.targetAmount.toLocaleString()}€
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Montant collecté</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {project.currentAmount.toLocaleString()}€
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progression du financement</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {project.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <span>Documents Techniques</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-600 capitalize">{doc.type}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDownloadDocument(doc.id, doc.name)}
                        disabled={downloadingDocId === doc.id}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Télécharger le document"
                      >
                        {downloadingDocId === doc.id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{project.village?.name || 'Village inconnu'}</p>
                  <p className="text-sm text-gray-600">{project.village?.region || 'Région inconnue'}</p>
                  {project.village?.coordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      {project.village.coordinates.lat.toFixed(4)}, {project.village.coordinates.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{project.prestataireName}</p>
                  <p className="text-sm text-gray-600">Prestataire</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-600">Date de création</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{project.estimatedDuration} mois</p>
                  <p className="text-sm text-gray-600">Durée estimée</p>
                </div>
              </div>

              {project.village?.population && (
                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{project.village.population.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Population</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          {project.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={handleValidateProject}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Valider le projet</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRejectProject}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <X className="w-5 h-5" />
                      <span>Rejeter le projet</span>
                    </>
                  )}
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProjectDetail;
