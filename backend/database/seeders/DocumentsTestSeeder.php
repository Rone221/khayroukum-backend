<?php

namespace Database\Seeders;

use App\Models\{DocumentTechnique, Projet, User};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DocumentsTestSeeder extends Seeder
{
    public function run(): void
    {
        // Récupérer le prestataire et quelques projets
        $prestataire = User::where('email', 'prestataire@khayroukum.sn')->first();
        $projets = Projet::take(4)->get(); // Prendre les 4 premiers projets

        if (!$prestataire || $projets->isEmpty()) {
            echo "❌ Prestataire ou projets non trouvés. Assurez-vous d'exécuter VillagesProjetsSeed d'abord.\n";
            return;
        }

        // Créer le dossier de stockage si nécessaire
        if (!Storage::disk('public')->exists('documents/projets')) {
            Storage::disk('public')->makeDirectory('documents/projets');
        }

        $documentsData = [
            // Projet 1 - Forage Mbour
            [
                'projet_id' => $projets[0]->id,
                'nom' => 'Devis forage motorisé Mbour',
                'type_document' => 'devis',
                'chemin_fichier' => 'documents/projets/' . $projets[0]->id . '/devis_forage_mbour.pdf',
                'taille_fichier' => 245760, // 240KB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],
            [
                'projet_id' => $projets[0]->id,
                'nom' => 'Étude de sol - Mbour',
                'type_document' => 'rapport',
                'chemin_fichier' => 'documents/projets/' . $projets[0]->id . '/etude_sol_mbour.pdf',
                'taille_fichier' => 1024000, // 1MB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],
            [
                'projet_id' => $projets[0]->id,
                'nom' => 'Photos du site avant travaux',
                'type_document' => 'photo',
                'chemin_fichier' => 'documents/projets/' . $projets[0]->id . '/photos_site_avant.jpg',
                'taille_fichier' => 512000, // 500KB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],

            // Projet 2 - Filtration Kédougou
            [
                'projet_id' => $projets[1]->id,
                'nom' => 'Devis système de filtration',
                'type_document' => 'devis',
                'chemin_fichier' => 'documents/projets/' . $projets[1]->id . '/devis_filtration.pdf',
                'taille_fichier' => 387420, // 378KB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],
            [
                'projet_id' => $projets[1]->id,
                'nom' => 'Analyse qualité eau - Kédougou',
                'type_document' => 'rapport',
                'chemin_fichier' => 'documents/projets/' . $projets[1]->id . '/analyse_eau_kedougou.pdf',
                'taille_fichier' => 856000, // 836KB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],
            [
                'projet_id' => $projets[1]->id,
                'nom' => 'Schéma technique filtration',
                'type_document' => 'autre',
                'chemin_fichier' => 'documents/projets/' . $projets[1]->id . '/schema_filtration.dwg',
                'taille_fichier' => 1500000, // 1.5MB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],

            // Projet 3 - Irrigation Tambacounda
            [
                'projet_id' => $projets[2]->id,
                'nom' => 'Devis irrigation communautaire',
                'type_document' => 'devis',
                'chemin_fichier' => 'documents/projets/' . $projets[2]->id . '/devis_irrigation.pdf',
                'taille_fichier' => 456780, // 446KB
                'uploaded_by' => $prestataire->id,
                'status' => 'pending',
            ],
            [
                'projet_id' => $projets[2]->id,
                'nom' => 'Plan parcellaire agricole',
                'type_document' => 'autre',
                'chemin_fichier' => 'documents/projets/' . $projets[2]->id . '/plan_parcellaire.pdf',
                'taille_fichier' => 723000, // 706KB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],
            [
                'projet_id' => $projets[2]->id,
                'nom' => 'Vidéo présentation du projet',
                'type_document' => 'video',
                'chemin_fichier' => 'documents/projets/' . $projets[2]->id . '/presentation_projet.mp4',
                'taille_fichier' => 15740000, // 15MB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],

            // Projet 4 - Modernisation Saint-Louis
            [
                'projet_id' => $projets[3]->id,
                'nom' => 'Devis modernisation réseau',
                'type_document' => 'devis',
                'chemin_fichier' => 'documents/projets/' . $projets[3]->id . '/devis_modernisation.pdf',
                'taille_fichier' => 567890, // 555KB
                'uploaded_by' => $prestataire->id,
                'status' => 'pending',
            ],
            [
                'projet_id' => $projets[3]->id,
                'nom' => 'État des lieux réseau existant',
                'type_document' => 'rapport',
                'chemin_fichier' => 'documents/projets/' . $projets[3]->id . '/etat_lieux_reseau.pdf',
                'taille_fichier' => 2100000, // 2MB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],
            [
                'projet_id' => $projets[3]->id,
                'nom' => 'Photos diagnostic réseau',
                'type_document' => 'photo',
                'chemin_fichier' => 'documents/projets/' . $projets[3]->id . '/photos_diagnostic.jpg',
                'taille_fichier' => 890000, // 869KB
                'uploaded_by' => $prestataire->id,
                'status' => 'approved',
            ],
        ];

        $documentsCreated = 0;
        foreach ($documentsData as $docData) {
            // Créer le dossier du projet s'il n'existe pas
            $projectDir = 'documents/projets/' . $docData['projet_id'];
            if (!Storage::disk('public')->exists($projectDir)) {
                Storage::disk('public')->makeDirectory($projectDir);
            }

            // Créer un fichier factice pour la démonstration
            $fileName = basename($docData['chemin_fichier']);
            $filePath = $projectDir . '/' . $fileName;

            // Contenu factice basé sur le type de document
            $content = $this->generateDummyContent($docData['type_document'], $docData['nom']);
            Storage::disk('public')->put($filePath, $content);

            // Créer l'enregistrement en base
            DocumentTechnique::create($docData);
            $documentsCreated++;
        }

        echo "\n✅ Documents de test créés avec succès !\n";
        echo "📄 Documents créés : $documentsCreated\n";
        echo "📁 Types de documents : devis, rapport, photo, vidéo, autre\n";
        echo "🎯 Projets concernés : " . $projets->count() . "\n";
    }

    private function generateDummyContent(string $type, string $nom): string
    {
        switch ($type) {
            case 'devis':
                return "DEVIS - $nom\n\nCeci est un fichier de démonstration pour un devis.\nContenu généré automatiquement pour les tests.\n\nDate: " . date('Y-m-d') . "\nStatut: Document de test";

            case 'rapport':
                return "RAPPORT TECHNIQUE - $nom\n\nCeci est un fichier de démonstration pour un rapport technique.\nContenu généré automatiquement pour les tests.\n\nAnalyse détaillée:\n- Point 1\n- Point 2\n- Point 3\n\nConclusion: Document de test";

            case 'photo':
                return "PHOTO - $nom\n\nCeci est un fichier de démonstration pour une photo.\nContenu généré automatiquement pour les tests.\n\nFormat: JPG\nRésolution: Demo\nDate: " . date('Y-m-d');

            case 'video':
                return "VIDÉO - $nom\n\nCeci est un fichier de démonstration pour une vidéo.\nContenu généré automatiquement pour les tests.\n\nFormat: MP4\nDurée: Demo\nDate: " . date('Y-m-d');

            default:
                return "DOCUMENT - $nom\n\nCeci est un fichier de démonstration.\nContenu généré automatiquement pour les tests.\n\nType: $type\nDate: " . date('Y-m-d');
        }
    }
}
