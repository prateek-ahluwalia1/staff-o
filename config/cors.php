<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'http://localhost:3000',    // React default
        'http://localhost:5173',    // Vite default
        'http://localhost:8000',    // Laravel (if different port)
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://staff-o.vercel.app'
        // Add your production domain here
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // CRITICAL
];