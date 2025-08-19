<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Projet;
use App\Models\Village;
use App\Models\User;
use App\Models\ContactMessage;
use App\Models\SiteContent;
use App\Models\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class PublicController extends Controller
{
    /**
     * Obtenir les statistiques générales pour le site public
     */
    public function stats()
    {
        try {
            // Cache des statistiques pour 15 minutes
            $stats = Cache::remember('public_stats', 900, function () {
                return [
                    'total_projects' => Projet::where('statut', 'terminé')->count(),
                    'total_villages' => Village::count(),
                    'total_beneficiaires' => Village::sum('population') ?? 0,
                    'active_prestataires' => User::where('role', 'prestataire')->count(),
                    'projects_in_progress' => Projet::where('statut', 'en_cours')->count(),
                    'completed_projects' => Projet::where('statut', 'terminé')->count(),
                    'last_updated' => now()->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $stats
            ])->header('Cache-Control', 'public, max-age=900'); // Cache navigateur 15min
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques'
            ], 500);
        }
    }

    /**
     * Obtenir les projets terminés pour le site public
     */
    public function projects(Request $request)
    {
        try {
            $limit = $request->get('limit', 6); // Par défaut 6 projets
            
            // Cache des projets pour 30 minutes avec la limite comme clé
            $projects = Cache::remember("public_projects_limit_{$limit}", 1800, function () use ($limit) {
                // Afficher les projets actifs, en cours et terminés (pas les brouillons ou rejetés)
                return Projet::with(['village'])
                    ->whereIn('statut', ['validé', 'en_cours', 'terminé', 'en_attente'])
                    ->orderBy('created_at', 'desc')
                    ->limit($limit)
                    ->get()
                    ->map(function ($projet) {
                        return [
                            'id' => $projet->id,
                            'titre' => $projet->titre,
                            'description' => $projet->description,
                            'village_nom' => $projet->village->nom ?? 'N/A',
                            'budget' => $projet->budget,
                            'date_debut' => $projet->date_debut,
                            'date_fin' => $projet->date_fin,
                            'type_financement' => $projet->type_financement,
                            'statut' => $projet->statut,
                            'beneficiaires_estimes' => $projet->village->population ?? 0,
                        ];
                    });
            });

            return response()->json([
                'success' => true,
                'data' => $projects
            ])->header('Cache-Control', 'public, max-age=1800'); // Cache navigateur 30min
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des projets'
            ], 500);
        }
    }

    /**
     * Obtenir les villages pour le site public
     */
    public function villages(Request $request)
    {
        try {
            $limit = $request->get('limit', 8);
            
            $villages = Village::with(['projets' => function ($query) {
                $query->where('statut', 'terminé');
            }])
                ->orderBy('nom')
                ->limit($limit)
                ->get()
                ->map(function ($village) {
                    return [
                        'id' => $village->id,
                        'nom' => $village->nom,
                        'region' => $village->region,
                        'population' => $village->population,
                        'coordonnees_gps' => $village->coordonnees_gps,
                        'projets_termines' => $village->projets->count(),
                        'derniere_activite' => $village->projets->max('date_fin'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $villages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des villages'
            ], 500);
        }
    }

    /**
     * Obtenir des informations générales sur l'organisation
     */
    public function about()
    {
        try {
            // Cache des données About pour 2 heures
            $data = Cache::remember('public_about_data', 7200, function () {
                // Récupération du contenu depuis SiteContent
                $aboutContent = SiteContent::getSectionContent('about');
                $statsContent = SiteContent::getContent('stats', 'highlights');
                
                // Récupération des statistiques en temps réel
                $realTimeStats = [
                    'villages_served' => Village::count(),
                    'projects_completed' => Projet::where('statut', 'terminé')->count(),
                    'total_investment' => Projet::where('statut', 'terminé')->sum('budget'),
                    'beneficiaires' => Village::sum('population') ?? 0,
                ];

                // Données de base depuis le contenu géré
                $baseData = [
                    'mission' => $aboutContent['mission']['text'] ?? "Accompagner le développement rural durable à travers des projets participatifs et l'accès au financement.",
                    'vision' => $aboutContent['vision']['text'] ?? "Un développement rural inclusif et durable pour tous.",
                    'founded_year' => $aboutContent['founded_year']['year'] ?? 2020,
                    'values' => $aboutContent['values']['list'] ?? [
                        'Transparence totale dans la gestion des fonds',
                        'Participation active des communautés',
                        'Durabilité environnementale et sociale'
                    ]
                ];

                // Fusion des statistiques statiques et temps réel
                if ($statsContent) {
                    $achievements = array_merge($statsContent, $realTimeStats);
                } else {
                    $achievements = $realTimeStats;
                }

                $baseData['achievements'] = $achievements;
                
                $baseData['key_figures'] = [
                    'active_partnerships' => User::where('role', 'prestataire')->count(),
                    'success_rate' => $this->calculateSuccessRate(),
                    'average_project_duration' => $this->calculateAverageProjectDuration(),
                ];

                return $baseData;
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ])->header('Cache-Control', 'public, max-age=7200'); // Cache navigateur 2h
        } catch (\Exception $e) {
            \Log::error('Erreur API about: ' . $e->getMessage());
            
            // Fallback vers les données par défaut
            $fallbackData = [
                'mission' => "Accompagner le développement rural durable à travers des projets participatifs et l'accès au financement.",
                'vision' => "Un développement rural inclusif et durable pour tous.",
                'founded_year' => 2020,
                'achievements' => [
                    'villages_served' => Village::count(),
                    'projects_completed' => Projet::where('statut', 'terminé')->count(),
                    'total_investment' => 0,
                    'beneficiaires' => Village::sum('population') ?? 0,
                ],
                'key_figures' => [
                    'active_partnerships' => User::where('role', 'prestataire')->count(),
                    'success_rate' => 0,
                    'average_project_duration' => 0,
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $fallbackData
            ]);
        }
    }

    /**
     * Calculer le taux de réussite des projets
     */
    private function calculateSuccessRate()
    {
        $total = Projet::count();
        if ($total === 0) return 0;
        
        $completed = Projet::where('statut', 'terminé')->count();
        return round(($completed / $total) * 100, 1);
    }

    /**
     * Calculer la durée moyenne des projets terminés (en mois)
     */
    private function calculateAverageProjectDuration()
    {
        $projects = Projet::where('statut', 'terminé')
            ->whereNotNull('date_debut')
            ->whereNotNull('date_fin')
            ->get();

        if ($projects->count() === 0) return 0;

        $totalDuration = $projects->sum(function ($project) {
            return \Carbon\Carbon::parse($project->date_fin)
                ->diffInMonths(\Carbon\Carbon::parse($project->date_debut));
        });

        return round($totalDuration / $projects->count(), 1);
    }

    /**
     * Soumettre un message de contact
     */
    public function submitContact(Request $request)
    {
        try {
            // Validation des données
            $validator = Validator::make($request->all(), [
                'nom' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'telephone' => 'nullable|string|max:20',
                'sujet' => 'required|string|in:nouveau-projet,partenariat,don,technique,autre',
                'message' => 'required|string|max:5000',
            ], [
                'nom.required' => 'Le nom est obligatoire',
                'email.required' => 'L\'email est obligatoire',
                'email.email' => 'L\'email doit être valide',
                'sujet.required' => 'Le sujet est obligatoire',
                'sujet.in' => 'Le sujet sélectionné n\'est pas valide',
                'message.required' => 'Le message est obligatoire',
                'message.max' => 'Le message ne peut pas dépasser 5000 caractères',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Données invalides',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Créer le message de contact
            $contactMessage = ContactMessage::create([
                'nom' => $request->nom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'sujet' => $request->sujet,
                'message' => $request->message,
                'status' => 'nouveau'
            ]);

            // Ici, vous pouvez ajouter l'envoi d'email de notification
            // Mail::to('admin@khayroukum.ml')->send(new NewContactMessage($contactMessage));

            return response()->json([
                'success' => true,
                'message' => 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
                'data' => [
                    'id' => $contactMessage->id,
                    'created_at' => $contactMessage->created_at->format('d/m/Y H:i')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'envoi du message de contact: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'envoi de votre message. Veuillez réessayer plus tard.'
            ], 500);
        }
    }

    /**
     * Récupérer le contenu d'une section spécifique
     */
    public function getContent(Request $request, $section)
    {
        try {
            $cacheKey = "public_content_{$section}";
            
            $content = Cache::remember($cacheKey, 3600, function () use ($section) {
                return SiteContent::getSectionContent($section);
            });

            if (empty($content)) {
                return response()->json([
                    'success' => false,
                    'message' => "Aucun contenu trouvé pour la section '{$section}'"
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $content
            ])->header('Cache-Control', 'public, max-age=3600');

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la récupération du contenu {$section}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du contenu'
            ], 500);
        }
    }

    /**
     * Récupérer les paramètres publics du site
     */
    public function getSettings()
    {
        try {
            $settings = Cache::remember('public_site_settings', 3600, function () {
                return SiteSettings::getPublicSettings();
            });

            return response()->json([
                'success' => true,
                'data' => $settings
            ])->header('Cache-Control', 'public, max-age=3600');

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des paramètres: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paramètres'
            ], 500);
        }
    }

    /**
     * Récupérer le contenu de la page d'accueil
     */
    public function getHomepage()
    {
        try {
            $data = Cache::remember('public_homepage_content', 1800, function () {
                return [
                    'hero' => SiteContent::getSectionContent('hero'),
                    'stats' => SiteContent::getContent('stats', 'highlights', [
                        'villages_served' => Village::count(),
                        'projects_completed' => Projet::whereIn('statut', ['validé', 'en_cours', 'terminé'])->count(),
                        'total_investment' => Projet::whereIn('statut', ['validé', 'en_cours', 'terminé'])->sum('budget') ?? 0,
                        'beneficiaires' => Village::sum('population') ?? 0,
                    ]),
                    'testimonials' => SiteContent::getContent('testimonials', 'featured', []),
                    'settings' => SiteSettings::whereIn('key', [
                        'primary_color', 'secondary_color', 'site_name', 'site_tagline'
                    ])->pluck('value', 'key')->toArray()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ])->header('Cache-Control', 'public, max-age=1800');

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération du contenu de la homepage: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du contenu de la page d\'accueil'
            ], 500);
        }
    }
}
