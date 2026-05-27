<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$pdo = db();

$err = '';
$ok = '';

function conad_is_list_array(array $arr): bool {
  return array_keys($arr) === range(0, count($arr) - 1);
}

function conad_deep_merge_assoc(array $base, array $override): array {
  foreach ($override as $k => $v) {
    if (array_key_exists($k, $base) && is_array($base[$k]) && is_array($v)) {
      if (!conad_is_list_array($base[$k]) && !conad_is_list_array($v)) {
        $base[$k] = conad_deep_merge_assoc($base[$k], $v);
      } else {
        $base[$k] = $v;
      }
    } else {
      $base[$k] = $v;
    }
  }
  return $base;
}

function conad_flatten_scalar_paths($value, string $prefix = ''): array {
  $paths = [];
  if (is_array($value)) {
    foreach ($value as $k => $v) {
      $next = $prefix === '' ? (string)$k : ($prefix . '.' . (string)$k);
      $paths = array_merge($paths, conad_flatten_scalar_paths($v, $next));
    }
    return $paths;
  }
  if ($prefix !== '') {
    $paths[] = $prefix;
  }
  return $paths;
}

function conad_get_by_path($data, string $path, &$found = false) {
  $found = false;
  if ($path === '') return null;
  $parts = explode('.', $path);
  $cur = $data;
  foreach ($parts as $part) {
    if (!is_array($cur)) return null;
    $key = ctype_digit($part) ? (int)$part : $part;
    if (!array_key_exists($key, $cur)) return null;
    $cur = $cur[$key];
  }
  $found = true;
  return $cur;
}

function conad_set_by_path(array &$data, string $path, $value): void {
  $parts = explode('.', $path);
  $cur =& $data;
  $last = count($parts) - 1;

  foreach ($parts as $i => $part) {
    $key = ctype_digit($part) ? (int)$part : $part;
    if ($i === $last) {
      $cur[$key] = $value;
      return;
    }

    if (!isset($cur[$key]) || !is_array($cur[$key])) {
      $next = $parts[$i + 1] ?? '';
      $cur[$key] = ctype_digit((string)$next) ? [] : [];
    }
    $cur =& $cur[$key];
  }
}

function conad_cast_like(string $raw, $sample) {
  if (is_bool($sample)) {
    $v = strtolower(trim($raw));
    return in_array($v, ['1', 'true', 'yes', 'on'], true);
  }
  if (is_int($sample)) return (int)$raw;
  if (is_float($sample)) return (float)$raw;
  if ($sample === null) {
    $t = trim($raw);
    return $t === '' ? null : $raw;
  }
  return $raw;
}

function conad_build_override_diff($default, $current) {
  if (is_array($default) && is_array($current)) {
    $defaultIsList = conad_is_list_array($default);
    $currentIsList = conad_is_list_array($current);

    if ($defaultIsList || $currentIsList) {
      return $default === $current ? null : $current;
    }

    $out = [];
    $keys = array_unique(array_merge(array_keys($default), array_keys($current)));
    foreach ($keys as $k) {
      $hasDefault = array_key_exists($k, $default);
      $hasCurrent = array_key_exists($k, $current);
      if (!$hasCurrent) continue;

      if (!$hasDefault) {
        $out[$k] = $current[$k];
        continue;
      }

      $diff = conad_build_override_diff($default[$k], $current[$k]);
      if ($diff !== null) {
        $out[$k] = $diff;
      }
    }
    return empty($out) ? null : $out;
  }

  return $default === $current ? null : $current;
}

function conad_encode_field_key(string $path): string {
  return rtrim(strtr(base64_encode($path), '+/', '-_'), '=');
}

function conad_allowed_langs(): array {
  return ['pt-BR', 'en-US', 'es-ES'];
}

function conad_normalize_lang(string $lang): string {
  return in_array($lang, conad_allowed_langs(), true) ? $lang : 'pt-BR';
}

function conad_override_setting_key(string $lang): string {
  if ($lang === 'pt-BR') return 'public_cms_override_json';
  return 'public_cms_override_json__' . $lang;
}

$selectedLang = conad_normalize_lang((string)($_GET['lang'] ?? 'pt-BR'));

// Carregar default CMS
$defaultPath = __DIR__ . '/../content/cms-default.json';
$defaultCms = [];
$overrideKey = conad_override_setting_key($selectedLang);

if (!file_exists($defaultPath)) {
  $err = 'Arquivo cms-default.json não encontrado';
  $cms = [];
} else {
  $defaultCms = json_decode((string)file_get_contents($defaultPath), true) ?: [];
  $currentOverride = (string)setting_get($pdo, $overrideKey, '');
  $overrideCms = $currentOverride !== '' ? json_decode($currentOverride, true) ?: [] : [];
  $cms = conad_deep_merge_assoc($defaultCms, $overrideCms);
}

$allPaths = array_values(array_unique(array_merge(
  conad_flatten_scalar_paths($defaultCms),
  conad_flatten_scalar_paths($cms)
)));
sort($allPaths, SORT_NATURAL | SORT_FLAG_CASE);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  $action = (string)($_POST['action'] ?? '');
  $postedLang = conad_normalize_lang((string)($_POST['lang'] ?? $selectedLang));
  $selectedLang = $postedLang;
  $overrideKey = conad_override_setting_key($selectedLang);

  try {
    if ($action === 'save_cms') {
      $postedFields = isset($_POST['cms']) && is_array($_POST['cms']) ? $_POST['cms'] : [];
      $nextCms = $cms;

      foreach ($allPaths as $path) {
        $fieldKey = conad_encode_field_key($path);
        if (!array_key_exists($fieldKey, $postedFields)) continue;

        $postedRaw = (string)$postedFields[$fieldKey];
        $foundDefault = false;
        $sample = conad_get_by_path($defaultCms, $path, $foundDefault);

        if (!$foundDefault) {
          $foundCurrent = false;
          $sample = conad_get_by_path($cms, $path, $foundCurrent);
          if (!$foundCurrent) $sample = '';
        }

        $typedValue = conad_cast_like($postedRaw, $sample);
        conad_set_by_path($nextCms, $path, $typedValue);
      }

      $diff = conad_build_override_diff($defaultCms, $nextCms);
      if ($diff !== null && is_array($diff) && !empty($diff)) {
        $json = json_encode($diff, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        setting_set($pdo, $overrideKey, $json);
      } else {
        setting_set($pdo, $overrideKey, null);
      }

      $ok = 'Conteúdo atualizado.';

      $currentOverride = (string)setting_get($pdo, $overrideKey, '');
      $overrideCms = $currentOverride !== '' ? json_decode($currentOverride, true) ?: [] : [];
      $cms = conad_deep_merge_assoc($defaultCms, $overrideCms);

      $allPaths = array_values(array_unique(array_merge(
        conad_flatten_scalar_paths($defaultCms),
        conad_flatten_scalar_paths($cms)
      )));
      sort($allPaths, SORT_NATURAL | SORT_FLAG_CASE);
    }
  } catch (Throwable $e) {
    $err = $e->getMessage();
  }
}

admin_header('Conteúdo');
?>

<?php if ($ok): ?><div class="alert" style="margin-bottom:12px;background:#d4edda;border-color:#c3e6cb;color:#155724"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="margin-bottom:12px;background:#f8d7da;border-color:#f5c6cb;color:#721c24"><?php echo h($err); ?></div><?php endif; ?>

<div class="card" style="margin-bottom:12px">
  <div style="font-weight:700;margin-bottom:10px">Idioma do conteúdo</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap">
    <?php foreach (conad_allowed_langs() as $langOpt): ?>
      <a
        class="btn <?php echo $selectedLang === $langOpt ? 'btn-outline' : 'btn-ghost'; ?> is-sm"
        href="<?php echo h(ADMIN_BASE_PATH . '/content.php?lang=' . rawurlencode($langOpt)); ?>"
      ><?php echo h($langOpt); ?></a>
    <?php endforeach; ?>
  </div>
  <div style="margin-top:8px;color:var(--color-muted);font-size:12px">
    Você está editando: <strong><?php echo h($selectedLang); ?></strong>.
  </div>
</div>

<?php
$homePlanIconPaths = [
  'home.plans.items.0.iconSvg',
  'home.plans.items.1.iconSvg',
  'home.plans.items.2.iconSvg',
  'home.plans.items.3.iconSvg',
];

$sectionTitles = [
  'global' => 'Global',
  'home' => 'Home',
  'precos' => 'Preços',
  'informacoes' => 'Informações',
  'preletores' => 'Preletores',
  'local' => 'Local',
  'termos' => 'Termos',
  '__other' => 'Outros',
];

$groupedPaths = [];
foreach ($sectionTitles as $key => $_title) {
  $groupedPaths[$key] = [];
}

foreach ($allPaths as $path) {
  if (in_array($path, $homePlanIconPaths, true)) continue;
  $topLevel = strstr($path, '.', true);
  if ($topLevel === false || $topLevel === '') {
    $topLevel = $path;
  }
  $groupKey = array_key_exists($topLevel, $sectionTitles) ? $topLevel : '__other';
  $groupedPaths[$groupKey][] = $path;
}
?>

<form method="post" action="<?php echo h(ADMIN_BASE_PATH . '/content.php?lang=' . rawurlencode($selectedLang)); ?>">
  <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
  <input type="hidden" name="action" value="save_cms">
  <input type="hidden" name="lang" value="<?php echo h($selectedLang); ?>">

  <div class="card" style="margin-bottom:12px">
    <div style="font-weight:700;margin-bottom:4px">Ícones SVG da Home (abaixo da contagem regressiva)</div>
    <div style="color:var(--color-muted);font-size:12px;margin-bottom:8px">
      Campos da seção "Encontre a experiência certa para você".
    </div>
    <?php foreach ($homePlanIconPaths as $path): ?>
      <?php
      $found = false;
      $value = conad_get_by_path($cms, $path, $found);
      $fieldKey = conad_encode_field_key($path);
      $strValue = $found ? (string)$value : '';
      ?>
      <div class="form-row">
        <label class="label" for="cms_<?php echo h($fieldKey); ?>"><?php echo h(str_replace('.', ' → ', $path)); ?></label>
        <textarea
          id="cms_<?php echo h($fieldKey); ?>"
          class="textarea"
          name="cms[<?php echo h($fieldKey); ?>]"
          rows="8"
          placeholder="Cole aqui o SVG completo (<svg ...>...</svg>)"
        ><?php echo h($strValue); ?></textarea>
      </div>
    <?php endforeach; ?>
  </div>

  <?php if (!empty($allPaths)): ?>
    <?php foreach ($sectionTitles as $groupKey => $groupTitle): ?>
      <?php if (empty($groupedPaths[$groupKey])) continue; ?>
      <div class="card" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:8px"><?php echo h($groupTitle); ?></div>
        <?php foreach ($groupedPaths[$groupKey] as $path): ?>
          <?php
          $found = false;
          $value = conad_get_by_path($cms, $path, $found);
          if (!$found || is_array($value)) continue;
          $label = str_replace('.', ' → ', $path);
          $fieldKey = conad_encode_field_key($path);
          $strValue = is_bool($value) ? ($value ? '1' : '0') : (string)$value;
          $isSvgField = (bool)preg_match('/(?:^|\.)iconSvg$/', $path);
          $isLong = strlen($strValue) > 180;
          ?>
          <div class="form-row">
            <label class="label" for="cms_<?php echo h($fieldKey); ?>"><?php echo h($label); ?></label>

            <?php if ($isSvgField || $isLong): ?>
              <textarea
                id="cms_<?php echo h($fieldKey); ?>"
                class="textarea"
                name="cms[<?php echo h($fieldKey); ?>]"
                rows="<?php echo $isSvgField ? '8' : '5'; ?>"
                placeholder="<?php echo $isSvgField ? 'Cole aqui o SVG completo (<svg ...>...</svg>)' : 'Texto...'; ?>"
              ><?php echo h($strValue); ?></textarea>
              <?php if ($isSvgField): ?>
                <div style="margin-top:6px;color:#666;font-size:12px">Aceita SVG inline. Exemplo: <code>&lt;svg viewBox=\"0 0 24 24\" ...&gt;...&lt;/svg&gt;</code></div>
              <?php endif; ?>
            <?php else: ?>
              <input
                id="cms_<?php echo h($fieldKey); ?>"
                class="input"
                type="text"
                name="cms[<?php echo h($fieldKey); ?>]"
                value="<?php echo h($strValue); ?>"
                placeholder="Valor..."
              >
            <?php endif; ?>
          </div>
        <?php endforeach; ?>
      </div>
    <?php endforeach; ?>
  <?php else: ?>
    <div class="alert" style="background:#fff3cd;border-color:#ffc107;color:#856404">Nenhum campo de conteúdo disponível.</div>
  <?php endif; ?>

  <div style="display:flex;gap:10px;align-items:center;margin-top:16px">
    <button class="btn btn-primary" type="submit">Salvar conteúdo</button>
  </div>
</form>

<?php require_once __DIR__ . '/includes/layout-footer.php';
