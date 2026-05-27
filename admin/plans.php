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
      $slug = trim((string)($_POST['slug'] ?? ''));
      $name = trim((string)($_POST['name'] ?? ''));
      $description = trim((string)($_POST['description'] ?? ''));
      $benefits = trim((string)($_POST['benefits_text'] ?? ''));
      $priceFull = to_int($_POST['price_full_cents'] ?? 0, 0);
      $installCount = to_int($_POST['installment_count'] ?? 1, 1);
      $installPrice = trim((string)($_POST['installment_price_cents'] ?? ''));
      $installPriceVal = ($installPrice === '' ? null : to_int($installPrice, 0));
      $isActive = isset($_POST['is_active']) ? 1 : 0;
      $sortOrder = to_int($_POST['sort_order'] ?? 0, 0);

      if ($slug === '' || $name === '') {
        throw new RuntimeException('Slug e nome são obrigatórios.');
      }

      if ($id > 0) {
        $stmt = $pdo->prepare('UPDATE payment_plans SET slug=?, name=?, description=?, benefits_text=?, price_full_cents=?, installment_count=?, installment_price_cents=?, is_active=?, sort_order=? WHERE id=?');
        $stmt->execute([$slug, $name, ($description === '' ? null : $description), ($benefits === '' ? null : $benefits), $priceFull, $installCount, $installPriceVal, $isActive, $sortOrder, $id]);
        $ok = 'Plano atualizado.';
      } else {
        $stmt = $pdo->prepare('INSERT INTO payment_plans (slug, name, description, benefits_text, price_full_cents, installment_count, installment_price_cents, is_active, sort_order) VALUES (?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$slug, $name, ($description === '' ? null : $description), ($benefits === '' ? null : $benefits), $priceFull, $installCount, $installPriceVal, $isActive, $sortOrder]);
        $ok = 'Plano criado.';
      }
    } elseif ($action === 'delete') {
      $id = to_int($_POST['id'] ?? 0, 0);
      if ($id <= 0) throw new RuntimeException('ID inválido.');
      $stmt = $pdo->prepare('DELETE FROM payment_plans WHERE id=?');
      $stmt->execute([$id]);
      $ok = 'Plano removido.';
    }
  } catch (Throwable $e) {
    $err = $e->getMessage();
  }
}

$plans = $pdo->query('SELECT * FROM payment_plans ORDER BY sort_order ASC, id DESC')->fetchAll();

$editId = isset($_GET['edit']) ? (int)$_GET['edit'] : 0;
$editing = null;
if ($editId > 0) {
  $stmt = $pdo->prepare('SELECT * FROM payment_plans WHERE id=?');
  $stmt->execute([$editId]);
  $row = $stmt->fetch();
  if (is_array($row)) $editing = $row;
}

admin_header('Planos');
?>

<?php if ($ok): ?><div class="alert" style="margin-bottom:12px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="margin-bottom:12px"><?php echo h($err); ?></div><?php endif; ?>

<div class="admin-grid-2" style="align-items:start">
  <div class="admin-card">
    <div class="card-title"><?php echo $editing ? 'Editar plano' : 'Novo plano'; ?></div>
    <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/plans.php">
      <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="id" value="<?php echo h((string)($editing['id'] ?? 0)); ?>">

      <div class="form-row">
        <label class="label">Slug</label>
        <input class="input" name="slug" required value="<?php echo h((string)($editing['slug'] ?? '')); ?>">
      </div>

      <div class="form-row">
        <label class="label">Nome</label>
        <input class="input" name="name" required value="<?php echo h((string)($editing['name'] ?? '')); ?>">
      </div>

      <div class="form-row">
        <label class="label">Descrição</label>
        <textarea class="textarea" name="description" rows="2"><?php echo h((string)($editing['description'] ?? '')); ?></textarea>
      </div>

      <div class="form-row">
        <label class="label">Benefícios (texto)</label>
        <textarea class="textarea" name="benefits_text" rows="3"><?php echo h((string)($editing['benefits_text'] ?? '')); ?></textarea>
      </div>

      <div class="admin-grid-2">
        <div class="form-row">
          <label class="label">Preço (centavos)</label>
          <input class="input" name="price_full_cents" type="number" min="0" required value="<?php echo h((string)($editing['price_full_cents'] ?? 0)); ?>">
        </div>
        <div class="form-row">
          <label class="label">Parcelas</label>
          <input class="input" name="installment_count" type="number" min="1" required value="<?php echo h((string)($editing['installment_count'] ?? 1)); ?>">
        </div>
      </div>

      <div class="admin-grid-2">
        <div class="form-row">
          <label class="label">Valor parcela (centavos)</label>
          <input class="input" name="installment_price_cents" type="number" min="0" value="<?php echo h((string)($editing['installment_price_cents'] ?? '')); ?>">
        </div>
        <div class="form-row">
          <label class="label">Ordem</label>
          <input class="input" name="sort_order" type="number" value="<?php echo h((string)($editing['sort_order'] ?? 0)); ?>">
        </div>
      </div>

      <label style="display:flex;gap:8px;align-items:center;margin-top:8px">
        <input type="checkbox" name="is_active" <?php echo ((int)($editing['is_active'] ?? 1) === 1) ? 'checked' : ''; ?>>
        Ativo
      </label>

      <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
        <button class="btn btn-primary" type="submit">Salvar</button>
        <?php if ($editing): ?>
          <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/plans.php">Cancelar</a>
        <?php endif; ?>
      </div>
    </form>
  </div>

  <div class="admin-card">
    <div class="card-title">Lista</div>
    <?php if (!$plans): ?>
      <div style="color:var(--color-muted)">Nenhum plano.</div>
    <?php else: ?>
      <div class="admin-list">
        <?php foreach ($plans as $p): ?>
          <div class="item" style="align-items:flex-start">
            <div>
              <div style="font-weight:600"><?php echo h((string)$p['name']); ?> <?php echo ((int)$p['is_active'] === 1) ? '' : '<span style="color:var(--color-muted)">(inativo)</span>'; ?></div>
              <div class="meta">Slug: <?php echo h((string)$p['slug']); ?> · R$ <?php echo h(number_format(((int)$p['price_full_cents'])/100, 2, ',', '.')); ?></div>
            </div>
            <div style="display:flex;gap:8px">
              <a class="btn btn-ghost is-sm" href="<?php echo ADMIN_BASE_PATH; ?>/plans.php?edit=<?php echo (int)$p['id']; ?>">Editar</a>
              <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/plans.php" onsubmit="return confirm('Remover este plano?');">
                <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?php echo (int)$p['id']; ?>">
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
