<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Projet;
use App\Models\DocumentTechnique;
use App\Models\User;
use App\Notifications\NouveauDocument;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentTechniqueController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Projet $projet)
    {
        return $projet->documents;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Projet $projet)
    {
        $this->authorize('create', [DocumentTechnique::class, $projet]);

        $data = $request->validate([
            'type' => 'required|in:devis,contrat,plan,rapport',
            'fichier' => 'required|file',
        ]);

        $path = $request->file('fichier')->store('documents', 'public');

        $document = $projet->documents()->create([
            'type' => $data['type'],
            'fichier_path' => $path,
            'uploaded_by' => Auth::id(),
        ]);

        // notify admins about new document
        User::role('administrateur')->get()->each(function ($admin) use ($document) {
            $admin->notify(new NouveauDocument($document));
        });

        return response()->json($document, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return DocumentTechnique::findOrFail($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $doc = DocumentTechnique::findOrFail($id);
        $doc->update($request->all());
        return $doc;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        DocumentTechnique::findOrFail($id)->delete();
        return response()->noContent();
    }
}
