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
            'type' => $this->faker->randomElement(['devis','contrat','plan','rapport']),
            'fichier_path' => 'documents/'.$this->faker->uuid.'.pdf',
            'uploaded_by' => User::factory(),
        ];
    }
}
