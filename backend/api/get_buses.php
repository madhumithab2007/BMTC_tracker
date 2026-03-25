<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/api_helpers.php';
require_once __DIR__ . '/../config/db_connection.php';

allow_preflight();

$query = "
    SELECT
        b.bus_id,
        b.bus_number,
        b.status,
        b.capacity,
        b.driver_name,
        r.route_name,
        r.source,
        r.destination,
        r.distance_km,
        r.estimated_duration_mins,
        bl.latitude,
        bl.longitude,
        bl.speed,
        bl.heading,
        bl.last_updated
    FROM buses b
    LEFT JOIN routes r ON b.route_id = r.route_id
    LEFT JOIN (
        SELECT l1.*
        FROM bus_locations l1
        INNER JOIN (
            SELECT bus_id, MAX(last_updated) AS latest_update
            FROM bus_locations
            GROUP BY bus_id
        ) latest
            ON latest.bus_id = l1.bus_id
           AND latest.latest_update = l1.last_updated
    ) bl ON b.bus_id = bl.bus_id
    WHERE b.status = 'active'
    ORDER BY b.bus_number ASC
";

$result = $conn->query($query);
$buses = [];

while ($row = $result->fetch_assoc()) {
    $buses[] = $row;
}

send_json([
    'success' => true,
    'buses' => $buses,
    'count' => count($buses),
]);
