<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

/**
 * Superadmin on/off switch for each automated notification event.
 *
 * Read-heavy (checked on every notification fire), so lookups are cached for
 * a short time and the cache is cleared on save.
 */
class NotificationSetting extends Model
{
    protected $table = 'notification_settings';

    protected $fillable = [
        'key',
        'label',
        'group',
        'channel',
        'enabled',
        'description',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    protected static function booted()
    {
        static::saved(fn () => Cache::forget('notification_settings_map'));
        static::deleted(fn () => Cache::forget('notification_settings_map'));
    }

    /**
     * Whether a given event key is currently allowed to fire.
     *
     * Defaults to true (fail OPEN) for a key that has no row yet — a missing
     * row should never silently swallow a notification that was previously
     * working, it just means the admin hasn't touched that toggle.
     */
    public static function isEnabled(string $key): bool
    {
        $map = Cache::remember('notification_settings_map', 60, function () {
            return static::query()->pluck('enabled', 'key')->all();
        });

        return array_key_exists($key, $map) ? (bool) $map[$key] : true;
    }
}
