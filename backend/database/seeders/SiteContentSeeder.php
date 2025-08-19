<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SiteContent;

class SiteContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $contents = [
            // Section Hero (Page d'accueil)
            [
                'section' => 'hero',
                'key' => 'title',
                'value' => [
                    'fr' => 'Développement Rural Durable au Mali',
                    'text' => 'Développement Rural Durable au Mali'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'hero',
                'key' => 'subtitle',
                'value' => [
                    'fr' => 'Une plateforme participative pour financer et suivre les projets de développement rural dans les communautés maliennes',
                    'text' => 'Une plateforme participative pour financer et suivre les projets de développement rural dans les communautés maliennes'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'hero',
                'key' => 'cta_primary',
                'value' => [
                    'text' => 'Explorer les projets',
                    'url' => '/projets',
                    'style' => 'primary'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'hero',
                'key' => 'cta_secondary',
                'value' => [
                    'text' => 'Devenir partenaire',
                    'url' => '/register',
                    'style' => 'secondary'
                ],
                'status' => 'published',
                'published_at' => now()
            ],

            // Section À propos
            [
                'section' => 'about',
                'key' => 'mission',
                'value' => [
                    'fr' => 'Accompagner le développement rural durable à travers des projets participatifs, transparents et à fort impact social, en créant un pont entre les communautés rurales, les prestataires locaux et les financeurs engagés.',
                    'text' => 'Accompagner le développement rural durable à travers des projets participatifs, transparents et à fort impact social, en créant un pont entre les communautés rurales, les prestataires locaux et les financeurs engagés.'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'about',
                'key' => 'vision',
                'value' => [
                    'fr' => 'Être la plateforme de référence pour le développement rural participatif au Mali, où chaque village a accès aux ressources nécessaires pour réaliser ses projets de développement durable.',
                    'text' => 'Être la plateforme de référence pour le développement rural participatif au Mali, où chaque village a accès aux ressources nécessaires pour réaliser ses projets de développement durable.'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'about',
                'key' => 'values',
                'value' => [
                    'list' => [
                        'Transparence totale dans la gestion des fonds',
                        'Participation active des communautés',
                        'Durabilité environnementale et sociale',
                        'Innovation technologique au service du rural',
                        'Équité et inclusion sociale'
                    ]
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'about',
                'key' => 'founded_year',
                'value' => [
                    'year' => 2020,
                    'text' => '2020'
                ],
                'status' => 'published',
                'published_at' => now()
            ],

            // Section Contact
            [
                'section' => 'contact',
                'key' => 'phone',
                'value' => [
                    'number' => '+223 70 00 00 00',
                    'text' => '+223 70 00 00 00',
                    'hours' => 'Lun - Ven : 8h - 17h'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'contact',
                'key' => 'email',
                'value' => [
                    'address' => 'contact@khayroukum.ml',
                    'text' => 'contact@khayroukum.ml',
                    'response_time' => 'Réponse sous 24h'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'contact',
                'key' => 'address',
                'value' => [
                    'street' => 'Hamdallaye ACI 2000',
                    'city' => 'Bamako',
                    'country' => 'Mali',
                    'full' => 'Hamdallaye ACI 2000, Bamako, Mali'
                ],
                'status' => 'published',
                'published_at' => now()
            ],
            [
                'section' => 'contact',
                'key' => 'hours',
                'value' => [
                    'schedule' => [
                        'Lundi - Vendredi' => '8h00 - 17h00',
                        'Samedi' => '9h00 - 13h00',
                        'Dimanche' => 'Fermé'
                    ],
                    'note' => 'Réponse aux emails sous 24h en jours ouvrables'
                ],
                'status' => 'published',
                'published_at' => now()
            ],

            // Section Statistiques (pour la page d'accueil)
            [
                'section' => 'stats',
                'key' => 'highlights',
                'value' => [
                    'villages_served' => 8,
                    'projects_completed' => 18,
                    'total_investment' => 45000000, // 45 millions CFA
                    'beneficiaires' => 15000,
                    'active_partnerships' => 12,
                    'success_rate' => 85.5,
                    'average_project_duration' => 8.2
                ],
                'status' => 'published',
                'published_at' => now()
            ],

            // Section FAQ
            [
                'section' => 'faq',
                'key' => 'common_questions',
                'value' => [
                    'questions' => [
                        [
                            'question' => 'Comment puis-je proposer un projet pour mon village ?',
                            'answer' => 'Vous pouvez créer un compte prestataire et soumettre votre projet avec tous les documents requis. Notre équipe examinera votre demande dans un délai de 5 jours ouvrables.'
                        ],
                        [
                            'question' => 'Quels types de projets sont acceptés ?',
                            'answer' => 'Nous acceptons les projets liés à l\'accès à l\'eau potable, à l\'agriculture durable, aux infrastructures communautaires et à l\'éducation dans les zones rurales.'
                        ],
                        [
                            'question' => 'Comment puis-je contribuer financièrement à un projet ?',
                            'answer' => 'Créez un compte donateur, explorez les projets disponibles et choisissez celui que vous souhaitez soutenir. Tous les paiements sont sécurisés et transparents.'
                        ],
                        [
                            'question' => 'Puis-je suivre l\'évolution des projets que je finance ?',
                            'answer' => 'Absolument ! Notre plateforme offre un suivi en temps réel avec des rapports réguliers, des photos et des mises à jour sur l\'avancement de chaque projet.'
                        ]
                    ]
                ],
                'status' => 'published',
                'published_at' => now()
            ],

            // Section Témoignages
            [
                'section' => 'testimonials',
                'key' => 'featured',
                'value' => [
                    'testimonials' => [
                        [
                            'name' => 'Aminata Traoré',
                            'role' => 'Présidente du comité de gestion - Village de Kati',
                            'content' => 'Grâce à Khayroukum, notre village a enfin accès à l\'eau potable. Le processus était transparent et nous avons été impliqués à chaque étape.',
                            'rating' => 5,
                            'project' => 'Forage et château d\'eau'
                        ],
                        [
                            'name' => 'Mamadou Diallo',
                            'role' => 'Prestataire certifié',
                            'content' => 'Cette plateforme révolutionne la façon dont nous menons les projets ruraux. La transparence et le suivi en temps réel font toute la différence.',
                            'rating' => 5,
                            'project' => 'Système d\'irrigation communautaire'
                        ],
                        [
                            'name' => 'Dr. Marie Coulibaly',
                            'role' => 'Donatrice et partenaire technique',
                            'content' => 'Enfin une plateforme qui garantit que chaque franc investi arrive vraiment aux communautés. L\'impact est mesurable et durable.',
                            'rating' => 5,
                            'project' => 'Multiple projets soutenus'
                        ]
                    ]
                ],
                'status' => 'published',
                'published_at' => now()
            ]
        ];

        foreach ($contents as $content) {
            SiteContent::updateOrCreate(
                [
                    'section' => $content['section'],
                    'key' => $content['key']
                ],
                $content
            );
        }

        $this->command->info('✅ Contenu du site vitrine créé avec succès !');
    }
}
