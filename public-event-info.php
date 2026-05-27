<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = db();

$eventInfo = [
  'location' => setting_get($pdo, 'event_location', ''),
  'address' => setting_get($pdo, 'event_address', ''),
  'city' => setting_get($pdo, 'event_city', ''),
  'state' => setting_get($pdo, 'event_state', ''),
  'country' => setting_get($pdo, 'event_country', 'Brasil'),
  'zipcode' => setting_get($pdo, 'event_zipcode', ''),
  'venue_name' => setting_get($pdo, 'event_venue_name', ''),
  'venue_phone' => setting_get($pdo, 'event_venue_phone', ''),
  'venue_website' => setting_get($pdo, 'event_venue_website', ''),
  'map_embed' => setting_get($pdo, 'event_map_embed', ''),
  'additional_info' => setting_get($pdo, 'event_additional_info', ''),
  'rules' => setting_get($pdo, 'event_rules', ''),
  'important_notes' => setting_get($pdo, 'event_important_notes', ''),
];

echo json_encode($eventInfo, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
