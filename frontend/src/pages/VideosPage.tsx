import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Video as VideoIcon,
  Sparkles,
  Download,
  Trash2,
  Play,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ToastContainer from '../components/ui/ToastNotification';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../contexts/AuthContext';
import { Project } from '../types';
import api from '../lib/api';

type VideoStatut = 'en_cours' | 'termine' | 'echec';
type VideoFormat = '9:16' | '16:9' | '1:1';

interface GeneratedVideo {
  id: number;
  projetId: number | null;
  projetTitre: string | null;
  sujet: string;
  script: string | null;
  format: VideoFormat;
  statut: VideoStatut;
  progression: number;
  erreur: string | null;
  downloadUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

const FORMATS: { value: VideoFormat; label: string }[] = [
  { value: '9:16', label: 'Vertical 9:16 (TikTok, Reels, Shorts)' },
  { value: '16:9', label: 'Horizontal 16:9 (YouTube)' },
  { value: '1:1', label: 'Carré 1:1 (Instagram, Facebook)' },
];

const VOIX = [
  { value: 'fr-FR-DeniseNeural-Female', label: 'Denise (femme, français)' },
  { value: 'fr-FR-HenriNeural-Male', label: 'Henri (homme, français)' },
  { value: 'fr-FR-EloiseNeural-Female', label: 'Éloïse (femme, français)' },
  { value: 'fr-FR-RemyMultilingualNeural-Male', label: 'Rémy (homme, multilingue)' },
  { value: 'fr-FR-VivienneMultilingualNeural-Female', label: 'Vivienne (femme, multilingue)' },
];

const POLL_INTERVAL_MS = 5000;

const statutBadge: Record<VideoStatut, { label: string; className: string; icon: React.ElementType }> = {
  en_cours: { label: 'En cours', className: 'bg-blue-100 text-blue-800', icon: Loader2 },
  termine: { label: 'Terminée', className: 'bg-green-100 text-green-800', icon: CheckCircle },
  echec: { label: 'Échec', className: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const apiError = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { message?: string; error?: string; errors?: Record<string, string[]> } } })
    ?.response?.data;
  if (data?.errors) return Object.values(data.errors).flat().join(' ');
  return data?.error || data?.message || fallback;
};

const VideosPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'administrateur';
  const [searchParams] = useSearchParams();
  const { toasts, removeToast, success, error: showError } = useToast();

  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Formulaire
  const [projetId, setProjetId] = useState<string>(searchParams.get('projet') ?? '');
  const [sujet, setSujet] = useState('');
  const [format, setFormat] = useState<VideoFormat>('9:16');
  const [voix, setVoix] = useState(VOIX[0].value);
  const [sousTitres, setSousTitres] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [script, setScript] = useState('');
  const [motsCles, setMotsCles] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Lecture / suppression
  const [previews, setPreviews] = useState<Record<number, string>>({});
  const [loadingPreview, setLoadingPreview] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<GeneratedVideo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const previewsRef = useRef(previews);
  previewsRef.current = previews;

  const fetchVideos = useCallback(async () => {
    const res = await api.get<GeneratedVideo[]>('/videos');
    setVideos(res.data);
    return res.data;
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      fetchVideos(),
      api.get('/projets').then(res => {
        const all: Project[] = res.data;
        setProjects(isAdmin ? all : all.filter(p => String(p.prestataireId) === String(user.id)));
      }),
    ])
      .catch(() => setLoadError('Impossible de charger les vidéos.'))
      .finally(() => setLoading(false));
  }, [user, isAdmin, fetchVideos]);

  // Rafraîchit automatiquement tant qu'une vidéo est en cours de génération.
  const hasPending = videos.some(v => v.statut === 'en_cours');
  useEffect(() => {
    if (!hasPending) return;
    const timer = window.setInterval(() => {
      fetchVideos().catch(() => undefined);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [hasPending, fetchVideos]);

  // Libère les URLs blob des aperçus en quittant la page.
  useEffect(() => () => Object.values(previewsRef.current).forEach(url => URL.revokeObjectURL(url)), []);

  const selectedProject = projects.find(p => String(p.id) === projetId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projetId && !sujet.trim()) {
      showError('Sujet manquant', 'Choisissez un projet ou saisissez un sujet.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        format,
        langue: 'fr-FR',
        voix,
        sous_titres: sousTitres,
      };
      if (projetId) payload.projet_id = Number(projetId);
      if (sujet.trim()) payload.sujet = sujet.trim();
      if (script.trim()) payload.script = script.trim();
      const keywords = motsCles.split(',').map(k => k.trim()).filter(Boolean);
      if (keywords.length) payload.mots_cles = keywords;

      const res = await api.post<GeneratedVideo>('/videos', payload);
      setVideos(prev => [res.data, ...prev]);
      setSujet('');
      setScript('');
      setMotsCles('');
      success('Génération lancée', 'La vidéo sera prête dans quelques minutes.');
    } catch (err) {
      showError('Échec du lancement', apiError(err, 'Le service de génération est indisponible.'));
    } finally {
      setSubmitting(false);
    }
  };

  const fetchBlob = async (video: GeneratedVideo) => {
    const res = await api.get(`/videos/${video.id}/download`, { responseType: 'blob' });
    return new Blob([res.data], { type: 'video/mp4' });
  };

  const handlePreview = async (video: GeneratedVideo) => {
    if (previews[video.id]) return;
    setLoadingPreview(video.id);
    try {
      const url = URL.createObjectURL(await fetchBlob(video));
      setPreviews(prev => ({ ...prev, [video.id]: url }));
    } catch (err) {
      showError('Lecture impossible', apiError(err, 'La vidéo est introuvable.'));
    } finally {
      setLoadingPreview(null);
    }
  };

  const handleDownload = async (video: GeneratedVideo) => {
    try {
      const url = previews[video.id] ?? URL.createObjectURL(await fetchBlob(video));
      const link = document.createElement('a');
      link.href = url;
      link.download = `video-${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      if (!previews[video.id]) URL.revokeObjectURL(url);
    } catch (err) {
      showError('Téléchargement impossible', apiError(err, 'La vidéo est introuvable.'));
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/videos/${toDelete.id}`);
      if (previews[toDelete.id]) URL.revokeObjectURL(previews[toDelete.id]);
      setVideos(prev => prev.filter(v => v.id !== toDelete.id));
      success('Vidéo supprimée');
      setToDelete(null);
    } catch (err) {
      showError('Suppression impossible', apiError(err, 'Réessayez plus tard.'));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <VideoIcon className="w-7 h-7 text-blue-600" />
          Vidéos
        </h1>
        <p className="text-gray-600 mt-1">
          Générez automatiquement de courtes vidéos (script, voix off, sous-titres et images) pour présenter vos projets.
        </p>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {/* Formulaire de génération */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Nouvelle vidéo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="projet" className="block text-sm font-medium text-gray-700 mb-1">
                  Projet (facultatif)
                </label>
                <select id="projet" value={projetId} onChange={e => setProjetId(e.target.value)} className={inputClass}>
                  <option value="">— Aucun projet —</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <select
                  id="format"
                  value={format}
                  onChange={e => setFormat(e.target.value as VideoFormat)}
                  className={inputClass}
                >
                  {FORMATS.map(f => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-1">
                Sujet {projetId ? '(facultatif)' : ''}
              </label>
              <textarea
                id="sujet"
                rows={3}
                maxLength={500}
                value={sujet}
                onChange={e => setSujet(e.target.value)}
                className={inputClass}
                placeholder={
                  selectedProject
                    ? `Par défaut : « ${selectedProject.title} » et sa description`
                    : "Ex. : L'arrivée de l'eau potable dans le village de Ndiaye grâce à un nouveau forage"
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="voix" className="block text-sm font-medium text-gray-700 mb-1">
                  Voix off
                </label>
                <select id="voix" value={voix} onChange={e => setVoix(e.target.value)} className={inputClass}>
                  {VOIX.map(v => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 md:mt-7 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sousTitres}
                  onChange={e => setSousTitres(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                Ajouter des sous-titres
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(v => !v)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Options avancées
            </button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="script" className="block text-sm font-medium text-gray-700 mb-1">
                    Script imposé
                  </label>
                  <textarea
                    id="script"
                    rows={5}
                    maxLength={5000}
                    value={script}
                    onChange={e => setScript(e.target.value)}
                    className={inputClass}
                    placeholder="Laissez vide pour que le script soit rédigé automatiquement."
                  />
                </div>
                <div>
                  <label htmlFor="motsCles" className="block text-sm font-medium text-gray-700 mb-1">
                    Mots-clés des images (séparés par des virgules)
                  </label>
                  <input
                    id="motsCles"
                    type="text"
                    value={motsCles}
                    onChange={e => setMotsCles(e.target.value)}
                    className={inputClass}
                    placeholder="water well, african village, children drinking water"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    De préférence en anglais : ils servent à chercher les images sur Pexels.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Générer la vidéo
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Liste des vidéos */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {isAdmin ? 'Toutes les vidéos' : 'Mes vidéos'} ({videos.length})
        </h2>
        <button
          onClick={() => fetchVideos().catch(() => showError('Actualisation impossible'))}
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <VideoIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Aucune vidéo pour l'instant. Lancez votre première génération ci-dessus.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map(video => {
            const badge = statutBadge[video.statut];
            const BadgeIcon = badge.icon;
            const previewUrl = previews[video.id];
            return (
              <Card key={video.id} className="flex flex-col">
                <CardContent className="p-4 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
                    >
                      <BadgeIcon className={`w-3 h-3 ${video.statut === 'en_cours' ? 'animate-spin' : ''}`} />
                      {badge.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {video.format} · {new Date(video.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  {video.projetTitre && (
                    <p className="text-xs font-medium text-blue-700">Projet : {video.projetTitre}</p>
                  )}
                  <p className="text-sm text-gray-800 line-clamp-3" title={video.sujet}>
                    {video.sujet}
                  </p>

                  {video.statut === 'en_cours' && (
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(video.progression, 3)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{video.progression} % — génération en cours…</p>
                    </div>
                  )}

                  {video.statut === 'echec' && video.erreur && (
                    <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{video.erreur}</p>
                  )}

                  {video.statut === 'termine' && (
                    <div className="mt-auto">
                      {previewUrl ? (
                        <video
                          src={previewUrl}
                          controls
                          className={`w-full rounded-lg bg-black ${video.format === '9:16' ? 'max-h-96' : ''}`}
                        />
                      ) : (
                        <button
                          onClick={() => handlePreview(video)}
                          disabled={loadingPreview === video.id}
                          className="w-full h-32 rounded-lg bg-gray-900 text-white flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-70"
                        >
                          {loadingPreview === video.id ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Play className="w-6 h-6" />
                          )}
                          Voir la vidéo
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-100 mt-auto">
                    {video.statut === 'termine' && (
                      <button
                        onClick={() => handleDownload(video)}
                        className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    )}
                    <button
                      onClick={() => setToDelete(video)}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                      aria-label="Supprimer la vidéo"
                    >
                      <Trash2 className="w-4 h-4" />
                      {video.statut !== 'termine' && 'Supprimer'}
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={toDelete !== null}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la vidéo"
        message="Cette vidéo sera définitivement supprimée. Continuer ?"
        confirmText="Supprimer"
        loading={deleting}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default VideosPage;
