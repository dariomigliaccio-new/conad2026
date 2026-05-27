<?php
declare(strict_types=1);

if (defined('CONAD_ADMIN_BOOTSTRAPPED')) {
    return;
}

define('CONAD_ADMIN_BOOTSTRAPPED', true);

require_once __DIR__ . '/config-loader.php';
require_once __DIR__ . '/../../includes/i18n.php';

// Debug
function app_debug_enabled(): bool {
    if (defined('APP_DEBUG')) {
        return (bool)constant('APP_DEBUG');
    }
    $v = getenv('CONAD_DEBUG');
    if ($v === false) return false;
    $v = strtolower(trim((string)$v));
    return in_array($v, ['1', 'true', 'yes', 'on'], true);
}

error_reporting(E_ALL);
@ini_set('log_errors', '1');
@ini_set('display_errors', app_debug_enabled() ? '1' : '0');
@ini_set('display_startup_errors', app_debug_enabled() ? '1' : '0');

// Session
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_start();
}

function h(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function conad_error_id(): string {
    return bin2hex(random_bytes(4));
}

function conad_log_path(): string {
    return dirname(__DIR__) . '/error_log';
}

function log_conad(string $errorId, string $message): void {
    $prefix = '[CONAD-ERR ' . $errorId . '] ';
    error_log($prefix . $message);
    try {
        @file_put_contents(conad_log_path(), $prefix . $message . "\n", FILE_APPEND | LOCK_EX);
    } catch (Throwable $ignored) {
        // ignora
    }
}

function log_unhandled_exception(Throwable $e): string {
    $errorId = conad_error_id();

    $ctx = [
        'id' => $errorId,
        'ts' => gmdate('c'),
        'host' => $_SERVER['HTTP_HOST'] ?? '',
        'uri' => $_SERVER['REQUEST_URI'] ?? '',
        'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'ua' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'class' => get_class($e),
        'message' => $e->getMessage(),
    ];

    log_conad($errorId, json_encode($ctx, JSON_UNESCAPED_UNICODE));
    log_conad($errorId, $e->getTraceAsString());

    if ($e instanceof PDOException && is_array($e->errorInfo ?? null)) {
        log_conad($errorId, 'PDO errorInfo: ' . json_encode($e->errorInfo, JSON_UNESCAPED_UNICODE));
    }

    return $errorId;
}

function log_fatal_error(array $err): string {
    $errorId = conad_error_id();
    $ctx = [
        'id' => $errorId,
        'ts' => gmdate('c'),
        'host' => $_SERVER['HTTP_HOST'] ?? '',
        'uri' => $_SERVER['REQUEST_URI'] ?? '',
        'method' => $_SERVER['REQUEST_METHOD'] ?? '',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
        'ua' => $_SERVER['HTTP_USER_AGENT'] ?? '',
        'type' => $err['type'] ?? null,
        'message' => $err['message'] ?? null,
        'file' => $err['file'] ?? null,
        'line' => $err['line'] ?? null,
    ];
    log_conad($errorId, 'FATAL ' . json_encode($ctx, JSON_UNESCAPED_UNICODE));
    return $errorId;
}

function render_error_page(string $title, string $hint, string $errorId, ?string $detail = null): void {
    http_response_code(500);
    header('Content-Type: text/html; charset=UTF-8');

    echo '<!doctype html><html lang="pt-br"><head>';
    echo '<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
    echo '<meta name="robots" content="noindex,nofollow">';
    echo '<title>' . h($title) . '</title>';
    echo '<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:900px;margin:40px auto;padding:0 16px;line-height:1.5}code,pre{background:#f6f8fa;padding:2px 6px;border-radius:6px}pre{padding:12px;overflow:auto}h1{font-size:20px}li{margin:6px 0}</style>';
    echo '</head><body>';
    echo '<h1>' . h($title) . '</h1>';
    echo '<p>' . h($hint) . '</p>';
    echo '<p style="color:#666">ID do erro: <code>' . h($errorId) . '</code></p>';

    if (app_debug_enabled() && $detail !== null) {
        echo '<p><strong>Detalhes (debug):</strong> <code>' . h($detail) . '</code></p>';
    } else {
        echo '<p style="color:#666">(Para ver detalhes, ative <code>CONAD_DEBUG=1</code>. Alternativamente, procure por <code>CONAD-ERR ' . h($errorId) . '</code> no arquivo <code>admin/error_log</code> ou no <code>error_log</code> do servidor/cPanel.)</p>';
    }

    echo '</body></html>';
}

set_exception_handler(function (Throwable $e): void {
    $errorId = log_unhandled_exception($e);
    render_error_page('Erro no sistema', 'Tente novamente. Se persistir, contate o suporte técnico.', $errorId, $e->getMessage());
});

register_shutdown_function(function (): void {
    $err = error_get_last();
    if (!is_array($err)) return;

    $type = (int)($err['type'] ?? 0);
    $fatalTypes = [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR];
    if (!in_array($type, $fatalTypes, true)) return;

    $errorId = log_fatal_error($err);
    if (headers_sent()) {
        echo "\n\n<!-- CONAD fatal: $errorId -->\n";
        return;
    }

    $detail = ($err['message'] ?? '') . ' @ ' . ($err['file'] ?? '') . ':' . ($err['line'] ?? '');
    render_error_page('Erro no sistema', 'Tente novamente. Se persistir, contate o suporte técnico.', $errorId, (string)$detail);
});

// DB
function db(): PDO {
    static $pdo = null;
    if ($pdo instanceof PDO) return $pdo;

    $host = defined('DB_HOST') ? DB_HOST : 'localhost';
    $name = defined('DB_NAME') ? DB_NAME : 'inscricoes';
    $user = defined('DB_USER') ? DB_USER : '';
    $pass = defined('DB_PASS') ? DB_PASS : '';

    if ($user === '' || $pass === '') {
        $errorId = conad_error_id();
        $hint = 'DB_USER ou DB_PASS não configurados. Crie admin/includes/config.local.php com credenciais reais.';
        log_conad($errorId, $hint);
        render_error_page('Configuração incompleta', $hint, $errorId);
        exit;
    }

    $dsn = 'mysql:host=' . $host . ';dbname=' . $name . ';charset=utf8mb4';
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (Throwable $e) {
        $errorId = log_unhandled_exception($e);
        render_error_page('Erro de conexão ao banco', 'Verifique admin/includes/config.local.php', $errorId, $e->getMessage());
        exit;
    }

    return $pdo;
}

// Auth
function is_logged_in(): bool {
    return isset($_SESSION['admin_id']) && is_numeric($_SESSION['admin_id']);
}

function require_login(): void {
    if (!is_logged_in()) {
        header('Location: ' . ADMIN_BASE_PATH . '/index.php');
        exit;
    }
}

function logout_admin(): void {
    $_SESSION = [];
    if (session_id() !== '') {
        session_destroy();
    }
}

// CSRF
function csrf_token(): string {
    if (!isset($_SESSION) || !is_array($_SESSION)) {
        return '';
    }
    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token']) || $_SESSION['csrf_token'] === '') {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
    }
    return (string)$_SESSION['csrf_token'];
}

function csrf_verify(): void {
    $token = $_POST['_csrf'] ?? '';
    $expected = csrf_token();
    if ($expected === '' || !is_string($token) || !hash_equals($expected, $token)) {
        http_response_code(400);
        header('Content-Type: text/html; charset=UTF-8');
        echo '<h1>Erro de segurança</h1><p>CSRF token inválido. Tente novamente.</p>';
        exit;
    }
}

function setting_get(PDO $pdo, string $key, ?string $default = null): ?string {
    $stmt = $pdo->prepare('SELECT setting_value FROM settings WHERE setting_key=?');
    $stmt->execute([$key]);
    $v = $stmt->fetchColumn();
    if ($v === false || $v === null) return $default;
    return (string)$v;
}

function setting_set(PDO $pdo, string $key, ?string $value): void {
    $stmt = $pdo->prepare('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value)');
    $stmt->execute([$key, $value]);
}
