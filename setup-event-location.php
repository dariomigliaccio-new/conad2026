<?php
/**
 * Página para configurar o endereço do evento
 * Acesso: https://seusite.com/setup-event-location.php
 */
require_once __DIR__ . '/admin/includes/bootstrap.php';

$pdo = db();
$msg = null;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $location = trim($_POST['location'] ?? '');
        $address = trim($_POST['address'] ?? '');
        $city = trim($_POST['city'] ?? '');
        $state = trim($_POST['state'] ?? '');
        $country = trim($_POST['country'] ?? 'Brasil');
        $zipcode = trim($_POST['zipcode'] ?? '');
        $venue_name = trim($_POST['venue_name'] ?? '');
        $venue_phone = trim($_POST['venue_phone'] ?? '');
        $venue_website = trim($_POST['venue_website'] ?? '');
        $additional_info = trim($_POST['additional_info'] ?? '');
        $rules = trim($_POST['rules'] ?? '');
        $important_notes = trim($_POST['important_notes'] ?? '');

        // Validar
        if (empty($location) || empty($address)) {
            throw new Exception('Local e Endereço são obrigatórios!');
        }

        // Salvar no banco
        $updates = [
            'event_location' => $location,
            'event_address' => $address,
            'event_city' => $city,
            'event_state' => $state,
            'event_country' => $country,
            'event_zipcode' => $zipcode,
            'event_venue_name' => $venue_name,
            'event_venue_phone' => $venue_phone,
            'event_venue_website' => $venue_website,
            'event_additional_info' => $additional_info,
            'event_rules' => $rules,
            'event_important_notes' => $important_notes,
        ];

        $stmt = $pdo->prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?');
        
        foreach ($updates as $key => $value) {
            $stmt->execute([$key, $value, $value]);
        }

        $msg = '✅ Endereço do evento salvo com sucesso!';
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
}

// Carregar valores atuais
$current = [];
foreach (['event_location', 'event_address', 'event_city', 'event_state', 'event_zipcode', 'event_venue_name', 'event_venue_phone', 'event_venue_website', 'event_additional_info', 'event_rules', 'event_important_notes'] as $key) {
    try {
        $stmt = $pdo->prepare('SELECT setting_value FROM settings WHERE setting_key = ?');
        $stmt->execute([$key]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $current[$key] = $row['setting_value'] ?? '';
    } catch (Exception $e) {
        $current[$key] = '';
    }
}

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurar Endereço do Evento</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { margin-bottom: 30px; color: #333; }
        .form-group { margin-bottom: 20px; }
        label { display: block; margin-bottom: 5px; font-weight: 600; color: #333; }
        input[type="text"], input[type="email"], input[type="tel"], textarea, select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; }
        textarea { resize: vertical; min-height: 100px; }
        button { background: #007bff; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600; }
        button:hover { background: #0056b3; }
        .alert { padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .alert-success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .alert-error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .row.full { grid-template-columns: 1fr; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📍 Configurar Endereço do Evento</h1>

        <?php if ($msg): ?>
            <div class="alert alert-success"><?php echo htmlspecialchars($msg); ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="alert alert-error"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="POST">
            <div class="row">
                <div class="form-group">
                    <label>Nome do Local *</label>
                    <input type="text" name="location" value="<?php echo htmlspecialchars($current['event_location']); ?>" required placeholder="Ex: Centro de Convenções">
                </div>
                <div class="form-group">
                    <label>CEP</label>
                    <input type="text" name="zipcode" value="<?php echo htmlspecialchars($current['event_zipcode']); ?>" placeholder="Ex: 01310-100">
                </div>
            </div>

            <div class="row full">
                <div class="form-group">
                    <label>Endereço *</label>
                    <input type="text" name="address" value="<?php echo htmlspecialchars($current['event_address']); ?>" required placeholder="Ex: Rua Tal, 123">
                </div>
            </div>

            <div class="row">
                <div class="form-group">
                    <label>Cidade</label>
                    <input type="text" name="city" value="<?php echo htmlspecialchars($current['event_city']); ?>" placeholder="Ex: São Paulo">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <input type="text" name="state" value="<?php echo htmlspecialchars($current['event_state']); ?>" placeholder="Ex: SP">
                </div>
            </div>

            <div class="row full">
                <div class="form-group">
                    <label>Nome do Venue</label>
                    <input type="text" name="venue_name" value="<?php echo htmlspecialchars($current['event_venue_name']); ?>" placeholder="Ex: Hotel Empresa">
                </div>
            </div>

            <div class="row">
                <div class="form-group">
                    <label>Telefone</label>
                    <input type="tel" name="venue_phone" value="<?php echo htmlspecialchars($current['event_venue_phone']); ?>" placeholder="Ex: (11) 3000-0000">
                </div>
                <div class="form-group">
                    <label>Website</label>
                    <input type="text" name="venue_website" value="<?php echo htmlspecialchars($current['event_venue_website']); ?>" placeholder="Ex: https://venue.com.br">
                </div>
            </div>

            <div class="row full">
                <div class="form-group">
                    <label>Informações Adicionais</label>
                    <textarea name="additional_info" placeholder="Outras informações sobre o local..."><?php echo htmlspecialchars($current['event_additional_info']); ?></textarea>
                </div>
            </div>

            <div class="row full">
                <div class="form-group">
                    <label>Regras</label>
                    <textarea name="rules" placeholder="Regras do espaço..."><?php echo htmlspecialchars($current['event_rules']); ?></textarea>
                </div>
            </div>

            <div class="row full">
                <div class="form-group">
                    <label>⚠️ Observações Importantes</label>
                    <textarea name="important_notes" placeholder="Observações que os usuários precisam saber..."><?php echo htmlspecialchars($current['event_important_notes']); ?></textarea>
                </div>
            </div>

            <button type="submit">✅ Salvar Endereço do Evento</button>
        </form>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

        <h2 style="margin-top: 30px; margin-bottom: 15px;">ℹ️ Próximas Ações</h2>
        <ol style="margin-left: 20px; line-height: 1.8;">
            <li>Preencha todos os campos acima</li>
            <li>Clique em "Salvar"</li>
            <li>Acesse <a href="/local.html" target="_blank">/local.html</a> para ver o mapa com o endereço</li>
            <li>O mapa será carregado automaticamente com a geolocalização do endereço</li>
        </ol>
    </div>
</body>
</html>
