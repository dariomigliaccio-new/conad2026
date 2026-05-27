<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';

// Página intermediária removida do fluxo.
// A escolha de plano permanece em /precos.html.
redirect('/precos.html#lotes');
exit;

$pdo = db();

function money_br(int $cents): string {
    $v = $cents / 100;
    return 'R$ ' . number_format($v, 2, ',', '.');
}

$rid = (int)($_GET['rid'] ?? 0);
$reg = null;
$paymentMode = 'full';
if ($rid > 0) {
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

  if ((int)$reg['current_step'] < 3) {
    redirect('/pagamento.php?rid=' . $rid);
  }

  if (!empty($reg['plan_id'])) {
    redirect('/checkout.php?rid=' . $rid);
  }

  $paymentMode = (string)($reg['payment_mode'] ?? 'full');
  if (!in_array($paymentMode, ['full', 'installments'], true)) $paymentMode = 'full';
} else {
  // Fluxo novo: precisa ter aceitado termos antes
  if ((int)($_SESSION['conad_pre_terms_accepted'] ?? 0) !== 1) {
    redirect('/termos.php');
  }
}

$plans = $pdo->query('SELECT * FROM payment_plans WHERE is_active=1 ORDER BY sort_order ASC, id ASC LIMIT 5')->fetchAll();

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

    $planId = (int)($_POST['plan_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM payment_plans WHERE id=? AND is_active=1 LIMIT 1');
    $stmt->execute([$planId]);
    $plan = $stmt->fetch();

    if (!$plan) $errors[] = 'Selecione um plano válido.';

    if (!$errors) {
      if ($rid > 0) {
        $stmt = $pdo->prepare('UPDATE registrations SET plan_id=?, current_step=4 WHERE id=?');
        $stmt->execute([(int)$plan['id'], $rid]);
        redirect('/checkout.php?rid=' . $rid);
      }

      // Fluxo novo: salva escolha em sessão e segue para o formulário
      $_SESSION['conad_pre_plan_id'] = (int)$plan['id'];
      $_SESSION['conad_pre_plan_selected_at'] = time();
      redirect('/inscricao.php');
    }
}

?><!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Plano | Inscrição</title>
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
    <div class="container" style="max-width:980px">
      <h1 class="h2">Plano</h1>
      <p class="section-lead" style="margin-top:10px">Planos de inscrição — escolha um plano e preencha sua inscrição</p>

      <?php if ($rid > 0): ?>
        <div class="card" style="padding:12px;margin-top:14px;border-color:#e5e7eb;background:#f8fafc;color:#0f172a">
          <strong>Forma de pagamento selecionada:</strong>
          <?php echo $paymentMode === 'installments' ? 'A prazo (parcelado)' : 'À vista'; ?>
        </div>
      <?php endif; ?>

      <?php if ($errors): ?>
        <div class="card" style="padding:12px;border-color:#ffdddd;background:#fff5f5;color:#9b1c1c;margin-top:12px">
          <?php echo h(implode(' ', $errors)); ?>
        </div>
      <?php endif; ?>

      <div style="margin-top:12px">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:12px">
          <?php foreach ($plans as $p): ?>
            <div class="card" style="padding:16px;display:flex;flex-direction:column;gap:12px">
              <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap">
                <div>
                  <div style="font-weight:700"><?php echo h((string)$p['name']); ?></div>
                  <?php if (!empty($p['description'])): ?>
                    <div style="color:var(--color-muted);margin-top:6px"><?php echo h((string)$p['description']); ?></div>
                  <?php endif; ?>
                </div>
                <div style="text-align:right">
                  <div style="font-weight:700"><?php echo h(money_br((int)$p['price_full_cents'])); ?></div>
                  <?php if ((int)$p['installment_count'] > 1 && !empty($p['installment_price_cents'])): ?>
                    <div style="color:var(--color-muted);margin-top:6px;white-space:nowrap">
                      <?php echo h((string)$p['installment_count']); ?>× de <?php echo h(money_br((int)$p['installment_price_cents'])); ?>
                    </div>
                  <?php endif; ?>
                </div>
              </div>

              <?php
                $benefitsRaw = trim((string)($p['benefits_text'] ?? ''));
                $benefits = [];
                if ($benefitsRaw !== '') {
                  foreach (preg_split('/\r?\n/', $benefitsRaw) as $line) {
                    $line = trim((string)$line);
                    if ($line !== '') $benefits[] = $line;
                  }
                }
              ?>
              <?php if ($benefits): ?>
                <div>
                  <div style="font-size:13px;color:var(--color-muted);margin-bottom:8px">Benefícios</div>
                  <ul style="margin:0;padding-left:18px;color:var(--color-text)">
                    <?php foreach ($benefits as $b): ?>
                      <li style="margin:6px 0"><?php echo h($b); ?></li>
                    <?php endforeach; ?>
                  </ul>
                </div>
              <?php endif; ?>

              <div style="margin-top:auto;display:flex;gap:10px;flex-wrap:wrap">
                <form method="post" style="flex:1;min-width:160px">
                  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>" />
                  <input type="hidden" name="plan_id" value="<?php echo h((string)$p['id']); ?>" />
                  <button class="btn btn-primary" type="submit" style="width:100%">Escolher plano</button>
                </form>
              </div>
            </div>
          <?php endforeach; ?>
        </div>

        <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn btn-ghost" href="<?php echo $rid > 0 ? '/pagamento.php?rid=' . h((string)$rid) : '/termos.php'; ?>">Voltar</a>
        </div>
      </div>
    </div>
  </main>

  <script src="js/content.js"></script>
  <script src="js/site.js"></script>
</body>
</html>
