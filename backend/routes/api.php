<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VillageController;
use App\Http\Controllers\ProjetController;
use App\Http\Controllers\DocumentTechniqueController;
use App\Http\Controllers\OffreFinancementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\DashboardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('villages', [VillageController::class, 'index']);
    Route::post('villages', [VillageController::class, 'store'])->middleware('role:prestataire');

    Route::get('projets', [ProjetController::class, 'index']);
    Route::post('projets', [ProjetController::class, 'store'])->middleware('role:prestataire');
    Route::get('projets/{projet}', [ProjetController::class, 'show']);
    Route::put('projets/{projet}', [ProjetController::class, 'update']);
    Route::delete('projets/{projet}', [ProjetController::class, 'destroy']);
    Route::patch('projets/{projet}/valider', [ProjetController::class, 'valider'])->middleware('role:administrateur');

    Route::post('projets/{projet}/documents', [DocumentTechniqueController::class, 'store'])->middleware('role:prestataire');
    Route::get('projets/{projet}/documents', [DocumentTechniqueController::class, 'index']);

    Route::post('projets/{projet}/offres', [OffreFinancementController::class, 'store'])->middleware('role:donateur');
    Route::get('projets/{projet}/offres', [OffreFinancementController::class, 'index']);

    Route::get('stats', [DashboardController::class, 'index'])->middleware('role:administrateur');

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{notification}/marquer-lu', [NotificationController::class, 'markAsRead']);
});
