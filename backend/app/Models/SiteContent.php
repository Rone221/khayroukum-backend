<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'section',
        'key',
        'value',
        'status',
        'published_at',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'value' => 'array',
        'published_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relations
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeBySection($query, $section)
    {
        return $query->where('section', $section);
    }

    public function scopeByKey($query, $key)
    {
        return $query->where('key', $key);
    }

    // Méthodes statiques pour récupérer le contenu
    public static function getContent($section, $key, $default = null)
    {
        $content = self::bySection($section)->byKey($key)->published()->first();
        return $content ? $content->value : $default;
    }

    public static function getSectionContent($section)
    {
        return self::bySection($section)->published()->get()->pluck('value', 'key')->toArray();
    }

    // Méthodes d'instance
    public function publish()
    {
        $this->update([
            'status' => 'published',
            'published_at' => now()
        ]);
    }

    public function unpublish()
    {
        $this->update([
            'status' => 'draft',
            'published_at' => null
        ]);
    }
}
