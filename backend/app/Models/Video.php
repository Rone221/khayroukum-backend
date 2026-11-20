<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Vidéo courte générée par MoneyPrinterTurbo.
 */
class Video extends Model
{
    public const STATUT_EN_COURS = 'en_cours';
    public const STATUT_TERMINE = 'termine';
    public const STATUT_ECHEC = 'echec';

    protected $fillable = [
        'user_id',
        'projet_id',
        'task_id',
        'sujet',
        'script',
        'format',
        'statut',
        'progression',
        'fichier_path',
        'erreur',
        'parametres',
    ];

    protected $casts = [
        'parametres' => 'array',
        'progression' => 'integer',
    ];

    protected $hidden = ['fichier_path'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Projet::class);
    }

    public function isEnCours(): bool
    {
        return $this->statut === self::STATUT_EN_COURS;
    }
}
