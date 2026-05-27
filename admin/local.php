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
      'event_location' => $_POST['event_location'] ?? '',
      'event_address' => $_POST['event_address'] ?? '',
      'event_city' => $_POST['event_city'] ?? '',
      'event_state' => $_POST['event_state'] ?? '',
      'event_country' => $_POST['event_country'] ?? 'Brasil',
      'event_zipcode' => $_POST['event_zipcode'] ?? '',
      'event_venue_name' => $_POST['event_venue_name'] ?? '',
      'event_venue_phone' => $_POST['event_venue_phone'] ?? '',
      'event_venue_website' => $_POST['event_venue_website'] ?? '',
      'event_map_embed' => $_POST['event_map_embed'] ?? '',
      'event_additional_info' => $_POST['event_additional_info'] ?? '',
      'event_rules' => $_POST['event_rules'] ?? '',
      'event_important_notes' => $_POST['event_important_notes'] ?? '',
    ];

    foreach ($fields as $key => $value) {
      setting_set($pdo, $key, $value);
    }

    $ok = 'Informações do evento atualizadas com sucesso!';
  } catch (Throwable $e) {
    $err = 'Erro: ' . $e->getMessage();
  }
}

// Carregar valores atuais
$location = setting_get($pdo, 'event_location', '');
$address = setting_get($pdo, 'event_address', '');
$city = setting_get($pdo, 'event_city', '');
$state = setting_get($pdo, 'event_state', '');
$country = setting_get($pdo, 'event_country', 'Brasil');
$zipcode = setting_get($pdo, 'event_zipcode', '');
$venue_name = setting_get($pdo, 'event_venue_name', '');
$venue_phone = setting_get($pdo, 'event_venue_phone', '');
$venue_website = setting_get($pdo, 'event_venue_website', '');
$map_embed = setting_get($pdo, 'event_map_embed', '');
$additional_info = setting_get($pdo, 'event_additional_info', '');
$rules = setting_get($pdo, 'event_rules', '');
$important_notes = setting_get($pdo, 'event_important_notes', '');

admin_header('Informações do Evento');
?>

<?php if ($ok): ?><div class="alert" style="background:#d4edda;border-color:#c3e6cb;color:#155724;margin-bottom:16px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="background:#f8d7da;border-color:#f5c6cb;color:#721c24;margin-bottom:16px"><?php echo h($err); ?></div><?php endif; ?>

<form method="post" action="<?php echo ADMIN_BASE_PATH; ?>/local.php">
  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">

  <div class="admin-card">
    <div class="card-title">Local do Evento</div>

    <div class="form-row">
      <label class="label">Nome do local / Venue</label>
      <input class="input" type="text" name="event_location" value="<?php echo h((string)$location); ?>" placeholder="Ex: Centro de Convenções XYZ">
    </div>

    <div class="form-row">
      <label class="label">Endereço</label>
      <input class="input" type="text" name="event_address" value="<?php echo h((string)$address); ?>" placeholder="Rua/Avenida, número">
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-row">
        <label class="label">Cidade</label>
        <input class="input" type="text" name="event_city" value="<?php echo h((string)$city); ?>" placeholder="Ex: São Paulo">
      </div>

      <div class="form-row">
        <label class="label">Estado / UF</label>
        <input class="input" type="text" name="event_state" value="<?php echo h((string)$state); ?>" placeholder="Ex: SP">
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div class="form-row">
        <label class="label">País</label>
        <input class="input" type="text" name="event_country" value="<?php echo h((string)$country); ?>" placeholder="Brasil">
      </div>

      <div class="form-row">
        <label class="label">CEP</label>
        <input class="input" type="text" name="event_zipcode" value="<?php echo h((string)$zipcode); ?>" placeholder="00000-000">
      </div>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Dados do Venue / Organizador</div>

    <div class="form-row">
      <label class="label">Nome da empresa / organização</label>
      <input class="input" type="text" name="event_venue_name" value="<?php echo h((string)$venue_name); ?>" placeholder="">
    </div>

    <div class="form-row">
      <label class="label">Telefone</label>
      <input class="input" type="text" name="event_venue_phone" value="<?php echo h((string)$venue_phone); ?>" placeholder="(11) 99999-9999">
    </div>

    <div class="form-row">
      <label class="label">Website</label>
      <input class="input" type="text" name="event_venue_website" value="<?php echo h((string)$venue_website); ?>" placeholder="https://...">
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Mapa e Localização</div>

    <div class="form-row">
      <label class="label">Código embed do mapa (Google Maps iframe)</label>
      <textarea class="textarea" name="event_map_embed" rows="3" placeholder="Cole o código embed do Google Maps (iframe completo)..."><?php echo h((string)$map_embed); ?></textarea>
      <small style="color:#666;margin-top:6px">Obtenha em: Google Maps > Compartilhar > Incorporar um mapa</small>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Informações Adicionais</div>

    <div class="form-row">
      <label class="label">Informações adicionais sobre o evento</label>
      <textarea class="textarea" name="event_additional_info" rows="3" placeholder="Infos extras sobre o local, estacionamento, etc..."><?php echo h((string)$additional_info); ?></textarea>
    </div>
  </div>

  <div class="admin-card">
    <div class="card-title">Regras e Observações</div>

    <div class="form-row">
      <label class="label">Regras do evento</label>
      <textarea class="textarea" name="event_rules" rows="3" placeholder="Lista de regras e restrições..."><?php echo h((string)$rules); ?></textarea>
    </div>

    <div class="form-row">
      <label class="label">Observações importantes</label>
      <textarea class="textarea" name="event_important_notes" rows="3" placeholder="Notas importantes para participantes..."><?php echo h((string)$important_notes); ?></textarea>
    </div>
  </div>

  <div style="display:flex;gap:10px;margin-top:20px">
    <button class="btn btn-primary" type="submit">Salvar informações do evento</button>
  </div>
</form>

<?php require_once __DIR__ . '/includes/layout-footer.php';
