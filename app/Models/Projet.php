<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Projet extends Model
{
    use HasFactory;
    protected $fillable = [
        'village_id',
        'titre',
        'description',
        'statut',
        'date_debut',
        'date_fin',
        'montant_total',
        'created_by',
        'validated_by',
    ];

    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(DocumentTechnique::class);
    }

    public function offres(): HasMany
    {
        return $this->hasMany(OffreFinancement::class);
    }
}
