<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Include database connection
require_once __DIR__ . '/../config/db_connection.php';

// Query to get all active buses with their locations
$query = "SELECT b.bus_id, b.bus_number, b.status, b.capacity,
          r.route_name, r.source, r.destination,
          bl.latitude, bl.longitude, bl.speed, bl.last_updated
          FROM buses b
          LEFT JOIN routes r ON b.route_id = r.route_id
          LEFT JOIN bus_locations bl ON b.bus_id = bl.bus_id
          WHERE b.status = 'active'
          ORDER BY b.bus_number";

$result = $conn->query($query);
$buses = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $buses[] = $row;
    }
    echo json_encode(['success' => true, 'buses' => $buses]);
} else {
    echo json_encode(['success' => true, 'buses' => [], 'message' => 'No buses found']);
}

$conn->close();
?>