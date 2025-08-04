<?php

namespace App\Notifications;

use App\Models\Projet;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjetNecessiteModifications extends Notification
{
    use Queueable;

    public function __construct(public Projet $projet, public string $raison)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Modifications requises pour votre projet')
            ->line('Votre projet "' . $this->projet->titre . '" nécessite des modifications.')
            ->line('Raison : ' . $this->raison)
            ->action('Modifier le projet', url('/projets/' . $this->projet->id . '/edit'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Modifications requises',
            'message' => 'Votre projet "' . $this->projet->titre . '" doit être modifié. Raison : ' . $this->raison,
            'type' => 'warning'
        ];
    }
}
