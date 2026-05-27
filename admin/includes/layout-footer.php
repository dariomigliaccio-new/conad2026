<?php
?>
      </div>
    </section>
  </main>
  <script src="/js/site.js"></script>
  <script>
    // Admin Language Selector
    document.addEventListener('DOMContentLoaded', function() {
      const selector = document.querySelector('[data-admin-lang-selector]');
      if (!selector) return;
      const toggle = selector.querySelector('.lang-toggle');
      const menu = selector.querySelector('.lang-menu');
      const options = selector.querySelectorAll('.lang-option');
      const codeSpan = selector.querySelector('.lang-code');
      const langCodes = { 'pt-BR': 'PT', 'en-US': 'EN', 'es-ES': 'ES' };
      function updateUI() {
        const current = localStorage.getItem('admin-lang') || 'pt-BR';
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
          localStorage.setItem('admin-lang', lang);
          updateUI();
          menu.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
          // Optional: reload page to apply language change server-side
          // window.location.href = '?lang=' + encodeURIComponent(lang);
        });
      });
      updateUI();
    });
  </script>
</body>
</html>
