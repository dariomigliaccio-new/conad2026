/**
 * CMS Frontend Helper
 * Carrega dados do CMS (home config, preletores, event info)
 * Usa localStorage para cache
 */

class CMSData {
  constructor() {
    this.cacheTime = 5 * 60 * 1000; // 5 minutos
    this.dataEndpoint = '/public-all-data.php';
  }

  async fetch() {
    const cached = this.getCache();
    if (cached) {
      return cached;
    }

    try {
      const res = await fetch(this.dataEndpoint);
      if (!res.ok) throw new Error('HTTP error ' + res.status);
      
      const data = await res.json();
      this.setCache(data);
      return data;
    } catch (e) {
      console.error('CMS fetch error:', e);
      return this.getEmptyData();
    }
  }

  getCache() {
    const cached = localStorage.getItem('cms_data_cache');
    const timestamp = localStorage.getItem('cms_data_timestamp');
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age < this.cacheTime) {
        return JSON.parse(cached);
      }
    }
    return null;
  }

  setCache(data) {
    localStorage.setItem('cms_data_cache', JSON.stringify(data));
    localStorage.setItem('cms_data_timestamp', Date.now().toString());
  }

  getEmptyData() {
    return {
      home: {
        hero: { title: '', subtitle: '', button_text: 'Inscrever-se', button_url: 'precos.html' },
        section1: { title: '', subtitle: '' },
        section2: { title: '', subtitle: '' },
        countdown: { enabled: false, date: '', time: '' },
        images: { banner_desktop: '', banner_mobile: '', logo_desktop: '', logo_mobile: '' },
      },
      preletores: [],
      event: {
        location: '', address: '', city: '', state: '', country: 'Brasil',
        zipcode: '', venue_name: '', venue_phone: '', venue_website: '',
        map_embed: '', additional_info: '', rules: '', important_notes: ''
      }
    };
  }
}

// Helper para obter imagem correta por dispositivo
function getResponsiveImage(data, imageType) {
  const isMobile = window.innerWidth < 768;
  
  switch (imageType) {
    case 'banner':
      return isMobile ? data.banner_mobile : data.banner_desktop;
    case 'logo':
      return isMobile ? data.logo_mobile : data.logo_desktop;
    default:
      return '';
  }
}

// Função para renderizar preletores
function renderPreletores(preletores, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!preletores || preletores.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:#999">Nenhum preletor cadastrado.</p>';
    return;
  }

  container.innerHTML = preletores.map(p => `
    <div class="preletor-item">
      ${p.image ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.name)}" class="preletor-image">` : ''}
      <div class="preletor-content">
        <h3 class="preletor-name">${escapeHtml(p.name)}</h3>
        ${p.title ? `<p class="preletor-title">${escapeHtml(p.title)}</p>` : ''}
        ${p.bio ? `<p class="preletor-bio">${escapeHtml(p.bio).replace(/\n/g, '<br>')}</p>` : ''}
      </div>
    </div>
  `).join('');
}

// Função para renderizar informações do evento
function renderEventInfo(eventData, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = '';
  
  if (eventData.location) {
    html += `<p><strong>Local:</strong> ${escapeHtml(eventData.location)}</p>`;
  }
  
  if (eventData.address || eventData.city) {
    const addr = [eventData.address, eventData.city, eventData.state]
      .filter(Boolean)
      .join(', ');
    if (addr) html += `<p><strong>Endereço:</strong> ${escapeHtml(addr)}</p>`;
  }
  
  if (eventData.venue_phone) {
    html += `<p><strong>Telefone:</strong> <a href="tel:${escapeHtml(eventData.venue_phone)}">${escapeHtml(eventData.venue_phone)}</a></p>`;
  }
  
  if (eventData.venue_website) {
    html += `<p><strong>Website:</strong> <a href="${escapeHtml(eventData.venue_website)}" target="_blank">Visitar</a></p>`;
  }
  
  if (eventData.map_embed) {
    html += `<div class="event-map">${eventData.map_embed}</div>`;
  }
  
  if (eventData.additional_info) {
    html += `<div class="event-info"><p>${escapeHtml(eventData.additional_info).replace(/\n/g, '<br>')}</p></div>`;
  }
  
  if (eventData.rules) {
    html += `<div class="event-rules"><h4>Regras</h4><p>${escapeHtml(eventData.rules).replace(/\n/g, '<br>')}</p></div>`;
  }
  
  if (eventData.important_notes) {
    html += `<div class="event-notes"><h4>Observações Importantes</h4><p>${escapeHtml(eventData.important_notes).replace(/\n/g, '<br>')}</p></div>`;
  }
  
  container.innerHTML = html || '<p style="color:#999">Informações não disponíveis.</p>';
}

// Função para renderizar countdown
function renderCountdown(date, time, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const targetDate = new Date(`${date}T${time}`).getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      container.innerHTML = '<div class="countdown finished">O evento já começou!</div>';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    container.innerHTML = `
      <div class="countdown">
        <div class="countdown-item">
          <span class="countdown-number">${days}</span>
          <span class="countdown-label">Dias</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-number">${hours}</span>
          <span class="countdown-label">Horas</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-number">${minutes}</span>
          <span class="countdown-label">Minutos</span>
        </div>
        <div class="countdown-item">
          <span class="countdown-number">${seconds}</span>
          <span class="countdown-label">Segundos</span>
        </div>
      </div>
    `;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Função helper para escapar HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Exportar para uso global
window.CMSData = CMSData;
window.getResponsiveImage = getResponsiveImage;
window.renderPreletores = renderPreletores;
window.renderEventInfo = renderEventInfo;
window.renderCountdown = renderCountdown;
