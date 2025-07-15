<?php

namespace App\Policies;

use App\Models\Projet;
use App\Models\User;

class OffreFinancementPolicy
{
    public function create(User $user, Projet $projet): bool
    {
        return $user->role === 'donateur' && $user->is_verified && $projet->statut === 'valide';
    }
}
