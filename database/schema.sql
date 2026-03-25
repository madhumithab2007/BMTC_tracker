CREATE DATABASE IF NOT EXISTS bmtc_tracker
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE bmtc_tracker;

CREATE TABLE IF NOT EXISTS users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'commuter') NOT NULL DEFAULT 'commuter',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
    route_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(50) NOT NULL UNIQUE,
    source VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    distance_km DECIMAL(6,2) DEFAULT NULL,
    estimated_duration_mins INT UNSIGNED DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buses (
    bus_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(30) NOT NULL UNIQUE,
    route_id INT UNSIGNED DEFAULT NULL,
    capacity INT UNSIGNED NOT NULL DEFAULT 50,
    status ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
    driver_name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_buses_route
        FOREIGN KEY (route_id) REFERENCES routes(route_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS bus_locations (
    location_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    bus_id INT UNSIGNED NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    speed DECIMAL(5,2) DEFAULT NULL,
    heading SMALLINT UNSIGNED DEFAULT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_locations_bus
        FOREIGN KEY (bus_id) REFERENCES buses(bus_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS user_feedback (
    feedback_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED DEFAULT NULL,
    user_name VARCHAR(100) NOT NULL,
    bus_number VARCHAR(30) NOT NULL,
    rating TINYINT UNSIGNED NOT NULL,
    comment TEXT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_feedback_rating
        CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_buses_status ON buses(status);
CREATE INDEX idx_locations_bus_updated ON bus_locations(bus_id, last_updated);
CREATE INDEX idx_feedback_bus_number ON user_feedback(bus_number);

INSERT INTO users (full_name, email, password_hash, role)
VALUES
    ('BMTC Admin', 'admin@bmtc.local', '$2y$10$ojCWHBBbqCDEVGXTUEQhzesgEt5NyIciWj4eHCBct..odlumVf7oK', 'admin'),
    ('Demo Rider', 'rider@bmtc.local', '$2y$10$mjrOuA/ASCgGgD0a6vVXt.r/i3khsg/BnKKoApry9dQxU/nSowtV2', 'commuter')
ON DUPLICATE KEY UPDATE
    full_name = VALUES(full_name),
    password_hash = VALUES(password_hash),
    role = VALUES(role),
    is_active = 1;

INSERT INTO routes (route_name, source, destination, distance_km, estimated_duration_mins)
VALUES
    ('500D', 'Banashankari', 'Hebbal', 23.50, 70),
    ('KIAS-8', 'Electronic City', 'Kempegowda International Airport', 54.20, 100),
    ('401K', 'Yelahanka', 'Kengeri', 31.80, 85)
ON DUPLICATE KEY UPDATE
    source = VALUES(source),
    destination = VALUES(destination),
    distance_km = VALUES(distance_km),
    estimated_duration_mins = VALUES(estimated_duration_mins);

INSERT INTO buses (bus_number, route_id, capacity, status, driver_name)
SELECT 'KA-01-F-1024', route_id, 48, 'active', 'Ramesh Kumar'
FROM routes
WHERE route_name = '500D'
ON DUPLICATE KEY UPDATE
    route_id = VALUES(route_id),
    capacity = VALUES(capacity),
    status = VALUES(status),
    driver_name = VALUES(driver_name);

INSERT INTO buses (bus_number, route_id, capacity, status, driver_name)
SELECT 'KA-57-B-4401', route_id, 40, 'active', 'Meena S'
FROM routes
WHERE route_name = 'KIAS-8'
ON DUPLICATE KEY UPDATE
    route_id = VALUES(route_id),
    capacity = VALUES(capacity),
    status = VALUES(status),
    driver_name = VALUES(driver_name);

INSERT INTO buses (bus_number, route_id, capacity, status, driver_name)
SELECT 'KA-05-M-7788', route_id, 52, 'active', 'Anil Gowda'
FROM routes
WHERE route_name = '401K'
ON DUPLICATE KEY UPDATE
    route_id = VALUES(route_id),
    capacity = VALUES(capacity),
    status = VALUES(status),
    driver_name = VALUES(driver_name);

INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading, last_updated)
SELECT bus_id, 12.9352230, 77.5502090, 28.50, 90, NOW()
FROM buses
WHERE bus_number = 'KA-01-F-1024'
  AND NOT EXISTS (
      SELECT 1
      FROM bus_locations bl
      WHERE bl.bus_id = buses.bus_id
  );

INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading, last_updated)
SELECT bus_id, 12.8456120, 77.6601940, 46.20, 35, NOW()
FROM buses
WHERE bus_number = 'KA-57-B-4401'
  AND NOT EXISTS (
      SELECT 1
      FROM bus_locations bl
      WHERE bl.bus_id = buses.bus_id
  );

INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading, last_updated)
SELECT bus_id, 13.0285120, 77.5899210, 31.10, 210, NOW()
FROM buses
WHERE bus_number = 'KA-05-M-7788'
  AND NOT EXISTS (
      SELECT 1
      FROM bus_locations bl
      WHERE bl.bus_id = buses.bus_id
  );
