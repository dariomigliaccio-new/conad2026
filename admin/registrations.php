<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$pdo = db();

$err = '';
$ok = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  $action = (string)($_POST['action'] ?? '');

  try {
    if ($action === 'delete') {
      $id = (int)($_POST['id'] ?? 0);
      if ($id <= 0) throw new RuntimeException('ID inválido.');

      // FK com ON DELETE CASCADE remove filhos/ocupantes automaticamente.
      $stmt = $pdo->prepare('DELETE FROM registrations WHERE id=?');
      $stmt->execute([$id]);
      $ok = 'Inscrição removida.';
    } elseif ($action === 'mark_paid') {
      $id = (int)($_POST['id'] ?? 0);
      if ($id <= 0) throw new RuntimeException('ID inválido.');
      $stmt = $pdo->prepare("UPDATE registrations SET status='paid' WHERE id=?");
      $stmt->execute([$id]);
      $ok = 'Status atualizado para pago.';
    } elseif ($action === 'mark_pending') {
      $id = (int)($_POST['id'] ?? 0);
      if ($id <= 0) throw new RuntimeException('ID inválido.');
      $stmt = $pdo->prepare("UPDATE registrations SET status='pending' WHERE id=?");
      $stmt->execute([$id]);
      $ok = 'Status atualizado para pendente.';
    } elseif ($action === 'mark_canceled') {
      $id = (int)($_POST['id'] ?? 0);
      if ($id <= 0) throw new RuntimeException('ID inválido.');
      $stmt = $pdo->prepare("UPDATE registrations SET status='canceled' WHERE id=?");
      $stmt->execute([$id]);
      $ok = 'Status atualizado para cancelado.';
    }
  } catch (Throwable $e) {
    $err = $e->getMessage();
  }
}

$status = (string)($_GET['status'] ?? 'all');
$allowed = ['all','pending','paid','canceled'];
if (!in_array($status, $allowed, true)) $status = 'all';

$where = '';
$params = [];
if ($status !== 'all') {
  $where = 'WHERE r.status=?';
  $params[] = $status;
}

try {
  $sql = 'SELECT r.id, r.participant_name, r.participant_email, r.participant_phone, r.status, r.created_at, '
         . 'COALESCE(p.name, "(Sem plano)") AS plan_name, '
         . 'COALESCE(cg.name, "(Sem congregação)") AS cong_name '
         . 'FROM registrations r '
         . 'LEFT JOIN payment_plans p ON p.id = r.plan_id '
         . 'LEFT JOIN congregations cg ON cg.id = r.congregation_id ';
  if (!empty($where)) $sql .= $where . ' ';
  $sql .= 'ORDER BY r.created_at DESC LIMIT 200';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll() ?: [];
} catch (Throwable $e) {
  $err = 'Erro ao carregar inscrições: ' . $e->getMessage();
  $rows = [];
}

admin_header('Inscrições');
?>

<?php if ($ok): ?><div class="alert" style="margin-bottom:12px;background:#d4edda;border-color:#c3e6cb;color:#155724"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="margin-bottom:12px;background:#f8d7da;border-color:#f5c6cb;color:#721c24"><?php echo h($err); ?></div><?php endif; ?>

<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px">
  <?php foreach ($allowed as $st): ?>
    <a class="btn <?php echo ($status === $st) ? 'btn-outline' : 'btn-ghost'; ?> is-sm" href="<?php echo ADMIN_BASE_PATH; ?>/registrations.php?status=<?php echo h($st); ?>">
      <?php echo match($st) {
        'all' => 'Todas',
        'pending' => 'Pendentes',
        'paid' => 'Pagas',
        'canceled' => 'Canceladas',
        default => $st
      }; ?>
    </a>
  <?php endforeach; ?>
</div>

<?php if (!$rows): ?>
  <div class="admin-card">
    <div style="color:var(--color-muted);text-align:center;padding:40px">Nenhuma inscrição encontrada.</div>
  </div>
<?php else: ?>
  <div class="admin-card" style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="border-bottom:2px solid #e0e0e0;background:#f5f5f5">
          <th style="padding:10px;text-align:left;font-weight:600">Nome</th>
          <th style="padding:10px;text-align:left;font-weight:600">Email</th>
          <th style="padding:10px;text-align:left;font-weight:600">Telefone</th>
          <th style="padding:10px;text-align:left;font-weight:600">Plano</th>
          <th style="padding:10px;text-align:left;font-weight:600">Congregação</th>
          <th style="padding:10px;text-align:center;font-weight:600">Status</th>
          <th style="padding:10px;text-align:left;font-weight:600">Data</th>
          <th style="padding:10px;text-align:center;font-weight:600">Ações</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($rows as $r): ?>
          <tr style="border-bottom:1px solid #e0e0e0">
            <td style="padding:10px"><strong><?php echo h((string)$r['participant_name']); ?></strong></td>
            <td style="padding:10px"><?php echo h((string)$r['participant_email']); ?></td>
            <td style="padding:10px"><?php echo h((string)($r['participant_phone'] ?? '')); ?></td>
            <td style="padding:10px"><?php echo h((string)$r['plan_name']); ?></td>
            <td style="padding:10px"><?php echo h((string)$r['cong_name']); ?></td>
            <td style="padding:10px;text-align:center">
              <span style="display:inline-block;padding:3px 8px;border-radius:4px;font-size:11px;font-weight:600;background:<?php 
                echo match($r['status']) {
                  'paid' => '#d4edda;color:#155724',
                  'pending' => '#fff3cd;color:#856404',
                  'canceled' => '#f8d7da;color:#721c24',
                  default => '#e9ecef;color:#495057'
                }; ?>"><?php echo h((string)$r['status']); ?></span>
            </td>
            <td style="padding:10px"><?php echo h((string)substr($r['created_at'], 0, 10)); ?></td>
            <td style="padding:10px;text-align:center">
              <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap">
                <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/registrations.php?status=<?php echo h($status); ?>" style="display:inline">
                  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
                  <input type="hidden" name="id" value="<?php echo (int)$r['id']; ?>">
                  <input type="hidden" name="action" value="mark_paid">
                  <button class="btn btn-ghost is-sm" type="submit" style="padding:4px 8px;font-size:11px">✓</button>
                </form>
                <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/registrations.php?status=<?php echo h($status); ?>" style="display:inline">
                  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
                  <input type="hidden" name="id" value="<?php echo (int)$r['id']; ?>">
                  <input type="hidden" name="action" value="delete">
                  <button class="btn btn-ghost is-sm" type="submit" style="padding:4px 8px;font-size:11px;color:#d32f2f" onclick="return confirm('Excluir?')">🗑</button>
                </form>
              </div>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
<?php endif; ?>

<?php require_once __DIR__ . '/includes/layout-footer.php';
