<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = db();
$cmsPath = __DIR__ . '/content/cms-default.json';
$cms = file_exists($cmsPath) ? json_decode(file_get_contents($cmsPath), true) ?: [] : [];

$homeConfig = [
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
  ],
  'images' => [
    'banner_desktop' => setting_get($pdo, 'banner_home_desktop', ''),
    'banner_mobile' => setting_get($pdo, 'banner_home_mobile', ''),
    'banner_desktop_list' => json_decode((string)setting_get($pdo, 'banner_home_desktop_list', '[]'), true) ?: [],
    'banner_mobile_list' => json_decode((string)setting_get($pdo, 'banner_home_mobile_list', '[]'), true) ?: [],
    'logo_desktop' => setting_get($pdo, 'logo_desktop', ''),
    'logo_mobile' => setting_get($pdo, 'logo_mobile', ''),
  ],
];

echo json_encode($homeConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
