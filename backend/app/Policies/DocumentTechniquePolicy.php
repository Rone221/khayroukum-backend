<?php

namespace App\Policies;

use App\Models\Projet;
use App\Models\User;

class DocumentTechniquePolicy
{
    public function create(User $user, Projet $projet): bool
    {
        return $user->id === $projet->created_by;
    }
}
