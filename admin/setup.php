<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';

$pdo = db();

$err = '';
$ok = '';

$count = (int)$pdo->query('SELECT COUNT(*) FROM admins')->fetchColumn();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();

  try {
    if ($count > 0) {
      throw new RuntimeException('Já existe admin cadastrado.');
    }

    $email = trim((string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');

    if ($email === '' || $password === '') {
      throw new RuntimeException('Informe e-mail e senha.');
    }

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)');
    $stmt->execute([$email, $hash]);

    $ok = 'Admin criado. Faça login.';
  } catch (Throwable $e) {
    $err = $e->getMessage();
  }
}

admin_header('Setup do Admin');
?>

<?php if ($ok): ?><div class="alert" style="margin-bottom:12px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="margin-bottom:12px"><?php echo h($err); ?></div><?php endif; ?>

<div class="admin-card" style="max-width:640px">
  <div class="card-title">Criar primeiro admin</div>

  <?php if ($count > 0): ?>
    <div style="color:var(--color-muted)">Já existe admin no banco. Use <a href="<?php echo ADMIN_BASE_PATH; ?>/index.php">login</a>.</div>
  <?php else: ?>
    <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/setup.php">
      <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">

      <div class="form-row">
        <label class="label">E-mail</label>
        <input class="input" type="email" name="email" required>
      </div>

      <div class="form-row">
        <label class="label">Senha</label>
        <input class="input" type="password" name="password" required>
      </div>

      <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
        <button class="btn btn-primary" type="submit">Criar admin</button>
        <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/index.php">Ir pro login</a>
      </div>
    </form>
  <?php endif; ?>
</div>

<?php require_once __DIR__ . '/includes/layout-footer.php';
