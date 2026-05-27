<?php
require_once __DIR__ . '/includes/bootstrap.php';

if (is_logged_in()) {
  header('Location: ' . ADMIN_BASE_PATH . '/dashboard.php');
  exit;
}

$err = '';
$email = '';

// Gera CSRF token antes de qualquer output
$token = csrf_token();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();

  $email = trim((string)($_POST['email'] ?? ''));
  $password = (string)($_POST['password'] ?? '');

  if ($email === '' || $password === '') {
    $err = 'Informe usuário/e-mail e senha.';
  } else {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, password_hash FROM admins WHERE email=? LIMIT 1');
    $stmt->execute([$email]);
    $row = $stmt->fetch();

    // Permite login curto (ex: conad2026) mapeando para conad2026@conad.local.
    if ((!is_array($row) || !isset($row['id'], $row['password_hash'])) && !str_contains($email, '@')) {
      $stmt->execute([$email . '@conad.local']);
      $row = $stmt->fetch();
    }

    if (is_array($row) && isset($row['id'], $row['password_hash']) && password_verify($password, (string)$row['password_hash'])) {
      $_SESSION['admin_id'] = (int)$row['id'];
      session_regenerate_id(true);
      header('Location: ' . ADMIN_BASE_PATH . '/dashboard.php');
      exit;
    }

    $err = 'Login inválido.';
  }
}

require_once __DIR__ . '/includes/layout.php';
admin_header('Login', ['hideTitle' => true]);
?>

<div class="card" style="max-width:520px;margin:0 auto">
  <h2 style="margin:0 0 12px 0">Acesso do Admin</h2>

  <?php if ($err !== ''): ?>
    <div class="alert" style="margin-bottom:12px"><?php echo h($err); ?></div>
  <?php endif; ?>

  <form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/index.php">
    <input type="hidden" name="_csrf" value="<?php echo h($token); ?>">

    <div class="form-row">
      <label class="label" for="email">Usuário ou e-mail</label>
      <input class="input" id="email" name="email" type="text" autocomplete="username" required value="<?php echo h($email); ?>">
    </div>

    <div class="form-row">
      <label class="label" for="password">Senha</label>
      <input class="input" id="password" name="password" type="password" required>
    </div>

    <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
      <button class="btn btn-primary" type="submit">Entrar</button>
      <a class="btn btn-ghost" href="/index.html">Voltar ao site</a>
    </div>
  </form>

  <div style="margin-top:12px;color:var(--color-muted);font-size:13px">
    Se for o primeiro acesso, crie um admin via banco (tabela <code>admins</code>) ou use o <code>setup.php</code> do admin legado.
  </div>
</div>

<?php
require_once __DIR__ . '/includes/layout-footer.php';
