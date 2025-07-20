<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Village extends Model
{
    use HasFactory;
        protected $fillable = [
            'nom',
            'population',
            'coordonnees',
            'region',
            'departement',
            'commune',
            'photo',
            'description',
            'statut',
            'created_by',
        ];

        protected $casts = [
            'coordonnees' => 'array',
        ];

        public function prestataire()
        {
            return $this->belongsTo(User::class, 'created_by');
        }

        public function projets()
        {
            return $this->hasMany(Projet::class);
        }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
