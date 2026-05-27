<?php
/**
 * Seeder de Planos - Cria planos de teste automaticamente
 * Acesso: /setup-plans.php
 */
require_once __DIR__ . '/admin/includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  ?>
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Seeder de Planos</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
      .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
      button { background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
      button:hover { background: #5568d3; }
      .error { color: #c33; background: #fee; border: 1px solid #fcc; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
      .success { color: #0a0; background: #efe; border: 1px solid #cfc; padding: 12px; border-radius: 6px; margin-bottom: 20px; }
      code { background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
    </style>
  </head>
  <body>
    <h1>🎫 Seeder de Planos</h1>
    
    <div class="card">
      <h2>Problema</h2>
      <p>O formulário de inscrição não aparece após escolher um plano porque <strong>não há planos cadastrados</strong> no banco de dados.</p>
      
      <h3>Solução</h3>
      <p>Clique no botão abaixo para criar automaticamente 3 planos de teste:</p>
      
      <form method="POST" style="margin-top: 20px;">
        <button type="submit">✅ Criar Planos de Teste</button>
      </form>
      
      <p style="margin-top: 20px; color: #666; font-size: 13px;">
        <strong>O que será criado:</strong><br>
        1. Lote 1 - R$ 497,00<br>
        2. Lote 2 - R$ 697,00<br>
        3. VIP Premium - R$ 997,00
      </p>
    </div>

    <div class="card" style="background: #f9f9f9;">
      <h3>Próximas etapas:</h3>
      <ol>
        <li>Criar os planos (clique acima)</li>
        <li>Ir para <code>/precos.html</code></li>
        <li>Escolher um plano</li>
        <li>Preencher o formulário</li>
      </ol>
    </div>
  </body>
  </html>
  <?php
  exit;
}

$pdo = db();
$error = '';
$success = false;

try {
  // Verificar se já existem planos
  $stmt = $pdo->query('SELECT COUNT(*) as total FROM payment_plans');
  $result = $stmt->fetch();
  $existingPlans = (int)($result['total'] ?? 0);

  if ($existingPlans > 0) {
    $error = "Já existem $existingPlans planos cadastrados. Não será feito nada.";
  } else {
    // Inserir planos de teste
    $plans = [
      ['lote-1', 'Lote 1', 'Primeiro lote com preço especial', 49700, 1, 10],
      ['lote-2', 'Lote 2 (Mais popular)', 'Segundo lote', 69700, 1, 20],
      ['vip', 'VIP Premium', 'Plano VIP com benefícios exclusivos', 99700, 1, 30],
    ];

    foreach ($plans as $plan) {
      $stmt = $pdo->prepare(
        'INSERT INTO payment_plans (slug, name, description, price_full_cents, is_active, sort_order) 
         VALUES (?, ?, ?, ?, 1, ?)'
      );
      $stmt->execute($plan);
    }

    $success = true;
  }
} catch (Throwable $e) {
  $error = 'Erro ao criar planos: ' . $e->getMessage();
}

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Resultado</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
    .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; }
    .error { color: #c33; background: #fee; border: 1px solid #fcc; padding: 12px; border-radius: 6px; }
    .success { color: #0a0; background: #efe; border: 1px solid #cfc; padding: 12px; border-radius: 6px; }
    a { color: #667eea; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">
    <?php if ($success): ?>
      <div class="success">
        <h2>✅ Sucesso!</h2>
        <p>3 planos de teste foram criados com sucesso!</p>
        
        <h3>Próximos passos:</h3>
        <ol>
          <li>Acesse <a href="/precos.html">/precos.html</a></li>
          <li>Você verá os 3 planos:</li>
          <ul>
            <li>Lote 1 - R$ 497,00</li>
            <li>Lote 2 - R$ 697,00</li>
            <li>VIP Premium - R$ 997,00</li>
          </ul>
          <li>Clique em "Inscrever agora" em qualquer plano</li>
          <li>O formulário de inscrição deve aparecer</li>
        </ol>
        
        <p style="margin-top: 20px;"><a href="/precos.html">→ Ir para Preços</a></p>
      </div>
    <?php else: ?>
      <div class="error">
        <h2>❌ Erro</h2>
        <p><?php echo htmlspecialchars($error); ?></p>
        <p><a href="javascript:history.back()">← Voltar</a></p>
      </div>
    <?php endif; ?>
  </div>
</body>
</html>
<?php
