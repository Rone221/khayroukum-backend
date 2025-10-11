<?php

namespace Database\Seeders;

use App\Models\{User, Village, Projet, OffreFinancement};
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        // roles
        foreach (['administrateur', 'prestataire', 'donateur'] as $roleName) {
            Role::firstOrCreate(['name' => $roleName]);
        }

        // users - Keep only admin and one donateur for essential functionality
        $admin = User::factory()->create([
            'prenom' => 'Admin',
            'nom' => 'User',
            'email' => 'admin@khayroukum.sn',
            'role' => 'administrateur',
            'is_verified' => true,
        ]);
        $admin->assignRole('administrateur');

        $donateur = User::factory()->create([
            'prenom' => 'Donateur',
            'nom' => 'Test',
            'email' => 'donateur@khayroukum.sn',
            'role' => 'donateur',
            'is_verified' => true,
        ]);
        $donateur->assignRole('donateur');

        $prestataire = User::factory()->create([
            'prenom' => 'Prestataire',
            'nom' => 'Test',
            'email' => 'prestataire@example.com',
            'role' => 'prestataire',
            'is_verified' => true,
        ]);
        $prestataire->assignRole('prestataire');

        // Create some test villages and projects for frontend display
        $villages = Village::factory(5)->create();

        // Create test projects
        foreach ($villages as $village) {
            Projet::factory(2)->create([
                'village_id' => $village->id,
                'created_by' => $prestataire->id, // Assign to prestataire
                'statut' => 'valide', // Make them visible
            ]);
        }

        // Create some additional projects with different statuses
        Projet::factory(3)->create([
            'village_id' => $villages->random()->id,
            'created_by' => $admin->id,
            'statut' => 'en_attente',
        ]);

        // Minimal test data - removed demo accounts as requested
        // Only essential data for the admin to manage the platform

        // Affiche les identifiants de connexion
        echo "\nIdentifiants de connexion :\n";
        echo "Administrateur : admin@khayroukum.sn\n";
        echo "Donateur de test : donateur@khayroukum.sn\n";
        echo "Prestataire de test : prestataire@example.com\n";
        echo "Mot de passe par défaut : password\n";
        echo "\nNote: Les comptes de démonstration ont été supprimés.\n";
        echo "Les prestataires peuvent maintenant se connecter directement.\n";
        echo "Des projets de test ont été créés pour la démonstration.\n";
    }
}
