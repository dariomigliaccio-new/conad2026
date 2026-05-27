<?php
require_once __DIR__ . '/includes/bootstrap.php';

header('Content-Type: text/plain; charset=utf-8');

echo "diag=ok\n";

echo 'php=' . PHP_VERSION . "\n";

echo 'session_status=' . session_status() . "\n";

echo 'is_logged_in=' . (is_logged_in() ? '1' : '0') . "\n";

try {
  $pdo = db();
  echo 'db_select1=' . (int)$pdo->query('SELECT 1')->fetchColumn() . "\n";
  echo 'admins_count=' . (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn() . "\n";
} catch (Throwable $e) {
  $errorId = log_unhandled_exception($e);
  echo 'db_error=1' . "\n";
  echo 'error_id=' . $errorId . "\n";
}
