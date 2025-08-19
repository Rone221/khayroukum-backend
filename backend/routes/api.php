<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VillageController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\DocumentTechniqueController;
use App\Http\Controllers\Api\ProjetDocumentController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\OffreFinancementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\PrestataireDashboardController;
use App\Http\Controllers\Admin\ContentController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\MediaController;

// Routes publiques (sans authentification)
Route::prefix('public')->group(function () {
    Route::get('/stats', [PublicController::class, 'stats']);
    Route::get('/projects', [PublicController::class, 'projects']);
    Route::get('/villages', [PublicController::class, 'villages']);
    Route::get('/about', [PublicController::class, 'about']);
    Route::post('/contact', [PublicController::class, 'submitContact']);
    
    // Nouvelles routes pour le CMS
    Route::get('/content/{section}', [PublicController::class, 'getContent']);
    Route::get('/settings', [PublicController::class, 'getSettings']);
    Route::get('/homepage', [PublicController::class, 'getHomepage']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('villages', [VillageController::class, 'index']);
    Route::get('villages/user', [VillageController::class, 'userVillages'])->middleware('role:prestataire');
    Route::post('villages', [VillageController::class, 'store'])->middleware('role:prestataire');
    Route::get('villages/{village}', [VillageController::class, 'show']);
    Route::put('villages/{village}', [VillageController::class, 'update'])->middleware('role:prestataire');
    Route::delete('villages/{village}', [VillageController::class, 'destroy'])->middleware('role:prestataire');

    Route::get('projets', [ProjetController::class, 'index']);
    Route::post('projets', [ProjetController::class, 'store'])->middleware('role:prestataire');
    Route::get('projets/{projet}', [ProjetController::class, 'show']);
    Route::put('projets/{projet}', [ProjetController::class, 'update']);
    Route::delete('projets/{projet}', [ProjetController::class, 'destroy']);
    Route::patch('projets/{projet}/valider', [ProjetController::class, 'valider'])->middleware('role:administrateur');

    Route::post('projets/{projet}/documents', [ProjetDocumentController::class, 'store']);
    Route::get('projets/{projet}/documents', [ProjetDocumentController::class, 'index']);
    Route::get('documents/{document}/download', [ProjetDocumentController::class, 'download'])->name('api.documents.download');
    Route::delete('documents/{document}', [ProjetDocumentController::class, 'destroy']);
    
    // Documents du prestataire
    Route::get('prestataire/documents', [ProjetDocumentController::class, 'prestataireDocuments'])->middleware('role:prestataire');
    Route::delete('prestataire/documents/{id}', [ProjetDocumentController::class, 'prestataireDestroy'])->middleware('role:prestataire');
    Route::post('prestataire/documents/bulk-delete', [ProjetDocumentController::class, 'prestataireBulkDestroy'])->middleware('role:prestataire');

    Route::post('projets/{projet}/offres', [OffreFinancementController::class, 'store'])->middleware('role:donateur');
    Route::get('projets/{projet}/offres', [OffreFinancementController::class, 'index']);

    Route::get('stats', [DashboardController::class, 'index'])->middleware('role:administrateur');

    Route::get('admin/activity', [DashboardController::class, 'activity'])->middleware('role:administrateur');

    // Routes d'administration des utilisateurs
    Route::get('admin/users', [AdminUserController::class, 'index'])->middleware('role:administrateur');
    Route::get('admin/users/{user}', [AdminUserController::class, 'show'])->middleware('role:administrateur');
    Route::patch('admin/users/{user}/toggle-verification', [AdminUserController::class, 'toggleVerification'])->middleware('role:administrateur');
    Route::patch('admin/users/{user}/ban', [AdminUserController::class, 'banUser'])->middleware('role:administrateur');
    Route::patch('admin/users/{user}/unban', [AdminUserController::class, 'unbanUser'])->middleware('role:administrateur');
    Route::patch('admin/users/{user}/role', [AdminUserController::class, 'changeRole'])->middleware('role:administrateur');

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{notification}/marquer-lu', [NotificationController::class, 'markAsRead']);

    // Routes de profil
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);
    Route::put('profile/password', [ProfileController::class, 'updatePassword']);
    Route::get('profile/activity', [ProfileController::class, 'activity']);

    // Routes du dashboard prestataire
    Route::get('prestataire/stats', [PrestataireDashboardController::class, 'stats'])->middleware('role:prestataire');
    Route::get('prestataire/activity', [PrestataireDashboardController::class, 'activity'])->middleware('role:prestataire');

    // Routes admin pour le CMS
    Route::prefix('admin')->middleware('role:administrateur')->group(function () {
        // Gestion du contenu
        Route::get('content', [ContentController::class, 'index']);
        Route::get('content/section/{section}', [ContentController::class, 'getBySection']);
        Route::get('content/{id}', [ContentController::class, 'show']);
        Route::post('content', [ContentController::class, 'store']);
        Route::put('content/{id}', [ContentController::class, 'update']);
        Route::delete('content/{id}', [ContentController::class, 'destroy']);
        Route::patch('content/{id}/toggle-publish', [ContentController::class, 'togglePublish']);

        // Gestion des paramètres
        Route::get('settings', [SettingsController::class, 'index']);
        Route::get('settings/group/{group}', [SettingsController::class, 'getByGroup']);
        Route::get('settings/{id}', [SettingsController::class, 'show']);
        Route::post('settings', [SettingsController::class, 'store']);
        Route::put('settings/{id}', [SettingsController::class, 'update']);
        Route::delete('settings/{id}', [SettingsController::class, 'destroy']);
        Route::post('settings/bulk-update', [SettingsController::class, 'bulkUpdate']);

        // Gestion des médias
        Route::get('media', [MediaController::class, 'index']);
        Route::get('media/stats', [MediaController::class, 'stats']);
        Route::get('media/{id}', [MediaController::class, 'show']);
        Route::post('media', [MediaController::class, 'store']);
        Route::post('media/bulk', [MediaController::class, 'bulkStore']);
        Route::put('media/{id}', [MediaController::class, 'update']);
        Route::delete('media/{id}', [MediaController::class, 'destroy']);
    });
});
