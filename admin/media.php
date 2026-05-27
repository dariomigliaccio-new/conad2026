<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$pdo = db();
$err = '';
$ok = '';

function parse_banner_list(?string $raw): array {
  $raw = trim((string)$raw);
  if ($raw === '') return [];
  $decoded = json_decode($raw, true);
  if (!is_array($decoded)) return [];

  $out = [];
  foreach ($decoded as $v) {
    if (!is_string($v)) continue;
    $url = trim($v);
    if ($url === '') continue;
    if (strlen($url) > 1000) continue;
    $out[] = $url;
  }
  return array_values(array_unique($out));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  $action = (string)($_POST['action'] ?? '');

  if ($action === 'save_media') {
    try {
      $desktop = parse_banner_list((string)($_POST['banner_home_desktop_list'] ?? ''));
      $mobile = parse_banner_list((string)($_POST['banner_home_mobile_list'] ?? ''));

      // Limites simples para evitar payloads muito grandes
      $desktop = array_slice($desktop, 0, 20);
      $mobile = array_slice($mobile, 0, 20);

      setting_set($pdo, 'banner_home_desktop_list', json_encode($desktop, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
      setting_set($pdo, 'banner_home_mobile_list', json_encode($mobile, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

      // Compatibilidade com campos legados
      setting_set($pdo, 'banner_home_desktop', $desktop[0] ?? '');
      setting_set($pdo, 'banner_home_mobile', $mobile[0] ?? '');

      if (((string)($_POST['ajax'] ?? '')) === '1') {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
      }

      $ok = 'Banners salvos com sucesso.';
    } catch (Throwable $e) {
      if (((string)($_POST['ajax'] ?? '')) === '1') {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => $e->getMessage()], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
      }
      $err = 'Erro ao salvar banners: ' . $e->getMessage();
    }
  }
}

$desktopRaw = (string)setting_get($pdo, 'banner_home_desktop_list', '');
$mobileRaw = (string)setting_get($pdo, 'banner_home_mobile_list', '');
$legacyDesktop = trim((string)setting_get($pdo, 'banner_home_desktop', ''));
$legacyMobile = trim((string)setting_get($pdo, 'banner_home_mobile', ''));

$desktopBanners = parse_banner_list($desktopRaw);
$mobileBanners = parse_banner_list($mobileRaw);

if (empty($desktopBanners) && $legacyDesktop !== '') $desktopBanners = [$legacyDesktop];
if (empty($mobileBanners) && $legacyMobile !== '') $mobileBanners = [$legacyMobile];

admin_header('Imagens & Mídia');
?>

<div style="max-width:900px">
  <?php if ($ok): ?><div class="alert" style="background:#d4edda;border-color:#c3e6cb;color:#155724;margin-bottom:16px"><?php echo h($ok); ?></div><?php endif; ?>
  <?php if ($err): ?><div class="alert" style="background:#f8d7da;border-color:#f5c6cb;color:#721c24;margin-bottom:16px"><?php echo h($err); ?></div><?php endif; ?>

  <div class="admin-card">
    <div class="card-title">Banners Rotativos da Home</div>
    <p class="admin-note" style="margin-top:0;margin-bottom:14px">
      Desktop recomendado: <strong>1668x668</strong>. Mobile recomendado: <strong>800x1000</strong>.
      Você pode enviar múltiplas imagens em cada grupo; a home faz rotação automática.
    </p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <!-- Banner Desktop -->
      <div>
        <label class="label">Banner Home (Desktop)</label>
        <div class="upload-zone" data-upload-field="banner_home_desktop" style="border:2px dashed #ccc;padding:20px;border-radius:8px;text-align:center;cursor:pointer">
          <i class="fa-solid fa-image" style="font-size:32px;color:#999;margin-bottom:10px;display:block"></i>
          <p style="margin:0;color:#666">Clique ou arraste para adicionar banner</p>
          <p style="margin:5px 0 0 0;font-size:12px;color:#999">(Max 5MB - JPG, PNG, WebP)</p>
          <input type="file" accept="image/*" style="display:none">
        </div>
        <div data-list="banner_home_desktop" style="margin-top:10px;display:grid;grid-template-columns:1fr;gap:8px"></div>
        <div class="upload-status" data-field="banner_home_desktop" style="margin-top:10px;display:none;padding:8px;border-radius:6px;font-size:13px"></div>
      </div>

      <!-- Banner Mobile -->
      <div>
        <label class="label">Banner Home (Mobile)</label>
        <div class="upload-zone" data-upload-field="banner_home_mobile" style="border:2px dashed #ccc;padding:20px;border-radius:8px;text-align:center;cursor:pointer">
          <i class="fa-solid fa-image" style="font-size:32px;color:#999;margin-bottom:10px;display:block"></i>
          <p style="margin:0;color:#666">Clique ou arraste para adicionar banner</p>
          <p style="margin:5px 0 0 0;font-size:12px;color:#999">(Max 5MB - JPG, PNG, WebP)</p>
          <input type="file" accept="image/*" style="display:none">
        </div>
        <div data-list="banner_home_mobile" style="margin-top:10px;display:grid;grid-template-columns:1fr;gap:8px"></div>
        <div class="upload-status" data-field="banner_home_mobile" style="margin-top:10px;display:none;padding:8px;border-radius:6px;font-size:13px"></div>
      </div>
    </div>

    <div style="display:flex;gap:10px;margin-top:18px">
      <button id="save-media" class="btn btn-primary" type="button">Salvar banners</button>
      <span id="save-status" class="admin-note" style="align-self:center"></span>
    </div>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const state = {
    desktop: <?php echo json_encode($desktopBanners, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>,
    mobile: <?php echo json_encode($mobileBanners, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); ?>
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderList(type) {
    const listEl = document.querySelector(`[data-list="${type}"]`);
    if (!listEl) return;
    const list = type === 'banner_home_desktop' ? state.desktop : state.mobile;

    if (!Array.isArray(list) || list.length === 0) {
      listEl.innerHTML = '<div class="admin-note">Nenhum banner adicionado.</div>';
      return;
    }

    listEl.innerHTML = list.map((url, idx) => `
      <div style="border:1px solid #e8e8e8;border-radius:8px;padding:8px;background:#fff">
        <img src="${escapeHtml(url)}" alt="Banner ${idx + 1}" style="width:100%;border-radius:6px;max-height:180px;object-fit:cover">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;gap:8px">
          <small style="color:#666">#${idx + 1}</small>
          <button type="button" class="btn btn-ghost is-sm" data-remove="${type}" data-index="${idx}">Remover</button>
        </div>
      </div>
    `).join('');
  }

  function setUploadStatus(field, text, ok) {
    const statusDiv = document.querySelector(`[data-field="${field}"].upload-status`);
    if (!statusDiv) return;
    statusDiv.style.display = 'block';
    statusDiv.textContent = text;
    statusDiv.style.background = ok ? '#d4edda' : '#f8d7da';
    statusDiv.style.color = ok ? '#155724' : '#721c24';
    setTimeout(() => { statusDiv.style.display = 'none'; }, 2500);
  }

  async function saveLists() {
    const saveStatus = document.getElementById('save-status');
    if (saveStatus) saveStatus.textContent = 'Salvando...';

    const formData = new FormData();
    formData.append('action', 'save_media');
    formData.append('ajax', '1');
    formData.append('_csrf', '<?php echo h(csrf_token()); ?>');
    formData.append('banner_home_desktop_list', JSON.stringify(state.desktop || []));
    formData.append('banner_home_mobile_list', JSON.stringify(state.mobile || []));

    try {
      const res = await fetch('<?php echo ADMIN_BASE_PATH; ?>/media.php', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || ('HTTP ' + res.status));
      if (saveStatus) saveStatus.textContent = 'Banners salvos.';
      setTimeout(() => { if (saveStatus) saveStatus.textContent = ''; }, 2000);
    } catch (e) {
      if (saveStatus) saveStatus.textContent = 'Erro ao salvar: ' + e.message;
    }
  }

  const uploadZones = document.querySelectorAll('.upload-zone');

  uploadZones.forEach(zone => {
    const field = zone.getAttribute('data-upload-field');
    const input = zone.querySelector('input[type="file"]');

    // Click to upload
    zone.addEventListener('click', () => input.click());

    // File select
    input.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        uploadFile(field, e.target.files[0]);
      }
    });

    // Drag & drop
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.style.background = '#f0f0f0';
    });

    zone.addEventListener('dragleave', () => {
      zone.style.background = '';
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.style.background = '';
      if (e.dataTransfer.files.length > 0) {
        uploadFile(field, e.dataTransfer.files[0]);
      }
    });
  });

  function uploadFile(field, file) {
    const formData = new FormData();
    formData.append('field', field);
    formData.append('image', file);
    formData.append('_csrf', '<?php echo h(csrf_token()); ?>');
    setUploadStatus(field, 'Enviando...', true);

    fetch('<?php echo ADMIN_BASE_PATH; ?>/upload.php', {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        if (field === 'banner_home_desktop') {
          state.desktop.push(data.url);
          renderList('banner_home_desktop');
        } else if (field === 'banner_home_mobile') {
          state.mobile.push(data.url);
          renderList('banner_home_mobile');
        }
        setUploadStatus(field, 'Enviado com sucesso.', true);
        saveLists();
      } else {
        setUploadStatus(field, 'Erro: ' + data.error, false);
      }
    })
    .catch(err => {
      setUploadStatus(field, 'Erro: ' + err.message, false);
    });
  }

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-remove]');
    if (!btn) return;
    const type = btn.getAttribute('data-remove');
    const index = parseInt(btn.getAttribute('data-index') || '-1', 10);
    if (Number.isNaN(index) || index < 0) return;

    if (type === 'banner_home_desktop') {
      state.desktop.splice(index, 1);
      renderList(type);
    } else if (type === 'banner_home_mobile') {
      state.mobile.splice(index, 1);
      renderList(type);
    }
    saveLists();
  });

  document.getElementById('save-media')?.addEventListener('click', saveLists);

  renderList('banner_home_desktop');
  renderList('banner_home_mobile');
});
</script>

<?php require_once __DIR__ . '/includes/layout-footer.php';
