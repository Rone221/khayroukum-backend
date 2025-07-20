
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  MapPin, 
  Users, 
  Calendar,
  Euro,
  Clock,
  FileText,
  ArrowLeft,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Project, Contribution } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [nameOnBoard, setNameOnBoard] = useState('');
  const [message, setMessage] = useState('');
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [offers, setOffers] = useState<Contribution[]>([]);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/projets/${id}`),
      api.get(`/projets/${id}/offres`)
    ])
      .then(([projRes, offersRes]) => {
        setProject(projRes.data);
        setOffers(offersRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDonation = () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0 || !project) return;
    api
      .post(`/projets/${project.id}/offres`, {
        montant: parseFloat(donationAmount),
        nom_sur_tableau: nameOnBoard,
        message,
      })
      .then(res => {
        setOffers(o => [...o, res.data]);
        toast.success('Offre enregistrée');
        setShowDonationForm(false);
        setDonationAmount('');
        setNameOnBoard('');
        setMessage('');
      })
      .catch(() => toast.error('Erreur lors de l\'envoi'));
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
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Projet non trouvé</h2>
        <p className="text-gray-600 mb-4">Le projet que vous recherchez n'existe pas.</p>
        <Link to="/donateur/projects" className="text-blue-600 hover:text-blue-800">
          Retour aux projets
        </Link>
      </div>
    );
  }

  const progressPercentage = Math.round((project.currentAmount / project.targetAmount) * 100);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/donateur/projects" className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Retour aux projets</span>
      </Link>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 p-8 text-white">
          <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>{project.village.name}, {project.village.region}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{project.village.population.toLocaleString()} habitants</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description du projet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed mb-4">{project.description}</p>
              <p className="text-gray-700 leading-relaxed">
                Ce projet vise à améliorer l'accès à l'eau potable pour les habitants de {project.village.name}. 
                Grâce à votre soutien, nous pourrons installer des infrastructures modernes et durables 
                qui bénéficieront à toute la communauté pendant de nombreuses années.
              </p>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails techniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Durée estimée</span>
                    <span className="font-semibold">{project.estimatedDuration} mois</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Population bénéficiaire</span>
                    <span className="font-semibold">{project.village.population.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Prestataire</span>
                    <span className="font-semibold">{project.prestataireName}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Coordonnées</span>
                    <span className="font-semibold">
                      {project.village.coordinates.lat.toFixed(2)}, {project.village.coordinates.lng.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Statut</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      project.status === 'validated' ? 'bg-green-100 text-green-800' :
                      project.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'validated' ? 'Validé' :
                       project.status === 'funded' ? 'Financé' : project.status}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {project.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents du projet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">PDF - 2.4 MB</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800">
                        Télécharger
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
          {/* Funding Progress */}
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-center">Financement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {project.currentAmount.toLocaleString()}€
                </div>
                <div className="text-sm text-gray-600">
                  sur {project.targetAmount.toLocaleString()}€
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm text-gray-600">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">12</div>
                  <div className="text-xs text-blue-600">Donateurs</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">
                    {project.targetAmount - project.currentAmount > 0 
                      ? `${(project.targetAmount - project.currentAmount).toLocaleString()}€`
                      : '0€'
                    }
                  </div>
                  <div className="text-xs text-green-600">Restant</div>
                </div>
              </div>

              {/* Donation Button */}
              {!showDonationForm ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowDonationForm(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Faire un don</span>
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                    <Share2 className="w-4 h-4" />
                    <span>Partager</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant de votre offre
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        placeholder="100"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                      />
                      <span className="absolute right-3 top-3 text-gray-500">€</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom affiché</label>
                    <input
                      type="text"
                      value={nameOnBoard}
                      onChange={e => setNameOnBoard(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message (optionnel)</label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleDonation}
                      disabled={!donationAmount || parseFloat(donationAmount) <= 0}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Confirmer
                    </button>
                    <button 
                      onClick={() => setShowDonationForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Amounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Montants suggérés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[25, 50, 100, 200].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setDonationAmount(amount.toString());
                      setShowDonationForm(true);
                    }}
                    className="p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-center font-medium"
                  >
                    {amount}€
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {offers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Offres de financement</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {offers.map(o => (
                    <li key={o.id} className="flex justify-between border p-2 rounded">
                      <span>{o.donatorName || nameOnBoard || 'Anonyme'}</span>
                      <span className="font-medium">{o.amount.toLocaleString()}€</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
