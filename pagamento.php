<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';

$pdo = db();

function money_br(int $cents): string {
    $v = $cents / 100;
    return 'R$ ' . number_format($v, 2, ',', '.');
}

$rid = (int)($_GET['rid'] ?? 0);
if ($rid <= 0) {
    http_response_code(400);
    echo 'Parâmetro inválido.';
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM registrations WHERE id=? LIMIT 1');
$stmt->execute([$rid]);
$reg = $stmt->fetch();

if (!$reg) {
    http_response_code(404);
    echo 'Inscrição não encontrada.';
    exit;
}

if ((int)$reg['terms_accepted'] !== 1) {
    redirect('/termos.php?rid=' . $rid);
}

if (!empty($reg['plan_id'])) {
  redirect('/checkout.php?rid=' . $rid);
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $paymentMode = (string)($_POST['payment_mode'] ?? 'full');
    if (!in_array($paymentMode, ['full', 'installments'], true)) $paymentMode = 'full';

    if (!$errors) {
    $stmt = $pdo->prepare('UPDATE registrations SET payment_mode=?, current_step=3 WHERE id=?');
    $stmt->execute([$paymentMode, $rid]);
    redirect('/plano.php?rid=' . $rid);
    }
}

?><!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pagamento | Inscrição</title>
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
    <div class="container" style="max-width:980px">
      <h1 class="h2">Pagamento</h1>
      <p class="section-lead" style="margin-top:10px">Passo 3 de 5 — Forma de pagamento</p>

      <?php if ($errors): ?>
        <div class="card" style="padding:12px;border-color:#ffdddd;background:#fff5f5;color:#9b1c1c;margin-top:14px">
          <?php echo h(implode(' ', $errors)); ?>
        </div>
      <?php endif; ?>

      <div class="card" style="padding:16px;margin-top:14px">
        <form method="post">
          <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>" />

          <div style="font-weight:600;margin-bottom:10px">Forma de pagamento</div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:14px">
            <label style="display:flex;align-items:center;gap:10px">
              <input type="radio" name="payment_mode" value="full" <?php echo ((string)($reg['payment_mode'] ?? 'full') === 'full') ? 'checked' : ''; ?> />
              <span>À vista</span>
            </label>
            <label style="display:flex;align-items:center;gap:10px">
              <input type="radio" name="payment_mode" value="installments" <?php echo ((string)($reg['payment_mode'] ?? '') === 'installments') ? 'checked' : ''; ?> />
              <span>A prazo (parcelado)</span>
            </label>
          </div>

          <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary" type="submit">Continuar</button>
            <a class="btn btn-ghost" href="/termos.php?rid=<?php echo h((string)$rid); ?>">Voltar</a>
          </div>
        </form>
      </div>
    </div>
  </main>

  <script src="js/content.js"></script>
  <script src="js/site.js"></script>
</body>
</html>
