<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class VillageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom' => $this->faker->city(),
            'region' => $this->faker->state(),
            'localisation_gps' => $this->faker->latitude().','.$this->faker->longitude(),
            'description' => $this->faker->sentence(),
            'prioritaire' => $this->faker->boolean(),
            'created_by' => User::factory(),
        ];
    }
}
