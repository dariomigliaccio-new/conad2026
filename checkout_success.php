<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';

$rid = (int)($_GET['rid'] ?? 0);
?><!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pagamento aprovado</title>
  <link rel="stylesheet" href="css/site.css" />
</head>
<body>
  <main class="section">
    <div class="container" style="max-width:720px">
      <h1 class="h2">Pagamento aprovado</h1>
      <div class="card" style="padding:16px;margin-top:14px">
        <p style="margin:0;color:var(--color-muted)">Retorno do Stripe (placeholder). ID da inscrição: <strong><?php echo h((string)$rid); ?></strong></p>
        <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn btn-primary" href="/admin/registrations.php">Ver no admin</a>
          <a class="btn btn-ghost" href="/index.html">Ir para Home</a>
        </div>
      </div>
    </div>
  </main>
</body>
</html>
