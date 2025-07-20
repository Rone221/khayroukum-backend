
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../lib/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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
  Eye
} from 'lucide-react';

const PrestataireDocuments: React.FC = () => {
  const { id: projectId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.get(`/projets/${projectId}/documents`)
      .then(res => setDocuments(res.data))
      .catch(() => setError("Impossible de charger les documents."))
      .finally(() => setLoading(false));
  }, [projectId]);


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
    switch (type) {
      case 'PDF': return <FileText className="w-6 h-6 text-red-500" />;
      case 'Images': return <Image className="w-6 h-6 text-blue-500" />;
      default: return <FileCheck className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mes Documents</h1>
        <p className="text-gray-600 mt-1">Gérez vos documents techniques et administratifs</p>
      </div>

      {/* Upload Section */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
        {/* Section d'upload supprimée, à réintégrer plus tard si besoin */}
        {/* Ajout d'un enfant vide pour corriger l'erreur */}
        <></>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Documents récents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        {getFileIcon(doc.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">{doc.projectName}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                          </span>
                          <span>{doc.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                        {getStatusText(doc.status)}
                      </span>
                      <div className="flex space-x-1">
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
                        {/* ...download/delete buttons... */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents approuvés</p>
                <p className="text-2xl font-bold text-green-600">12</p>
              </div>
              <div className="p-3 rounded-lg bg-green-50">
                <FileCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">3</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50">
                <Upload className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Espace utilisé</p>
                <p className="text-2xl font-bold text-blue-600">24.8 MB</p>
              </div>
              <div className="p-3 rounded-lg bg-blue-50">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrestataireDocuments;
