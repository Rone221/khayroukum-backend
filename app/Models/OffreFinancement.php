<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OffreFinancement extends Model
{
    use HasFactory;
    protected $fillable = [
        'donateur_id',
        'projet_id',
        'montant',
        'nom_sur_tableau',
        'message',
    ];

    public function donateur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'donateur_id');
    }

    public function projet(): BelongsTo
    {
        return $this->belongsTo(Projet::class);
    }
}
