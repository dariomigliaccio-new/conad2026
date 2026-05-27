<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = db();
$cmsPath = __DIR__ . '/content/cms-default.json';
$cms = file_exists($cmsPath) ? json_decode(file_get_contents($cmsPath), true) ?: [] : [];
$prelatoresPath = __DIR__ . '/content/preletores.json';
$preletores = file_exists($prelatoresPath) ? json_decode(file_get_contents($prelatoresPath), true) ?: [] : [];

$allData = [
  'home' => [
    'hero' => [
      'title' => setting_get($pdo, 'home_hero_title', $cms['hero']['title'] ?? 'Conferência Nacional'),
      'subtitle' => setting_get($pdo, 'home_hero_subtitle', $cms['hero']['subtitle'] ?? ''),
      'button_text' => setting_get($pdo, 'home_hero_button_text', 'Inscrever-se'),
      'button_url' => setting_get($pdo, 'home_hero_button_url', 'precos.html'),
    ],
    'section1' => [
      'title' => setting_get($pdo, 'home_section1_title', ''),
      'subtitle' => setting_get($pdo, 'home_section1_subtitle', ''),
    ],
    'section2' => [
      'title' => setting_get($pdo, 'home_section2_title', ''),
      'subtitle' => setting_get($pdo, 'home_section2_subtitle', ''),
    ],
    'countdown' => [
      'enabled' => setting_get($pdo, 'home_countdown_enabled', '1') === '1',
      'date' => setting_get($pdo, 'countdown_date', '2026-08-15'),
      'time' => setting_get($pdo, 'countdown_time', '09:00:00'),
      'title' => setting_get($pdo, 'countdown_title', 'Falta'),
      'subtitle' => setting_get($pdo, 'countdown_subtitle', 'para o evento começar'),
    ],
    'images' => [
      'banner_desktop' => setting_get($pdo, 'banner_home_desktop', ''),
      'banner_mobile' => setting_get($pdo, 'banner_home_mobile', ''),
      'banner_desktop_list' => json_decode((string)setting_get($pdo, 'banner_home_desktop_list', '[]'), true) ?: [],
      'banner_mobile_list' => json_decode((string)setting_get($pdo, 'banner_home_mobile_list', '[]'), true) ?: [],
      'logo_desktop' => setting_get($pdo, 'logo_desktop', ''),
      'logo_mobile' => setting_get($pdo, 'logo_mobile', ''),
    ],
  ],
  'preletores' => $preletores,
  'event' => [
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
  ],
  'info' => [
    'overview' => setting_get($pdo, 'info_overview', ''),
    'general_details' => setting_get($pdo, 'info_general_details', ''),
    'rules' => setting_get($pdo, 'info_rules', ''),
    'notes' => setting_get($pdo, 'info_notes', ''),
  ],
];

echo json_encode($allData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
