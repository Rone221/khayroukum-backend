<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Projet;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Notifications\NouveauProjet;
use App\Notifications\ProjetValide;

class ProjetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Projet::all();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'village_id' => 'required|exists:villages,id',
            'titre' => 'required',
            'description' => 'nullable',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'montant_total' => 'numeric',
        ]);
        $data['created_by'] = Auth::id();

        $projet = Projet::create($data);

        // notify admins of new project
        User::role('administrateur')->get()->each(function ($admin) use ($projet) {
            $admin->notify(new NouveauProjet($projet));
        });

        return response()->json($projet, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Projet::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $projet = Projet::findOrFail($id);
        $projet->update($request->all());
        return $projet;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Projet::findOrFail($id)->delete();
        return response()->noContent();
    }

    public function valider(Projet $projet)
    {
        $this->authorize('validate', $projet);

        $projet->update([
            'statut' => 'valide',
            'validated_by' => Auth::id(),
        ]);

        $projet->creator->notify(new ProjetValide($projet));

        return $projet;
    }
}
