<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$pdo = db();
$err = '';
$ok = '';

// Carregar dados do CMS default
$cmsPath = __DIR__ . '/../content/cms-default.json';
$cms = file_exists($cmsPath) ? json_decode(file_get_contents($cmsPath), true) ?: [] : [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  $action = (string)($_POST['action'] ?? '');

  try {
    if ($action === 'save_home') {
      // Salvar cada campo individual como setting
      $fields = [
        'home_hero_title' => $_POST['hero_title'] ?? '',
        'home_hero_subtitle' => $_POST['hero_subtitle'] ?? '',
        'home_hero_button_text' => $_POST['hero_button_text'] ?? '',
        'home_hero_button_url' => $_POST['hero_button_url'] ?? '',
        'home_section1_title' => $_POST['section1_title'] ?? '',
        'home_section1_subtitle' => $_POST['section1_subtitle'] ?? '',
        'home_section2_title' => $_POST['section2_title'] ?? '',
        'home_section2_subtitle' => $_POST['section2_subtitle'] ?? '',
        'home_countdown_enabled' => isset($_POST['countdown_enabled']) ? '1' : '0',
      ];

      foreach ($fields as $key => $value) {
        setting_set($pdo, $key, $value);
      }

      $ok = 'Página inicial atualizada com sucesso!';
    }
  } catch (Throwable $e) {
    $err = 'Erro: ' . $e->getMessage();
  }
}

// Carregar valores atuais
$hero_title = setting_get($pdo, 'home_hero_title', $cms['hero']['title'] ?? 'Conferência Nacional');
$hero_subtitle = setting_get($pdo, 'home_hero_subtitle', $cms['hero']['subtitle'] ?? '');
$hero_button_text = setting_get($pdo, 'home_hero_button_text', 'Inscrever-se');
$hero_button_url = setting_get($pdo, 'home_hero_button_url', 'precos.html');
$section1_title = setting_get($pdo, 'home_section1_title', '');
$section1_subtitle = setting_get($pdo, 'home_section1_subtitle', '');
$section2_title = setting_get($pdo, 'home_section2_title', '');
$section2_subtitle = setting_get($pdo, 'home_section2_subtitle', '');
$countdown_enabled = setting_get($pdo, 'home_countdown_enabled', '1') === '1';

admin_header('Página Inicial (Home)');
?>

<?php if ($ok): ?><div class="alert" style="background:#d4edda;border-color:#c3e6cb;color:#155724;margin-bottom:16px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="background:#f8d7da;border-color:#f5c6cb;color:#721c24;margin-bottom:16px"><?php echo h($err); ?></div><?php endif; ?>

<form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/home.php">
  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
  <input type="hidden" name="action" value="save_home">

  <div class="admin-card">
    <div class="card-title">Seção Hero (Destaque Principal)</div>

    <div class="form-row">
      <label class="label">Título principal</label>
      <input class="input" type="text" name="hero_title" value="<?php echo h((string)$hero_title); ?>" placeholder="Ex: Conferência Nacional">
    </div>

    <div class="form-row">
      <label class="label">Subtítulo</label>
      <textarea class="textarea" name="hero_subtitle" rows="2" placeholder="Ex: Junte-se a nós para um evento transformador"><?php echo h((string)$hero_subtitle); ?></textarea>
    </div>

    <div class="form-row">
      <label class="label">Texto do botão CTA</label>
      <input class="input" type="text" name="hero_button_text" value="<?php echo h((string)$hero_button_text); ?>" placeholder="Ex: Inscrever-se">
    </div>

    <div class="form-row">
      <label class="label">Link do botão CTA</label>
      <input class="input" type="text" name="hero_button_url" value="<?php echo h((string)$hero_button_url); ?>" placeholder="Ex: precos.html">
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Seção 1 (Depois do Hero)</div>

    <div class="form-row">
      <label class="label">Título</label>
      <input class="input" type="text" name="section1_title" value="<?php echo h((string)$section1_title); ?>" placeholder="Título da seção 1">
    </div>

    <div class="form-row">
      <label class="label">Descrição</label>
      <textarea class="textarea" name="section1_subtitle" rows="3" placeholder="Descrição ou texto da seção"><?php echo h((string)$section1_subtitle); ?></textarea>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Seção 2</div>

    <div class="form-row">
      <label class="label">Título</label>
      <input class="input" type="text" name="section2_title" value="<?php echo h((string)$section2_title); ?>" placeholder="Título da seção 2">
    </div>

    <div class="form-row">
      <label class="label">Descrição</label>
      <textarea class="textarea" name="section2_subtitle" rows="3" placeholder="Descrição ou texto da seção"><?php echo h((string)$section2_subtitle); ?></textarea>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Contagem Regressiva</div>

    <div class="form-row">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" name="countdown_enabled" <?php echo $countdown_enabled ? 'checked' : ''; ?>>
        <span>Ativar contagem regressiva na home</span>
      </label>
    </div>
  </div>

  <div style="display:flex;gap:10px;margin-top:20px">
    <button class="btn btn-primary" type="submit">Salvar página inicial</button>
  </div>
</form>

<?php require_once __DIR__ . '/includes/layout-footer.php';
