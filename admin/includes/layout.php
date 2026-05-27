<?php
require_once __DIR__ . '/bootstrap.php';

function admin_header(string $title, array $opts = []): void {
    $hideTitle = (bool)($opts['hideTitle'] ?? false);
?><!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title><?php echo h($title); ?> | Admin</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <link rel="stylesheet" href="/css/site.css" />
</head>
<body class="is-admin">
  <header class="site-header is-scrolled" style="z-index:3000">
    <div class="container header-inner">
      <a class="brand" href="/index.html" aria-label="Voltar ao site">
        <span class="brand-text"><span class="brand-mark">CONAD</span><span class="brand-year">Admin</span></span>
      </a>
      <div class="header-actions">
        <div style="display:flex;gap:8px;align-items:center">
          <!-- Admin Language Selector -->
          <div class="lang-selector" data-admin-lang-selector style="min-width:auto">
            <button class="lang-toggle" style="padding:6px 10px;font-size:12px" aria-label="Idioma" aria-haspopup="listbox">
              <span class="lang-code" data-lang-code>PT</span>
            </button>
            <div class="lang-menu" role="listbox" style="min-width:120px">
              <button class="lang-option" data-lang="pt-BR" role="option"><span>🇧🇷 Português</span></button>
              <button class="lang-option" data-lang="en-US" role="option"><span>🇺🇸 English</span></button>
              <button class="lang-option" data-lang="es-ES" role="option"><span>🇪🇸 Español</span></button>
            </div>
          </div>

          <?php if (is_logged_in()): ?>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/dashboard.php">Dashboard</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/home.php">Home</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/plans.php">Planos</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/informacoes.php">Informações</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/preletores.php">Preletores</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/local.php">Local</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/media.php">Mídia</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/countdown.php">Countdown</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/congregations.php">Congregações</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/registrations.php">Inscrições</a>
            <a class="btn btn-ghost" href="<?php echo ADMIN_BASE_PATH; ?>/settings.php">Configurações</a>
            <a class="btn btn-primary" href="<?php echo ADMIN_BASE_PATH; ?>/logout.php">Sair</a>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </header>
  <main id="conteudo">
    <section class="section" style="padding-top: calc(var(--header-h) + 28px)">
      <div class="container">
        <?php if (!$hideTitle): ?>
          <h1 style="margin:0 0 10px 0"><?php echo h($title); ?></h1>
        <?php endif; ?>

<?php
}
