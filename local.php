<?php
require_once __DIR__ . '/admin/includes/bootstrap.php';

$mapboxToken = defined('MAPBOX_TOKEN') ? (string) constant('MAPBOX_TOKEN') : '';
?>
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Local da CONAD 2026. Endereço, orientações de chegada e informações do espaço." data-cms-attr="content:local.metaDescription" />
  <title>Local | CONAD 2026</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  <link href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css" rel="stylesheet" />
  <link rel="stylesheet" href="css/site.css?v=20260213-geo-force-1" />
  <script src="js/i18n.js" defer></script>
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
        <a href="local.php" class="is-active">Local</a>
      </nav>

      <div class="header-actions">
        <div class="lang-selector" data-lang-selector>
          <button class="lang-toggle" aria-label="Selecionar idioma" aria-haspopup="listbox">
            <i class="fa-solid fa-globe" aria-hidden="true"></i>
            <span class="lang-code" data-lang-code>PT</span>
            <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
          </button>
          <div class="lang-menu" role="listbox" aria-label="Opções de idioma">
            <button class="lang-option" data-lang="pt-BR" role="option"><span>🇧🇷 Português</span></button>
            <button class="lang-option" data-lang="en-US" role="option"><span>🇺🇸 English</span></button>
            <button class="lang-option" data-lang="es-ES" role="option"><span>🇪🇸 Español</span></button>
          </div>
        </div>

        <a class="btn btn-primary" href="precos.html">Inscreva-se</a>
      </div>
    </div>

    <div class="menu-overlay" data-menu-overlay aria-hidden="true">
      <div class="menu-panel" role="dialog" aria-modal="true" aria-label="Menu" data-menu-panel>
        <nav class="menu-nav" aria-label="Navegação do menu">
          <a class="menu-link" href="index.html"><i class="fa-solid fa-house" aria-hidden="true"></i><span>Home</span></a>
          <a class="menu-link" href="precos.html"><i class="fa-solid fa-tag" aria-hidden="true"></i><span>Preços</span></a>
          <a class="menu-link" href="informacoes.html"><i class="fa-solid fa-circle-info" aria-hidden="true"></i><span>Informações</span></a>
          <a class="menu-link" href="preletores.html"><i class="fa-solid fa-user-group" aria-hidden="true"></i><span>Preletores</span></a>
          <a class="menu-link is-active" href="local.php"><i class="fa-solid fa-location-dot" aria-hidden="true"></i><span>Local</span></a>
        </nav>
      </div>
    </div>
  </header>

  <main id="conteudo">
    <section class="page-hero">
      <div class="container">
        <h1 data-cms-text="local.pageHeroTitle">Local</h1>
        <p data-cms-text="local.pageHeroLead">Endereço, orientações de chegada e informações do espaço.</p>

        <div class="card" style="padding:12px;margin-top:16px;border-color:var(--color-border)">
          <div style="font-weight:600;margin-bottom:10px" data-cms-text="local.mapTitle">Localização do evento</div>
          <div style="color:var(--color-muted);margin-bottom:10px" id="mapAddressDisplay">Carregando localização...</div>
          <div id="eventMap" style="height:360px;border-radius:12px;overflow:hidden;border:1px solid var(--color-border)"></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2 class="section-title" data-cms-text="local.sectionTitle">Endereço</h2>
        <p class="section-lead" data-cms-text="local.sectionLead">Confira as informações de localização e acesso ao evento.</p>

        <div id="event-info-container"></div>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <img class="footer-brand-logo" src="images/novo-logo.png" alt="CONAD 2026" loading="lazy" decoding="async" />
      <div class="social" aria-label="Mídias sociais">
        <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i></a>
        <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f" aria-hidden="true"></i></a>
        <a href="#" aria-label="YouTube"><i class="fa-brands fa-youtube" aria-hidden="true"></i></a>
      </div>
      <p class="footer-address">CONFRADEB - Concilio Distrital Brasileiro 4000 N. Federal Hwy. - Lighthouse Point , FL 33064 - USA</p>
    </div>
    <div class="container footer-note">
      <p>© 2026 Brazilian District Council of the Assemblies of God. All Rights Reserved© 2022 Assembly of God Bethlehem Ministry. All Rights Reserved</p>
    </div>
  </footer>

  <script src="js/content.js?v=20260213-geo-force-1"></script>
  <script src="js/cms-frontend.js"></script>
  <script src="js/site.js?v=20260213-geo-force-1"></script>
  <script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js"></script>

  <script>
    const MAPBOX_TOKEN = '<?= h($mapboxToken) ?>';
    const MAPBOX_STYLE = 'mapbox/streets-v12';

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = String(text || '');
      return div.innerHTML;
    }

    function showMapError(title, details) {
      const mapEl = document.getElementById('eventMap');
      if (!mapEl) return;
      const safeTitle = String(title || 'Mapa não disponível');
      const safeDetails = details ? String(details) : '';
      mapEl.innerHTML =
        '<div style="padding:14px;color:var(--color-muted);display:flex;flex-direction:column;gap:8px">' +
        '<div style="font-weight:600">' + escapeHtml(safeTitle) + '</div>' +
        (safeDetails ? '<div style="font-size:12px;white-space:pre-wrap;max-height:150px;overflow:auto">' + escapeHtml(safeDetails) + '</div>' : '') +
        '</div>';
    }

    async function initMap() {
      const mapEl = document.getElementById('eventMap');
      const mapAddressEl = document.getElementById('mapAddressDisplay');
      if (!mapEl) return;

      const cms = new CMSData();
      const data = await cms.fetch();
      const event = data.event || {};

      const addressParts = [];
      if (event.address) addressParts.push(event.address);
      if (event.city) addressParts.push(event.city);
      if (event.state) addressParts.push(event.state);
      if (event.country && event.country !== 'Brasil') addressParts.push(event.country);
      const fullAddress = addressParts.join(', ');

      if (mapAddressEl) {
        mapAddressEl.textContent = fullAddress || '(Localização não configurada)';
      }

      if (!fullAddress || fullAddress.trim() === '') {
        showMapError('Localização não configurada', 'Configure o endereço do evento no painel admin.');
        return;
      }

      if (!window.mapboxgl) {
        showMapError('Mapbox não carregado', 'O Mapbox GL JS não foi carregado corretamente.');
        return;
      }

      if (!MAPBOX_TOKEN) {
        showMapError('Token Mapbox não configurado', 'Defina CONAD_MAPBOX_TOKEN na configuração do servidor.');
        return;
      }

      mapboxgl.accessToken = MAPBOX_TOKEN;

      try {
        const styleUrl = 'https://api.mapbox.com/styles/v1/' + MAPBOX_STYLE + '?access_token=' + encodeURIComponent(MAPBOX_TOKEN);
        const styleRes = await fetch(styleUrl);
        if (!styleRes.ok) throw new Error('HTTP ' + styleRes.status);
      } catch (err) {
        showMapError('Token Mapbox inválido', err.message);
        return;
      }

      const map = new mapboxgl.Map({
        container: mapEl,
        style: 'mapbox://styles/' + MAPBOX_STYLE,
        center: [-98.5795, 39.8283],
        zoom: 3,
        projection: 'mercator'
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('error', (e) => {
        const err = e && e.error ? e.error : null;
        const msg = err && err.message ? err.message : 'Erro desconhecido';
        showMapError('Erro do Mapbox', msg);
      });

      map.on('load', () => {
        const geocodeUrl =
          'https://api.mapbox.com/geocoding/v5/mapbox.places/' +
          encodeURIComponent(fullAddress) +
          '.json?limit=1&access_token=' +
          encodeURIComponent(MAPBOX_TOKEN);

        fetch(geocodeUrl)
          .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
          .then(data => {
            const feature = data && data.features && data.features[0];
            const center = feature && feature.center;
            if (Array.isArray(center) && center.length === 2) {
              new mapboxgl.Marker({ color: '#FF6B35' }).setLngLat([center[0], center[1]]).addTo(map);
              map.flyTo({ center: [center[0], center[1]], zoom: 14, duration: 1000 });
            }
          })
          .catch(err => console.warn('Erro na geocodificação:', err));
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMap);
    } else {
      initMap();
    }

    const cms = new CMSData();
    cms.fetch().then(data => {
      const container = document.getElementById('event-info-container');
      if (!container) return;
      const event = data.event || {};
      let html = '<div class="event-info-grid"><div>';

      if (event.location || event.address) {
        html += '<div class="card" style="margin-bottom:16px"><h3 style="margin-top:0">📍 Local do Evento</h3>';
        if (event.location) html += `<p><strong>${escapeHtml(event.location)}</strong></p>`;
        const addr = [event.address, event.city, event.state].filter(Boolean).join(', ');
        if (addr) html += `<p>${escapeHtml(addr)}</p>`;
        if (event.zipcode) html += `<p><small>CEP: ${escapeHtml(event.zipcode)}</small></p>`;
        html += '</div>';
      }
      if (event.venue_name || event.venue_phone || event.venue_website) {
        html += '<div class="card" style="margin-bottom:16px"><h3 style="margin-top:0">📞 Contato</h3>';
        if (event.venue_name) html += `<p><strong>${escapeHtml(event.venue_name)}</strong></p>`;
        if (event.venue_phone) html += `<p>Telefone: <a href="tel:${escapeHtml(event.venue_phone)}">${escapeHtml(event.venue_phone)}</a></p>`;
        if (event.venue_website) html += `<p><a href="${escapeHtml(event.venue_website)}" target="_blank" rel="noopener">Visitar website →</a></p>`;
        html += '</div>';
      }
      if (event.additional_info) {
        html += '<div class="card" style="margin-bottom:16px"><h3 style="margin-top:0">ℹ️ Informações Adicionais</h3>';
        html += `<p>${escapeHtml(event.additional_info).replace(/\n/g, '<br>')}</p></div>`;
      }
      if (event.rules) {
        html += '<div class="card" style="margin-bottom:16px"><h3 style="margin-top:0">📋 Regras</h3>';
        html += `<p>${escapeHtml(event.rules).replace(/\n/g, '<br>')}</p></div>`;
      }
      if (event.important_notes) {
        html += '<div class="card" style="margin-bottom:16px;border-color:#f59e0b"><h3 style="margin-top:0;color:#f59e0b">⚠️ Observações Importantes</h3>';
        html += `<p>${escapeHtml(event.important_notes).replace(/\n/g, '<br>')}</p></div>`;
      }
      html += '</div></div>';
      container.innerHTML = html;
    });

    document.addEventListener('DOMContentLoaded', function() {
      const selector = document.querySelector('[data-lang-selector]');
      if (!selector) return;
      const toggle = selector.querySelector('.lang-toggle');
      const menu = selector.querySelector('.lang-menu');
      const options = selector.querySelectorAll('.lang-option');
      const codeSpan = selector.querySelector('.lang-code');
      const langCodes = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES' };

      function updateUI() {
        const current = localStorage.getItem('lang') || 'pt-BR';
        codeSpan.textContent = langCodes[current] || 'PT';
        options.forEach(opt => opt.setAttribute('aria-selected', opt.dataset.lang === current ? 'true' : 'false'));
      }

      toggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = menu.classList.contains('is-open');
        menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', !isOpen);
      });

      document.addEventListener('click', function(e) {
        if (!selector.contains(e.target)) {
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });

      options.forEach(opt => {
        opt.addEventListener('click', function() {
          const lang = this.dataset.lang;
          localStorage.setItem('lang', lang);
          if (window.i18n?.setLang) {
            window.i18n.setLang(lang);
            window.i18n.init(lang).then(() => { if (window.i18n?.translatePage) window.i18n.translatePage(); });
          }
          updateUI();
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });

      updateUI();
    });
  </script>
</body>
</html>
