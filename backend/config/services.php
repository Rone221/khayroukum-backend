<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'moneyprinter' => [
        // URL de l'API MoneyPrinterTurbo (python main.py), sans /api/v1
        'url' => env('MONEYPRINTER_URL', 'http://127.0.0.1:8080'),
        // Doit correspondre à `api_key` dans config.toml de MoneyPrinterTurbo (vide = pas d'auth)
        'api_key' => env('MONEYPRINTER_API_KEY'),
        'timeout' => (int) env('MONEYPRINTER_TIMEOUT', 30),
        // Disque Laravel où les vidéos terminées sont copiées
        'disk' => env('MONEYPRINTER_DISK', 'local'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
