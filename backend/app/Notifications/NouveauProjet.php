<?php

namespace App\Notifications;

use App\Models\Projet;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouveauProjet extends Notification
{
    use Queueable;

    public function __construct(public Projet $projet)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Nouveau projet soumis')
            ->line('Un nouveau projet intitulé "'.$this->projet->titre.'" a été soumis.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nouveau projet soumis',
            'message' => 'Un nouveau projet intitulé "' . $this->projet->titre . '" a été soumis et attend votre validation.',
            'type' => 'info'
        ];
    }
}
