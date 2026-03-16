<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * IMPORTANT: We pass ['middleware' => ['auth:sanctum']] so that the
     * /broadcasting/auth endpoint validates Bearer tokens (Sanctum)
     * instead of session cookies.
     */
    public function boot(): void
    {
        Broadcast::routes(['middleware' => ['auth:sanctum']]);

        require base_path('routes/channels.php');
    }
}