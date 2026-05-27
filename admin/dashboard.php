<?php
require_once __DIR__ . '/includes/bootstrap.php';
require_once __DIR__ . '/includes/layout.php';
require_login();

$statusView = (string)($_GET['status'] ?? 'all');
$allowedStatus = ['all', 'pending', 'paid', 'canceled'];
if (!in_array($statusView, $allowedStatus, true)) $statusView = 'all';

$pdo = db();

function q_count(PDO $pdo, string $sql, array $params = []): int {
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $v = $stmt->fetchColumn();
  return (int)($v === false || $v === null ? 0 : $v);
}

$counts = [
  'registrations' => q_count($pdo, 'SELECT COUNT(*) FROM registrations'),
  'pending' => q_count($pdo, "SELECT COUNT(*) FROM registrations WHERE status='pending'"),
  'paid' => q_count($pdo, "SELECT COUNT(*) FROM registrations WHERE status='paid'"),
  'canceled' => q_count($pdo, "SELECT COUNT(*) FROM registrations WHERE status='canceled'"),
  'completed' => q_count($pdo, 'SELECT COUNT(*) FROM registrations WHERE current_step>=5'),
];

admin_header('Dashboard', ['hideTitle' => true]);

$statusLabel = [
  'all' => 'Todos',
  'pending' => 'Pendentes',
  'paid' => 'Pagos',
  'canceled' => 'Cancelados',
];
?>

<div class="admin-dashboard">
  <section class="admin-main" style="width:100%">
    <div class="admin-topbar" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px">
        <h2 style="margin:0">Dashboard</h2>
      </div>

      <div class="topbar-actions" aria-label="Filtros de status">
        <?php foreach ($allowedStatus as $st): ?>
          <?php $isActive = ($statusView === $st); ?>
          <a class="btn <?php echo $isActive ? 'btn-outline' : 'btn-ghost'; ?> is-sm" href="<?php echo ADMIN_BASE_PATH; ?>/dashboard.php?status=<?php echo h($st); ?>">
            <?php echo h($statusLabel[$st] ?? $st); ?>
          </a>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="admin-metrics" aria-label="Resumo">
      <div class="admin-metric"><p class="k">Inscrições</p><p class="v" data-metric="registrations"><?php echo h((string)$counts['registrations']); ?></p></div>
      <div class="admin-metric"><p class="k">Pagos</p><p class="v" data-metric="paid"><?php echo h((string)$counts['paid']); ?></p></div>
      <div class="admin-metric"><p class="k">Pendentes</p><p class="v" data-metric="pending"><?php echo h((string)$counts['pending']); ?></p></div>
      <div class="admin-metric"><p class="k">Concluídas</p><p class="v" data-metric="completed"><?php echo h((string)$counts['completed']); ?></p></div>
    </div>

    <div class="admin-grid-2">
      <div class="admin-card">
        <div class="card-title">Status geral</div>
        <canvas id="chartStatus" height="160" aria-label="Gráfico de status" role="img"></canvas>
      </div>

      <div class="admin-card">
        <div class="card-title">Atividades recentes</div>
        <div class="admin-list" aria-label="Lista de atividades" data-recent-list>
          <div style="color:var(--color-muted)">Carregando…</div>
        </div>
        <div class="admin-note" data-dashboard-error style="display:none;margin-top:10px;color:var(--color-muted);font-size:13px"></div>
      </div>
    </div>

    <div class="admin-grid-bottom">
      <div class="admin-card">
        <div class="card-title">Comparação por plano</div>
        <canvas id="chartByPlan" height="160" aria-label="Gráfico por plano" role="img"></canvas>
      </div>
      <div class="admin-card">
        <div class="card-title">Top congregações</div>
        <canvas id="chartByCong" height="160" aria-label="Gráfico por congregação" role="img"></canvas>
      </div>
    </div>

    <div style="margin-top:16px" class="admin-card">
      <div class="card-title">Evolução (últimos 30 dias)</div>
      <canvas id="chartTimeline" height="120" aria-label="Gráfico de evolução" role="img"></canvas>
    </div>
  </section>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script>
  (function () {
    function mkDonut(ctx, labels, data) {
      return new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: ['rgba(102,126,234,.25)', 'rgba(11,11,11,.18)', 'rgba(118,75,162,.22)'],
            borderColor: ['rgba(102,126,234,.55)', 'rgba(11,11,11,.25)', 'rgba(118,75,162,.35)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          cutout: '62%'
        }
      });
    }

    function mkBar(ctx, labels, data) {
      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Inscrições',
            data: data,
            backgroundColor: 'rgba(11,11,11,.18)',
            borderColor: 'rgba(11,11,11,.35)',
            borderWidth: 1,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { maxRotation: 0, autoSkip: true }, grid: { display: false } },
            y: { beginAtZero: true }
          }
        }
      });
    }

    function updateChart(chart, labels, data) {
      if (!chart) return;
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.update();
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function renderRecent(list) {
      var host = document.querySelector('[data-recent-list]');
      if (!host) return;

      if (!Array.isArray(list) || list.length === 0) {
        host.innerHTML = '<div style="color:var(--color-muted)">Sem dados no momento.</div>';
        return;
      }

      host.innerHTML = list.map(function (r) {
        return (
          '<div class="item">'
          + '<div>'
          + '<div style="font-weight:600">' + escapeHtml(r.participant_name || '') + '</div>'
          + '<div class="meta">Plano: ' + escapeHtml(r.plan_name || '') + '</div>'
          + '</div>'
          + '<div style="text-align:right">'
          + '<div style="font-weight:600">' + escapeHtml(r.status || '') + '</div>'
          + '<div class="meta">' + escapeHtml(r.created_at || '') + '</div>'
          + '</div>'
          + '</div>'
        );
      }).join('');
    }

    var charts = {
      status: mkDonut(document.getElementById('chartStatus'), ['Pago', 'Pendente', 'Cancelado'], [0, 0, 0]),
      byPlan: mkBar(document.getElementById('chartByPlan'), [], []),
      byCong: mkBar(document.getElementById('chartByCong'), [], []),
      timeline: mkBar(document.getElementById('chartTimeline'), [], []),
    };

    function setMetric(key, value) {
      var el = document.querySelector('[data-metric="' + key + '"]');
      if (!el) return;
      el.textContent = String(value);
    }

    function showError(msg) {
      var el = document.querySelector('[data-dashboard-error]');
      if (!el) return;
      el.style.display = 'block';
      el.textContent = msg;
    }

    async function refresh() {
      try {
        var url = '<?php echo ADMIN_BASE_PATH; ?>/dashboard-data.php?status=<?php echo h($statusView); ?>';
        var res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return;
        var payload = await res.json();
        if (!payload || payload.ok !== true) {
          if (payload && payload.error_id) {
            showError('Falha ao carregar dados do dashboard. ID: ' + payload.error_id);
          }
          return;
        }

        if (payload.counts) {
          setMetric('registrations', payload.counts.registrations);
          setMetric('paid', payload.counts.paid);
          setMetric('pending', payload.counts.pending);
          setMetric('completed', payload.counts.completed);
        }

        if (payload.statusDistribution) {
          updateChart(charts.status, ['Pago', 'Pendente', 'Cancelado'], [payload.statusDistribution.paid || 0, payload.statusDistribution.pending || 0, payload.statusDistribution.canceled || 0]);
        }

        if (Array.isArray(payload.byPlan)) {
          updateChart(charts.byPlan, payload.byPlan.map(function (x) { return x.label; }), payload.byPlan.map(function (x) { return x.c; }));
        }
        if (Array.isArray(payload.byCong)) {
          updateChart(charts.byCong, payload.byCong.map(function (x) { return x.label; }), payload.byCong.map(function (x) { return x.c; }));
        }
        if (Array.isArray(payload.timeline)) {
          updateChart(charts.timeline, payload.timeline.map(function (x) { return x.d; }), payload.timeline.map(function (x) { return x.c; }));
        }

        renderRecent(payload.recent);
      } catch (_) {
        // ignora
      }
    }

    refresh();
    setInterval(refresh, 30000);
  })();
</script>

<?php
require_once __DIR__ . '/includes/layout-footer.php';
