<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $notifications = Auth::user()->notifications->map(function ($notification) {
            return [
                'id' => $notification->id,
                'userId' => $notification->notifiable_id,
                'title' => $notification->data['title'] ?? 'Nouvelle notification',
                'message' => $notification->data['message'] ?? 'Vous avez une nouvelle notification',
                'type' => $notification->data['type'] ?? 'info',
                'read' => $notification->read_at !== null,
                'createdAt' => $notification->created_at->toISOString(),
            ];
        });

        return response()->json($notifications);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(DatabaseNotification $notification)
    {
        // Vérifier que la notification appartient à l'utilisateur authentifié
        if ($notification->notifiable_id !== Auth::id()) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $notification->markAsRead();
        return response()->noContent();
    }
}
