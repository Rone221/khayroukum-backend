<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'email', 
        'telephone',
        'sujet',
        'message',
        'status',
        'lu_at',
        'reponse'
    ];

    protected $casts = [
        'lu_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Scopes
    public function scopeNouveaux($query)
    {
        return $query->where('status', 'nouveau');
    }

    public function scopeNonLus($query)
    {
        return $query->whereNull('lu_at');
    }

    // Méthodes
    public function marquerCommeLu()
    {
        $this->update([
            'status' => 'lu',
            'lu_at' => now()
        ]);
    }
}
