<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit('Not Found');
}

require_once __DIR__ . '/admin/includes/bootstrap.php';

$opts = getopt('', ['email:', 'password:']);
$email = isset($opts['email']) ? trim((string)$opts['email']) : '';
$password = isset($opts['password']) ? (string)$opts['password'] : '';

if ($email === '' || $password === '') {
    fwrite(STDERR, "Uso: php create-admin.php --email=admin@dominio.com --password='senha-forte'\n");
    exit(1);
}

if (strlen($password) < 8) {
    fwrite(STDERR, "Erro: a senha precisa ter no minimo 8 caracteres.\n");
    exit(1);
}

try {
    $pdo = db();
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare('SELECT id FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $existingId = $stmt->fetchColumn();

    if ($existingId !== false && $existingId !== null) {
        fwrite(STDERR, "Erro: email ja existe (ID {$existingId}).\n");
        exit(1);
    }

    $stmt = $pdo->prepare('INSERT INTO admins (email, password_hash) VALUES (?, ?)');
    $stmt->execute([$email, $passwordHash]);

    echo "Admin criado com sucesso.\n";
    echo "ID: " . $pdo->lastInsertId() . "\n";
    echo "Email: {$email}\n";
    echo "Login: /admin/index.php\n";
} catch (Throwable $e) {
    fwrite(STDERR, "Erro: {$e->getMessage()}\n");
    exit(1);
}
