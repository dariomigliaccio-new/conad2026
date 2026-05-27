// Dynamic children fields for inscricao.php
(function () {
  const list = document.querySelector('[data-children-list]');
  const addBtn = document.querySelector('[data-add-child]');
  const tpl = document.querySelector('[data-child-template]');

  if (!list || !addBtn || !tpl) return;

  function applyDateMask(input) {
    if (!input || !(input instanceof HTMLInputElement)) return;
    if (input.dataset.maskBound === '1') return;
    input.dataset.maskBound = '1';

    function formatDigitsToBrDate(digits) {
      const d = digits.slice(0, 2);
      const m = digits.slice(2, 4);
      const y = digits.slice(4, 8);
      let out = d;
      if (digits.length >= 3) out += '/' + m;
      if (digits.length >= 5) out += '/' + y;
      return out;
    }

    input.addEventListener('input', () => {
      const digits = (input.value || '').replace(/\D/g, '').slice(0, 8);
      input.value = formatDigitsToBrDate(digits);
    });
  }

  // Campos já renderizados na página
  document.querySelectorAll('input[data-mask-date]').forEach(applyDateMask);

  function nextIndex() {
    const items = list.querySelectorAll('[data-child-item]');
    let max = -1;
    items.forEach((el) => {
      const idx = Number(el.getAttribute('data-index'));
      if (!Number.isNaN(idx)) max = Math.max(max, idx);
    });
    return max + 1;
  }

  function addChild(initial) {
    const idx = nextIndex();
    const frag = tpl.content.cloneNode(true);
    const item = frag.querySelector('[data-child-item]');
    item.setAttribute('data-index', String(idx));

    const name = frag.querySelector('[data-child-name]');
    const lastName = frag.querySelector('[data-child-last-name]');
    const sex = frag.querySelector('[data-child-sex]');
    const dob = frag.querySelector('[data-child-dob]');
    const remove = frag.querySelector('[data-remove-child]');

    name.name = `children[${idx}][name]`;
    if (lastName) lastName.name = `children[${idx}][last_name]`;
    if (sex) sex.name = `children[${idx}][sex]`;
    dob.name = `children[${idx}][dob]`;

    applyDateMask(dob);

    if (initial && typeof initial.name === 'string') name.value = initial.name;
    if (lastName && initial && typeof initial.last_name === 'string') lastName.value = initial.last_name;
    if (sex && initial && typeof initial.sex === 'string') sex.value = initial.sex;
    if (initial && typeof initial.dob === 'string') dob.value = initial.dob;

    remove.addEventListener('click', () => {
      item.remove();
    });

    list.appendChild(frag);
  }

  addBtn.addEventListener('click', () => addChild(null));
})();

// Dynamic additional occupants fields for inscricao.php
(function () {
  const list = document.querySelector('[data-occupants-list]');
  const addBtn = document.querySelector('[data-add-occupant]');
  const tpl = document.querySelector('[data-occupant-template]');

  if (!list || !addBtn || !tpl) return;

  function applyDateMask(input) {
    if (!input || !(input instanceof HTMLInputElement)) return;
    if (input.dataset.maskBound === '1') return;
    input.dataset.maskBound = '1';

    function formatDigitsToBrDate(digits) {
      const d = digits.slice(0, 2);
      const m = digits.slice(2, 4);
      const y = digits.slice(4, 8);
      let out = d;
      if (digits.length >= 3) out += '/' + m;
      if (digits.length >= 5) out += '/' + y;
      return out;
    }

    input.addEventListener('input', () => {
      const digits = (input.value || '').replace(/\D/g, '').slice(0, 8);
      input.value = formatDigitsToBrDate(digits);
    });
  }

  function setupIntlTelInput(input) {
    if (!input || !window.intlTelInput) return null;
    if (input.dataset.itiBound === '1') return input._itiInstance || null;
    input.dataset.itiBound = '1';

    try {
      const iti = window.intlTelInput(input, {
        initialCountry: 'us',
        preferredCountries: ['us'],
        nationalMode: true,
        separateDialCode: true,
        autoPlaceholder: 'aggressive',
        dropdownContainer: document.body,
        validationNumberTypes: null,
        loadUtils: function () {
          return import('https://cdn.jsdelivr.net/npm/intl-tel-input@25.13.2/build/js/utils.js');
        },
      });
      input._itiInstance = iti;
      return iti;
    } catch (e) {
      return null;
    }
  }

  function nextIndex() {
    const items = list.querySelectorAll('[data-occupant-item]');
    let max = -1;
    items.forEach((el) => {
      const idx = Number(el.getAttribute('data-index'));
      if (!Number.isNaN(idx)) max = Math.max(max, idx);
    });
    return max + 1;
  }

  function addOccupant(initial) {
    const idx = nextIndex();
    const frag = tpl.content.cloneNode(true);
    const item = frag.querySelector('[data-occupant-item]');
    item.setAttribute('data-index', String(idx));

    const first = frag.querySelector('[data-occ-first]');
    const last = frag.querySelector('[data-occ-last]');
    const sex = frag.querySelector('[data-occ-sex]');
    const dob = frag.querySelector('[data-occ-dob]');
    const phone = frag.querySelector('[data-occ-phone]');
    const email = frag.querySelector('[data-occ-email]');
    const remove = frag.querySelector('[data-remove-occupant]');

    first.name = `occupants[${idx}][first_name]`;
    last.name = `occupants[${idx}][last_name]`;
    sex.name = `occupants[${idx}][sex]`;
    dob.name = `occupants[${idx}][dob]`;
    phone.name = `occupants[${idx}][phone]`;
    email.name = `occupants[${idx}][email]`;

    applyDateMask(dob);
    setupIntlTelInput(phone);

    if (initial && typeof initial.first_name === 'string') first.value = initial.first_name;
    if (initial && typeof initial.last_name === 'string') last.value = initial.last_name;
    if (initial && typeof initial.sex === 'string') sex.value = initial.sex;
    if (initial && typeof initial.dob === 'string') dob.value = initial.dob;
    if (initial && typeof initial.phone === 'string') phone.value = initial.phone;
    if (initial && typeof initial.email === 'string') email.value = initial.email;

    remove.addEventListener('click', () => item.remove());

    list.appendChild(frag);
  }

  addBtn.addEventListener('click', () => addOccupant(null));

  // Normaliza telefones (E.164) no submit, quando o intl-tel-input estiver ativo
  document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector("form[method='post']");
    if (!form) return;
    form.addEventListener('submit', function () {
      const inputs = form.querySelectorAll('input[data-iti-bound="1"]');
      inputs.forEach((input) => {
        const value = (input.value || '').trim();
        if (!value) return;
        const iti = input._itiInstance;
        try {
          if (iti && iti.isValidNumber()) {
            input.value = iti.getNumber();
          }
        } catch (e) {
          // deixa o backend validar
        }
      });
    });
  });
})();
