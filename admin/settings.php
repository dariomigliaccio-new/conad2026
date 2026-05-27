<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$pdo = db();

$err = '';
$ok = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  try {
    $keys = [
      'stripe_enabled',
      'stripe_mode',
      'stripe_publishable_test',
      'stripe_secret_test',
      'stripe_publishable_live',
      'stripe_secret_live',
      'banner_home_desktop',
      'banner_home_mobile',
      'logo_desktop',
      'logo_mobile',
      'countdown_date',
      'countdown_time',
    ];

    foreach ($keys as $k) {
      $v = isset($_POST[$k]) ? (string)$_POST[$k] : '';
      setting_set($pdo, $k, $v);
    }
    $ok = 'Configurações salvas com sucesso!';
  } catch (Throwable $e) {
    $err = $e->getMessage();
  }
}

$stripe_enabled = setting_get($pdo, 'stripe_enabled', '');
$stripe_mode = setting_get($pdo, 'stripe_mode', '');
$stripe_publishable_test = setting_get($pdo, 'stripe_publishable_test', '');
$stripe_secret_test = setting_get($pdo, 'stripe_secret_test', '');
$stripe_publishable_live = setting_get($pdo, 'stripe_publishable_live', '');
$stripe_secret_live = setting_get($pdo, 'stripe_secret_live', '');
$banner_home_desktop = setting_get($pdo, 'banner_home_desktop', '');
$banner_home_mobile = setting_get($pdo, 'banner_home_mobile', '');
$logo_desktop = setting_get($pdo, 'logo_desktop', '');
$logo_mobile = setting_get($pdo, 'logo_mobile', '');
$countdown_date = setting_get($pdo, 'countdown_date', '2026-08-15');
$countdown_time = setting_get($pdo, 'countdown_time', '09:00:00');

admin_header('Configurações');
?>

<?php if ($ok): ?><div class="alert" style="background:#d4edda;border-color:#c3e6cb;color:#155724;margin-bottom:16px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="background:#f8d7da;border-color:#f5c6cb;color:#721c24;margin-bottom:16px"><?php echo h($err); ?></div><?php endif; ?>

<form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/settings.php">
  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">

  <div class="admin-card">
    <div class="card-title">Stripe (Pagamentos)</div>

    <div class="admin-grid-2">
      <div class="form-row">
        <label class="label">stripe_enabled (0/1)</label>
        <input class="input" name="stripe_enabled" value="<?php echo h((string)$stripe_enabled); ?>">
      </div>
      <div class="form-row">
        <label class="label">stripe_mode (test/live)</label>
        <input class="input" name="stripe_mode" value="<?php echo h((string)$stripe_mode); ?>">
      </div>
    </div>

    <div class="admin-grid-2">
      <div class="form-row">
        <label class="label">stripe_publishable_test</label>
        <input class="input" name="stripe_publishable_test" value="<?php echo h((string)$stripe_publishable_test); ?>">
      </div>
      <div class="form-row">
        <label class="label">stripe_secret_test</label>
        <input class="input" name="stripe_secret_test" value="<?php echo h((string)$stripe_secret_test); ?>">
      </div>
    </div>

    <div class="admin-grid-2">
      <div class="form-row">
        <label class="label">stripe_publishable_live</label>
        <input class="input" name="stripe_publishable_live" value="<?php echo h((string)$stripe_publishable_live); ?>">
      </div>
      <div class="form-row">
        <label class="label">stripe_secret_live</label>
        <input class="input" name="stripe_secret_live" value="<?php echo h((string)$stripe_secret_live); ?>">
      </div>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Imagens (Banners e Logos)</div>

    <div style="margin-bottom:20px;padding:12px;background:#e3f2fd;border-radius:6px;border-left:4px solid #2196f3">
      <p style="margin:0;font-weight:600;margin-bottom:8px">📏 Dimensões Recomendadas:</p>
      <ul style="margin:0;padding-left:20px;font-size:13px;color:#555">
        <li><strong>Banner Desktop:</strong> 1920 × 1080 px (16:9)</li>
        <li><strong>Banner Mobile:</strong> 1080 × 1350 px (4:5)</li>
        <li><strong>Logo Desktop:</strong> 320 × 80 px (apenas símbolo/marca, sem texto)</li>
        <li><strong>Logo Mobile:</strong> 200 × 200 px (quadrado, apenas símbolo/marca)</li>
      </ul>
    </div>

    <div class="form-row">
      <label class="label">📱 Banner Home (Desktop - 1920×1080)</label>
      <input class="input" type="text" name="banner_home_desktop" value="<?php echo h((string)$banner_home_desktop); ?>" placeholder="/uploads/banner-desktop.jpg">
      <?php if (!empty($banner_home_desktop)): ?>
        <div style="margin-top:8px"><img src="<?php echo h($banner_home_desktop); ?>" style="max-width:300px;border-radius:4px" alt="Banner desktop"></div>
      <?php endif; ?>
    </div>

    <div class="form-row">
      <label class="label">📱 Banner Home (Mobile - 1080×1350)</label>
      <input class="input" type="text" name="banner_home_mobile" value="<?php echo h((string)$banner_home_mobile); ?>" placeholder="/uploads/banner-mobile.jpg">
      <?php if (!empty($banner_home_mobile)): ?>
        <div style="margin-top:8px"><img src="<?php echo h($banner_home_mobile); ?>" style="max-width:200px;border-radius:4px" alt="Banner mobile"></div>
      <?php endif; ?>
    </div>

    <div class="form-row">
      <label class="label">🖼️ Logo (Desktop - 320×80)</label>
      <input class="input" type="text" name="logo_desktop" value="<?php echo h((string)$logo_desktop); ?>" placeholder="/uploads/logo-desktop.png">
      <?php if (!empty($logo_desktop)): ?>
        <div style="margin-top:8px"><img src="<?php echo h($logo_desktop); ?>" style="max-width:200px;border-radius:4px" alt="Logo desktop"></div>
      <?php endif; ?>
      <small style="color:#666;margin-top:6px">⚠️ Apenas símbolo/marca (sem texto)</small>
    </div>

    <div class="form-row">
      <label class="label">🖼️ Logo (Mobile - 200×200, quadrado)</label>
      <input class="input" type="text" name="logo_mobile" value="<?php echo h((string)$logo_mobile); ?>" placeholder="/uploads/logo-mobile.png">
      <?php if (!empty($logo_mobile)): ?>
        <div style="margin-top:8px"><img src="<?php echo h($logo_mobile); ?>" style="max-width:150px;border-radius:4px" alt="Logo mobile"></div>
      <?php endif; ?>
      <small style="color:#666;margin-top:6px">⚠️ Quadrado (200×200), apenas símbolo/marca (sem texto)</small>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Contagem Regressiva</div>

    <div class="form-row">
      <label class="label">Data (formato: YYYY-MM-DD)</label>
      <input class="input" type="date" name="countdown_date" value="<?php echo h((string)$countdown_date); ?>">
    </div>

    <div class="form-row">
      <label class="label">Hora (formato: HH:MM:SS)</label>
      <input class="input" type="time" name="countdown_time" value="<?php echo substr($countdown_time, 0, 5); ?>">
    </div>
  </div>

  <div style="display:flex;gap:10px;margin-top:20px">
    <button class="btn btn-primary" type="submit">Salvar configurações</button>
  </div>
</form>

<?php require_once __DIR__ . '/includes/layout-footer.php';
