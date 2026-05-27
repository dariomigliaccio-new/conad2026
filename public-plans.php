<?php
declare(strict_types=1);

// Endpoint público: retorna os planos ativos (para a página de preços).
// Nenhuma informação sensível é exposta aqui.

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

try {
  require_once __DIR__ . '/admin/includes/config-loader.php';
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'Configuração não encontrada'], JSON_UNESCAPED_UNICODE);
  exit;
}

try {
  $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
  $pdo = new PDO($dsn, DB_USER, DB_PASS, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]);

  $rows = $pdo->query('SELECT id, slug, name, description, benefits_text, price_full_cents, installment_count, installment_price_cents, sort_order FROM payment_plans WHERE is_active=1 ORDER BY sort_order ASC, id ASC LIMIT 5')->fetchAll();

  $plans = array_map(function (array $r): array {
    $benefitsText = (string)($r['benefits_text'] ?? '');
    $benefits = [];
    if (trim($benefitsText) !== '') {
      $lines = preg_split('/\r\n|\r|\n/', $benefitsText);
      if (is_array($lines)) {
        foreach ($lines as $line) {
          $line = trim((string)$line);
          if ($line !== '') $benefits[] = $line;
        }
      }
    }

    return [
      'id' => (int)($r['id'] ?? 0),
      'slug' => (string)($r['slug'] ?? ''),
      'name' => (string)($r['name'] ?? ''),
      'description' => (string)($r['description'] ?? ''),
      'benefits' => $benefits,
      'price_full_cents' => (int)($r['price_full_cents'] ?? 0),
      'installment_count' => (int)($r['installment_count'] ?? 1),
      'installment_price_cents' => isset($r['installment_price_cents']) ? (int)$r['installment_price_cents'] : null,
      'sort_order' => (int)($r['sort_order'] ?? 0),
    ];
  }, is_array($rows) ? $rows : []);

  echo json_encode(['plans' => $plans], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
  error_log('[public-plans.php] ' . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Não foi possível carregar os planos'], JSON_UNESCAPED_UNICODE);
}
