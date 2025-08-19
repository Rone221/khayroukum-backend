<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('role:admin');
    }

    /**
     * Récupérer tous les paramètres organisés par groupe
     */
    public function index()
    {
        try {
            $settings = SiteSettings::with('updatedBy')
                ->orderBy('group')
                ->orderBy('order')
                ->orderBy('key')
                ->get()
                ->groupBy('group');

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la récupération des paramètres: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paramètres'
            ], 500);
        }
    }

    /**
     * Récupérer les paramètres d'un groupe spécifique
     */
    public function getByGroup($group)
    {
        try {
            $settings = SiteSettings::where('group', $group)
                ->with('updatedBy')
                ->orderBy('order')
                ->orderBy('key')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la récupération des paramètres {$group}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des paramètres'
            ], 500);
        }
    }

    /**
     * Récupérer un paramètre spécifique
     */
    public function show($id)
    {
        try {
            $setting = SiteSettings::with('updatedBy')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $setting
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la récupération du paramètre {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Paramètre non trouvé'
            ], 404);
        }
    }

    /**
     * Créer un nouveau paramètre
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string|max:255|unique:site_settings',
            'value' => 'required',
            'group' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,boolean,color,image,json',
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
            'order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $setting = SiteSettings::create([
                'key' => $request->key,
                'value' => $request->value,
                'group' => $request->group,
                'type' => $request->type,
                'label' => $request->label,
                'description' => $request->description,
                'is_public' => $request->boolean('is_public', false),
                'order' => $request->integer('order', 0),
                'updated_by' => Auth::id()
            ]);

            // Vider le cache
            $this->clearSettingsCache();

            return response()->json([
                'success' => true,
                'message' => 'Paramètre créé avec succès',
                'data' => $setting->load('updatedBy')
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création du paramètre: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du paramètre'
            ], 500);
        }
    }

    /**
     * Mettre à jour un paramètre
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'key' => 'required|string|max:255|unique:site_settings,key,' . $id,
            'value' => 'required',
            'group' => 'required|string|max:255',
            'type' => 'required|in:text,textarea,boolean,color,image,json',
            'label' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_public' => 'boolean',
            'order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $setting = SiteSettings::findOrFail($id);

            $setting->update([
                'key' => $request->key,
                'value' => $request->value,
                'group' => $request->group,
                'type' => $request->type,
                'label' => $request->label,
                'description' => $request->description,
                'is_public' => $request->boolean('is_public'),
                'order' => $request->integer('order', 0),
                'updated_by' => Auth::id()
            ]);

            // Vider le cache
            $this->clearSettingsCache();

            return response()->json([
                'success' => true,
                'message' => 'Paramètre mis à jour avec succès',
                'data' => $setting->load('updatedBy')
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la mise à jour du paramètre {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du paramètre'
            ], 500);
        }
    }

    /**
     * Supprimer un paramètre
     */
    public function destroy($id)
    {
        try {
            $setting = SiteSettings::findOrFail($id);
            
            $setting->delete();

            // Vider le cache
            $this->clearSettingsCache();

            return response()->json([
                'success' => true,
                'message' => 'Paramètre supprimé avec succès'
            ]);

        } catch (\Exception $e) {
            \Log::error("Erreur lors de la suppression du paramètre {$id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du paramètre'
            ], 500);
        }
    }

    /**
     * Mettre à jour plusieurs paramètres en une fois
     */
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|exists:site_settings,key',
            'settings.*.value' => 'required'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updatedSettings = [];
            
            foreach ($request->settings as $settingData) {
                $setting = SiteSettings::where('key', $settingData['key'])->first();
                
                if ($setting) {
                    $setting->update([
                        'value' => $settingData['value'],
                        'updated_by' => Auth::id()
                    ]);
                    
                    $updatedSettings[] = $setting->load('updatedBy');
                }
            }

            // Vider le cache
            $this->clearSettingsCache();

            return response()->json([
                'success' => true,
                'message' => count($updatedSettings) . ' paramètres mis à jour avec succès',
                'data' => $updatedSettings
            ]);

        } catch (\Exception $e) {
            \Log::error('Erreur lors de la mise à jour en lot des paramètres: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour des paramètres'
            ], 500);
        }
    }

    /**
     * Vider le cache des paramètres
     */
    private function clearSettingsCache()
    {
        Cache::forget('public_site_settings');
        Cache::forget('public_homepage_content');
        
        // Vider également les caches par clé
        $settings = SiteSettings::pluck('key');
        foreach ($settings as $key) {
            Cache::forget("site_setting_{$key}");
        }
    }
}
