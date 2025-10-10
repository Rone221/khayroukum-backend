<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    /**
     * Upload une image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        try {
            $image = $request->file('image');

            // Générer un nom unique pour l'image
            $imageName = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();

            // Stocker l'image dans le dossier public/uploads/images
            $imagePath = $image->storeAs('uploads/images', $imageName, 'public');

            // Générer l'URL complète
            $imageUrl = url('storage/' . $imagePath);

            return response()->json([
                'success' => true,
                'message' => 'Image téléchargée avec succès',
                'data' => [
                    'url' => $imageUrl,
                    'path' => $imagePath,
                    'name' => $imageName
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du téléchargement de l\'image',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer une image
     */
    public function deleteImage(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        try {
            $path = $request->input('path');

            // Vérifier que le fichier existe et le supprimer
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);

                return response()->json([
                    'success' => true,
                    'message' => 'Image supprimée avec succès'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Image non trouvée'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de l\'image',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
