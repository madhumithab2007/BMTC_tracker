<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/api_helpers.php';

allow_preflight();

if (!isset($_SESSION['user'])) {
    send_json([
        'success' => true,
        'authenticated' => false,
    ]);
}

send_json([
    'success' => true,
    'authenticated' => true,
    'user' => $_SESSION['user'],
]);
