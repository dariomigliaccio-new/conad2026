<?php
declare(strict_types=1);

// Endpoint público: expõe apenas conteúdo seguro para o site (ex.: contagem regressiva).
// NÃO expõe chaves Stripe nem qualquer configuração sensível.

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$lang = (string)($_GET['lang'] ?? 'pt-BR');
$allowedLangs = ['pt-BR', 'en-US', 'es-ES'];
if (!in_array($lang, $allowedLangs, true)) {
    $lang = 'pt-BR';
}

function cms_override_key_for_lang(string $lang): string
{
    if ($lang === 'pt-BR') {
        return 'public_cms_override_json';
    }
    return 'public_cms_override_json__' . $lang;
}

try {
    require_once __DIR__ . '/admin/includes/config-loader.php';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Configuração não encontrada'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    $langOverrideKey = cms_override_key_for_lang($lang);
    $keys = [
        'public_event_datetime_iso',
        'public_event_started_heading',
        'public_event_started_text',
        'countdown_date',
        'countdown_time',
        'public_cms_override_json',
        $langOverrideKey,
        'banner_home_desktop',
        'banner_home_mobile',
        'banner_home_desktop_list',
        'banner_home_mobile_list',
    ];

    $in = implode(',', array_fill(0, count($keys), '?'));
    $stmt = $pdo->prepare('SELECT setting_key, setting_value FROM settings WHERE setting_key IN (' . $in . ')');
    $stmt->execute($keys);
    $rows = $stmt->fetchAll();

    $map = [];
    foreach ($rows as $r) {
        $k = (string)($r['setting_key'] ?? '');
        $v = (string)($r['setting_value'] ?? '');
        $map[$k] = $v;
    }

    $out = [];

    // Override JSON do admin (mesma estrutura do cms-default.json)
    $overrideRaw = (string)($map[$langOverrideKey] ?? '');
    if (trim($overrideRaw) !== '') {
        $decoded = json_decode($overrideRaw, true);
        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            $out = $decoded;
        }
    }

    if (!isset($out['global']) || !is_array($out['global'])) {
        $out['global'] = [];
    }
    if (!isset($out['home']) || !is_array($out['home'])) {
        $out['home'] = [];
    }
    if (!isset($out['home']['hero']) || !is_array($out['home']['hero'])) {
        $out['home']['hero'] = [];
    }

    $desktopList = [];
    $mobileList = [];

    $desktopListRaw = (string)($map['banner_home_desktop_list'] ?? '');
    if (trim($desktopListRaw) !== '') {
        $decoded = json_decode($desktopListRaw, true);
        if (is_array($decoded)) {
            foreach ($decoded as $item) {
                if (is_string($item) && trim($item) !== '') $desktopList[] = trim($item);
            }
        }
    }

    $mobileListRaw = (string)($map['banner_home_mobile_list'] ?? '');
    if (trim($mobileListRaw) !== '') {
        $decoded = json_decode($mobileListRaw, true);
        if (is_array($decoded)) {
            foreach ($decoded as $item) {
                if (is_string($item) && trim($item) !== '') $mobileList[] = trim($item);
            }
        }
    }

    $legacyDesktop = trim((string)($map['banner_home_desktop'] ?? ''));
    $legacyMobile = trim((string)($map['banner_home_mobile'] ?? ''));
    if ($legacyDesktop !== '' && !in_array($legacyDesktop, $desktopList, true)) $desktopList[] = $legacyDesktop;
    if ($legacyMobile !== '' && !in_array($legacyMobile, $mobileList, true)) $mobileList[] = $legacyMobile;

    $out['home']['hero']['desktopBanners'] = $desktopList;
    $out['home']['hero']['mobileBanners'] = $mobileList;

    // Chaves públicas (do banco) para o site
    $eventIso = trim((string)($map['public_event_datetime_iso'] ?? ''));
    if ($eventIso === '') {
        $date = trim((string)($map['countdown_date'] ?? ''));
        $time = trim((string)($map['countdown_time'] ?? ''));
        if ($time !== '' && strlen($time) === 5) {
            $time .= ':00';
        }
        if ($date !== '' && $time !== '') {
            $eventIso = $date . 'T' . $time;
        }
    }
    $out['global']['eventDateTimeISO'] = $eventIso;
    $out['global']['eventStartedHeading'] = $map['public_event_started_heading'] ?? '';
    $out['global']['eventStartedText'] = $map['public_event_started_text'] ?? '';

    echo json_encode($out, JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    error_log('[public-content.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Não foi possível carregar conteúdo'], JSON_UNESCAPED_UNICODE);
}
