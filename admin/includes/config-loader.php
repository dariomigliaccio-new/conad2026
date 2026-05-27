<?php
declare(strict_types=1);

if (defined('CONAD_CONFIG_LOADED')) {
    return;
}

define('CONAD_CONFIG_LOADED', true);

$localConfig = __DIR__ . '/config.local.php';
$baseConfig = __DIR__ . '/config.php';

if (file_exists($localConfig)) {
    require_once $localConfig;
} elseif (file_exists($baseConfig)) {
    require_once $baseConfig;
} else {
    throw new RuntimeException('Configuração não encontrada. Crie admin/includes/config.local.php');
}

$required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS', 'ADMIN_BASE_PATH', 'SESSION_NAME'];
foreach ($required as $k) {
    if (!defined($k)) {
        throw new RuntimeException('Configuração inválida: constante ausente ' . $k);
    }
}
