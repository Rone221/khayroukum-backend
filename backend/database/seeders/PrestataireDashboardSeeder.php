<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Village;
use App\Models\Projet;
use App\Models\DocumentTechnique;
use Carbon\Carbon;

class PrestataireDashboardSeeder extends Seeder
{
    public function run()
    {
        // Créer un prestataire de test
        $prestataire = User::where('role', 'prestataire')->first();

        if (!$prestataire) {
            $prestataire = User::create([
                'prenom' => 'Ahmed',
                'nom' => 'Traore',
                'email' => 'ahmed.traore@prestataire.com',
                'password' => bcrypt('password123'),
                'role' => 'prestataire',
                'is_verified' => true,
            ]);
        }

        // Créer des villages avec des dates variées
        $villages = [
            [
                'nom' => 'Koundara',
                'region' => 'Boké',
                'population' => 1500,
                'created_at' => Carbon::now()->subDays(5),
            ],
            [
                'nom' => 'Siguiri',
                'region' => 'Kankan',
                'population' => 2200,
                'created_at' => Carbon::now()->subDays(12),
            ],
            [
                'nom' => 'Mamou',
                'region' => 'Mamou',
                'population' => 1800,
                'created_at' => Carbon::now()->subDays(20),
            ]
        ];

        foreach ($villages as $villageData) {
            $village = Village::firstOrCreate(
                ['nom' => $villageData['nom'], 'created_by' => $prestataire->id],
                array_merge($villageData, ['created_by' => $prestataire->id])
            );

            // Créer des projets pour chaque village avec des dates et statuts variés
            $projets = [
                [
                    'titre' => 'Forage d\'eau potable à ' . $village->nom,
                    'description' => 'Construction d\'un nouveau forage pour améliorer l\'accès à l\'eau potable',
                    'statut' => 'valide',
                    'montant_total' => 25000,
                    'created_at' => $villageData['created_at']->copy()->addHours(2),
                    'updated_at' => Carbon::now()->subHours(rand(1, 48)),
                ],
                [
                    'titre' => 'Système de distribution d\'eau à ' . $village->nom,
                    'description' => 'Installation d\'un réseau de distribution d\'eau',
                    'statut' => 'en_cours',
                    'montant_total' => 35000,
                    'created_at' => $villageData['created_at']->copy()->addDays(2),
                    'updated_at' => Carbon::now()->subHours(rand(6, 72)),
                ],
                [
                    'titre' => 'Station de traitement à ' . $village->nom,
                    'description' => 'Construction d\'une station de traitement d\'eau',
                    'statut' => 'en_attente',
                    'montant_total' => 45000,
                    'created_at' => $villageData['created_at']->copy()->addDays(5),
                    'updated_at' => Carbon::now()->subHours(rand(12, 96)),
                ]
            ];

            foreach ($projets as $projetData) {
                $projet = Projet::firstOrCreate(
                    [
                        'titre' => $projetData['titre'],
                        'village_id' => $village->id,
                        'created_by' => $prestataire->id
                    ],
                    array_merge($projetData, [
                        'village_id' => $village->id,
                        'created_by' => $prestataire->id,
                    ])
                );

                // Créer des documents techniques avec des dates variées
                $documents = [
                    [
                        'nom' => 'Plan technique du projet',
                        'type_document' => 'plan',
                        'chemin_fichier' => 'documents/plan_' . $projet->id . '.pdf',
                        'taille_fichier' => 2048576, // 2MB
                        'created_at' => $projet->created_at->copy()->addDays(1),
                    ],
                    [
                        'nom' => 'Rapport d\'avancement',
                        'type_document' => 'rapport',
                        'chemin_fichier' => 'documents/rapport_' . $projet->id . '.pdf',
                        'taille_fichier' => 1024000, // 1MB
                        'created_at' => $projet->created_at->copy()->addDays(3),
                    ]
                ];

                foreach ($documents as $docData) {
                    DocumentTechnique::firstOrCreate(
                        [
                            'chemin_fichier' => $docData['chemin_fichier'],
                            'projet_id' => $projet->id
                        ],
                        array_merge($docData, [
                            'projet_id' => $projet->id,
                            'uploaded_by' => $prestataire->id,
                        ])
                    );
                }
            }
        }

        $this->command->info('Données de test pour le dashboard prestataire créées avec succès!');
    }
}
