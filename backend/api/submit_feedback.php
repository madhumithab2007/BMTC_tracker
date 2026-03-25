<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/api_helpers.php';
require_once __DIR__ . '/../config/db_connection.php';

allow_preflight();
require_method('POST');

$user = require_login();
$data = get_json_input();

$busNumber = trim((string) ($data['bus_number'] ?? ''));
$rating = (int) ($data['rating'] ?? 0);
$comment = trim((string) ($data['comment'] ?? ''));

if ($busNumber === '' || $rating < 1 || $rating > 5) {
    send_json(['success' => false, 'error' => 'Bus number and a rating between 1 and 5 are required'], 422);
}

$userId = (int) ($user['user_id'] ?? 0);
$userName = (string) ($user['full_name'] ?? 'Authenticated User');

$statement = $conn->prepare(
    'INSERT INTO user_feedback (user_id, user_name, bus_number, rating, comment) VALUES (?, ?, ?, ?, ?)'
);
$statement->bind_param('issis', $userId, $userName, $busNumber, $rating, $comment);
$statement->execute();

send_json([
    'success' => true,
    'message' => 'Thank you for your feedback!',
    'feedback_id' => $statement->insert_id,
], 201);
