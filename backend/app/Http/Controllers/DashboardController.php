<?php

namespace App\Http\Controllers;

use App\Models\Projet;
use App\Models\Village;
use App\Models\User;
use App\Models\OffreFinancement;

class DashboardController extends Controller
{
    public function index()
    {
        return [
            'nombre_projets' => Projet::count(),
            'projets_valides' => Projet::where('statut', 'valide')->count(),
            'projets_en_cours' => Projet::where('statut', 'en_cours')->count(),
            'total_villages' => Village::count(),
            'total_donateurs' => User::role('donateur')->count(),
            'montant_total_finance' => OffreFinancement::sum('montant'),
        ];
    }

    public function activity()
    {
        $activities = [];


        // Projets créés
        foreach (Projet::with('creator', 'village')->orderByDesc('created_at')->limit(10)->get() as $projet) {
            $activities[] = [
                'type' => 'projet',
                'title' => 'Nouveau projet créé',
                'detail' => $projet->titre . ' (' . ($projet->village ? $projet->village->nom : 'Village inconnu') . ')',
                'user' => $projet->creator ? $projet->creator->name : 'Utilisateur inconnu',
                'date' => $projet->created_at->format('d/m/Y H:i'),
                'color' => 'bg-blue-400',
            ];
        }

        // Documents ajoutés
        foreach (\App\Models\DocumentTechnique::with('uploader', 'projet')->orderByDesc('created_at')->limit(10)->get() as $doc) {
            $activities[] = [
                'type' => 'document',
                'title' => 'Document technique ajouté',
                'detail' => ($doc->projet ? $doc->projet->titre : 'Projet inconnu'),
                'user' => $doc->uploader ? $doc->uploader->name : 'Utilisateur inconnu',
                'date' => $doc->created_at->format('d/m/Y H:i'),
                'color' => 'bg-green-400',
            ];
        }

        // Financements
        foreach (\App\Models\OffreFinancement::with('donateur', 'projet')->orderByDesc('created_at')->limit(10)->get() as $offre) {
            $activities[] = [
                'type' => 'financement',
                'title' => 'Nouveau financement',
                'detail' => ($offre->projet ? $offre->projet->titre : 'Projet inconnu') . ' - ' . number_format($offre->montant, 0, ',', ' ') . '€',
                'user' => $offre->donateur ? $offre->donateur->name : 'Donateur inconnu',
                'date' => $offre->created_at->format('d/m/Y H:i'),
                'color' => 'bg-yellow-400',
            ];
        }

        // Nouvelles inscriptions prestataires
        foreach (User::role('prestataire')->orderByDesc('created_at')->limit(10)->get() as $user) {
            $activities[] = [
                'type' => 'inscription',
                'title' => 'Nouveau prestataire inscrit',
                'detail' => $user->name,
                'user' => $user->name,
                'date' => $user->created_at->format('d/m/Y H:i'),
                'color' => 'bg-purple-400',
            ];
        }

        // Nouvelles inscriptions donateurs
        foreach (User::role('donateur')->orderByDesc('created_at')->limit(10)->get() as $user) {
            $activities[] = [
                'type' => 'inscription',
                'title' => 'Nouveau donateur inscrit',
                'detail' => $user->name,
                'user' => $user->name,
                'date' => $user->created_at->format('d/m/Y H:i'),
                'color' => 'bg-pink-400',
            ];
        }

        // Fusionner et trier par date décroissante
        usort($activities, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });

        // Limiter à 20 activités récentes
        $activities = array_slice($activities, 0, 20);

        return response()->json($activities);
    }
}
