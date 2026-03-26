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

// User private channel
Broadcast::channel('user.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Chat private channel
Broadcast::channel('chat.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Presence channel for online users
Broadcast::channel('online-users', function ($user) {
    return ['id' => $user->id, 'name' => $user->name];
});