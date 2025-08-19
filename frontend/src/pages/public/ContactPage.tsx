import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, User, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { publicApiService } from '../../services/publicApi';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Envoi des données à l'API réelle
            const response = await publicApiService.submitContact(formData);

            if (response.success) {
                setIsSubmitted(true);
                setFormData({
                    nom: '',
                    email: '',
                    telephone: '',
                    sujet: '',
                    message: '',
                });
            } else {
                setError(response.message || 'Une erreur est survenue lors de l\'envoi du message.');
            }
        } catch (err: any) {
            console.error('Erreur lors de l\'envoi:', err);
            setError(err.message || 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const contactInfo = [
        {
            icon: Phone,
            title: 'Téléphone',
            value: '+223 70 00 00 00',
            description: 'Lun - Ven : 8h - 17h',
        },
        {
            icon: Mail,
            title: 'Email',
            value: 'contact@khayroukum.ml',
            description: 'Réponse sous 24h',
        },
        {
            icon: MapPin,
            title: 'Adresse',
            value: 'Bamako, Mali',
            description: 'Hamdallaye ACI 2000',
        },
    ];

    const faqItems = [
        {
            question: 'Comment puis-je proposer un projet pour mon village ?',
            answer: 'Vous pouvez créer un compte prestataire et soumettre votre projet avec tous les documents requis. Notre équipe examinera votre demande dans un délai de 5 jours ouvrables.'
        },
        {
            question: 'Quels types de projets sont acceptés ?',
            answer: 'Nous acceptons les projets liés à l\'accès à l\'eau potable, à l\'agriculture durable, aux infrastructures communautaires et à l\'éducation dans les zones rurales.'
        },
        {
            question: 'Comment puis-je contribuer financièrement à un projet ?',
            answer: 'Créez un compte donateur, explorez les projets disponibles et choisissez celui que vous souhaitez soutenir. Tous les paiements sont sécurisés et transparents.'
        },
        {
            question: 'Puis-je suivre l\'évolution des projets que je finance ?',
            answer: 'Absolument ! Notre plateforme offre un suivi en temps réel avec des rapports réguliers, des photos et des mises à jour sur l\'avancement de chaque projet.'
        }
    ];

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="max-w-md mx-auto text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Message envoyé !</h2>
                    <p className="text-gray-600 mb-8">
                        Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Envoyer un autre message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">
                            Contactez-nous
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
                            Nous sommes là pour répondre à vos questions et vous accompagner dans vos projets
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Informations de contact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {contactInfo.map((info, index) => (
                        <div key={index} className="text-center p-8 border rounded-lg hover:shadow-lg transition-shadow">
                            <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <info.icon className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{info.title}</h3>
                            <div className="text-lg text-gray-900 mb-1">{info.value}</div>
                            <div className="text-sm text-gray-600">{info.description}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Formulaire de contact */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="text-red-600 text-sm">{error}</div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom complet *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        id="nom"
                                        name="nom"
                                        required
                                        value={formData.nom}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Votre nom complet"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                                    Téléphone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="tel"
                                        id="telephone"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="+223 70 00 00 00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-2">
                                    Sujet *
                                </label>
                                <select
                                    id="sujet"
                                    name="sujet"
                                    required
                                    value={formData.sujet}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Sélectionnez un sujet</option>
                                    <option value="nouveau-projet">Proposer un nouveau projet</option>
                                    <option value="partenariat">Partenariat</option>
                                    <option value="don">Question sur les dons</option>
                                    <option value="technique">Support technique</option>
                                    <option value="autre">Autre</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message *
                                </label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Décrivez votre demande ou votre message..."
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5 mr-2" />
                                        Envoyer le message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* FAQ */}
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Questions Fréquentes</h2>

                        <div className="space-y-6">
                            {faqItems.map((item, index) => (
                                <div key={index} className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {item.question}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Heures de contact */}
                        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                            <div className="flex items-center mb-4">
                                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Heures de contact</h3>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Lundi - Vendredi</span>
                                    <span>8h00 - 17h00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Samedi</span>
                                    <span>9h00 - 13h00</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dimanche</span>
                                    <span>Fermé</span>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-blue-600">
                                * Réponse aux emails sous 24h en jours ouvrables
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <section className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-12 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Vous avez un projet en tête ?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        N'attendez plus pour donner vie à vos idées de développement rural.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/register"
                            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Créer un compte
                        </a>
                        <a
                            href="/projets"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                        >
                            Découvrir les projets
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ContactPage;
