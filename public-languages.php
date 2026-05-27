<?php
/**
 * Public languages endpoint
 * Serves translations as JSON
 * Usage: /public-languages.php?lang=pt-BR
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=86400');

$lang = (string)($_GET['lang'] ?? 'pt-BR');
$allowed = ['pt-BR', 'en-US', 'es-ES'];

if (!in_array($lang, $allowed, true)) {
  $lang = 'pt-BR';
}

$path = __DIR__ . '/content/languages.json';

if (!file_exists($path)) {
  http_response_code(404);
  echo json_encode(['error' => 'Languages file not found']);
  exit;
}

$all = json_decode(file_get_contents($path), true);
if (!is_array($all) || !isset($all[$lang])) {
  http_response_code(404);
  echo json_encode(['error' => 'Language not found']);
  exit;
}

echo json_encode($all[$lang], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
