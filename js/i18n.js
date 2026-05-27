/**
 * i18n - Simple internationalization helper
 * Loads translations from languages.json and provides t(key) function
 */

(function () {
  const savedLang = localStorage.getItem('lang');
  const browserIsPt = navigator.language.split('-')[0] === 'pt';
  let currentLang = savedLang || (browserIsPt ? 'pt-BR' : 'en-US');
  let translations = {};

  /**
   * Initialize i18n system
   * @param {string} lang - Language code (pt-BR, en-US, es-ES)
   */
  async function init(lang = null) {
    if (lang) {
      currentLang = lang;
      localStorage.setItem('lang', lang);
    }

    try {
      const res = await fetch('/public-languages.php?lang=' + encodeURIComponent(currentLang));
      if (!res.ok) throw new Error('Failed to load translations');
      translations = await res.json();
    } catch (err) {
      console.error('i18n init failed:', err);
      translations = {};
    }
  }

  /**
   * Translate a key
   * @param {string} key - Translation key (e.g., 'nav.home')
   * @param {object} vars - Optional variables to replace {var} in translation
   * @returns {string} Translated string or key if not found
   */
  function t(key, vars = {}) {
    let text = translations[key] || key;
    
    // Replace variables like {name} -> value
    Object.keys(vars).forEach(k => {
      text = text.replace(new RegExp('{' + k + '}', 'g'), vars[k]);
    });
    
    return text;
  }

  /**
   * Get current language
   */
  function getLang() {
    return currentLang;
  }

  /**
   * Set language
   */
  function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
  }

  /**
   * Get available languages
   */
  function getAvailableLangs() {
    return ['pt-BR', 'en-US', 'es-ES'];
  }

  /**
   * Translate all data-i18n elements on page
   */
  function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      const attr = el.getAttribute('data-i18n-attr');
      const key = el.getAttribute('data-i18n-key');
      el.setAttribute(attr, t(key));
    });
  }

  // Expose to window
  window.i18n = {
    init,
    t,
    getLang,
    setLang,
    getAvailableLangs,
    translatePage,
  };

  // Auto-init if script loaded
  if (document.readyState !== 'loading') {
    init().then(translatePage);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      init().then(translatePage);
    });
  }
})();
