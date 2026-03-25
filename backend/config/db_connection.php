<?php

declare(strict_types=1);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

function get_db_connection(): mysqli
{
    $host = getenv('BMTC_DB_HOST') ?: '127.0.0.1';
    $port = (int) (getenv('BMTC_DB_PORT') ?: 3307);
    $username = getenv('BMTC_DB_USER') ?: 'root';
    $password = getenv('BMTC_DB_PASSWORD') ?: '';
    $database = getenv('BMTC_DB_NAME') ?: 'bmtc_tracker';

    try {
        $connection = new mysqli($host, $username, $password, $database, $port);
        $connection->set_charset('utf8mb4');

        return $connection;
    } catch (mysqli_sql_exception $exception) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed',
            'details' => $exception->getMessage(),
        ]);
        exit;
    }
}

$conn = get_db_connection();
