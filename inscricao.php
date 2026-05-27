<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';
require_once __DIR__ . '/admin/includes/countries.php';

$pdo = db();

if (!function_exists('redirect')) {
  function redirect(string $path): void {
    header('Location: ' . $path);
    exit;
  }
}

function conad_is_assoc_array($v): bool {
  if (!is_array($v)) return false;
  $keys = array_keys($v);
  return $keys !== range(0, count($keys) - 1);
}

function conad_deep_merge_assoc(array $base, array $override): array {
  foreach ($override as $k => $v) {
    if (is_array($v) && isset($base[$k]) && is_array($base[$k]) && conad_is_assoc_array($v) && conad_is_assoc_array($base[$k])) {
      $base[$k] = conad_deep_merge_assoc($base[$k], $v);
    } else {
      $base[$k] = $v;
    }
  }
  return $base;
}

function conad_load_public_cms_content(PDO $pdo): array {
  $defaultPath = __DIR__ . '/content/cms-default.json';
  $base = [];
  if (file_exists($defaultPath)) {
    $raw = file_get_contents($defaultPath);
    $decoded = json_decode((string)$raw, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) $base = $decoded;
  }

  try {
    $stmt = $pdo->prepare('SELECT setting_value FROM settings WHERE setting_key=? LIMIT 1');
    $stmt->execute(['public_cms_override_json']);
    $row = $stmt->fetch();
    $overrideRaw = (string)($row['setting_value'] ?? '');
    if (trim($overrideRaw) !== '') {
      $override = json_decode($overrideRaw, true);
      if (json_last_error() === JSON_ERROR_NONE && is_array($override)) {
        $base = conad_deep_merge_assoc($base, $override);
      }
    }
  } catch (Throwable $e) {
    // ignora; mantém default
  }

  return $base;
}

// Fluxo correto:
// Home -> Preços (escolha do plano) -> Formulário.
// O plano pode vir por query (?plan=slug) ou por sessão (compat).
if ((int)($_GET['rid'] ?? 0) <= 0) {
  $planSlug = trim((string)($_GET['plan'] ?? ''));
  if ($planSlug !== '') {
    try {
      $stmt = $pdo->prepare('SELECT id FROM payment_plans WHERE slug=? AND is_active=1 LIMIT 1');
      $stmt->execute([$planSlug]);
      $planRow = $stmt->fetch();
      if ($planRow && (int)($planRow['id'] ?? 0) > 0) {
        $_SESSION['conad_pre_plan_id'] = (int)$planRow['id'];
        $_SESSION['conad_pre_plan_selected_at'] = date('Y-m-d H:i:s');
      }
    } catch (Throwable $e) {
      // ignora
    }
  }

  if ((int)($_SESSION['conad_pre_plan_id'] ?? 0) <= 0) {
    redirect('/precos.html#lotes');
  }
}

function normalize_phone_international(string $raw): ?string {
  $raw = trim($raw);
  if ($raw === '') return null;

  // Mantém somente + e dígitos
  $clean = preg_replace('/[^0-9+]/', '', $raw);
  if (!is_string($clean)) return null;
  $clean = trim($clean);

  // Exige formato internacional (E.164-ish): + seguido de 7-15 dígitos
  // (o DDI/prefixo do país é obrigatório)
  if (!str_starts_with($clean, '+')) return null;

  $digits = substr($clean, 1);
  if ($digits === '' || !ctype_digit($digits)) return null;
  if ($digits[0] === '0') return null;
  $len = strlen($digits);
  if ($len < 7 || $len > 15) return null;
  return '+' . $digits;
}

function parse_date_any(string $raw): ?string {
  $raw = trim($raw);
  if ($raw === '') return null;

  // Aceita YYYY-MM-DD (compat)
  if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $raw)) {
    $dt = DateTime::createFromFormat('Y-m-d', $raw);
    if (!$dt) return null;
    return $dt->format('Y-m-d');
  }

  // Aceita DD/MM/AAAA (pt-br)
  if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $raw)) {
    $dt = DateTime::createFromFormat('d/m/Y', $raw);
    if (!$dt) return null;
    return $dt->format('Y-m-d');
  }

  return null;
}

function post_str(string $key): string {
  return trim((string)($_POST[$key] ?? ''));
}

function allowed_primary_sex_values(): array {
  return ['Homem', 'Mulher'];
}

function conad_str_lower(string $s): string {
  $s = trim($s);
  if (function_exists('mb_strtolower')) return (string)mb_strtolower($s, 'UTF-8');
  return strtolower($s);
}

function normalize_person_name(string $name): string {
  $name = trim(preg_replace('/\s+/u', ' ', $name) ?? $name);
  return conad_str_lower($name);
}

// Congregações (para dropdown)
$congregations = [];
$congregationsLoadError = null;
try {
  $congregations = $pdo->query("SELECT id, name FROM congregations WHERE is_active=1 ORDER BY (CASE WHEN name='Sede do Ministerio' THEN 0 ELSE 1 END) ASC, sort_order ASC, name ASC")->fetchAll();
} catch (Throwable $e) {
  $congregations = [];
  $congregationsLoadError = 'Lista de congregações ainda não configurada.';
}

$errors = [];
$createdId = null;

$cmsContent = conad_load_public_cms_content($pdo);
$termsTitle = (string)($cmsContent['termos']['title'] ?? 'Política de Inscrição');
$termsBody = (string)($cmsContent['termos']['body'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();

  // Fluxo novo: exige plano selecionado e aceite de termos no próprio formulário
  $prePlanId = (int)($_SESSION['conad_pre_plan_id'] ?? 0);
  $termsAccepted = (int)($_POST['terms_accepted'] ?? 0) === 1;
  if ((int)($_GET['rid'] ?? 0) <= 0) {
    if ($prePlanId <= 0) $errors[] = 'Você precisa selecionar um plano antes de continuar.';
    if (!$termsAccepted) $errors[] = 'Você precisa aceitar os termos para continuar.';
  }

  // 1) Primary Participant (required)
  $primaryFirstName = post_str('primary_first_name');
  $primaryLastName = post_str('primary_last_name');
  $primarySex = post_str('primary_sex');
  $primaryDob = parse_date_any(post_str('primary_dob'));
  $primaryPhoneRaw = post_str('primary_phone');
  $primaryPhone = $primaryPhoneRaw !== '' ? normalize_phone_international($primaryPhoneRaw) : null;
  $primaryEmail = post_str('primary_email');

  if ($primaryFirstName === '') $errors[] = 'Primeiro nome (ocupante principal) é obrigatório.';
  if ($primaryLastName === '') $errors[] = 'Sobrenome (ocupante principal) é obrigatório.';
  if (!in_array($primarySex, allowed_primary_sex_values(), true)) $errors[] = 'Sexo (ocupante principal) é obrigatório e deve ser Homem ou Mulher.';
  if ($primaryDob === null) $errors[] = 'Data de nascimento (ocupante principal) é obrigatória.';
  if ($primaryPhoneRaw === '' || $primaryPhone === null) $errors[] = 'Telefone (ocupante principal) inválido. Use com DDI obrigatório (ex: +55...).';
  if (!filter_var($primaryEmail, FILTER_VALIDATE_EMAIL)) $errors[] = 'Email (ocupante principal) inválido.';

  // 2) Ocupantes adicionais (dinâmico)
  $occupants = $_POST['occupants'] ?? [];
  $occupantsToInsert = [];
  if (is_array($occupants)) {
    foreach ($occupants as $occ) {
      if (!is_array($occ)) continue;
      $ofn = trim((string)($occ['first_name'] ?? ''));
      $oln = trim((string)($occ['last_name'] ?? ''));
      $osx = trim((string)($occ['sex'] ?? ''));
      $odRaw = trim((string)($occ['dob'] ?? ''));
      $od = parse_date_any($odRaw);
      $opRaw = trim((string)($occ['phone'] ?? ''));
      $op = $opRaw !== '' ? normalize_phone_international($opRaw) : null;
      $oe = trim((string)($occ['email'] ?? ''));

      // se bloco estiver totalmente vazio, ignora
      if ($ofn === '' && $oln === '' && $osx === '' && $odRaw === '' && $opRaw === '' && $oe === '') continue;

      if ($ofn === '' || $oln === '') {
        $errors[] = 'Para cada ocupante adicional, informe Nome e Sobrenome.';
        continue;
      }
      if (!in_array($osx, allowed_primary_sex_values(), true)) {
        $errors[] = 'Para cada ocupante adicional, informe o Sexo (Homem ou Mulher).';
        continue;
      }
      if ($od === null) {
        $errors[] = 'Para cada ocupante adicional, informe uma Data de nascimento válida.';
        continue;
      }
      if ($op === null) {
        $errors[] = 'Para cada ocupante adicional, informe um Telefone válido com DDI (ex: +55...).';
        continue;
      }
      if (!filter_var($oe, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Para cada ocupante adicional, informe um E-mail válido.';
        continue;
      }

      $occupantsToInsert[] = [
        'first_name' => $ofn,
        'last_name' => $oln,
        'sex' => $osx,
        'dob' => $od,
        'phone' => $op,
        'email' => $oe,
      ];
    }
  }

  // 3) Children (dynamic)
  $children = $_POST['children'] ?? [];
  $childrenToInsert = [];
  if (is_array($children)) {
    foreach ($children as $child) {
      if (!is_array($child)) continue;
      $cn = trim((string)($child['name'] ?? ''));
      $cln = trim((string)($child['last_name'] ?? ''));
      $cdRaw = trim((string)($child['dob'] ?? ''));
      $cd = parse_date_any($cdRaw);
      $cs = trim((string)($child['sex'] ?? ''));

      if ($cn === '' && $cdRaw === '') continue;
      if ($cn === '' || $cln === '' || $cd === null) {
        $errors[] = 'Para cada criança, informe Nome, Sobrenome e Data de nascimento.';
        continue;
      }

      if (!in_array($cs, allowed_primary_sex_values(), true)) {
        $errors[] = 'Para cada criança, informe o Sexo (Homem ou Mulher).';
        continue;
      }

      $childrenToInsert[] = ['name' => $cn, 'last_name' => $cln, 'dob' => $cd, 'sex' => $cs];
    }
  }

  // 4) Address (international) - required
  $street = post_str('address_street');
  $unit = post_str('address_unit');
  $city = post_str('address_city');
  $region = post_str('address_state');
  $postal = post_str('address_zip');
  $country = post_str('address_country');

  $countries = conad_countries_ptbr();

  if ($street === '') $errors[] = 'Endereço (rua e número) é obrigatório.';
  if ($city === '') $errors[] = 'Cidade é obrigatória.';
  if ($postal === '') $errors[] = 'CEP/Código postal é obrigatório.';
  if ($country === '') $errors[] = 'País é obrigatório.';
  if ($country !== '' && !in_array($country, $countries, true)) $errors[] = 'País inválido. Selecione um país da lista.';

  // 5) Church info
  $pastorName = post_str('pastor_name');
  $congregationIdRaw = post_str('congregation_id');
  $congregationId = $congregationIdRaw !== '' ? (int)$congregationIdRaw : 0;

  if ($pastorName === '') $errors[] = 'Nome do pastor é obrigatório.';
  if ($congregationsLoadError) $errors[] = $congregationsLoadError;
  if ($congregationId <= 0) $errors[] = 'Congregação é obrigatória.';

  if ($congregationId > 0) {
    try {
      $stmt = $pdo->prepare('SELECT id FROM congregations WHERE id=? AND is_active=1 LIMIT 1');
      $stmt->execute([$congregationId]);
      $exists = $stmt->fetch();
      if (!$exists) $errors[] = 'Congregação inválida.';
    } catch (Throwable $e) {
      $errors[] = 'Não foi possível validar a congregação.';
    }
  }

  // 6) Bloqueio de duplicidade (nome / email / telefone)
  // Regra solicitada: não permitir repetir nome, e-mail ou telefone em novas inscrições.
  if (!$errors) {
    $participantName = trim($primaryFirstName . ' ' . $primaryLastName);
    $nameKey = normalize_person_name($participantName);
    $emailKey = conad_str_lower($primaryEmail);

    // duplicidade dentro da própria submissão
    $submittedEmailKeys = [$emailKey];
    $submittedPhones = [$primaryPhone];
    $submittedNameKeys = [$nameKey];
    foreach ($occupantsToInsert as $o) {
      $okName = normalize_person_name(trim($o['first_name'] . ' ' . $o['last_name']));
      $okEmail = conad_str_lower((string)$o['email']);
      $okPhone = (string)$o['phone'];
      if (in_array($okName, $submittedNameKeys, true)) $errors[] = 'Nome já cadastrado.';
      else $submittedNameKeys[] = $okName;
      if (in_array($okEmail, $submittedEmailKeys, true)) $errors[] = 'E-mail já cadastrado.';
      else $submittedEmailKeys[] = $okEmail;
      if (in_array($okPhone, $submittedPhones, true)) $errors[] = 'Telefone já cadastrado.';
      else $submittedPhones[] = $okPhone;
    }

    try {
      $stmt = $pdo->prepare('SELECT id FROM registrations WHERE LOWER(participant_name)=? LIMIT 1');
      $stmt->execute([$nameKey]);
      if ($stmt->fetch()) $errors[] = 'Nome já cadastrado.';

      $stmt = $pdo->prepare('SELECT id FROM registrations WHERE LOWER(participant_email)=? OR LOWER(primary_email)=? LIMIT 1');
      $stmt->execute([$emailKey, $emailKey]);
      if ($stmt->fetch()) $errors[] = 'E-mail já cadastrado.';

      // Telefones são gravados normalizados (E.164). Checamos contra colunas comuns.
      $stmt = $pdo->prepare('SELECT id FROM registrations WHERE participant_phone=? OR primary_phone=? OR secondary_phone=? LIMIT 1');
      $stmt->execute([$primaryPhone, $primaryPhone, $primaryPhone]);
      if ($stmt->fetch()) $errors[] = 'Telefone já cadastrado.';

      // Ocupantes adicionais (quando a tabela existir)
      if (db_has_table($pdo, 'registration_occupants')) {
        foreach ($occupantsToInsert as $o) {
          $okEmail = conad_str_lower((string)$o['email']);
          $okPhone = (string)$o['phone'];
          $okName = normalize_person_name(trim($o['first_name'] . ' ' . $o['last_name']));

          $stmt = $pdo->prepare('SELECT id FROM registration_occupants WHERE LOWER(CONCAT(occupant_first_name, " ", occupant_last_name))=? LIMIT 1');
          $stmt->execute([$okName]);
          if ($stmt->fetch()) $errors[] = 'Nome já cadastrado.';

          $stmt = $pdo->prepare('SELECT id FROM registration_occupants WHERE LOWER(occupant_email)=? LIMIT 1');
          $stmt->execute([$okEmail]);
          if ($stmt->fetch()) $errors[] = 'E-mail já cadastrado.';

          $stmt = $pdo->prepare('SELECT id FROM registration_occupants WHERE occupant_phone=? LIMIT 1');
          $stmt->execute([$okPhone]);
          if ($stmt->fetch()) $errors[] = 'Telefone já cadastrado.';
        }
      }
    } catch (Throwable $e) {
      // Não bloqueia por falha de consulta, mas registra para diagnóstico.
      error_log('[inscricao.php] Falha ao validar duplicidade: ' . (string)$e->getMessage());
    }
  }

    if (!$errors) {
      $ip = isset($_SERVER['REMOTE_ADDR']) ? (string)$_SERVER['REMOTE_ADDR'] : null;
      $ua = isset($_SERVER['HTTP_USER_AGENT']) ? (string)$_SERVER['HTTP_USER_AGENT'] : null;

        $pdo->beginTransaction();
        try {
            // Step 3 (novo fluxo) cria o registro já com plano e termos aceitos.
            $hasPrimarySexColumn = db_has_column($pdo, 'registrations', 'primary_sex');
            $hasChildSexColumn = db_has_column($pdo, 'registration_children', 'child_sex');
            $hasChildLastNameColumn = db_has_column($pdo, 'registration_children', 'child_last_name');
            $hasOccupantsTable = db_has_table($pdo, 'registration_occupants');

            $fieldsPayload = [];
            if (!$hasPrimarySexColumn) $fieldsPayload['sexo'] = $primarySex;
            if ($childrenToInsert && (!$hasChildSexColumn || !$hasChildLastNameColumn)) {
              $fieldsPayload['children'] = array_map(function (array $c) {
                return ['name' => $c['name'], 'last_name' => $c['last_name'], 'dob' => $c['dob'], 'sex' => $c['sex']];
              }, $childrenToInsert);
            }
            if ($occupantsToInsert && !$hasOccupantsTable) {
              $fieldsPayload['occupants'] = array_map(function (array $o) {
                return [
                  'first_name' => $o['first_name'],
                  'last_name' => $o['last_name'],
                  'sex' => $o['sex'],
                  'dob' => $o['dob'],
                  'phone' => $o['phone'],
                  'email' => $o['email'],
                ];
              }, $occupantsToInsert);
            }

            $fieldsJson = $fieldsPayload ? json_encode($fieldsPayload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null;

            $cols = [
              'plan_id', 'payment_mode',
              'participant_name', 'participant_email', 'participant_phone',
              'primary_first_name', 'primary_last_name',
            ];
            $vals = [
              $prePlanId, 'full',
              $participantName, $primaryEmail, $primaryPhone,
              $primaryFirstName, $primaryLastName,
            ];

            if ($hasPrimarySexColumn) {
              $cols[] = 'primary_sex';
              $vals[] = $primarySex;
            }

            $cols = array_merge($cols, ['primary_dob', 'primary_phone', 'primary_email']);
            $vals = array_merge($vals, [$primaryDob, $primaryPhone, $primaryEmail]);

            // Mantém colunas de 2º ocupante por compatibilidade, mas o fluxo novo usa ocupantes adicionais dinâmicos
            $cols = array_merge($cols, ['secondary_name', 'secondary_sex', 'secondary_dob', 'secondary_phone', 'secondary_email']);
            $vals = array_merge($vals, [null, null, null, null, null]);

            $cols = array_merge($cols, [
              'address_street', 'address_unit', 'address_city', 'address_state', 'address_zip', 'address_country',
              'pastor_name', 'congregation_id',
              'fields_json',
              'terms_accepted', 'terms_accepted_at', 'terms_accepted_ip', 'terms_accepted_user_agent',
              'status', 'ip_address', 'user_agent', 'current_step'
            ]);
            $vals = array_merge($vals, [
              $street,
              ($unit === '' ? null : $unit),
              $city,
              ($region === '' ? null : $region),
              $postal,
              $country,
              $pastorName,
              $congregationId,
              $fieldsJson,
              ($termsAccepted ? 1 : 0),
              ($termsAccepted ? date('Y-m-d H:i:s') : null),
              $ip,
              $ua,
              'pending',
              $ip,
              $ua,
              4,
            ]);

            $placeholders = implode(',', array_fill(0, count($cols), '?'));
            $stmt = $pdo->prepare('INSERT INTO registrations (' . implode(',', $cols) . ') VALUES (' . $placeholders . ')');
            $stmt->execute($vals);

            $createdId = (int)$pdo->lastInsertId();

            if ($occupantsToInsert && $hasOccupantsTable) {
              $stmtOcc = $pdo->prepare('INSERT INTO registration_occupants (registration_id, occupant_first_name, occupant_last_name, occupant_sex, occupant_dob, occupant_phone, occupant_email) VALUES (?,?,?,?,?,?,?)');
              foreach ($occupantsToInsert as $o) {
                $stmtOcc->execute([$createdId, $o['first_name'], $o['last_name'], $o['sex'], $o['dob'], $o['phone'], $o['email']]);
              }
            }

            if ($childrenToInsert) {
              if ($hasChildSexColumn) {
                if ($hasChildLastNameColumn) {
                  $stmtChild = $pdo->prepare('INSERT INTO registration_children (registration_id, child_name, child_last_name, child_dob, child_sex) VALUES (?,?,?,?,?)');
                  foreach ($childrenToInsert as $c) {
                    $stmtChild->execute([$createdId, $c['name'], $c['last_name'], $c['dob'], $c['sex']]);
                  }
                } else {
                  $stmtChild = $pdo->prepare('INSERT INTO registration_children (registration_id, child_name, child_dob, child_sex) VALUES (?,?,?,?)');
                  foreach ($childrenToInsert as $c) {
                    $stmtChild->execute([$createdId, $c['name'], $c['dob'], $c['sex']]);
                  }
                }
              } else {
                if ($hasChildLastNameColumn) {
                  $stmtChild = $pdo->prepare('INSERT INTO registration_children (registration_id, child_name, child_last_name, child_dob) VALUES (?,?,?,?)');
                  foreach ($childrenToInsert as $c) {
                    $stmtChild->execute([$createdId, $c['name'], $c['last_name'], $c['dob']]);
                  }
                } else {
                  $stmtChild = $pdo->prepare('INSERT INTO registration_children (registration_id, child_name, child_dob) VALUES (?,?,?)');
                  foreach ($childrenToInsert as $c) {
                    $stmtChild->execute([$createdId, $c['name'], $c['dob']]);
                  }
                }
              }
            }

            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            $errors[] = 'Não foi possível salvar sua inscrição. Tente novamente.';

          $msg = (string)$e->getMessage();
          $hint = null;

          // Dicas comuns (principalmente quando o banco em produção ainda está com schema antigo)
          $msgLower = strtolower($msg);
          if (
            str_contains($msgLower, 'address_state') ||
            str_contains($msgLower, 'address_zip') ||
            str_contains($msgLower, 'address_country')
          ) {
            $hint = 'Seu banco pode estar com o schema antigo de endereço. No phpMyAdmin, rode: ALTER TABLE registrations MODIFY COLUMN address_state VARCHAR(120) NULL, MODIFY COLUMN address_zip VARCHAR(32) NULL, MODIFY COLUMN address_country VARCHAR(120) NULL;';
          } elseif (str_contains($msgLower, 'primary_sex') || str_contains($msgLower, 'child_sex') || str_contains($msgLower, 'child_last_name') || str_contains($msgLower, 'registration_occupants')) {
            $hint = 'Seu banco pode estar sem as colunas/tabelas novas. No phpMyAdmin, rode: ALTER TABLE registrations ADD COLUMN primary_sex ENUM(\'Homem\',\'Mulher\') NULL AFTER primary_last_name; ALTER TABLE registration_children ADD COLUMN child_last_name VARCHAR(191) NULL AFTER child_name, ADD COLUMN child_sex ENUM(\'Homem\',\'Mulher\') NULL AFTER child_dob; CREATE TABLE registration_occupants (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, registration_id BIGINT UNSIGNED NOT NULL, occupant_first_name VARCHAR(100) NOT NULL, occupant_last_name VARCHAR(100) NOT NULL, occupant_sex ENUM(\'Homem\',\'Mulher\') NOT NULL, occupant_dob DATE NOT NULL, occupant_phone VARCHAR(32) NOT NULL, occupant_email VARCHAR(191) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (id), KEY idx_occupants_registration_id (registration_id), KEY idx_occupants_email (occupant_email), KEY idx_occupants_phone (occupant_phone), CONSTRAINT fk_occupants_registration_id FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;';
          } elseif (str_contains($msgLower, 'unknown column') || str_contains($msgLower, 'column not found')) {
            $hint = 'Seu banco parece estar desatualizado (colunas faltando). Atualize o schema no MySQL (phpMyAdmin) antes de tentar novamente.';
          }

          if ($hint) {
            $errors[] = $hint;
          }

          error_log('[inscricao.php] Falha ao inserir registration: ' . $msg);
          if (app_debug_enabled()) {
            $errors[] = 'Detalhes (debug): ' . $msg;
            if ($e instanceof PDOException && is_array($e->errorInfo ?? null)) {
              $errors[] = 'PDO errorInfo (debug): ' . json_encode($e->errorInfo, JSON_UNESCAPED_UNICODE);
            }
          }
        }

        if ($createdId) {
          // Limpa estado do pré-fluxo
          unset($_SESSION['conad_pre_plan_id'], $_SESSION['conad_pre_plan_selected_at'], $_SESSION['conad_pre_terms_accepted'], $_SESSION['conad_pre_terms_accepted_at']);
          redirect('/checkout.php?rid=' . $createdId);
        }
    }
}

?><!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Inscrição</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/intl-tel-input@25.13.2/build/css/intlTelInput.css" />
  <link rel="stylesheet" href="css/site.css" />
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

  <header class="site-header" data-header>
    <div class="container header-inner">
      <div class="header-left">
        <button class="menu-toggle" type="button" aria-label="Abrir menu" aria-expanded="false" data-menu-toggle>
          <span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>
        </button>

        <a class="brand" href="index.html" aria-label="CONAD 2026">
          <img class="brand-logo" src="images/novo-logo.png" width="140" height="32" decoding="async" loading="eager" alt="CONAD 2026" data-cms-attr="src:global.logoSrc;alt:global.logoAlt" />
          <span class="brand-text"><span class="brand-mark" data-cms-text="global.brandMark">CONAD</span><span class="brand-year" data-cms-text="global.brandYear">2026</span></span>
        </a>
      </div>

      <nav class="nav" aria-label="Navegação principal">
        <a href="index.html">Home</a>
        <a href="precos.html">Preços</a>
        <a href="informacoes.html">Informações</a>
        <a href="preletores.html">Preletores</a>
        <a href="local.php">Local</a>
      </nav>

      <div class="header-actions">
        <a class="btn btn-primary is-sm" href="precos.html"><span class="btn-ico" aria-hidden="true"><i class="fa-solid fa-tag"></i></span>Ver preços</a>
      </div>
    </div>

    <div class="menu-overlay" data-menu-overlay aria-hidden="true">
      <div class="menu-panel" role="dialog" aria-modal="true" aria-label="Menu" data-menu-panel>
        <nav class="menu-nav" aria-label="Navegação do menu">
          <a class="menu-link" href="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i><span>Home</span></a>
          <a class="menu-link" href="precos.html"><i class="fa-solid fa-tag" aria-hidden="true"></i><span>Preços</span></a>
          <a class="menu-link" href="informacoes.html"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Informações</span></a>
          <a class="menu-link" href="preletores.html"><i class="fa-solid fa-user-group" aria-hidden="true"></i><span>Preletores</span></a>
          <a class="menu-link" href="local.php"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>Local</span></a>
        </nav>
      </div>
    </div>
  </header>

<main class="section">
  <div class="container" style="max-width:860px">
    <h1 class="h2">Inscrição</h1>
    <p class="section-lead" style="margin-top:10px">Passo 3 — Cadastro</p>

      <?php if ($errors): ?>
        <div class="card" style="padding:12px;border-color:#ffdddd;background:#fff5f5;color:#9b1c1c;margin-top:14px">
          <?php echo h(implode(' ', $errors)); ?>
        </div>
      <?php endif; ?>

      <div class="card form-surface" style="padding:16px;margin-top:14px">
        <form method="post">
          <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>" />

          <div class="form-hint">Campos com * são obrigatórios.</div>

          <div class="form-section">
            <div class="form-section-title">1) Ocupante principal</div>
            <div class="form-grid is-2col">
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Nome *</span>
              <input class="input" name="primary_first_name" value="<?php echo h((string)($_POST['primary_first_name'] ?? '')); ?>" required />
            </label>

            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Sobrenome *</span>
              <input class="input" name="primary_last_name" value="<?php echo h((string)($_POST['primary_last_name'] ?? '')); ?>" required />
            </label>

            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Data de nascimento *</span>
              <input class="input" type="text" name="primary_dob" inputmode="numeric" autocomplete="bday" placeholder="DD/MM/AAAA" pattern="\d{2}/\d{2}/\d{4}" title="Use DD/MM/AAAA" value="<?php echo h((string)($_POST['primary_dob'] ?? '')); ?>" data-mask-date required />
            </label>

            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Sexo *</span>
              <?php $postedSex = (string)($_POST['primary_sex'] ?? ''); ?>
              <select class="input" name="primary_sex" required>
                <option value="">Selecione…</option>
                <?php foreach (allowed_primary_sex_values() as $sx): ?>
                  <option value="<?php echo h($sx); ?>" <?php echo ($postedSex === $sx) ? 'selected' : ''; ?>><?php echo h($sx); ?></option>
                <?php endforeach; ?>
              </select>
            </label>

            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Telefone *</span>
              <input class="input" name="primary_phone" inputmode="tel" autocomplete="tel" value="<?php echo h((string)($_POST['primary_phone'] ?? '')); ?>" required />
              <div class="form-hint">Selecione o país e digite o número. Será salvo como <strong>+DDI...</strong></div>
            </label>

            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">E-mail *</span>
              <input class="input" type="email" name="primary_email" autocomplete="email" value="<?php echo h((string)($_POST['primary_email'] ?? '')); ?>" required />
            </label>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">2) Ocupantes adicionais (opcional)</div>
            <div class="form-hint" style="margin-top:10px">Clique em <strong>Adicionar mais pessoas</strong>. Para cada ocupante adicional, os campos são iguais ao ocupante principal e são obrigatórios.</div>
            <div style="margin-top:10px" data-occupants-list></div>
            <div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-primary is-sm" type="button" data-add-occupant>
                <span class="btn-ico" aria-hidden="true"><i class="fa-solid fa-user-plus"></i></span>
                Adicionar mais pessoas
              </button>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">3) Crianças (opcional)</div>
            <div style="margin-top:10px" data-children-list></div>
            <div style="margin-top:10px;display:flex;gap:12px;flex-wrap:wrap">
              <button class="btn btn-primary is-sm" type="button" data-add-child>
                <span class="btn-ico" aria-hidden="true"><i class="fa-solid fa-child-reaching"></i></span>
                Adicionar criança
              </button>
            </div>
          </div>

          <template data-child-template>
            <div data-child-item style="margin-top:10px;padding:12px;border:1px solid var(--color-border);border-radius:12px">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px">
                <div style="font-weight:700">Criança</div>
                <button class="btn btn-ghost is-sm" type="button" data-remove-child>
                  <span class="btn-ico" aria-hidden="true"><i class="fa-solid fa-trash"></i></span>
                  Remover
                </button>
              </div>
              <div style="display:grid;grid-template-columns:1fr;gap:10px">
                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Nome da criança</span>
                  <input class="input" data-child-name />
                </label>
                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Sobrenome da criança</span>
                  <input class="input" data-child-last-name />
                </label>
                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Sexo da criança</span>
                  <select class="input" data-child-sex>
                    <option value="">Selecione…</option>
                    <option value="Homem">Homem</option>
                    <option value="Mulher">Mulher</option>
                  </select>
                </label>
                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Data de nascimento da criança</span>
                  <input class="input" type="text" inputmode="numeric" placeholder="DD/MM/AAAA" pattern="\d{2}/\d{2}/\d{4}" title="Use DD/MM/AAAA" data-child-dob data-mask-date />
                </label>
              </div>
            </div>
          </template>

          <template data-occupant-template>
            <div data-occupant-item style="margin-top:10px;padding:12px;border:1px solid var(--color-border);border-radius:12px">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px">
                <div style="font-weight:700">Ocupante adicional</div>
                <button class="btn btn-ghost is-sm" type="button" data-remove-occupant>
                  <span class="btn-ico" aria-hidden="true"><i class="fa-solid fa-trash"></i></span>
                  Remover
                </button>
              </div>

              <div class="form-grid is-2col">
                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Nome *</span>
                  <input class="input" data-occ-first required />
                </label>

                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Sobrenome *</span>
                  <input class="input" data-occ-last required />
                </label>

                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Data de nascimento *</span>
                  <input class="input" type="text" inputmode="numeric" placeholder="DD/MM/AAAA" pattern="\d{2}/\d{2}/\d{4}" title="Use DD/MM/AAAA" data-occ-dob data-mask-date required />
                </label>

                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Sexo *</span>
                  <select class="input" data-occ-sex required>
                    <option value="">Selecione…</option>
                    <option value="Homem">Homem</option>
                    <option value="Mulher">Mulher</option>
                  </select>
                </label>

                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">Telefone *</span>
                  <input class="input" data-occ-phone inputmode="tel" autocomplete="tel" required />
                  <div class="form-hint">Selecione o país e digite o número. Será salvo como <strong>+DDI...</strong></div>
                </label>

                <label style="display:flex;flex-direction:column;gap:8px">
                  <span style="font-size:13px;color:var(--color-muted)">E-mail *</span>
                  <input class="input" type="email" data-occ-email autocomplete="email" required />
                </label>
              </div>
            </div>
          </template>

          <div class="form-section">
            <div class="form-section-title">4) Endereço</div>
            <div class="form-grid is-2col">
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Endereço (rua e número) *</span>
              <input class="input" name="address_street" autocomplete="street-address" value="<?php echo h((string)($_POST['address_street'] ?? '')); ?>" required />
            </label>
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Complemento</span>
              <input class="input" name="address_unit" value="<?php echo h((string)($_POST['address_unit'] ?? '')); ?>" />
            </label>
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Cidade *</span>
              <input class="input" name="address_city" autocomplete="address-level2" value="<?php echo h((string)($_POST['address_city'] ?? '')); ?>" required />
            </label>
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Estado / Região / Província (opcional)</span>
              <input class="input" name="address_state" autocomplete="address-level1" placeholder="Ex: SP, CA, Ontario" value="<?php echo h((string)($_POST['address_state'] ?? '')); ?>" />
            </label>
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">CEP / Código postal *</span>
              <input class="input" name="address_zip" autocomplete="postal-code" placeholder="Ex: 01310-200" value="<?php echo h((string)($_POST['address_zip'] ?? '')); ?>" required />
            </label>
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">País *</span>
              <?php $postedCountry = (string)($_POST['address_country'] ?? ''); ?>
              <select class="input" name="address_country" autocomplete="country-name" required>
                <option value="">Selecione…</option>
                <?php foreach (conad_countries_ptbr() as $ct): ?>
                  <option value="<?php echo h($ct); ?>" <?php echo ($postedCountry === $ct) ? 'selected' : ''; ?>><?php echo h($ct); ?></option>
                <?php endforeach; ?>
              </select>
            </label>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">5) Informações da igreja</div>
            <div class="form-grid is-2col">
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Nome do pastor *</span>
              <input class="input" name="pastor_name" value="<?php echo h((string)($_POST['pastor_name'] ?? '')); ?>" required />
            </label>
            <label style="display:flex;flex-direction:column;gap:8px">
              <span style="font-size:13px;color:var(--color-muted)">Congregação *</span>
              <select class="input" name="congregation_id" required>
                <option value="">Selecione…</option>
                <?php $postedCong = (string)($_POST['congregation_id'] ?? ''); ?>
                <?php foreach ($congregations as $c): ?>
                  <option value="<?php echo h((string)$c['id']); ?>" <?php echo ($postedCong === (string)$c['id']) ? 'selected' : ''; ?>><?php echo h((string)$c['name']); ?></option>
                <?php endforeach; ?>
              </select>
              <?php if ($congregationsLoadError): ?>
                <div style="margin-top:6px;color:var(--color-muted);font-size:12px">Admin: configure em <code>/admin/congregations.php</code>.</div>
              <?php endif; ?>
            </label>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section-title">6) Termos</div>

            <?php if (trim($termsBody) !== ''): ?>
              <div class="card" style="padding:14px;border-color:var(--color-border);margin-bottom:12px">
                <div style="font-weight:600;margin-bottom:8px"><?php echo h($termsTitle); ?></div>
                <div style="color:var(--color-muted);line-height:1.65;max-height:260px;overflow:auto;white-space:pre-wrap">
                  <?php echo h($termsBody); ?>
                </div>
              </div>
            <?php endif; ?>

            <label style="display:flex;gap:10px;align-items:flex-start">
              <input type="checkbox" name="terms_accepted" value="1" <?php echo ((int)($_POST['terms_accepted'] ?? 0) === 1) ? 'checked' : ''; ?> required />
              <span style="line-height:1.35">
                Li e aceito os termos. <a href="termos.php" target="_blank" rel="noopener">Abrir em nova guia</a>
              </span>
            </label>
          </div>

          <div style="margin-top:14px;display:flex;gap:12px;flex-wrap:wrap">
            <button class="btn btn-primary is-sm" type="submit">
              <span class="btn-ico" aria-hidden="true"><i class="fa-solid fa-circle-check"></i></span>
              Enviar inscrição
            </button>
            <a class="btn btn-ghost is-sm" href="precos.html#lotes">
              <span class="btn-ico" aria-hidden="true"><i class="fa-solid fa-arrow-left"></i></span>
              Voltar
            </a>
          </div>
        </form>
      </div>
  </div>
</main>

<script src="https://cdn.jsdelivr.net/npm/intl-tel-input@25.13.2/build/js/intlTelInput.min.js"></script>
<script>
  (function () {
    function setupIntlTelInput(input) {
      if (!input || !window.intlTelInput) return null;

      return window.intlTelInput(input, {
        initialCountry: "us",
        preferredCountries: ["us"],
        nationalMode: true,
        separateDialCode: true,
        autoPlaceholder: "aggressive",
        dropdownContainer: document.body,
        validationNumberTypes: null,
        loadUtils: function () {
          return import("https://cdn.jsdelivr.net/npm/intl-tel-input@25.13.2/build/js/utils.js");
        },
      });
    }

    document.addEventListener("DOMContentLoaded", function () {
      var form = document.querySelector("form[method='post']");
      var primary = document.querySelector("input[name='primary_phone']");
      if (!form || !primary) return;

      var itis = [];
      var itiPrimary = setupIntlTelInput(primary);
      if (itiPrimary) itis.push({ input: primary, iti: itiPrimary });

      form.addEventListener("submit", function () {
        itis.forEach(function (row) {
          var value = (row.input.value || "").trim();
          if (!value) return;
          try {
            if (row.iti && row.iti.isValidNumber()) {
              row.input.value = row.iti.getNumber();
            }
          } catch (e) {
            // fallback: deixa o backend validar
          }
        });
      });
    });
  })();
</script>

<script src="js/content.js"></script>
<script src="js/site.js"></script>
<script src="js/registration.js"></script>
</body>
</html>
