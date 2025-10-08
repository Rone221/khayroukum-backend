<?php

namespace Database\Seeders;

use App\Models\{User,Village,Projet,OffreFinancement};
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        // roles
        foreach (['administrateur','prestataire','donateur'] as $roleName) {
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

        // Minimal test data - removed demo accounts as requested
        // Only essential data for the admin to manage the platform

        // Affiche les identifiants de connexion
        echo "\nIdentifiants de connexion :\n";
        echo "Administrateur : admin@khayroukum.sn\n";
        echo "Donateur de test : donateur@khayroukum.sn\n";
        echo "Mot de passe par défaut : password\n";
        echo "\nNote: Les comptes de démonstration ont été supprimés.\n";
        echo "Les prestataires sont maintenant gérés uniquement par l'administrateur.\n";
    }
}
