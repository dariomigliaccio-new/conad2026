<?php
header('Content-Type: text/plain; charset=UTF-8');

echo "OK\n";
echo "date=" . gmdate('c') . "\n";
echo "host=" . ($_SERVER['HTTP_HOST'] ?? '') . "\n";
echo "uri=" . ($_SERVER['REQUEST_URI'] ?? '') . "\n";
echo "php=" . PHP_VERSION . "\n";
echo "sapi=" . PHP_SAPI . "\n";
echo "__FILE__=" . __FILE__ . "\n";
echo "__DIR__=" . __DIR__ . "\n";
echo "cwd=" . getcwd() . "\n";
echo "docroot=" . ($_SERVER['DOCUMENT_ROOT'] ?? '') . "\n";

echo "\nadmin_health_hint=Para diagnosticar o admin (DB + schema), use /admin/health.php\n";

echo "\nchecks:\n";
$checks = [
  'index.html' => __DIR__ . '/index.html',
  'inscricao.php' => __DIR__ . '/inscricao.php',
  'admin/' => __DIR__ . '/admin',
  'admin/setup.php' => __DIR__ . '/admin/setup.php',
];
foreach ($checks as $label => $path) {
  echo $label . "=" . (file_exists($path) ? 'exists' : 'missing') . " (" . $path . ")\n";
}
