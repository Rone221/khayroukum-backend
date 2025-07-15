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
}
