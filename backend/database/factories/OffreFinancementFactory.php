<?php

namespace Database\Factories;

use App\Models\OffreFinancement;
use App\Models\Projet;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OffreFinancementFactory extends Factory
{
    protected $model = OffreFinancement::class;

    public function definition(): array
    {
        return [
            'donateur_id' => User::factory(),
            'projet_id' => Projet::factory(),
            'montant' => $this->faker->numberBetween(5000, 100000),
            'nom_sur_tableau' => $this->faker->name(),
            'message' => $this->faker->sentence(),
        ];
    }
}
