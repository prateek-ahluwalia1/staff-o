<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

Broadcast::channel('notifications.{userId}', function ($user, int $userId) {
    // Only allow the user to subscribe to their own channel
    return (int) $user->id === $userId;
});

Broadcast::channel('admin-notifications', function (User $user) {
    return $user->is_admin ?? false;
});