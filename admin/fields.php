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

function normalize_json(?string $s): ?string {
  $s = trim((string)$s);
  if ($s === '') return null;
  json_decode($s, true);
  if (json_last_error() !== JSON_ERROR_NONE) {
    throw new RuntimeException('options_json inválido: JSON malformado.');
  }
  return $s;
}

$types = ['text','email','tel','select','textarea','checkbox'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  $action = (string)($_POST['action'] ?? '');

  try {
    if ($action === 'save') {
      $id = to_int($_POST['id'] ?? 0, 0);
      $key = trim((string)($_POST['field_key'] ?? ''));
      $label = trim((string)($_POST['label'] ?? ''));
      $type = (string)($_POST['field_type'] ?? 'text');
      $required = isset($_POST['is_required']) ? 1 : 0;
      $active = isset($_POST['is_active']) ? 1 : 0;
      $sortOrder = to_int($_POST['sort_order'] ?? 0, 0);
      $optionsJson = normalize_json($_POST['options_json'] ?? null);

      if ($key === '' || $label === '') throw new RuntimeException('field_key e label são obrigatórios.');
      if (!in_array($type, $types, true)) throw new RuntimeException('field_type inválido.');

      if ($id > 0) {
        $stmt = $pdo->prepare('UPDATE form_fields SET field_key=?, label=?, field_type=?, is_required=?, options_json=?, sort_order=?, is_active=? WHERE id=?');
        $stmt->execute([$key, $label, $type, $required, $optionsJson, $sortOrder, $active, $id]);
        $ok = 'Campo atualizado.';
      } else {
        $stmt = $pdo->prepare('INSERT INTO form_fields (field_key, label, field_type, is_required, options_json, sort_order, is_active) VALUES (?,?,?,?,?,?,?)');
        $stmt->execute([$key, $label, $type, $required, $optionsJson, $sortOrder, $active]);
        $ok = 'Campo criado.';
      }
    } elseif ($action === 'delete') {
      $id = to_int($_POST['id'] ?? 0, 0);
      if ($id <= 0) throw new RuntimeException('ID inválido.');
      $stmt = $pdo->prepare('DELETE FROM form_fields WHERE id=?');
      $stmt->execute([$id]);
      $ok = 'Campo removido.';
    }
  } catch (Throwable $e) {
    $err = $e->getMessage();
  }
}

$rows = $pdo->query('SELECT * FROM form_fields ORDER BY sort_order ASC, id DESC')->fetchAll();

$editId = isset($_GET['edit']) ? (int)$_GET['edit'] : 0;
$editing = null;
if ($editId > 0) {
  $stmt = $pdo->prepare('SELECT * FROM form_fields WHERE id=?');
  $stmt->execute([$editId]);
  $row = $stmt->fetch();
  if (is_array($row)) $editing = $row;
}

admin_header('Campos do Formulário');
?>

<div style="margin-bottom:14px;padding:10px 12px;background:#e7f3ff;border-left:3px solid #2196F3;color:#0c5aa0;font-size:13px">
  <strong>O que é isso?</strong> Aqui você define quais campos aparecem no formulário de inscrição (nome, email, phone, etc). Ative/desative, reordene ou edite os campos.
</div>

<?php
?>

<?php if ($ok): ?><div class="alert" style="margin-bottom:12px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="margin-bottom:12px"><?php echo h($err); ?></div><?php endif; ?>

<div class="admin-grid-2" style="align-items:start">
  <div class="admin-card">
    <div class="card-title"><?php echo $editing ? 'Editar campo' : 'Novo campo'; ?></div>
    <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/fields.php">
      <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
      <input type="hidden" name="action" value="save">
      <input type="hidden" name="id" value="<?php echo h((string)($editing['id'] ?? 0)); ?>">

      <div class="form-row">
        <label class="label">field_key</label>
        <input class="input" name="field_key" required value="<?php echo h((string)($editing['field_key'] ?? '')); ?>">
      </div>

      <div class="form-row">
        <label class="label">Label</label>
        <input class="input" name="label" required value="<?php echo h((string)($editing['label'] ?? '')); ?>">
      </div>

      <div class="admin-grid-2">
        <div class="form-row">
          <label class="label">Tipo</label>
          <select class="input" name="field_type">
            <?php foreach ($types as $t): ?>
              <option value="<?php echo h($t); ?>" <?php echo ((string)($editing['field_type'] ?? 'text') === $t) ? 'selected' : ''; ?>><?php echo h($t); ?></option>
            <?php endforeach; ?>
          </select>
        </div>
        <div class="form-row">
          <label class="label">Ordem</label>
          <input class="input" name="sort_order" type="number" value="<?php echo h((string)($editing['sort_order'] ?? 0)); ?>">
        </div>
      </div>

      <div class="form-row">
        <label class="label">options_json (opcional)</label>
        <textarea class="textarea" name="options_json" rows="4" placeholder='["Opção 1","Opção 2"]'><?php echo h((string)($editing['options_json'] ?? '')); ?></textarea>
      </div>

      <div style="display:flex;gap:14px;align-items:center;margin-top:8px;flex-wrap:wrap">
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="is_required" <?php echo ((int)($editing['is_required'] ?? 0) === 1) ? 'checked' : ''; ?>> Obrigatório</label>
        <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="is_active" <?php echo ((int)($editing['is_active'] ?? 1) === 1) ? 'checked' : ''; ?>> Ativo</label>
      </div>

      <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
        <button class="btn btn-primary" type="submit">Salvar</button>
        <?php if ($editing): ?>
          <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/fields.php">Cancelar</a>
        <?php endif; ?>
      </div>
    </form>
  </div>

  <div class="admin-card">
    <div class="card-title">Lista</div>
    <?php if (!$rows): ?>
      <div style="color:var(--color-muted)">Nenhum campo.</div>
    <?php else: ?>
      <div class="admin-list">
        <?php foreach ($rows as $r): ?>
          <div class="item">
            <div>
              <div style="font-weight:600"><?php echo h((string)$r['label']); ?> <?php echo ((int)$r['is_active'] === 1) ? '' : '<span style="color:var(--color-muted)">(inativo)</span>'; ?></div>
              <div class="meta"><?php echo h((string)$r['field_key']); ?> · <?php echo h((string)$r['field_type']); ?> <?php echo ((int)$r['is_required'] === 1) ? '· obrigatório' : ''; ?></div>
            </div>
            <div style="display:flex;gap:8px">
              <a class="btn btn-ghost is-sm" href="<?php echo ADMIN_BASE_PATH; ?>/fields.php?edit=<?php echo (int)$r['id']; ?>">Editar</a>
              <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/fields.php" onsubmit="return confirm('Remover este campo?');">
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
