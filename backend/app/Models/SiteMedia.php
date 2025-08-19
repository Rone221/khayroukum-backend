<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SiteMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'filename', 
        'path',
        'type',
        'mime_type',
        'size',
        'alt_text',
        'metadata',
        'used_in_sections',
        'is_active',
        'uploaded_by'
    ];

    protected $casts = [
        'metadata' => 'array',
        'used_in_sections' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeImages($query)
    {
        return $query->where('type', 'image');
    }

    public function scopeVideos($query)
    {
        return $query->where('type', 'video');
    }

    // Accesseurs
    public function getUrlAttribute()
    {
        return Storage::disk('public')->url($this->path);
    }

    public function getFullPathAttribute()
    {
        return Storage::disk('public')->path($this->path);
    }

    public function getSizeFormattedAttribute()
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($this->size, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);

        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }

    // Méthodes
    public function delete()
    {
        // Supprimer le fichier physique
        if (Storage::disk('public')->exists($this->path)) {
            Storage::disk('public')->delete($this->path);
        }

        // Supprimer l'enregistrement
        return parent::delete();
    }

    public function markAsUsed($section)
    {
        $usedSections = $this->used_in_sections ?? [];
        if (!in_array($section, $usedSections)) {
            $usedSections[] = $section;
            $this->update(['used_in_sections' => $usedSections]);
        }
    }

    public function markAsUnused($section)
    {
        $usedSections = $this->used_in_sections ?? [];
        if (($key = array_search($section, $usedSections)) !== false) {
            unset($usedSections[$key]);
            $this->update(['used_in_sections' => array_values($usedSections)]);
        }
    }
}
