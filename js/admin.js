(() => {
  const $ = (sel, root = document) => root.querySelector(sel);

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function deepGet(obj, path) {
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

  function deepSet(obj, path, value) {
    const parts = String(path).split('.').filter(Boolean);
    let cur = obj;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const idx = Number(part);
      const isIndex = Number.isInteger(idx) && String(idx) === part;

      if (isLast) {
        if (isIndex && Array.isArray(cur)) cur[idx] = value;
        else cur[part] = value;
        return;
      }

      const nextPart = parts[i + 1];
      const nextIdx = Number(nextPart);
      const nextIsIndex = Number.isInteger(nextIdx) && String(nextIdx) === nextPart;

      if (isIndex) {
        if (!Array.isArray(cur)) throw new Error('Caminho inválido (esperava array)');
        if (cur[idx] == null) cur[idx] = nextIsIndex ? [] : {};
        cur = cur[idx];
      } else {
        if (cur[part] == null) cur[part] = nextIsIndex ? [] : {};
        cur = cur[part];
      }
    }
  }

  function ensureFirebase() {
    const cfg = window.CMS_CONFIG;
    if (!cfg || cfg.enabled !== true) throw new Error('CMS_CONFIG.enabled precisa estar true');
    if (!cfg.firebase || !cfg.firebase.apiKey) throw new Error('CMS_CONFIG.firebase incompleto');

    if (!window.firebase || typeof window.firebase.initializeApp !== 'function') {
      throw new Error('Firebase SDK não carregado');
    }

    const app = window.firebase.apps && window.firebase.apps.length ? window.firebase.app() : window.firebase.initializeApp(cfg.firebase);
    const auth = window.firebase.auth(app);
    const db = window.firebase.firestore(app);
    return { cfg, app, auth, db };
  }

  async function loadDefaultContent() {
    const res = await fetch('content/cms-default.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('Não foi possível carregar cms-default.json');
    return res.json();
  }

  function flattenContent(content, prefix = '') {
    const out = [];
    if (Array.isArray(content)) {
      content.forEach((item, idx) => {
        const next = prefix ? `${prefix}.${idx}` : String(idx);
        out.push(...flattenContent(item, next));
      });
      return out;
    }

    if (isObject(content)) {
      Object.keys(content).forEach((key) => {
        const next = prefix ? `${prefix}.${key}` : key;
        out.push(...flattenContent(content[key], next));
      });
      return out;
    }

    const t = typeof content;
    if (t === 'string' || t === 'number' || t === 'boolean') {
      out.push({ key: prefix, value: content });
    }
    return out;
  }

  function renderFields(content) {
    const container = $('#fields');
    container.innerHTML = '';

    const entries = flattenContent(content);
    const groups = new Map();
    entries.forEach((entry) => {
      const top = (entry.key || '').split('.')[0] || 'root';
      if (!groups.has(top)) groups.set(top, []);
      groups.get(top).push(entry);
    });

    for (const [groupName, fields] of groups.entries()) {
      const groupEl = document.createElement('section');
      groupEl.className = 'section';

      const containerEl = document.createElement('div');
      containerEl.className = 'container';

      const title = document.createElement('h2');
      title.className = 'section-title';
      title.textContent = groupName;

      const card = document.createElement('div');
      card.className = 'card';
      card.style.padding = '16px';

      const grid = document.createElement('div');
      grid.className = 'form-grid';

      fields.forEach((field) => {
        const row = document.createElement('label');
        row.className = 'form-row';

        const label = document.createElement('span');
        label.className = 'form-label';
        label.textContent = field.key;

        const input = document.createElement('input');
        input.className = 'input';
        input.type = 'text';
        input.setAttribute('data-key', field.key);
        input.value = field.value == null ? '' : String(field.value);

        row.appendChild(label);
        row.appendChild(input);
        grid.appendChild(row);
      });

      card.appendChild(grid);
      containerEl.appendChild(title);
      containerEl.appendChild(card);
      groupEl.appendChild(containerEl);
      container.appendChild(groupEl);
    }
  }

  function collectContent(baseContent) {
    const out = JSON.parse(JSON.stringify(baseContent));
    document.querySelectorAll('[data-key]').forEach((input) => {
      const key = input.getAttribute('data-key');
      const original = deepGet(baseContent, key);
      let nextValue = input.value;

      if (typeof original === 'boolean') {
        const v = String(input.value).trim().toLowerCase();
        nextValue = v === 'true' || v === '1' || v === 'sim' || v === 'yes';
      } else if (typeof original === 'number') {
        const n = Number(input.value);
        nextValue = Number.isFinite(n) ? n : original;
      }

      deepSet(out, key, nextValue);
    });
    return out;
  }

  function setStatus(text) {
    const el = $('#status');
    if (el) el.textContent = text;
  }

  async function main() {
    const { cfg, auth, db } = ensureFirebase();
    const defaultContent = await loadDefaultContent();

    const loginForm = $('#loginForm');
    const editor = $('#editor');
    const logoutBtn = $('#logout');
    const saveBtn = $('#save');

    function showEditor(show) {
      editor.style.display = show ? '' : 'none';
      loginForm.style.display = show ? 'none' : '';
    }

    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        showEditor(false);
        setStatus('Faça login para editar.');
        return;
      }

      showEditor(true);
      setStatus(`Logado como ${user.email}`);

      const snap = await db.doc(cfg.documentPath).get();
      const remote = snap.exists ? snap.data() : null;
      const content = remote ? deepMerge(defaultContent, remote) : defaultContent;

      renderFields(content);
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#email').value.trim();
      const password = $('#password').value;
      setStatus('Entrando...');
      await auth.signInWithEmailAndPassword(email, password);
    });

    logoutBtn.addEventListener('click', async () => {
      await auth.signOut();
    });

    saveBtn.addEventListener('click', async () => {
      setStatus('Salvando...');
      const snap = await db.doc(cfg.documentPath).get();
      const remote = snap.exists ? snap.data() : {};
      const base = deepMerge(defaultContent, remote);
      const next = collectContent(base);
      await db.doc(cfg.documentPath).set(next, { merge: true });
      setStatus('Salvo!');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    main().catch((err) => {
      console.error(err);
      setStatus(`Erro: ${err.message || err}`);
    });
  });
})();
