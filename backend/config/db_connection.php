<?php
// Database configuration for XAMPP (MySQL on port 3307)
$host = 'localhost:3307';  // Important: added port 3307
$username = 'root';
$password = '';  // Empty for XAMPP
$database = 'bmtc_tracker';

// Create connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'error' => 'Connection failed: ' . $conn->connect_error]));
}

// Set charset to UTF-8
$conn->set_charset("utf8");

// Connection successful
?>