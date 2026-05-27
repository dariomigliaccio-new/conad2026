<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$pdo = db();

$err = '';
$ok = '';

function to_int($v, int $default = 0): int {
  if (is_numeric($v)) return (int)$v;
  return $default;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  $action = (string)($_POST['action'] ?? '');

  try {
    if ($action === 'save') {
      $id = to_int($_POST['id'] ?? 0, 0);
      $name = trim((string)($_POST['name'] ?? ''));
      $isActive = isset($_POST['is_active']) ? 1 : 0;
      $sortOrder = to_int($_POST['sort_order'] ?? 0, 0);

      if ($name === '') throw new RuntimeException('Nome é obrigatório.');

      if ($id > 0) {
        $stmt = $pdo->prepare('UPDATE congregations SET name=?, is_active=?, sort_order=? WHERE id=?');
        $stmt->execute([$name, $isActive, $sortOrder, $id]);
        $ok = 'Congregação atualizada.';
      } else {
        $stmt = $pdo->prepare('INSERT INTO congregations (name, is_active, sort_order) VALUES (?,?,?)');
        $stmt->execute([$name, $isActive, $sortOrder]);
        $ok = 'Congregação criada.';
      }
    } elseif ($action === 'delete') {
      $id = to_int($_POST['id'] ?? 0, 0);
      if ($id <= 0) throw new RuntimeException('ID inválido.');
      $stmt = $pdo->prepare('DELETE FROM congregations WHERE id=?');
      $stmt->execute([$id]);
      $ok = 'Congregação removida.';
    }
  } catch (Throwable $e) {
    $err = $e->getMessage();
  }
}

$rows = $pdo->query('SELECT * FROM congregations ORDER BY sort_order ASC, name ASC')->fetchAll();

$editId = isset($_GET['edit']) ? (int)$_GET['edit'] : 0;
$editing = null;
if ($editId > 0) {
  $stmt = $pdo->prepare('SELECT * FROM congregations WHERE id=?');
  $stmt->execute([$editId]);
  $row = $stmt->fetch();
  if (is_array($row)) $editing = $row;
}

admin_header('Congregações');
?>

<?php if ($ok): ?><div class="alert" style="margin-bottom:12px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="margin-bottom:12px"><?php echo h($err); ?></div><?php endif; ?>

<div class="admin-grid-2" style="align-items:start">
  <div class="admin-card">
    <div class="card-title"><?php echo $editing ? 'Editar congregação' : 'Nova congregação'; ?></div>
    <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/congregations.php">
      <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="id" value="<?php echo h((string)($editing['id'] ?? 0)); ?>">

      <div class="form-row">
        <label class="label">Nome</label>
        <input class="input" name="name" required value="<?php echo h((string)($editing['name'] ?? '')); ?>">
      </div>

      <div class="admin-grid-2">
        <div class="form-row">
          <label class="label">Ordem</label>
          <input class="input" name="sort_order" type="number" value="<?php echo h((string)($editing['sort_order'] ?? 0)); ?>">
        </div>
        <div class="form-row">
          <label class="label">Ativa</label>
          <label style="display:flex;gap:8px;align-items:center;margin-top:10px">
            <input type="checkbox" name="is_active" <?php echo ((int)($editing['is_active'] ?? 1) === 1) ? 'checked' : ''; ?>>
            Sim
          </label>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
        <button class="btn btn-primary" type="submit">Salvar</button>
        <?php if ($editing): ?>
          <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/congregations.php">Cancelar</a>
        <?php endif; ?>
      </div>
    </form>
  </div>

  <div class="admin-card">
    <div class="card-title">Lista</div>
    <?php if (!$rows): ?>
      <div style="color:var(--color-muted)">Nenhuma congregação.</div>
    <?php else: ?>
      <div class="admin-list">
        <?php foreach ($rows as $r): ?>
          <div class="item">
            <div>
              <div style="font-weight:600"><?php echo h((string)$r['name']); ?> <?php echo ((int)$r['is_active'] === 1) ? '' : '<span style="color:var(--color-muted)">(inativa)</span>'; ?></div>
              <div class="meta">Ordem: <?php echo h((string)$r['sort_order']); ?> · ID: <?php echo (int)$r['id']; ?></div>
            </div>
            <div style="display:flex;gap:8px">
              <a class="btn btn-ghost is-sm" href="<?php echo ADMIN_BASE_PATH; ?>/congregations.php?edit=<?php echo (int)$r['id']; ?>">Editar</a>
              <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/congregations.php" onsubmit="return confirm('Remover esta congregação? (inscrições ficarão sem congregação)');">
                <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?php echo (int)$r['id']; ?>">
                <button class="btn btn-ghost is-sm" type="submit">Excluir</button>
              </form>
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>
  </div>
</div>

<?php require_once __DIR__ . '/includes/layout-footer.php';
