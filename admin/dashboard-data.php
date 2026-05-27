<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_login();

header('Content-Type: application/json; charset=utf-8');

$pdo = db();

$statusView = (string)($_GET['status'] ?? 'all');
$allowedStatus = ['all', 'pending', 'paid', 'canceled'];
if (!in_array($statusView, $allowedStatus, true)) $statusView = 'all';

function q_count(PDO $pdo, string $sql, array $params = []): int {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $v = $stmt->fetchColumn();
  return (int)($v === false || $v === null ? 0 : $v);
}

function q_all(PDO $pdo, string $sql, array $params = []): array {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll();
  return is_array($rows) ? $rows : [];
}

try {
  $counts = [
    'plans' => q_count($pdo, 'SELECT COUNT(*) FROM payment_plans'),
    'fields' => q_count($pdo, 'SELECT COUNT(*) FROM form_fields'),
    'registrations' => q_count($pdo, 'SELECT COUNT(*) FROM registrations'),
    'pending' => q_count($pdo, "SELECT COUNT(*) FROM registrations WHERE status='pending'"),
    'paid' => q_count($pdo, "SELECT COUNT(*) FROM registrations WHERE status='paid'"),
    'canceled' => q_count($pdo, "SELECT COUNT(*) FROM registrations WHERE status='canceled'"),
    'completed' => q_count($pdo, 'SELECT COUNT(*) FROM registrations WHERE current_step>=5'),
  ];

  $where = '';
  $params = [];
  if ($statusView !== 'all') {
    $where = 'WHERE r.status=?';
    $params = [$statusView];
  }

  $byPlan = q_all(
    $pdo,
    'SELECT COALESCE(p.name, "(Sem plano)") AS label, COUNT(*) AS c\n'
      . 'FROM registrations r\n'
      . 'LEFT JOIN payment_plans p ON p.id = r.plan_id\n'
      . $where . "\n"
      . 'GROUP BY p.id, p.name\n'
      . 'ORDER BY c DESC\n'
      . 'LIMIT 8',
    $params
  );

  $byCong = q_all(
    $pdo,
    'SELECT COALESCE(cg.name, "(Sem congregação)") AS label, COUNT(*) AS c\n'
      . 'FROM registrations r\n'
      . 'LEFT JOIN congregations cg ON cg.id = r.congregation_id\n'
      . $where . "\n"
      . 'GROUP BY cg.id, cg.name\n'
      . 'ORDER BY c DESC\n'
      . 'LIMIT 8',
    $params
  );

  $timeline = q_all(
    $pdo,
    'SELECT DATE(r.created_at) AS d, COUNT(*) AS c\n'
      . 'FROM registrations r\n'
      . ($where ? ($where . ' AND r.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)') : 'WHERE r.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)') . "\n"
      . 'GROUP BY d\n'
      . 'ORDER BY d ASC',
    $params
  );

  $recent = q_all(
    $pdo,
    'SELECT r.id, r.participant_name, r.status, r.created_at, COALESCE(p.name, "(Sem plano)") AS plan_name\n'
      . 'FROM registrations r\n'
      . 'LEFT JOIN payment_plans p ON p.id = r.plan_id\n'
      . $where . "\n"
      . 'ORDER BY r.created_at DESC\n'
      . 'LIMIT 8',
    $params
  );

  echo json_encode([
    'ok' => true,
    'view' => ['status' => $statusView],
    'counts' => $counts,
    'statusDistribution' => [
      'paid' => (int)$counts['paid'],
      'pending' => (int)$counts['pending'],
      'canceled' => (int)$counts['canceled'],
    ],
    'byPlan' => array_map(fn($r) => ['label' => (string)($r['label'] ?? ''), 'c' => (int)($r['c'] ?? 0)], $byPlan),
    'byCong' => array_map(fn($r) => ['label' => (string)($r['label'] ?? ''), 'c' => (int)($r['c'] ?? 0)], $byCong),
    'timeline' => array_map(fn($r) => ['d' => (string)($r['d'] ?? ''), 'c' => (int)($r['c'] ?? 0)], $timeline),
    'recent' => array_map(fn($r) => [
      'id' => (int)($r['id'] ?? 0),
      'participant_name' => (string)($r['participant_name'] ?? ''),
      'status' => (string)($r['status'] ?? ''),
      'created_at' => (string)($r['created_at'] ?? ''),
      'plan_name' => (string)($r['plan_name'] ?? ''),
    ], $recent),
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
  http_response_code(500);
  $errorId = null;
  try {
    $errorId = log_unhandled_exception($e);
  } catch (Throwable $ignored) {
    $errorId = null;
  }

  echo json_encode([
    'ok' => false,
    'error' => 'Falha ao carregar dados do dashboard.',
    'error_id' => $errorId,
    'detail' => app_debug_enabled() ? (string)$e->getMessage() : null,
  ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
}
