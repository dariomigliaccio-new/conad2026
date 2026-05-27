(() => {
  const DEFAULT_URL = 'content/cms-default.json';

  const state = {
    content: null,
    loadedFrom: 'default'
  };

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function deepGet(obj, path) {
    if (!obj) return undefined;
    const parts = String(path).split('.').filter(Boolean);
    let cur = obj;
    for (const part of parts) {
      if (cur == null) return undefined;
      const idx = Number(part);
      cur = Number.isInteger(idx) && String(idx) === part ? cur[idx] : cur[part];
    }
    return cur;
  }

  function deepMerge(base, override) {
    if (!isObject(base) || !isObject(override)) return override;
    const out = { ...base };
    for (const key of Object.keys(override)) {
      const a = base[key];
      const b = override[key];
      if (isObject(a) && isObject(b)) out[key] = deepMerge(a, b);
      else out[key] = b;
    }
    return out;
  }

  function sanitizeSvgMarkup(raw) {
    if (typeof raw !== 'string' || raw.trim() === '') return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'image/svg+xml');
    const svg = doc.documentElement;
    if (!svg || svg.tagName.toLowerCase() !== 'svg') return null;

    const allowedTags = new Set(['svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);
    const allowedAttrs = new Set([
      'viewbox',
      'xmlns',
      'fill',
      'stroke',
      'stroke-width',
      'stroke-linecap',
      'stroke-linejoin',
      'stroke-miterlimit',
      'd',
      'points',
      'cx',
      'cy',
      'r',
      'x',
      'y',
      'x1',
      'y1',
      'x2',
      'y2',
      'width',
      'height',
      'rx',
      'ry',
      'transform',
      'opacity',
      'fill-opacity',
      'stroke-opacity',
      'aria-hidden',
      'focusable',
      'role'
    ]);

    const cleanNode = (node) => {
      const children = Array.from(node.children || []);
      for (const child of children) {
        const tag = child.tagName.toLowerCase();
        if (!allowedTags.has(tag)) {
          child.remove();
          continue;
        }
        for (const attr of Array.from(child.attributes)) {
          const name = attr.name.toLowerCase();
          const value = String(attr.value || '').trim().toLowerCase();
          if (name.startsWith('on') || name === 'href' || name === 'xlink:href') {
            child.removeAttribute(attr.name);
            continue;
          }
          if (!allowedAttrs.has(name) || value.includes('javascript:')) {
            child.removeAttribute(attr.name);
          }
        }
        cleanNode(child);
      }
    };

    cleanNode(svg);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    return new XMLSerializer().serializeToString(svg);
  }

  function applyContent(root = document) {
    const content = state.content;
    if (!content) return;

    root.querySelectorAll('[data-cms-text]').forEach((el) => {
      const key = el.getAttribute('data-cms-text');
      const value = deepGet(content, key);
      if (value === undefined || value === null) return;
      el.textContent = String(value);
    });

    root.querySelectorAll('[data-cms-attr]').forEach((el) => {
      const spec = el.getAttribute('data-cms-attr') || '';
      const pairs = spec
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const pair of pairs) {
        const [attr, key] = pair.split(':').map((s) => (s || '').trim());
        if (!attr || !key) continue;
        const value = deepGet(content, key);
        if (value === undefined || value === null) continue;
        const str = String(value);
        if (str.trim() === '') continue;
        el.setAttribute(attr, str);
      }
    });

    root.querySelectorAll('[data-cms-class]').forEach((el) => {
      const spec = el.getAttribute('data-cms-class') || '';
      const pairs = spec
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean);

      for (const pair of pairs) {
        const [className, key] = pair.split(':').map((s) => (s || '').trim());
        if (!className || !key) continue;
        const value = deepGet(content, key);
        el.classList.toggle(className, Boolean(value));
      }
    });

    root.querySelectorAll('[data-cms-svg]').forEach((el) => {
      const key = el.getAttribute('data-cms-svg');
      const value = deepGet(content, key);
      if (value === undefined || value === null) return;
      const svg = sanitizeSvgMarkup(String(value));
      if (!svg) return;
      el.innerHTML = svg;
    });

  }

  async function loadDefault() {
    const res = await fetch(DEFAULT_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('Não foi possível carregar cms-default.json');
    return res.json();
  }

  async function loadFromPublicEndpoint() {
    // Endpoint opcional (PHP) para sobrescrever conteúdo público via Admin.
    // Se não existir/der erro, o site continua usando apenas o JSON local.
    try {
      const scriptSrc = (document.currentScript && document.currentScript.src) || '';
      const url = scriptSrc ? new URL('../public-content.php', scriptSrc).toString() : 'public-content.php';
      const lang = (localStorage.getItem('lang') || 'pt-BR').trim() || 'pt-BR';
      const withLang = new URL(url, window.location.href);
      withLang.searchParams.set('lang', lang);
      const res = await fetch(withLang.toString(), { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      return isObject(data) ? data : null;
    } catch (_) {
      return null;
    }
  }

  function hasFirebaseConfig() {
    const cfg = window.CMS_CONFIG;
    const fb = cfg && cfg.firebase;
    return Boolean(
      cfg &&
        cfg.enabled === true &&
        fb &&
        fb.apiKey &&
        fb.authDomain &&
        fb.projectId &&
        fb.appId
    );
  }

  async function loadFromFirestore() {
    if (!hasFirebaseConfig()) return null;
    if (!window.firebase || typeof window.firebase.initializeApp !== 'function') return null;
    if (!window.firebase.firestore) return null;

    const cfg = window.CMS_CONFIG;
    const app = window.firebase.apps && window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(cfg.firebase);
    const db = window.firebase.firestore(app);

    const snap = await db.doc(cfg.documentPath).get();
    if (!snap.exists) return null;
    return snap.data() || null;
  }

  const ready = (async () => {
    try {
      const base = await loadDefault();
      state.content = base;

      const publicOverride = await loadFromPublicEndpoint();
      if (publicOverride) {
        state.content = deepMerge(state.content, publicOverride);
        state.loadedFrom = 'admin';
      }

      const remote = await loadFromFirestore();
      if (remote) {
        state.content = deepMerge(state.content, remote);
        state.loadedFrom = 'firestore';
      }

      window.CMS_CONTENT = state.content;
      window.dispatchEvent(new CustomEvent('cms:loaded', { detail: { source: state.loadedFrom } }));
      applyContent(document);
    } catch (err) {
      console.warn('[CMS] Falha ao carregar conteúdo:', err);
    }
  })();

  window.CMS = {
    ready,
    apply: applyContent
  };
})();
