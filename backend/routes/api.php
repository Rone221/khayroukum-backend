<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VillageController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\DocumentTechniqueController;
use App\Http\Controllers\Api\ProjetDocumentController;
use App\Http\Controllers\OffreFinancementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\PrestataireDashboardController;

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
    Route::get('documents/{document}/download', [ProjetDocumentController::class, 'download']);
    Route::delete('documents/{document}', [ProjetDocumentController::class, 'destroy']);

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
});
