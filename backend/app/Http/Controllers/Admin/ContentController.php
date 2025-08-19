<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class ContentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    /**
     * Récupérer tout le contenu organisé par section
     */
    public function index()
    {
        try {
            $content = SiteContent::with('createdBy', 'updatedBy')
                ->orderBy('section')
                ->orderBy('key')
                ->get()
                ->groupBy('section');

            return response()->json([
                'success' => true,
                'data' => $content
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération du contenu: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du contenu'
            ], 500);
        }
    }

    /**
     * Récupérer le contenu d'une section spécifique
     */
    public function getBySection($section)
    {
        try {
            $content = SiteContent::where('section', $section)
                ->with('createdBy', 'updatedBy')
                ->orderBy('key')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $content
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la récupération du contenu {$section}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du contenu'
            ], 500);
        }
    }

    /**
     * Récupérer un élément de contenu spécifique
     */
    public function show($id)
    {
        try {
            $content = SiteContent::with('createdBy', 'updatedBy')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $content
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la récupération du contenu {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Contenu non trouvé'
            ], 404);
        }
    }

    /**
     * Créer un nouveau contenu
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'section' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'value' => 'required',
            'description' => 'nullable|string',
            'is_published' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Vérifier si la combinaison section/key existe déjà
            $existing = SiteContent::where('section', $request->section)
                ->where('key', $request->key)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un contenu avec cette section et cette clé existe déjà'
                ], 422);
            }

            $content = SiteContent::create([
                'section' => $request->section,
                'key' => $request->key,
                'value' => $request->value,
                'description' => $request->description,
                'is_published' => $request->boolean('is_published', true),
                'created_by' => Auth::id(),
                'updated_by' => Auth::id()
            ]);

            // Vider le cache
            $this->clearContentCache($request->section);

            return response()->json([
                'success' => true,
                'message' => 'Contenu créé avec succès',
                'data' => $content->load('createdBy', 'updatedBy')
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création du contenu: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du contenu'
            ], 500);
        }
    }

    /**
     * Mettre à jour un contenu
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'section' => 'required|string|max:255',
            'key' => 'required|string|max:255',
            'value' => 'required',
            'description' => 'nullable|string',
            'is_published' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $content = SiteContent::findOrFail($id);

            // Vérifier si la nouvelle combinaison section/key existe déjà (sauf pour l'élément actuel)
            $existing = SiteContent::where('section', $request->section)
                ->where('key', $request->key)
                ->where('id', '!=', $id)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Un contenu avec cette section et cette clé existe déjà'
                ], 422);
            }

            $oldSection = $content->section;

            $content->update([
                'section' => $request->section,
                'key' => $request->key,
                'value' => $request->value,
                'description' => $request->description,
                'is_published' => $request->boolean('is_published'),
                'updated_by' => Auth::id()
            ]);

            // Vider le cache pour l'ancienne et la nouvelle section
            $this->clearContentCache($oldSection);
            if ($oldSection !== $request->section) {
                $this->clearContentCache($request->section);
            }

            return response()->json([
                'success' => true,
                'message' => 'Contenu mis à jour avec succès',
                'data' => $content->load('createdBy', 'updatedBy')
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la mise à jour du contenu {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du contenu'
            ], 500);
        }
    }

    /**
     * Supprimer un contenu
     */
    public function destroy($id)
    {
        try {
            $content = SiteContent::findOrFail($id);
            $section = $content->section;
            
            $content->delete();

            // Vider le cache
            $this->clearContentCache($section);

            return response()->json([
                'success' => true,
                'message' => 'Contenu supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la suppression du contenu {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du contenu'
            ], 500);
        }
    }

    /**
     * Publier ou dépublier un contenu
     */
    public function togglePublish($id)
    {
        try {
            $content = SiteContent::findOrFail($id);
            
            $content->update([
                'is_published' => !$content->is_published,
                'updated_by' => Auth::id()
            ]);

            // Vider le cache
            $this->clearContentCache($content->section);

            return response()->json([
                'success' => true,
                'message' => $content->is_published ? 'Contenu publié' : 'Contenu dépublié',
                'data' => $content->load('createdBy', 'updatedBy')
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors du changement de statut du contenu {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du changement de statut'
            ], 500);
        }
    }

    /**
     * Vider le cache pour une section
     */
    private function clearContentCache($section)
    {
        Cache::forget("public_content_{$section}");
        Cache::forget("site_content_{$section}");
        Cache::forget('public_homepage_content');
        Cache::forget('public_site_settings');
    }
}
