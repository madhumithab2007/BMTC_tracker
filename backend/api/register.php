<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/api_helpers.php';
require_once __DIR__ . '/../config/db_connection.php';

allow_preflight();
require_method('POST');

$data = get_json_input();
$fullName = trim((string) ($data['full_name'] ?? ''));
$email = trim((string) ($data['email'] ?? ''));
$password = (string) ($data['password'] ?? '');
$confirmPassword = (string) ($data['confirm_password'] ?? '');

if ($fullName === '' || $email === '' || $password === '' || $confirmPassword === '') {
    send_json(['success' => false, 'error' => 'All sign-up fields are required'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    send_json(['success' => false, 'error' => 'Please enter a valid email address'], 422);
}

if (strlen($password) < 8) {
    send_json(['success' => false, 'error' => 'Password must be at least 8 characters long'], 422);
}

if ($password !== $confirmPassword) {
    send_json(['success' => false, 'error' => 'Passwords do not match'], 422);
}

$checkStatement = $conn->prepare('SELECT user_id FROM users WHERE email = ? LIMIT 1');
$checkStatement->bind_param('s', $email);
$checkStatement->execute();
$existingUser = $checkStatement->get_result()->fetch_assoc();

if ($existingUser) {
    send_json(['success' => false, 'error' => 'An account with this email already exists'], 409);
}

$passwordHash = password_hash($password, PASSWORD_DEFAULT);
$insertStatement = $conn->prepare(
    'INSERT INTO users (full_name, email, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)'
);
$role = 'commuter';
$insertStatement->bind_param('ssss', $fullName, $email, $passwordHash, $role);
$insertStatement->execute();

$userId = $insertStatement->insert_id;

session_regenerate_id(true);
$_SESSION['user'] = [
    'user_id' => (int) $userId,
    'full_name' => $fullName,
    'email' => $email,
    'role' => $role,
];

send_json([
    'success' => true,
    'message' => 'Account created successfully',
    'user' => $_SESSION['user'],
], 201);
