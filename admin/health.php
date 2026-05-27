<?php
require_once __DIR__ . '/includes/bootstrap.php';

header('Content-Type: text/plain; charset=utf-8');

echo "admin_health=ok\n";

echo 'php=' . PHP_VERSION . "\n";

echo 'debug=' . (app_debug_enabled() ? '1' : '0') . "\n";

echo 'session_status=' . session_status() . "\n";

echo 'is_logged_in=' . (is_logged_in() ? '1' : '0') . "\n";

try {
  $pdo = db();
  $v = $pdo->query('SELECT 1')->fetchColumn();
  echo 'db_select1=' . (int)$v . "\n";

  $tables = ['admins','payment_plans','form_fields','congregations','registrations','registration_children','registration_occupants','settings'];
  foreach ($tables as $t) {
    $stmt = $pdo->prepare("SHOW TABLES LIKE " . $pdo->quote($t));
    $stmt->execute();
    $ok = $stmt->fetchColumn() ? 'ok' : 'missing';
    echo 'table_' . $t . '=' . $ok . "\n";
  }

  $countAdmins = (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();
  echo 'admins_count=' . $countAdmins . "\n";
} catch (Throwable $e) {
  $errorId = log_unhandled_exception($e);
  echo 'db_error=1' . "\n";
  echo 'error_id=' . $errorId . "\n";
}
