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

        // villages and projects
        $villages = Village::factory(2)->create(['created_by' => $prestataire->id]);
        foreach ($villages as $village) {
            Projet::factory()->for($village)->create([
                'created_by' => $prestataire->id,
            ]);
        }

        // offers
        $projet = Projet::first();
        OffreFinancement::factory()->create([
            'projet_id' => $projet->id,
            'donateur_id' => $donateur->id,
        ]);
    }
}
