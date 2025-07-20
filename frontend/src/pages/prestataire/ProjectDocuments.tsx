import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import { Document, Project } from '../../types';
import toast from 'react-hot-toast';

const ProjectDocuments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [type, setType] = useState('devis');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/projets/${id}`),
      api.get(`/projets/${id}/documents`)
    ]).then(([projRes, docsRes]) => {
      setProject(projRes.data);
      setDocuments(docsRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !id) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('type', type);
    formData.append('fichier', file);
    api.post(`/projets/${id}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => {
      setDocuments(d => [...d, res.data]);
      setFile(null);
      toast.success('Document envoyé');
    }).catch(() => toast.error('Erreur lors de l\'envoi')).finally(() => setUploading(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documents - {project.title}</h1>
        <p className="text-gray-600 mt-1">Gérez les documents techniques de ce projet</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full border-gray-300 rounded-lg">
                <option value="devis">Devis</option>
                <option value="contrat">Contrat</option>
                <option value="plan">Plan</option>
                <option value="rapport">Rapport</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fichier</label>
              <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full" />
            </div>
            <button type="submit" disabled={!file || uploading} className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
              {uploading ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents envoyés</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {documents.map(doc => (
              <li key={doc.id} className="flex justify-between items-center p-2 border rounded">
                <span>{doc.name || doc.type}</span>
                <a href={doc.url} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">Voir</a>
              </li>
            ))}
            {documents.length === 0 && <p className="text-sm text-gray-600">Aucun document.</p>}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDocuments;
