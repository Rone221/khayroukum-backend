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

        // users
        $admin = User::factory()->create([
            'prenom' => 'Admin',
            'nom' => 'User',
            'email' => 'admin@example.com',
            'role' => 'administrateur',
            'is_verified' => true,
        ]);
        $admin->assignRole('administrateur');

        $prestataire = User::factory()->create([
            'prenom' => 'Presta',
            'nom' => 'User',
            'email' => 'prestataire@example.com',
            'role' => 'prestataire',
            'is_verified' => true,
        ]);
        $prestataire->assignRole('prestataire');

        $donateur = User::factory()->create([
            'prenom' => 'Dona',
            'nom' => 'User',
            'email' => 'donateur@example.com',
            'role' => 'donateur',
            'is_verified' => true,
        ]);
        $donateur->assignRole('donateur');

        // villages, projects, documents, financements
        $villages = Village::factory(2)->create(['created_by' => $prestataire->id]);
        foreach ($villages as $village) {
            $projets = Projet::factory(2)->for($village)->create([
                'created_by' => $prestataire->id,
            ]);
            foreach ($projets as $projet) {
                // Documents techniques
                \App\Models\DocumentTechnique::factory(2)->create([
                    'projet_id' => $projet->id,
                    'uploaded_by' => $prestataire->id,
                ]);
                // Financements
                OffreFinancement::factory()->create([
                    'projet_id' => $projet->id,
                    'donateur_id' => $donateur->id,
                ]);
                OffreFinancement::factory()->create([
                    'projet_id' => $projet->id,
                    'donateur_id' => $donateur->id,
                    'montant' => 500,
                ]);
            }
        }

        // Affiche les identifiants de connexion pour test
        echo "\nIdentifiants de connexion pour test :\n";
        echo "Administrateur : admin@example.com\n";
        echo "Prestataire : prestataire@example.com\n";
        echo "Donateur : donateur@example.com\n";
        echo "Mot de passe par défaut (si factory) : password\n";
    }
}
