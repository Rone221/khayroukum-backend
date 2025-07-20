<?php

namespace App\Policies;

use App\Models\Projet;
use App\Models\User;

class ProjetPolicy
{
    public function validate(User $user, Projet $projet): bool
    {
        return $user->role === 'administrateur';
    }
}
