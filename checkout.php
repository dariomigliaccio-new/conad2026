<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';

$pdo = db();

function money_br(int $cents): string {
    $v = $cents / 100;
    return 'R$ ' . number_format($v, 2, ',', '.');
}

function get_setting(string $key, string $default = ''): string {
    $pdo = db();
    $stmt = $pdo->prepare('SELECT setting_value FROM settings WHERE setting_key=? LIMIT 1');
    $stmt->execute([$key]);
    $v = $stmt->fetchColumn();
    return $v === false || $v === null ? $default : (string)$v;
}

$rid = (int)($_GET['rid'] ?? 0);
if ($rid <= 0) {
    http_response_code(400);
    echo 'Parâmetro inválido.';
    exit;
}

$stmt = $pdo->prepare('SELECT r.*, p.slug AS plan_slug, p.name AS plan_name, p.price_full_cents, p.installment_count, p.installment_price_cents FROM registrations r LEFT JOIN payment_plans p ON p.id = r.plan_id WHERE r.id=? LIMIT 1');
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

if (empty($reg['plan_id'])) {
  redirect('/plano.php?rid=' . $rid);
}

// Atualiza etapa de forma idempotente (Step 5)
if ((int)$reg['current_step'] < 5) {
  $stmt = $pdo->prepare('UPDATE registrations SET current_step=5 WHERE id=?');
    $stmt->execute([$rid]);
}

$paymentMode = (string)$reg['payment_mode'];
$planName = (string)($reg['plan_name'] ?? '');
$planSlug = (string)($reg['plan_slug'] ?? '');

$displayPrice = money_br((int)$reg['price_full_cents']);
$installmentLabel = null;
if ($paymentMode === 'installments' && (int)$reg['installment_count'] > 1 && !empty($reg['installment_price_cents'])) {
    $installmentLabel = (int)$reg['installment_count'] . '× de ' . money_br((int)$reg['installment_price_cents']);
}

// Stripe (futuro): se habilitado e biblioteca instalada, cria Checkout Session e redireciona.
$stripeEnabled = get_setting('stripe_enabled', '0') === '1';
$stripeMode = get_setting('stripe_mode', 'test');
if (!in_array($stripeMode, ['test', 'live'], true)) $stripeMode = 'test';

$stripeSecret = $stripeMode === 'live'
    ? get_setting('stripe_secret_live', '')
    : get_setting('stripe_secret_test', '');

if ($stripeEnabled && $stripeSecret !== '' && file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';

    if (class_exists('Stripe\\Stripe') && class_exists('Stripe\\Checkout\\Session')) {
        \Stripe\Stripe::setApiKey($stripeSecret);

        $successUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/checkout_success.php?rid=' . $rid;
        $cancelUrl = (isset($_SERVER['HTTPS']) ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/checkout_cancel.php?rid=' . $rid;

        // TODO: mapear amount/line_items corretamente quando Stripe for ativado.
        // Por enquanto, cria uma sessão mínima baseada no preço à vista.
        $amountCents = (int)$reg['price_full_cents'];

        $session = \Stripe\Checkout\Session::create([
            'mode' => 'payment',
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'metadata' => [
                'registration_id' => (string)$rid,
                'plan_slug' => $planSlug,
                'payment_mode' => $paymentMode,
            ],
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => 'brl',
                    'unit_amount' => $amountCents,
                    'product_data' => [
                        'name' => $planName,
                    ],
                ],
            ]],
        ]);

        $stmt = $pdo->prepare('UPDATE registrations SET stripe_checkout_session_id=? WHERE id=?');
        $stmt->execute([(string)$session->id, $rid]);

        header('Location: ' . $session->url);
        exit;
    }
}

?><!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Checkout | Inscrição</title>
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
          <img class="brand-logo" src="images/novo-logo.png" width="140" height="32" decoding="async" loading="eager" alt="CONAD 2026" data-cms-attr="src:global.logoSrc;alt:global.logoAlt" />
          <span class="brand-text"><span class="brand-mark" data-cms-text="global.brandMark">CONAD</span><span class="brand-year" data-cms-text="global.brandYear">2026</span></span>
        </a>
      </div>

      <nav class="nav" aria-label="Navegação principal">
        <a href="index.html">Home</a>
        <a href="precos.html">Preços</a>
        <a href="informacoes.html">Informações</a>
        <a href="preletores.html">Preletores</a>
        <a href="local.php">Local</a>
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
          <a class="menu-link" href="local.php"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>Local</span></a>
        </nav>
      </div>
    </div>
  </header>

  <main id="conteudo" class="section">
    <div class="container" style="max-width:860px">
      <h1 class="h2">Checkout</h1>
      <p class="section-lead" style="margin-top:10px">Passo 5 de 5 — Stripe Checkout</p>

      <div class="card" style="padding:16px;margin-top:14px">
        <div style="font-weight:700;margin-bottom:10px">Resumo</div>
        <div style="display:grid;grid-template-columns:1fr;gap:10px">
          <div>
            <div style="font-size:13px;color:var(--color-muted)">Plano</div>
            <div style="font-weight:600"><?php echo h($planName); ?></div>
          </div>
          <div>
            <div style="font-size:13px;color:var(--color-muted)">Pagamento</div>
            <div style="font-weight:600"><?php echo $paymentMode === 'installments' ? 'A prazo (parcelado)' : 'À vista'; ?></div>
          </div>
          <div>
            <div style="font-size:13px;color:var(--color-muted)">Valor</div>
            <div style="font-weight:600"><?php echo h($installmentLabel ?? $displayPrice); ?></div>
          </div>
        </div>

        <div class="card" style="padding:12px;margin-top:14px;border-color:#fff0c2;background:#fffbe6;color:#92400e">
          Stripe ainda não está ativo neste ambiente. Assim que for habilitado, esta etapa redirecionará automaticamente para o Stripe Checkout.
        </div>

        <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn btn-primary" href="/pagamento.php?rid=<?php echo h((string)$rid); ?>">Voltar e alterar</a>
          <a class="btn btn-ghost" href="/admin/registrations.php">Ver no admin</a>
        </div>
      </div>

      <?php if ($stripeEnabled && $stripeSecret !== '' && !file_exists(__DIR__ . '/vendor/autoload.php')): ?>
        <div class="card" style="padding:12px;margin-top:12px;border-color:#ffdddd;background:#fff5f5;color:#9b1c1c">
          Stripe está habilitado nas configurações, mas a biblioteca PHP não foi encontrada. Para ativar, instale <code>stripe/stripe-php</code> via Composer (pasta <code>vendor/</code>).
        </div>
      <?php endif; ?>

    </div>
  </main>

  <script src="js/content.js"></script>
  <script src="js/site.js"></script>
</body>
</html>
