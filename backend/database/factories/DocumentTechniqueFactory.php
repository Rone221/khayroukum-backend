<?php

namespace Database\Factories;

use App\Models\DocumentTechnique;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DocumentTechniqueFactory extends Factory
{
    protected $model = DocumentTechnique::class;

    public function definition(): array
    {
        return [
            'projet_id' => Projet::factory(),
            'nom' => $this->faker->sentence(3),
            'type_document' => $this->faker->randomElement(['devis','facture','rapport','photo','autre']),
            'chemin_fichier' => 'documents/'.$this->faker->uuid.'.pdf',
            'taille_fichier' => $this->faker->numberBetween(1024, 10485760), // 1KB à 10MB
            'uploaded_by' => User::factory(),
        ];
    }
}
