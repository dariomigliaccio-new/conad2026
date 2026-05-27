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
    $date = trim((string)($_POST['date'] ?? ''));
    $timeRaw = trim((string)($_POST['time'] ?? '09:00'));
    if ($timeRaw !== '' && strlen($timeRaw) === 5) {
      $timeRaw .= ':00';
    }
    if ($date === '') {
      $date = '2026-08-15';
    }
    if ($timeRaw === '') {
      $timeRaw = '09:00:00';
    }
    $eventIso = $date . 'T' . $timeRaw;

    $fields = [
      'countdown_enabled' => isset($_POST['enabled']) ? '1' : '0',
      'home_countdown_enabled' => isset($_POST['enabled']) ? '1' : '0',
      'countdown_date' => $date,
      'countdown_time' => $timeRaw,
      'countdown_title' => $_POST['title'] ?? '',
      'countdown_subtitle' => $_POST['subtitle'] ?? '',
      // Chaves consumidas pela Home (js/site.js via public-content.php)
      'public_event_datetime_iso' => $eventIso,
    ];

    foreach ($fields as $key => $value) {
      setting_set($pdo, $key, $value);
    }

    $ok = 'Contagem regressiva atualizada com sucesso!';
  } catch (Throwable $e) {
    $err = 'Erro: ' . $e->getMessage();
  }
}

// Carregar valores atuais
$enabled = setting_get($pdo, 'countdown_enabled', '1') === '1';
$date = setting_get($pdo, 'countdown_date', '2026-08-15');
$time = setting_get($pdo, 'countdown_time', '09:00:00');
$title = setting_get($pdo, 'countdown_title', 'Falta');
$subtitle = setting_get($pdo, 'countdown_subtitle', 'para o evento começar');

admin_header('Contagem Regressiva');
?>

<?php if ($ok): ?><div class="alert" style="background:#d4edda;border-color:#c3e6cb;color:#155724;margin-bottom:16px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="background:#f8d7da;border-color:#f5c6cb;color:#721c24;margin-bottom:16px"><?php echo h($err); ?></div><?php endif; ?>

<form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/countdown.php">
  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">

  <div class="admin-card">
    <div class="card-title">Ativar / Desativar</div>

    <div class="form-row">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" name="enabled" <?php echo $enabled ? 'checked' : ''; ?>>
        <span><strong>Exibir contagem regressiva na home</strong></span>
      </label>
      <small style="color:#666;margin-top:8px;display:block">Se desabilitado, o countdown não será exibido em nenhuma página</small>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Data e Hora</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-row">
        <label class="label">Data do evento (YYYY-MM-DD)</label>
        <input class="input" type="date" name="date" value="<?php echo h((string)$date); ?>" required>
        <small style="color:#666;margin-top:6px">Ex: 2026-08-15</small>
      </div>

      <div class="form-row">
        <label class="label">Hora (HH:MM:SS)</label>
        <input class="input" type="time" name="time" value="<?php echo substr($time, 0, 5); ?>" required>
        <small style="color:#666;margin-top:6px">Ex: 09:00</small>
      </div>
    </div>

    <div style="margin-top:12px;padding:12px;background:#f0f0f0;border-radius:6px">
      <p style="margin:0;font-size:13px;color:#666">
        <strong>Data/hora combinada:</strong> <?php echo h($date); ?> às <?php echo h(substr($time, 0, 5)); ?>
      </p>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Textos do Countdown</div>

    <div class="form-row">
      <label class="label">Título do countdown</label>
      <input class="input" type="text" name="title" value="<?php echo h((string)$title); ?>" placeholder="Ex: Falta">
    </div>

    <div class="form-row">
      <label class="label">Subtítulo do countdown</label>
      <input class="input" type="text" name="subtitle" value="<?php echo h((string)$subtitle); ?>" placeholder="Ex: para o evento começar">
    </div>

    <div style="margin-top:12px;padding:12px;background:#f0f0f0;border-radius:6px">
      <p style="margin:0;font-size:13px;color:#666">
        <strong>Preview:</strong> <?php echo h($title); ?> <span style="font-weight:bold">10 dias 5 horas 30 minutos 45 segundos</span> <?php echo h($subtitle); ?>
      </p>
    </div>
  </div>

  <div style="display:flex;gap:10px;margin-top:20px">
    <button class="btn btn-primary" type="submit">Salvar configurações</button>
  </div>
</form>

<?php require_once __DIR__ . '/includes/layout-footer.php';
