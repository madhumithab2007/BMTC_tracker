<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/api_helpers.php';

allow_preflight();
require_method('POST');

$_SESSION = [];

if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}

session_destroy();

send_json([
    'success' => true,
    'message' => 'Logged out successfully',
]);
