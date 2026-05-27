(() => {
  const SELECTORS = {
    header: '[data-header]',
    menuToggle: '[data-menu-toggle]',
    menuOverlay: '[data-menu-overlay]',
    menuPanel: '[data-menu-panel]'
  };

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function qsa(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
  }

  function isSafariBrowser() {
    const ua = navigator.userAgent || '';
    const isSafari = /Safari/i.test(ua) && !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua);
    return isSafari;
  }

  function forceSafariFreshLoad() {
    if (!isSafariBrowser()) return false;

    const url = new URL(window.location.href);
    const marker = (url.searchParams.get('__v') || '').trim();
    if (marker !== '') return false;

    url.searchParams.set('__v', String(Date.now()));
    window.location.replace(url.toString());
    return true;
  }

  function lockBodyScroll(locked) {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  function setMenuOpen(open) {
    const toggle = qs(SELECTORS.menuToggle);
    const overlay = qs(SELECTORS.menuOverlay);
    if (!toggle || !overlay) return;

    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    overlay.classList.toggle('is-open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    lockBodyScroll(open);
  }

  function initHeader() {
    const header = qs(SELECTORS.header);
    if (!header) return;

    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 10);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function initMenu() {
    const toggle = qs(SELECTORS.menuToggle);
    const overlay = qs(SELECTORS.menuOverlay);
    const panel = qs(SELECTORS.menuPanel);
    if (!toggle || !overlay || !panel) return;

    let lastActive = null;

    const focusFirstLink = () => {
      const first = overlay.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
      if (first && typeof first.focus === 'function') first.focus();
    };

    const openMenu = () => {
      lastActive = document.activeElement;
      setMenuOpen(true);
      window.setTimeout(() => focusFirstLink(), 0);
    };

    const closeMenu = () => {
      setMenuOpen(false);
      if (lastActive && typeof lastActive.focus === 'function') lastActive.focus();
      lastActive = null;
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu();
      else openMenu();
    });

    qsa('a', overlay).forEach((a) => {
      a.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    });

    overlay.addEventListener('click', (e) => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (!isOpen) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      closeMenu();
    });
  }

  function initCountdown() {
    const root = document.getElementById('countdown');
    if (!root) return;

    const cmsDate = window.CMS_CONTENT && window.CMS_CONTENT.global && window.CMS_CONTENT.global.eventDateTimeISO;
    const eventDate = new Date(cmsDate || '2026-08-15T09:00:00').getTime();

    const update = () => {
      const now = Date.now();
      const distance = eventDate - now;

      if (distance <= 0) {
        const startedHeading =
          (window.CMS_CONTENT && window.CMS_CONTENT.global && window.CMS_CONTENT.global.eventStartedHeading) ||
          'CONAD 2026';
        const startedText =
          (window.CMS_CONTENT && window.CMS_CONTENT.global && window.CMS_CONTENT.global.eventStartedText) ||
          'O evento já começou.';
        root.classList.remove('impact-countdown');
        root.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'countdown-ended';
        const h3 = document.createElement('h3');
        h3.textContent = String(startedHeading);
        const p = document.createElement('p');
        p.textContent = String(startedText);
        wrap.appendChild(h3);
        wrap.appendChild(p);
        root.appendChild(wrap);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const set = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = String(value).padStart(2, '0');
      };

      set('days', days);
      set('hours', hours);
      set('minutes', minutes);
      set('seconds', seconds);
    };

    update();
    window.setInterval(update, 1000);
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
      }

      window.setTimeout(() => {
        alert('✅ Mensagem enviada com sucesso!\n\nEntraremos em contato em breve.');
        form.reset();
        if (submitBtn) {
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      }, 900);
    });
  }

  function initBrandLogo() {
    const logo = document.querySelector('.brand-logo');
    if (!logo) return;

    const src =
      window.CMS_CONTENT &&
      window.CMS_CONTENT.global &&
      typeof window.CMS_CONTENT.global.logoSrc === 'string'
        ? window.CMS_CONTENT.global.logoSrc.trim()
        : '';

    document.body.classList.toggle('has-logo', Boolean(src));

    logo.addEventListener('error', () => {
      document.body.classList.remove('has-logo');
      logo.removeAttribute('src');
    });
  }

  function initHeroBanners() {
    const root = document.querySelector('[data-hero-carousel]');
    const heroMedia = root ? root.querySelector('.hero-media') : null;
    const heroImg = root ? root.querySelector('[data-hero-image]') : document.querySelector('.hero-media img');
    if (!root || !heroMedia || !heroImg) return;

    const heroData = (window.CMS_CONTENT && window.CMS_CONTENT.home && window.CMS_CONTENT.home.hero) || {};
    const desktopList = Array.isArray(heroData.desktopBanners) ? heroData.desktopBanners.filter(Boolean) : [];
    const mobileList = Array.isArray(heroData.mobileBanners) ? heroData.mobileBanners.filter(Boolean) : [];
    const dotsRoot = root.querySelector('[data-hero-dots]');
    const copyRoot = root.querySelector('[data-hero-copy]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = 4500;
    const localFallbackBanners = ['images/hero1.jpg', 'images/hero2.jpeg', 'images/hero3.jpg'];
    root.style.setProperty('--hero-slide-interval', `${intervalMs}ms`);

    const mediaQuery = window.matchMedia('(max-width: 980px)');
    let timer = null;
    let currentIndex = 0;
    let visualIndex = 0;
    let currentMode = mediaQuery.matches ? 'mobile' : 'desktop';
    let isPaused = false;
    let isLoopingToStart = false;
    let track = null;

    const fallbackImage = () => {
      const cmsImage = typeof heroData.imageSrc === 'string' ? heroData.imageSrc.trim() : '';
      return cmsImage || heroImg.getAttribute('src') || '';
    };

    const unique = (items) => Array.from(new Set(items.map((item) => String(item).trim()).filter(Boolean)));

    const getCurrentList = () => {
      const preferred = currentMode === 'mobile' ? mobileList : desktopList;
      const fallback = currentMode === 'mobile' ? desktopList : mobileList;
      const configured = unique([...preferred, ...fallback, fallbackImage()]);
      return configured.length > 1 ? configured : unique([...configured, ...localFallbackBanners]);
    };

    const renderSlides = (list) => {
      heroMedia.innerHTML = '';
      track = document.createElement('div');
      track.className = 'hero-media-track';

      const alt = heroImg.getAttribute('alt') || 'Banner em destaque';
      const slides = list.length > 1 ? [...list, list[0]] : list;
      slides.forEach((src, idx) => {
        const slide = document.createElement('div');
        slide.className = 'hero-slide';

        const img = document.createElement('img');
        img.src = src;
        img.alt = alt;
        img.decoding = 'async';
        img.loading = idx === 0 ? 'eager' : 'lazy';
        if (idx === 0) img.classList.add('is-active');

        slide.appendChild(img);
        track.appendChild(slide);
      });

      track.addEventListener('transitionend', (event) => {
        if (event.target !== track || !isLoopingToStart) return;
        isLoopingToStart = false;
        visualIndex = 0;
        setTrackPosition(visualIndex, false);
      });

      heroMedia.appendChild(track);
    };

    const animateActiveImage = () => {
      if (!track || reducedMotion) return;
      const images = qsa('.hero-slide img', track);
      images.forEach((img, idx) => {
        img.classList.toggle('is-active', idx === visualIndex);
        img.classList.remove('is-moving');
      });

      const active = images[visualIndex];
      if (!active) return;
      void active.offsetWidth;
      active.classList.add('is-moving');
    };

    const setTrackPosition = (index, animated = true) => {
      if (!track) return;
      track.classList.toggle('is-jump-reset', !animated);
      track.style.transform = `translateX(-${index * 100}%)`;
      if (!animated) {
        void track.offsetWidth;
        window.requestAnimationFrame(() => {
          if (track) track.classList.remove('is-jump-reset');
        });
      }
    };

    const updateTrack = () => {
      if (!track) return;
      visualIndex = currentIndex;
      isLoopingToStart = false;
      setTrackPosition(visualIndex, true);
      animateActiveImage();
    };

    const clearTimer = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const animateCopy = () => {
      if (!copyRoot || reducedMotion) return;
      copyRoot.classList.remove('is-entering');
      void copyRoot.offsetWidth;
      copyRoot.classList.add('is-entering');
    };

    const updateDots = () => {
      if (!dotsRoot) return;
      const dots = qsa('.hero-dot', dotsRoot);
      dots.forEach((dot, idx) => {
        const active = idx === currentIndex;
        dot.classList.toggle('is-active', active);
        dot.classList.remove('is-progressing');
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
        dot.setAttribute('tabindex', active ? '0' : '-1');
        if (active && !isPaused && !reducedMotion && dots.length > 1) {
          void dot.offsetWidth;
          dot.classList.add('is-progressing');
        }
      });
    };

    const renderDots = (list) => {
      if (!dotsRoot) return;
      dotsRoot.innerHTML = '';
      if (list.length <= 1) {
        dotsRoot.hidden = true;
        return;
      }

      dotsRoot.hidden = false;
      list.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Mostrar banner ${idx + 1}`);
        dot.addEventListener('click', () => {
          goTo(idx, true);
        });
        dotsRoot.appendChild(dot);
      });
      updateDots();
    };

    const goTo = (index, manual = false) => {
      const list = getCurrentList();
      if (!Array.isArray(list) || list.length === 0) return;
      if (currentIndex === list.length - 1 && index === 0) {
        advanceNext(manual);
        return;
      }
      currentIndex = ((index % list.length) + list.length) % list.length;
      updateTrack();
      animateCopy();
      updateDots();
      if (manual) startTimer();
    };

    const advanceNext = (manual = false) => {
      const list = getCurrentList();
      if (!Array.isArray(list) || list.length === 0) return;

      if (currentIndex >= list.length - 1) {
        currentIndex = 0;
        visualIndex = list.length;
        isLoopingToStart = true;
        setTrackPosition(visualIndex, true);
        animateActiveImage();
      } else {
        currentIndex += 1;
        updateTrack();
      }

      animateCopy();
      updateDots();
      if (manual) startTimer();
    };

    const startTimer = () => {
      clearTimer();

      const list = getCurrentList();
      if (!Array.isArray(list) || list.length <= 1 || isPaused || reducedMotion) {
        updateDots();
        return;
      }

      updateDots();
      timer = window.setInterval(() => advanceNext(), intervalMs);
    };

    const startRotation = () => {
      clearTimer();
      const list = getCurrentList();
      currentIndex = 0;
      visualIndex = 0;
      isLoopingToStart = false;
      renderSlides(list);
      renderDots(list);
      updateTrack();
      animateCopy();
      startTimer();
    };

    root.addEventListener('mouseenter', () => {
      isPaused = true;
      clearTimer();
      updateDots();
    });
    root.addEventListener('mouseleave', () => {
      isPaused = false;
      startTimer();
    });
    root.addEventListener('focusin', () => {
      isPaused = true;
      clearTimer();
      updateDots();
    });
    root.addEventListener('focusout', () => {
      if (root.contains(document.activeElement)) return;
      isPaused = false;
      startTimer();
    });

    startRotation();

    const onChange = (e) => {
      const nextMode = e.matches ? 'mobile' : 'desktop';
      if (nextMode === currentMode) return;
      currentMode = nextMode;
      startRotation();
    };

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange);
    } else if (typeof mediaQuery.addListener === 'function') {
      mediaQuery.addListener(onChange);
    }
  }

  function initButtonIcons() {
    const BTN_SELECTOR =
      'a.btn, button.btn, input.btn, a.btn-primary, button.btn-primary, input.btn-primary, a.btn-secondary, button.btn-secondary, input.btn-secondary, a.btn-ghost, button.btn-ghost, input.btn-ghost, a.btn-outline, button.btn-outline, input.btn-outline, a.btn-header, button.btn-header, input.btn-header';

    const iconFromDataset = (el) => {
      const v = (el.getAttribute('data-btn-icon') || '').trim();
      return v ? v : '';
    };

    const hasIcon = (el) => {
      if (!el) return false;
      if (el.querySelector('.btn-ico')) return true;
      if (el.querySelector('i.fa-solid, i.fa-regular, i.fa-brands')) return true;
      if (el.querySelector('svg, img')) return true;
      return false;
    };

    const normalize = (s) =>
      String(s || '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    const pickIcon = (el) => {
      const explicit = iconFromDataset(el);
      if (explicit) return explicit;

      const aria = normalize(el.getAttribute('aria-label') || '');
      const txt = normalize(el.textContent || '');
      const label = txt || aria;
      if (!label) return '';

      // Ordem importa (casos mais específicos primeiro)
      const rules = [
        { re: /(ver|abrir)\s+pre[cç]os|pre[cç]os/, icon: 'fa-tag' },
        { re: /inscrev|inscri[cç][aã]o/, icon: 'fa-clipboard-list' },
        { re: /pagar|pagamento|checkout|finalizar/, icon: 'fa-credit-card' },
        { re: /enviar|confirmar|concluir|salvar|gravar|ok|cadastrar/, icon: 'fa-circle-check' },
        { re: /editar|alterar|atualizar/, icon: 'fa-pen-to-square' },
        { re: /remover|excluir|apagar|deletar/, icon: 'fa-trash' },
        { re: /adicionar|novo|incluir|mais/, icon: 'fa-plus' },
        { re: /baixar|download/, icon: 'fa-download' },
        { re: /imprimir|pdf/, icon: 'fa-print' },
        { re: /entrar|login|acessar/, icon: 'fa-right-to-bracket' },
        { re: /sair|logout/, icon: 'fa-right-from-bracket' },
        { re: /voltar|anterior/, icon: 'fa-arrow-left' },
        { re: /avan[cç]ar|pr[oó]ximo|continuar/, icon: 'fa-arrow-right' },
        { re: /ver\s+local|localiza[cç][aã]o|mapa|google\s+maps|rota/, icon: 'fa-location-dot' },
        { re: /inform[aç]([aã]o|oes)|detalhes|saiba\s+mais/, icon: 'fa-circle-info' },
        { re: /preletor|palestrante|convidad/, icon: 'fa-user-group' },
        { re: /contato|falar|mensagem|email|e-mail/, icon: 'fa-envelope' },
        { re: /whats|telefone|ligar/, icon: 'fa-phone' },
        { re: /buscar|pesquisar/, icon: 'fa-magnifying-glass' },
        { re: /menu/, icon: 'fa-bars' },
        { re: /cancelar|fechar/, icon: 'fa-xmark' }
      ];

      for (const r of rules) {
        if (r.re.test(label)) return r.icon;
      }
      return '';
    };

    const decorate = (el) => {
      if (!el || el.nodeType !== 1) return;
      if (!el.classList) return;
      const eligible =
        el.classList.contains('btn') ||
        el.classList.contains('btn-primary') ||
        el.classList.contains('btn-secondary') ||
        el.classList.contains('btn-ghost') ||
        el.classList.contains('btn-outline') ||
        el.classList.contains('btn-header');
      if (!eligible) return;
      if (el.hasAttribute('data-btn-noicon')) return;
      if (hasIcon(el)) return;

      const icon = pickIcon(el);
      if (!icon) return;

      const hasText = normalize(el.textContent).length > 0 || normalize(el.getAttribute('aria-label')).length > 0;
      if (!hasText) return;

      const span = document.createElement('span');
      span.className = 'btn-ico';
      span.setAttribute('aria-hidden', 'true');
      span.innerHTML = `<i class="fa-solid ${icon}"></i>`;
      el.insertBefore(span, el.firstChild);
    };

    qsa(BTN_SELECTOR).forEach(decorate);

    // Reaplicar em botões inseridos dinamicamente (planos, listas, etc.)
    if (!window.__CONAD_BTN_ICON_OBSERVER__) {
      const obs = new MutationObserver((mutations) => {
        for (const m of mutations) {
          for (const n of Array.from(m.addedNodes || [])) {
            if (!n || n.nodeType !== 1) continue;
            if (n.matches && n.matches(BTN_SELECTOR)) decorate(n);
            if (n.querySelectorAll) {
              n.querySelectorAll(BTN_SELECTOR).forEach(decorate);
            }
          }
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      window.__CONAD_BTN_ICON_OBSERVER__ = obs;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    if (forceSafariFreshLoad()) return;

    initHeader();
    initMenu();
    initContactForm();
    initButtonIcons();

    const cmsReady = window.CMS && window.CMS.ready;
    if (cmsReady && typeof cmsReady.then === 'function') {
      cmsReady.finally(() => {
        initHeroBanners();
        initBrandLogo();
        initCountdown();
        initButtonIcons();
      });
    } else {
      initHeroBanners();
      initBrandLogo();
      initCountdown();
      initButtonIcons();
    }
  });
})();
