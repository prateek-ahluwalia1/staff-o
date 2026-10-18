<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Admin-managed phone numbers for notifications that aren't tied to one
 * user record (daily summary, chat job-request pings, payment-completed
 * admin copies). Superadmin adds/removes numbers per group from the panel —
 * no code change needed to add or drop an admin's number.
 */
class NotificationRecipient extends Model
{
    protected $table = 'notification_recipients';

    protected $fillable = [
        'group_key',
        'phone',
        'label',
        'enabled',
    ];

    protected $casts = [
        'enabled' => 'boolean',
    ];

    /**
     * Active phone numbers for a group, falling back to the static
     * WHATSAPP_ADMIN_NUMBERS env list if nothing has been configured yet in
     * the panel — so this never goes silent on a fresh install.
     */
    public static function phonesFor(string $groupKey): array
    {
        $numbers = static::query()
            ->where('group_key', $groupKey)
            ->where('enabled', true)
            ->pluck('phone')
            ->filter()
            ->values()
            ->all();

        if ($numbers !== []) {
            return $numbers;
        }

        $fallback = (string) config('services.whatsapp_notifications.admin_fallback_numbers', '');

        return array_values(array_filter(array_map('trim', explode(',', $fallback))));
    }
}
