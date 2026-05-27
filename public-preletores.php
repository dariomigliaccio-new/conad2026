<?php
header('Content-Type: application/json; charset=utf-8');

$prelatoresPath = __DIR__ . '/content/preletores.json';
$preletores = [];

if (file_exists($prelatoresPath)) {
  $preletores = json_decode(file_get_contents($prelatoresPath), true) ?: [];
}

echo json_encode($preletores, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
