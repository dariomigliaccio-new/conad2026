(() => {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderSpeakerCard(s) {
    const photoSrc = s && s.photoSrc ? String(s.photoSrc) : '';
    const photoAlt = s && s.photoAlt ? String(s.photoAlt) : (s && s.name ? String(s.name) : 'Foto do preletor');
    const name = s && s.name ? String(s.name) : '';
    const role = s && s.role ? String(s.role) : '';

    return `
      <article class="card speaker-card">
        <div class="speaker-photo">
          ${photoSrc ? `<img loading="lazy" decoding="async" src="${escapeHtml(photoSrc)}" alt="${escapeHtml(photoAlt)}" />` : ''}
        </div>
        <div class="speaker-body">
          <h3 class="speaker-name">${escapeHtml(name)}</h3>
          ${role ? `<p class="speaker-role">${escapeHtml(role)}</p>` : ''}
        </div>
      </article>
    `;
  }

  async function boot() {
    const grid = document.querySelector('[data-speakers-grid]');
    if (!grid) return;

    try {
      if (window.CMS && window.CMS.ready) await window.CMS.ready;
    } catch (_) {
      // segue com o que tiver
    }

    const speakers = (window.CMS_CONTENT && window.CMS_CONTENT.preletores && window.CMS_CONTENT.preletores.speakers) || [];

    if (!Array.isArray(speakers) || speakers.length === 0) {
      grid.innerHTML = '<div style="color:var(--color-muted)">Nenhum preletor cadastrado no momento.</div>';
      return;
    }

    grid.innerHTML = speakers.map(renderSpeakerCard).join('');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
