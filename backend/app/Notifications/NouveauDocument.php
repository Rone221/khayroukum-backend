<?php

namespace App\Notifications;

use App\Models\DocumentTechnique;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouveauDocument extends Notification
{
    use Queueable;

    public function __construct(public DocumentTechnique $document) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Nouveau document soumis')
            ->line('Un document a été ajouté au projet ' . $this->document->projet->titre . '.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Nouveau document ajouté',
            'message' => 'Un document technique a été ajouté au projet "' . $this->document->projet->titre . '".',
            'type' => 'info'
        ];
    }
}
