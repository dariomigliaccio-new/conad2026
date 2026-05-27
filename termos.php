<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';

$pdo = db();

function conad_is_assoc_array($v): bool {
  if (!is_array($v)) return false;
  $keys = array_keys($v);
  return $keys !== range(0, count($keys) - 1);
}

function conad_deep_merge_assoc(array $base, array $override): array {
  foreach ($override as $k => $v) {
    if (is_array($v) && isset($base[$k]) && is_array($base[$k]) && conad_is_assoc_array($v) && conad_is_assoc_array($base[$k])) {
      $base[$k] = conad_deep_merge_assoc($base[$k], $v);
    } else {
      $base[$k] = $v;
    }
  }
  return $base;
}

function conad_load_public_cms_content(PDO $pdo): array {
  $defaultPath = __DIR__ . '/content/cms-default.json';
  $base = [];
  if (file_exists($defaultPath)) {
    $raw = file_get_contents($defaultPath);
    $decoded = json_decode((string)$raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) $base = $decoded;
  }

  try {
    $stmt = $pdo->prepare('SELECT setting_value FROM settings WHERE setting_key=? LIMIT 1');
    $stmt->execute(['public_cms_override_json']);
    $row = $stmt->fetch();
    $overrideRaw = (string)($row['setting_value'] ?? '');
    if (trim($overrideRaw) !== '') {
      $override = json_decode($overrideRaw, true);
      if (json_last_error() === JSON_ERROR_NONE && is_array($override)) {
        $base = conad_deep_merge_assoc($base, $override);
      }
    }
  } catch (Throwable $e) {
    // ignora; mantém default
  }

  return $base;
}

$cmsContent = conad_load_public_cms_content($pdo);
$TERMS_TITLE = (string)($cmsContent['termos']['title'] ?? 'Política de Inscrição');
$TERMS_TEXT = (string)($cmsContent['termos']['body'] ?? '');

?><!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Termos | Inscrição</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <link rel="stylesheet" href="css/site.css" />
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

  <header class="site-header" data-header>
    <div class="container header-inner">
      <div class="header-left">
        <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" data-menu-toggle>
          <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>

        <a class="brand" href="index.html" aria-label="CONAD 2026">
          <img class="brand-logo" src="favicon.svg" width="140" height="32" decoding="async" loading="eager" alt="CONAD 2026" data-cms-attr="src:global.logoSrc;alt:global.logoAlt" />
          <span class="brand-text"><span class="brand-mark" data-cms-text="global.brandMark">CONAD</span><span class="brand-year" data-cms-text="global.brandYear">2026</span></span>
        </a>
      </div>

      <nav class="nav" aria-label="Navegação principal">
        <a href="index.html">Home</a>
        <a href="precos.html">Preços</a>
        <a href="informacoes.html">Informações</a>
        <a href="preletores.html">Preletores</a>
        <a href="local.html">Local</a>
      </nav>

      <div class="header-actions">
        <a class="btn btn-primary" href="precos.html">Ver preços</a>
      </div>
    </div>

    <div class="menu-overlay" data-menu-overlay aria-hidden="true">
      <div class="menu-panel" role="dialog" aria-modal="true" aria-label="Menu" data-menu-panel>
        <nav class="menu-nav" aria-label="Navegação do menu">
          <a class="menu-link" href="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i><span>Home</span></a>
          <a class="menu-link" href="precos.html"><i class="fa-solid fa-tag" aria-hidden="true"></i><span>Preços</span></a>
          <a class="menu-link" href="informacoes.html"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Informações</span></a>
          <a class="menu-link" href="preletores.html"><i class="fa-solid fa-user-group" aria-hidden="true"></i><span>Preletores</span></a>
          <a class="menu-link" href="local.html"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>Local</span></a>
        </nav>
      </div>
    </div>
  </header>

  <main id="conteudo" class="section">
    <div class="container" style="max-width:860px">
      <h1 class="h2"><?php echo h($TERMS_TITLE); ?></h1>

      <p class="section-lead" style="margin-top:10px">Leia atentamente antes de concluir sua inscrição.</p>

      <div class="card" style="padding:16px;margin-top:14px">
        <div style="color:var(--color-muted);line-height:1.65;white-space:pre-wrap">
          <?php echo h($TERMS_TEXT); ?>
        </div>

        <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn btn-primary" href="precos.html#lotes">Ver preços</a>
          <a class="btn btn-ghost" href="inscricao.php">Ir para inscrição</a>
        </div>
      </div>
    </div>
  </main>

  <script src="js/content.js"></script>
  <script src="js/site.js"></script>
</body>
</html>
