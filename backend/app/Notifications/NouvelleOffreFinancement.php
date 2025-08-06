<?php

namespace App\Notifications;

use App\Models\OffreFinancement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouvelleOffreFinancement extends Notification
{
    use Queueable;

    public function __construct(public OffreFinancement $offre) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Nouvelle offre de financement')
            ->line('Vous avez reçu une nouvelle offre de financement de ' . number_format($this->offre->montant, 0, ',', ' ') . ' FCFA pour votre projet "' . $this->offre->projet->titre . '".')
            ->action('Voir le projet', url('/projets/' . $this->offre->projet->id));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nouvelle offre de financement',
            'message' => 'Vous avez reçu une offre de ' . number_format($this->offre->montant, 0, ',', ' ') . ' FCFA pour "' . $this->offre->projet->titre . '".',
            'type' => 'success'
        ];
    }
}
