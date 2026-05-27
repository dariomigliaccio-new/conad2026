<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$pdo = db();
$err = '';
$ok = '';

// Carregar preletores do JSON
$prelatoresPath = __DIR__ . '/../content/preletores.json';
$preletores = [];
if (file_exists($prelatoresPath)) {
  $preletores = json_decode(file_get_contents($prelatoresPath), true) ?: [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_verify();
  $action = (string)($_POST['action'] ?? '');

  try {
    if ($action === 'add_preletor') {
      $newPreletor = [
        'id' => uniqid('spk_'),
        'name' => $_POST['name'] ?? '',
        'title' => $_POST['title'] ?? '',
        'bio' => $_POST['bio'] ?? '',
        'image' => $_POST['image'] ?? '',
      ];
      
      if (empty($newPreletor['name'])) {
        throw new Exception('Nome é obrigatório');
      }

      $preletores[] = $newPreletor;
      if (file_put_contents($prelatoresPath, json_encode($preletores, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
        $ok = 'Preletor adicionado com sucesso!';
      } else {
        throw new Exception('Erro ao salvar preletor');
      }
    } 
    elseif ($action === 'delete_preletor') {
      $id = (string)($_POST['id'] ?? '');
      $preletores = array_filter($preletores, fn($p) => $p['id'] !== $id);
      if (file_put_contents($prelatoresPath, json_encode($preletores, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
        $ok = 'Preletor removido com sucesso!';
      } else {
        throw new Exception('Erro ao remover preletor');
      }
    }
    elseif ($action === 'update_preletor') {
      $id = (string)($_POST['id'] ?? '');
      foreach ($preletores as &$p) {
        if ($p['id'] === $id) {
          $p['name'] = $_POST['name'] ?? '';
          $p['title'] = $_POST['title'] ?? '';
          $p['bio'] = $_POST['bio'] ?? '';
          $p['image'] = $_POST['image'] ?? '';
          break;
        }
      }
      if (file_put_contents($prelatoresPath, json_encode($preletores, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
        $ok = 'Preletor atualizado com sucesso!';
      } else {
        throw new Exception('Erro ao salvar preletor');
      }
    }
  } catch (Throwable $e) {
    $err = 'Erro: ' . $e->getMessage();
  }
}

admin_header('Preletores');
?>

<?php if ($ok): ?><div class="alert" style="background:#d4edda;border-color:#c3e6cb;color:#155724;margin-bottom:16px"><?php echo h($ok); ?></div><?php endif; ?>
<?php if ($err): ?><div class="alert" style="background:#f8d7da;border-color:#f5c6cb;color:#721c24;margin-bottom:16px"><?php echo h($err); ?></div><?php endif; ?>

<style>
.preletor-card {
  background:#f9f9f9;
  border:1px solid #ddd;
  border-radius:8px;
  padding:16px;
  margin-bottom:12px;
  display:flex;gap:16px;
}

.preletor-image {
  width:80px;
  height:80px;
  border-radius:6px;
  object-fit:cover;
  background:#e0e0e0;
  flex-shrink:0;
}

.preletor-info {
  flex:1;
}

.preletor-name {
  font-weight:600;
  margin:0;
}

.preletor-title {
  color:#666;
  margin:4px 0;
  font-size:14px;
}

.preletor-actions {
  display:flex;gap:8px;align-items:center;
}

.preletor-actions button {
  padding:6px 12px;
  font-size:12px;
  border:1px solid #ddd;
  background:#fff;
  cursor:pointer;
  border-radius:4px;
}

.preletor-actions button:hover {
  background:#f0f0f0;
}
</style>

<!-- Listar preletores -->
<div class="admin-card">
  <div class="card-title">Preletores Cadastrados (<?php echo count($preletores); ?>)</div>
  
  <?php if (empty($preletores)): ?>
    <p style="color:#666;margin:0">Nenhum preletor cadastrado ainda.</p>
  <?php else: ?>
    <?php foreach ($preletores as $preletor): ?>
      <div class="preletor-card">
        <?php if (!empty($preletor['image'])): ?>
          <img src="<?php echo h($preletor['image']); ?>" alt="<?php echo h($preletor['name']); ?>" class="preletor-image">
        <?php else: ?>
          <div class="preletor-image" style="display:flex;align-items:center;justify-content:center;font-size:28px">📷</div>
        <?php endif; ?>
        
        <div class="preletor-info">
          <h3 class="preletor-name"><?php echo h($preletor['name']); ?></h3>
          <p class="preletor-title"><?php echo h($preletor['title'] ?? ''); ?></p>
          <?php if (!empty($preletor['bio'])): ?>
            <p style="font-size:13px;color:#555;margin:8px 0"><?php echo nl2br(h($preletor['bio'])); ?></p>
          <?php endif; ?>
        </div>

        <div class="preletor-actions">
          <button onclick="editarPreletor('<?php echo h($preletor['id']); ?>')">✎ Editar</button>
          <form method="post" style="display:inline;margin:0">
            <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
            <input type="hidden" name="action" value="delete_preletor">
            <input type="hidden" name="id" value="<?php echo h($preletor['id']); ?>">
            <button type="submit" onclick="return confirm('Tem certeza que quer remover?')" style="border-color:#c33;color:#c33;background:#fee">🗑 Remover</button>
          </form>
        </div>
      </div>
    <?php endforeach; ?>
  <?php endif; ?>
</div>

<!-- Formulário para adicionar novo preletor -->
<div class="admin-card">
  <div class="card-title">Adicionar Novo Preletor</div>

  <form method="post" id="form-preletor" action="<?php echo ADMIN_BASE_PATH; ?>/preletores.php">
    <input type="hidden" name="_csrf" value="<?php echo h(csrf_token()); ?>">
    <input type="hidden" name="action" value="add_preletor">
    <input type="hidden" name="id" id="form-preletor-id" value="">

    <div class="form-row">
      <label class="label">Nome completo *</label>
      <input class="input" type="text" id="form-name" name="name" required placeholder="Ex: João da Silva">
    </div>

    <div class="form-row">
      <label class="label">Título / Cargo</label>
      <input class="input" type="text" id="form-title" name="title" placeholder="Ex: Pastor, Evangelista">
    </div>

    <div class="form-row">
      <label class="label">Biografia / Descrição</label>
      <textarea class="textarea" id="form-bio" name="bio" rows="3" placeholder="Texto sobre o preletor"></textarea>
    </div>

    <div class="form-row">
      <label class="label">URL da Foto</label>
      <input class="input" type="text" id="form-image" name="image" placeholder="https://...ou /uploads/...">
      <small style="color:#666;margin-top:6px">Você pode fazer upload de uma imagem clicando no botão abaixo</small>
    </div>

    <div class="form-row">
      <label class="label">Ou selecionar uma imagem</label>
      <div style="border:2px dashed #ccc;border-radius:6px;padding:16px;text-align:center;cursor:pointer" id="drop-zone-preletor" onclick="document.getElementById('file-preletor').click()">
        <div style="font-size:28px;margin-bottom:8px">📤</div>
        <div style="color:#666">Clique aqui ou arraste uma imagem</div>
      </div>
      <input type="file" id="file-preletor" accept="image/*" style="display:none">
      <div id="upload-status-preletor" style="margin-top:8px;font-size:12px"></div>
    </div>

    <div style="display:flex;gap:10px">
      <button class="btn btn-primary" type="submit">Adicionar Preletor</button>
      <button class="btn btn-ghost" type="button" onclick="limparFormulario()">Limpar</button>
    </div>
  </form>
</div>

<script>
function limparFormulario() {
  document.getElementById('form-preletor-id').value = '';
  document.getElementById('form-name').value = '';
  document.getElementById('form-title').value = '';
  document.getElementById('form-bio').value = '';
  document.getElementById('form-image').value = '';
  document.querySelector('[name="action"]').value = 'add_preletor';
  document.querySelector('.card-title').textContent = 'Adicionar Novo Preletor';
}

function editarPreletor(id) {
  alert('Edição em linha virá em breve. Por enquanto, remova e crie novamente.');
}

// Upload de imagem
const dropZone = document.getElementById('drop-zone-preletor');
const fileInput = document.getElementById('file-preletor');
const statusDiv = document.getElementById('upload-status-preletor');

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '#666';
  dropZone.style.background = '#f0f0f0';
});

dropZone.addEventListener('dragleave', () => {
  dropZone.style.borderColor = '#ccc';
  dropZone.style.background = 'transparent';
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropZone.style.borderColor = '#ccc';
  dropZone.style.background = 'transparent';
  handleFileUpload(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    handleFileUpload(e.target.files[0]);
  }
});

function handleFileUpload(file) {
  if (!file.type.startsWith('image/')) {
    statusDiv.textContent = '❌ Selecione uma imagem válida';
    statusDiv.style.color = '#c33';
    return;
  }

  statusDiv.textContent = '⏳ Enviando...';
  statusDiv.style.color = '#666';

  const formData = new FormData();
  formData.append('field', 'preletor_image');
  formData.append('image', file);
  formData.append('_csrf', document.querySelector('[name="_csrf"]').value);

  fetch('<?php echo ADMIN_BASE_PATH; ?>/upload.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      document.getElementById('form-image').value = data.url;
      statusDiv.textContent = '✅ Imagem carregada com sucesso!';
      statusDiv.style.color = '#0d6';
    } else {
      statusDiv.textContent = '❌ ' + (data.error || 'Erro ao carregar');
      statusDiv.style.color = '#c33';
    }
  })
  .catch(() => {
    statusDiv.textContent = '❌ Erro de conexão';
    statusDiv.style.color = '#c33';
  });
}
</script>

<?php require_once __DIR__ . '/includes/layout-footer.php';
