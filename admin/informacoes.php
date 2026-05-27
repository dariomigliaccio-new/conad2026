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
    $fields = [
      'info_overview' => $_POST['overview'] ?? '',
      'info_general_details' => $_POST['general_details'] ?? '',
      'info_rules' => $_POST['rules'] ?? '',
      'info_notes' => $_POST['notes'] ?? '',
    ];

    foreach ($fields as $key => $value) {
      setting_set($pdo, $key, $value);
    }

    $ok = 'Informações atualizada com sucesso!';
  } catch (Throwable $e) {
    $err = 'Erro: ' . $e->getMessage();
  }
}

// Carregar valores atuais
$overview = setting_get($pdo, 'info_overview', '');
$general_details = setting_get($pdo, 'info_general_details', '');
$rules = setting_get($pdo, 'info_rules', '');
$notes = setting_get($pdo, 'info_notes', '');

admin_header('Informações do Evento');
?>

<?php if ($ok): ?><div class="alert" style="background:#d4edda;border-color:#c3e6cb;color:#155724;margin-bottom:16px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="background:#f8d7da;border-color:#f5c6cb;color:#721c24;margin-bottom:16px"><?php echo h($err); ?></div><?php endif; ?>

<form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/informacoes.php">
  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">

  <div class="admin-card">
    <div class="card-title">Visão Geral do Evento</div>

    <div class="form-row">
      <label class="label">Texto introdutório</label>
      <textarea class="textarea" name="overview" rows="4" placeholder="Texto que aparece na página de informações, explicando o evento..."><?php echo h((string)$overview); ?></textarea>
      <small style="color:#666;margin-top:6px">Este texto aparecerá no topo da página de informações</small>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Detalhes Gerais</div>

    <div class="form-row">
      <label class="label">Informações gerais do evento</label>
      <textarea class="textarea" name="general_details" rows="5" placeholder="Datas, duração, horários, estrutura do evento, etc..."><?php echo h((string)$general_details); ?></textarea>
      <small style="color:#666;margin-top:6px">Informações sobre quando, quanto tempo dura, horários, estrutura das atividades, etc.</small>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Regras e Política</div>

    <div class="form-row">
      <label class="label">Regras do evento</label>
      <textarea class="textarea" name="rules" rows="5" placeholder="Lista de regras, políticas de cancelamento, reembolso, etc..."><?php echo h((string)$rules); ?></textarea>
      <small style="color:#666;margin-top:6px">Políticas de comportamento, dress code, cancelamento, reembolso, etc.</small>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Observações Importantes ⚠️</div>

    <div class="form-row">
      <label class="label">Observações / Avisos</label>
      <textarea class="textarea" name="notes" rows="5" placeholder="Qualquer informação importante que participantes precisam saber..."><?php echo h((string)$notes); ?></textarea>
      <small style="color:#666;margin-top:6px">Este campo será exibido com destaque como "Observações Importantes"</small>
    </div>
  </div>

  <div style="display:flex;gap:10px;margin-top:20px">
    <button class="btn btn-primary" type="submit">Salvar informações</button>
  </div>
</form>

<?php require_once __DIR__ . '/includes/layout-footer.php';
