<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\OffreFinancement;
use Illuminate\Support\Facades\Auth;
use App\Models\Projet;
use App\Models\User;
use App\Notifications\NouvelleOffreFinancement;

class OffreFinancementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Projet $projet)
    {
        return $projet->offres;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Projet $projet)
    {
        $this->authorize('create', [OffreFinancement::class, $projet]);

        $data = $request->validate([
            'montant' => 'required|numeric',
            'nom_sur_tableau' => 'required',
            'message' => 'nullable',
        ]);
        $data['projet_id'] = $projet->id;
        $data['donateur_id'] = Auth::id();
        $offre = OffreFinancement::create($data);

        // Notifier le créateur du projet
        $projet->creator->notify(new NouvelleOffreFinancement($offre));

        return response()->json($offre, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return OffreFinancement::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $offre = OffreFinancement::findOrFail($id);
        $offre->update($request->all());
        return $offre;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        OffreFinancement::findOrFail($id)->delete();
        return response()->noContent();
    }
}
