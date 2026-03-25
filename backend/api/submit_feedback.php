<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Include database connection
require_once __DIR__ . '/../config/db_connection.php';

// Check if it's a POST request
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get JSON data from request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (isset($data['user_name']) && isset($data['bus_number']) && isset($data['rating'])) {
        
        $user_name = $conn->real_escape_string($data['user_name']);
        $bus_number = $conn->real_escape_string($data['bus_number']);
        $rating = intval($data['rating']);
        $comment = isset($data['comment']) ? $conn->real_escape_string($data['comment']) : '';
        
        // Insert feedback
        $query = "INSERT INTO user_feedback (user_name, bus_number, rating, comment) 
                  VALUES (?, ?, ?, ?)";
        
        $stmt = $conn->prepare($query);
        $stmt->bind_param("ssis", $user_name, $bus_number, $rating, $comment);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Thank you for your feedback!']);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to save feedback: ' . $stmt->error]);
        }
        
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Only POST requests are allowed']);
}

$conn->close();
?>