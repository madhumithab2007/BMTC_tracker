<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/api_helpers.php';
require_once __DIR__ . '/../config/db_connection.php';

allow_preflight();
require_method('POST');

$data = get_json_input();
$email = trim((string) ($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');

if ($email === '' || $password === '') {
    send_json(['success' => false, 'error' => 'Email and password are required'], 422);
}

$statement = $conn->prepare(
    'SELECT user_id, full_name, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1'
);
$statement->bind_param('s', $email);
$statement->execute();
$result = $statement->get_result();
$user = $result->fetch_assoc();

if (!$user || (int) $user['is_active'] !== 1 || !password_verify($password, $user['password_hash'])) {
    send_json(['success' => false, 'error' => 'Invalid email or password'], 401);
}

session_regenerate_id(true);

$_SESSION['user'] = [
    'user_id' => (int) $user['user_id'],
    'full_name' => $user['full_name'],
    'email' => $user['email'],
    'role' => $user['role'],
];

send_json([
    'success' => true,
    'message' => 'Login successful',
    'user' => $_SESSION['user'],
]);
