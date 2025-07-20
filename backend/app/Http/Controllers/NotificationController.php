<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return auth()->user()->notifications;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function markAsRead(DatabaseNotification $notification)
    {
        $notification->markAsRead();
        return response()->noContent();
    }
}
