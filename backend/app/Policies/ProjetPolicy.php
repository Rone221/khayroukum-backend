<?php

namespace App\Policies;

use App\Models\Projet;
use App\Models\User;

class ProjetPolicy
{
    /**
     * Détermine si l'utilisateur peut voir le projet
     */
    public function view(User $user, Projet $projet): bool
    {
        // Les administrateurs peuvent voir tous les projets
        if ($user->role === 'administrateur') {
            return true;
        }

        // Les prestataires peuvent voir leurs propres projets
        if ($user->role === 'prestataire') {
            return $projet->created_by === $user->id;
        }

        // Les donateurs peuvent voir les projets validés
        if ($user->role === 'donateur') {
            return $projet->statut === 'validated' || $projet->statut === 'funded';
        }

        return false;
    }

    /**
     * Détermine si l'utilisateur peut créer des projets
     */
    public function create(User $user): bool
    {
        return $user->role === 'prestataire';
    }

    /**
     * Détermine si l'utilisateur peut modifier le projet
     */
    public function update(User $user, Projet $projet): bool
    {
        // Les administrateurs peuvent modifier tous les projets
        if ($user->role === 'administrateur') {
            return true;
        }

        // Les prestataires peuvent modifier leurs propres projets non financés
        if ($user->role === 'prestataire') {
            return $projet->created_by === $user->id &&
                in_array($projet->statut, ['pending', 'validated']);
        }

        return false;
    }

    /**
     * Détermine si l'utilisateur peut supprimer le projet
     */
    public function delete(User $user, Projet $projet): bool
    {
        // Les administrateurs peuvent supprimer tous les projets
        if ($user->role === 'administrateur') {
            return true;
        }

        // Les prestataires peuvent supprimer leurs propres projets non financés
        if ($user->role === 'prestataire') {
            return $projet->created_by === $user->id &&
                in_array($projet->statut, ['pending']);
        }

        return false;
    }

    /**
     * Détermine si l'utilisateur peut valider le projet
     */
    public function validate(User $user, Projet $projet): bool
    {
        return $user->role === 'administrateur';
    }
}
