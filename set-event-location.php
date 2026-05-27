<?php
/**
 * SET EVENT LOCATION
 * Populate event location in database (international format, no special characters)
 */

require_once __DIR__ . '/admin/includes/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = db();

// Use query parameters to set location
// Example: set-event-location.php?address=123+Main+Street&city=New+York&state=NY

$address = $_GET['address'] ?? '';
$city = $_GET['city'] ?? '';
$state = $_GET['state'] ?? '';
$location = $_GET['location'] ?? '';
$zipcode = $_GET['zipcode'] ?? '';
$venue_name = $_GET['venue_name'] ?? '';
$venue_phone = $_GET['venue_phone'] ?? '';
$venue_website = $_GET['venue_website'] ?? '';
$country = $_GET['country'] ?? 'United States';

if (!$address || !$city || !$state) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Missing required parameters',
        'example' => 'set-event-location.php?address=123%20Main%20Street&city=New%20York&state=NY&location=Convention%20Center&country=United%20States',
        'parameters' => [
            'address' => 'Street address (required)',
            'city' => 'City name (required)',
            'state' => 'State or province (required)',
            'location' => 'Location/venue name (optional)',
            'zipcode' => 'ZIP/postal code (optional)',
            'venue_name' => 'Venue name (optional)',
            'venue_phone' => 'Phone number (optional)',
            'venue_website' => 'Website URL (optional)',
            'country' => 'Country name (default: United States)'
        ]
    ], JSON_PRETTY_PRINT);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO settings (setting_key, setting_value)
        VALUES 
            ('event_address', ?),
            ('event_city', ?),
            ('event_state', ?),
            ('event_location', ?),
            ('event_zipcode', ?),
            ('event_venue_name', ?),
            ('event_venue_phone', ?),
            ('event_venue_website', ?),
            ('event_country', ?)
        ON DUPLICATE KEY UPDATE
            setting_value = VALUES(setting_value)
    ");
    
    $stmt->execute([
        $address,
        $city,
        $state,
        $location,
        $zipcode,
        $venue_name,
        $venue_phone,
        $venue_website,
        $country
    ]);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Location saved successfully',
        'data' => [
            'address' => $address,
            'city' => $city,
            'state' => $state,
            'location' => $location,
            'zipcode' => $zipcode,
            'venue_name' => $venue_name,
            'venue_phone' => $venue_phone,
            'venue_website' => $venue_website,
            'country' => $country
        ],
        'test_url' => 'test-map-data.php'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
