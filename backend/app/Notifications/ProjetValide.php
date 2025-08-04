<?php

namespace App\Notifications;

use App\Models\Projet;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjetValide extends Notification
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
            ->subject('Projet validé')
            ->line('Votre projet "'.$this->projet->titre.'" a été validé.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Projet validé',
            'message' => 'Votre projet "' . $this->projet->titre . '" a été validé par l\'administration.',
            'type' => 'success'
        ];
    }
}
