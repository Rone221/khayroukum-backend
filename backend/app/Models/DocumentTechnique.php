<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentTechnique extends Model
{
    use HasFactory;
    protected $fillable = [
        'projet_id',
        'nom',
        'type_document',
        'chemin_fichier',
        'taille_fichier',
        'uploaded_by',
    ];

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Projet::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
