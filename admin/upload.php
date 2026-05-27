<?php
/**
 * Upload endpoint para imagens do CMS
 * POST /admin/upload.php
 * Requer autenticação e CSRF
 */

require_once __DIR__ . '/includes/bootstrap.php';
require_login();

header('Content-Type: application/json; charset=utf-8');

// Validar request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Validar CSRF
if (!isset($_POST['_csrf']) || !hash_equals($_SESSION['csrf_token'] ?? '', $_POST['_csrf'])) {
    http_response_code(403);
    echo json_encode(['error' => 'CSRF token invalid']);
    exit;
}

// Validar arquivo
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Nenhum arquivo enviado ou erro no upload']);
    exit;
}

$file = $_FILES['image'];
$field = (string)($_POST['field'] ?? '');

// Validar campo
$allowed_fields = [
    'banner_home_desktop',
    'banner_home_mobile',
    'logo_desktop',
    'logo_mobile',
    'speaker_photo',
];

if (!in_array($field, $allowed_fields, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Campo de upload inválido']);
    exit;
}

// Validar tipo de arquivo
$mime_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $mime_types, true)) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF']);
    exit;
}

// Validar tamanho (max 5MB)
if ($file['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['error' => 'Arquivo muito grande. Máximo 5MB']);
    exit;
}

// Criar diretório se não existir
$uploads_dir = __DIR__ . '/../uploads';
if (!is_dir($uploads_dir)) {
    @mkdir($uploads_dir, 0755, true);
}

// Gerar nome único
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = $field . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$filepath = $uploads_dir . '/' . $filename;

// Mover arquivo
if (!move_uploaded_file($file['tmp_name'], $filepath)) {
    http_response_code(500);
    echo json_encode(['error' => 'Erro ao salvar arquivo']);
    exit;
}

// Retornar sucesso com URL
$url = '/uploads/' . $filename;
echo json_encode([
    'ok' => true,
    'url' => $url,
    'filename' => $filename,
    'field' => $field,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
