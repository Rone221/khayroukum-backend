<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\SiteSettings;

class SiteSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Paramètres généraux
            [
                'key' => 'site_name',
                'value' => ['text' => 'Khayroukum'],
                'type' => 'text',
                'group' => 'general',
                'label' => 'Nom du site',
                'description' => 'Le nom principal du site vitrine',
                'is_public' => true,
                'sort_order' => 1
            ],
            [
                'key' => 'site_tagline',
                'value' => ['text' => 'Plateforme de développement rural participatif'],
                'type' => 'text',
                'group' => 'general',
                'label' => 'Slogan du site',
                'description' => 'Le slogan qui accompagne le nom du site',
                'is_public' => true,
                'sort_order' => 2
            ],
            [
                'key' => 'site_description',
                'value' => ['text' => 'Khayroukum est une plateforme participative dédiée au financement et au suivi des projets de développement rural au Mali. Nous connectons les communautés rurales, les prestataires locaux et les financeurs pour créer un impact durable.'],
                'type' => 'textarea',
                'group' => 'general',
                'label' => 'Description du site',
                'description' => 'Description utilisée pour le SEO et les réseaux sociaux',
                'is_public' => true,
                'sort_order' => 3
            ],
            [
                'key' => 'maintenance_mode',
                'value' => ['boolean' => false],
                'type' => 'boolean',
                'group' => 'general',
                'label' => 'Mode maintenance',
                'description' => 'Activer pour masquer le site public',
                'is_public' => false,
                'sort_order' => 4
            ],

            // Paramètres de design
            [
                'key' => 'primary_color',
                'value' => ['color' => '#3B82F6'],
                'type' => 'color',
                'group' => 'design',
                'label' => 'Couleur principale',
                'description' => 'Couleur principale utilisée sur le site',
                'is_public' => true,
                'sort_order' => 10
            ],
            [
                'key' => 'secondary_color',
                'value' => ['color' => '#10B981'],
                'type' => 'color',
                'group' => 'design',
                'label' => 'Couleur secondaire',
                'description' => 'Couleur secondaire pour les accents',
                'is_public' => true,
                'sort_order' => 11
            ],
            [
                'key' => 'accent_color',
                'value' => ['color' => '#F59E0B'],
                'type' => 'color',
                'group' => 'design',
                'label' => 'Couleur d\'accent',
                'description' => 'Couleur pour les éléments à mettre en valeur',
                'is_public' => true,
                'sort_order' => 12
            ],
            [
                'key' => 'font_family',
                'value' => ['text' => 'Inter, system-ui, -apple-system, sans-serif'],
                'type' => 'text',
                'group' => 'design',
                'label' => 'Police principale',
                'description' => 'Police utilisée sur le site',
                'is_public' => true,
                'sort_order' => 13
            ],

            // Paramètres de contact
            [
                'key' => 'contact_email',
                'value' => ['email' => 'contact@khayroukum.ml'],
                'type' => 'email',
                'group' => 'contact',
                'label' => 'Email de contact',
                'description' => 'Adresse email principale pour les contacts',
                'is_public' => true,
                'sort_order' => 20
            ],
            [
                'key' => 'contact_phone',
                'value' => ['phone' => '+223 70 00 00 00'],
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Téléphone de contact',
                'description' => 'Numéro de téléphone principal',
                'is_public' => true,
                'sort_order' => 21
            ],
            [
                'key' => 'contact_address',
                'value' => ['text' => 'Hamdallaye ACI 2000, Bamako, Mali'],
                'type' => 'text',
                'group' => 'contact',
                'label' => 'Adresse physique',
                'description' => 'Adresse physique de l\'organisation',
                'is_public' => true,
                'sort_order' => 22
            ],
            [
                'key' => 'business_hours',
                'value' => [
                    'schedule' => [
                        'monday' => ['open' => '08:00', 'close' => '17:00'],
                        'tuesday' => ['open' => '08:00', 'close' => '17:00'],
                        'wednesday' => ['open' => '08:00', 'close' => '17:00'],
                        'thursday' => ['open' => '08:00', 'close' => '17:00'],
                        'friday' => ['open' => '08:00', 'close' => '17:00'],
                        'saturday' => ['open' => '09:00', 'close' => '13:00'],
                        'sunday' => ['closed' => true]
                    ]
                ],
                'type' => 'json',
                'group' => 'contact',
                'label' => 'Horaires d\'ouverture',
                'description' => 'Horaires de disponibilité',
                'is_public' => true,
                'sort_order' => 23
            ],

            // Paramètres SEO
            [
                'key' => 'meta_keywords',
                'value' => ['text' => 'développement rural, Mali, financement participatif, projets communautaires, transparence, eau potable, agriculture durable'],
                'type' => 'text',
                'group' => 'seo',
                'label' => 'Mots-clés SEO',
                'description' => 'Mots-clés pour le référencement (séparés par des virgules)',
                'is_public' => true,
                'sort_order' => 30
            ],
            [
                'key' => 'google_analytics_id',
                'value' => ['text' => ''],
                'type' => 'text',
                'group' => 'seo',
                'label' => 'ID Google Analytics',
                'description' => 'Identifiant de suivi Google Analytics (ex: GA-XXXXXXXXX-X)',
                'is_public' => false,
                'sort_order' => 31
            ],
            [
                'key' => 'facebook_pixel_id',
                'value' => ['text' => ''],
                'type' => 'text',
                'group' => 'seo',
                'label' => 'ID Facebook Pixel',
                'description' => 'Identifiant du pixel Facebook pour le suivi',
                'is_public' => false,
                'sort_order' => 32
            ],

            // Paramètres de réseaux sociaux
            [
                'key' => 'facebook_url',
                'value' => ['url' => 'https://facebook.com/khayroukum'],
                'type' => 'url',
                'group' => 'social',
                'label' => 'Page Facebook',
                'description' => 'URL de la page Facebook officielle',
                'is_public' => true,
                'sort_order' => 40
            ],
            [
                'key' => 'twitter_url',
                'value' => ['url' => 'https://twitter.com/khayroukum'],
                'type' => 'url',
                'group' => 'social',
                'label' => 'Compte Twitter',
                'description' => 'URL du compte Twitter officiel',
                'is_public' => true,
                'sort_order' => 41
            ],
            [
                'key' => 'linkedin_url',
                'value' => ['url' => 'https://linkedin.com/company/khayroukum'],
                'type' => 'url',
                'group' => 'social',
                'label' => 'Page LinkedIn',
                'description' => 'URL de la page LinkedIn officielle',
                'is_public' => true,
                'sort_order' => 42
            ],
            [
                'key' => 'youtube_url',
                'value' => ['url' => 'https://youtube.com/c/khayroukum'],
                'type' => 'url',
                'group' => 'social',
                'label' => 'Chaîne YouTube',
                'description' => 'URL de la chaîne YouTube officielle',
                'is_public' => true,
                'sort_order' => 43
            ],

            // Paramètres de fonctionnalité
            [
                'key' => 'enable_contact_form',
                'value' => ['boolean' => true],
                'type' => 'boolean',
                'group' => 'features',
                'label' => 'Activer le formulaire de contact',
                'description' => 'Permettre aux visiteurs d\'envoyer des messages',
                'is_public' => false,
                'sort_order' => 50
            ],
            [
                'key' => 'enable_newsletter',
                'value' => ['boolean' => false],
                'type' => 'boolean',
                'group' => 'features',
                'label' => 'Activer la newsletter',
                'description' => 'Permettre l\'inscription à la newsletter',
                'is_public' => false,
                'sort_order' => 51
            ],
            [
                'key' => 'max_projects_per_page',
                'value' => ['number' => 9],
                'type' => 'number',
                'group' => 'features',
                'label' => 'Projets par page',
                'description' => 'Nombre maximum de projets affichés par page',
                'is_public' => false,
                'sort_order' => 52
            ]
        ];

        foreach ($settings as $setting) {
            SiteSettings::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('✅ Paramètres du site créés avec succès !');
    }
}
