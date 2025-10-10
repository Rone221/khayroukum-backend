<?php

namespace Database\Seeders;

use App\Models\{User, Village, Projet, OffreFinancement};
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class VillagesProjetsSeedeer extends Seeder
{
    public function run(): void
    {
        // Créer un prestataire de test
        $prestataire = User::factory()->create([
            'prenom' => 'Prestataire',
            'nom' => 'Test',
            'email' => 'prestataire@khayroukum.sn',
            'role' => 'prestataire',
            'is_verified' => true,
        ]);
        $prestataire->assignRole('prestataire');

        // Récupérer l'admin et le donateur existants
        $admin = User::where('email', 'admin@khayroukum.sn')->first();
        $donateur = User::where('email', 'donateur@khayroukum.sn')->first();

        // Villages au Sénégal avec données réalistes
        $villagesData = [
            [
                'nom' => 'Mbour',
                'population' => 2850,
                'region' => 'Thiès',
                'departement' => 'Mbour',
                'commune' => 'Mbour',
                'coordonnees' => ['latitude' => 14.4159, 'longitude' => -16.9613],
                'description' => 'Village côtier avec une forte activité de pêche. Manque d\'accès à l\'eau potable pour les familles éloignées du centre.',
                'telephone' => '+221 77 123 45 67',
                'statut' => 'actif',
                'created_by' => $prestataire->id,
            ],
            [
                'nom' => 'Kédougou',
                'population' => 1520,
                'region' => 'Kédougou',
                'departement' => 'Kédougou',
                'commune' => 'Kédougou',
                'coordonnees' => ['latitude' => 12.5569, 'longitude' => -12.1744],
                'description' => 'Village rural dans la région aurifère. Problèmes d\'accès à l\'eau dus à la contamination minière.',
                'telephone' => '+221 77 234 56 78',
                'statut' => 'actif',
                'created_by' => $prestataire->id,
            ],
            [
                'nom' => 'Tambacounda',
                'population' => 3200,
                'region' => 'Tambacounda',
                'departement' => 'Tambacounda',
                'commune' => 'Tambacounda',
                'coordonnees' => ['latitude' => 13.7671, 'longitude' => -13.6681],
                'description' => 'Grande communauté agricole avec des besoins en irrigation et eau potable pour le bétail.',
                'telephone' => '+221 77 345 67 89',
                'statut' => 'actif',
                'created_by' => $prestataire->id,
            ],
            [
                'nom' => 'Saint-Louis',
                'population' => 4100,
                'region' => 'Saint-Louis',
                'departement' => 'Saint-Louis',
                'commune' => 'Saint-Louis',
                'coordonnees' => ['latitude' => 16.0175, 'longitude' => -16.4897],
                'description' => 'Village historique sur le fleuve Sénégal. Besoin de modernisation du système d\'approvisionnement en eau.',
                'telephone' => '+221 77 456 78 90',
                'statut' => 'actif',
                'created_by' => $prestataire->id,
            ],
            [
                'nom' => 'Ziguinchor',
                'population' => 2750,
                'region' => 'Ziguinchor',
                'departement' => 'Ziguinchor',
                'commune' => 'Ziguinchor',
                'coordonnees' => ['latitude' => 12.5681, 'longitude' => -16.2719],
                'description' => 'Village en Casamance avec une riche tradition agricole. Nécessite des puits plus profonds.',
                'telephone' => '+221 77 567 89 01',
                'statut' => 'actif',
                'created_by' => $prestataire->id,
            ],
            [
                'nom' => 'Fatick',
                'population' => 1890,
                'region' => 'Fatick',
                'departement' => 'Fatick',
                'commune' => 'Fatick',
                'coordonnees' => ['latitude' => 14.3347, 'longitude' => -16.4122],
                'description' => 'Village avec une forte production de mil et d\'arachides. Eau souvent saumâtre.',
                'telephone' => '+221 77 678 90 12',
                'statut' => 'actif',
                'created_by' => $prestataire->id,
            ],
        ];

        $villages = [];
        foreach ($villagesData as $villageData) {
            $villages[] = Village::create($villageData);
        }

        // Projets de développement rural réalistes
        $projetsData = [
            [
                'village_id' => $villages[0]->id, // Mbour
                'titre' => 'Construction d\'un forage motorisé à Mbour',
                'description' => 'Installation d\'un système de forage motorisé avec pompe solaire pour alimenter 300 familles en eau potable. Le projet inclut la construction d\'un château d\'eau de 50m³ et la pose de 2km de canalisations dans le village.',
                'statut' => 'valide',
                'date_debut' => Carbon::now()->subMonths(2),
                'date_fin' => Carbon::now()->addMonths(10),
                'montant_total' => 85000,
                'created_by' => $prestataire->id,
                'validated_by' => $admin->id,
            ],
            [
                'village_id' => $villages[1]->id, // Kédougou
                'titre' => 'Système de filtration d\'eau à Kédougou',
                'description' => 'Mise en place d\'un système de filtration avancé pour traiter l\'eau contaminée par les activités minières. Installation de 3 stations de traitement et formation de 10 techniciens locaux.',
                'statut' => 'valide',
                'date_debut' => Carbon::now()->subMonths(1),
                'date_fin' => Carbon::now()->addMonths(14),
                'montant_total' => 125000,
                'created_by' => $prestataire->id,
                'validated_by' => $admin->id,
            ],
            [
                'village_id' => $villages[2]->id, // Tambacounda
                'titre' => 'Réseau d\'irrigation communautaire',
                'description' => 'Création d\'un réseau d\'irrigation pour 150 hectares de terres agricoles. Installation de 5 pompes solaires, construction de bassins de stockage et formation des agriculteurs.',
                'statut' => 'valide',
                'date_debut' => Carbon::now()->addMonths(1),
                'date_fin' => Carbon::now()->addMonths(16),
                'montant_total' => 95000,
                'created_by' => $prestataire->id,
                'validated_by' => $admin->id,
            ],
            [
                'village_id' => $villages[3]->id, // Saint-Louis
                'titre' => 'Modernisation du réseau d\'eau potable',
                'description' => 'Rénovation complète du système d\'eau potable avec installation de nouvelles canalisations, compteurs intelligents et station de traitement moderne.',
                'statut' => 'en_attente',
                'date_debut' => Carbon::now()->addMonths(2),
                'date_fin' => Carbon::now()->addMonths(18),
                'montant_total' => 110000,
                'created_by' => $prestataire->id,
                'validated_by' => null,
            ],
            [
                'village_id' => $villages[4]->id, // Ziguinchor
                'titre' => 'Forages artésiens en Casamance',
                'description' => 'Création de 4 forages artésiens profonds avec équipement de pompage manuel et solaire. Construction d\'abris et formation à la maintenance.',
                'statut' => 'valide',
                'date_debut' => Carbon::now()->subWeeks(3),
                'date_fin' => Carbon::now()->addMonths(12),
                'montant_total' => 75000,
                'created_by' => $prestataire->id,
                'validated_by' => $admin->id,
            ],
            [
                'village_id' => $villages[5]->id, // Fatick
                'titre' => 'Station de dessalement solaire',
                'description' => 'Installation d\'une station de dessalement alimentée par énergie solaire pour traiter l\'eau saumâtre. Capacité de 1000L/heure avec stockage.',
                'statut' => 'valide',
                'date_debut' => Carbon::now()->addWeeks(2),
                'date_fin' => Carbon::now()->addMonths(8),
                'montant_total' => 65000,
                'created_by' => $prestataire->id,
                'validated_by' => $admin->id,
            ],
            [
                'village_id' => $villages[0]->id, // Mbour - 2ème projet
                'titre' => 'Extension du réseau d\'assainissement',
                'description' => 'Construction d\'un réseau d\'assainissement avec stations d\'épuration naturelle pour améliorer l\'hygiène et protéger l\'environnement côtier.',
                'statut' => 'en_cours',
                'date_debut' => Carbon::now()->subMonths(3),
                'date_fin' => Carbon::now()->addMonths(9),
                'montant_total' => 58000,
                'created_by' => $prestataire->id,
                'validated_by' => $admin->id,
            ],
            [
                'village_id' => $villages[2]->id, // Tambacounda - 2ème projet
                'titre' => 'Puits communautaires avec pompes manuelles',
                'description' => 'Construction de 6 puits communautaires équipés de pompes manuelles Afridev dans les quartiers périphériques.',
                'statut' => 'valide',
                'date_debut' => Carbon::now()->addMonths(1),
                'date_fin' => Carbon::now()->addMonths(6),
                'montant_total' => 42000,
                'created_by' => $prestataire->id,
                'validated_by' => $admin->id,
            ],
        ];

        $projets = [];
        foreach ($projetsData as $projetData) {
            $projets[] = Projet::create($projetData);
        }

        // Créer quelques offres de financement pour les projets validés
        $projetsValides = array_filter($projets, function ($projet) {
            return $projet->statut === 'valide';
        });

        $offresData = [
            [
                'donateur_id' => $donateur->id,
                'projet_id' => $projets[0]->id, // Forage Mbour
                'montant' => 15000,
                'nom_sur_tableau' => 'Donateur Généreux',
                'message' => 'Heureux de contribuer à l\'accès à l\'eau potable pour les familles de Mbour.',
            ],
            [
                'donateur_id' => $donateur->id,
                'projet_id' => $projets[1]->id, // Filtration Kédougou
                'montant' => 25000,
                'nom_sur_tableau' => 'Famille Solidaire',
                'message' => 'Pour une eau pure et saine à Kédougou.',
            ],
            [
                'donateur_id' => $donateur->id,
                'projet_id' => $projets[2]->id, // Irrigation Tambacounda
                'montant' => 12000,
                'nom_sur_tableau' => 'Agriculture Durable',
                'message' => 'Soutien à l\'agriculture locale.',
            ],
            [
                'donateur_id' => $donateur->id,
                'projet_id' => $projets[4]->id, // Forages Ziguinchor
                'montant' => 8000,
                'nom_sur_tableau' => 'Ami de la Casamance',
                'message' => 'Pour les communautés de Casamance.',
            ],
            [
                'donateur_id' => $donateur->id,
                'projet_id' => $projets[5]->id, // Dessalement Fatick
                'montant' => 18000,
                'nom_sur_tableau' => 'Innovation Verte',
                'message' => 'Soutien aux technologies vertes.',
            ],
        ];

        foreach ($offresData as $offreData) {
            OffreFinancement::create($offreData);
        }

        echo "\n✅ Données de test créées avec succès !\n";
        echo "🏘️ Villages créés : " . count($villages) . "\n";
        echo "🚧 Projets créés : " . count($projets) . "\n";
        echo "💰 Offres de financement : " . count($offresData) . "\n";
        echo "\n📧 Compte prestataire : prestataire@khayroukum.sn\n";
        echo "🔑 Mot de passe : password\n";
    }
}
