<?php
// Config base (sem segredos). Em produção, crie `config.local.php`.

if (!function_exists('conad_env')) {
    function conad_env(string $key, ?string $default = null): ?string {
        $v = getenv($key);
        if ($v === false) return $default;
        $v = trim((string)$v);
        return $v === '' ? $default : $v;
    }
}

defined('DB_HOST') || define('DB_HOST', conad_env('CONAD_DB_HOST') ?? conad_env('DB_HOST', 'localhost'));
defined('DB_NAME') || define('DB_NAME', conad_env('CONAD_DB_NAME') ?? conad_env('DB_NAME', 'inscricoes'));
defined('DB_USER') || define('DB_USER', conad_env('CONAD_DB_USER') ?? conad_env('DB_USER', ''));
defined('DB_PASS') || define('DB_PASS', conad_env('CONAD_DB_PASS') ?? conad_env('DB_PASS', ''));

defined('ADMIN_BASE_PATH') || define('ADMIN_BASE_PATH', conad_env('CONAD_ADMIN_BASE_PATH', '/admin'));
defined('SESSION_NAME') || define('SESSION_NAME', conad_env('CONAD_SESSION_NAME', 'conad_admin'));

defined('APP_DEBUG') || define('APP_DEBUG', strtolower((string)conad_env('CONAD_DEBUG', '0')) === '1');
