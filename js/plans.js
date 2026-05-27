(() => {
  const container = document.querySelector('[data-plans-container]');
  if (!container) return;

  function formatBRLFromCents(cents) {
    const value = Number(cents || 0) / 100;
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    } catch (_) {
      return 'R$ ' + value.toFixed(2).replace('.', ',');
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderPlan(plan) {
    const benefits = Array.isArray(plan.benefits) ? plan.benefits : [];
    const benefitsLis = benefits.map((b) => `<li>${escapeHtml(b)}</li>`).join('');

    const desc = plan.description ? `<p class="form-hint" style="margin:8px 0 0 0">${escapeHtml(plan.description)}</p>` : '';

    const price = formatBRLFromCents(plan.price_full_cents);

    const installments =
      plan.installment_count && Number(plan.installment_count) > 1 && plan.installment_price_cents
        ? `<div class="form-hint" style="margin-top:6px">ou em até <strong>${escapeHtml(plan.installment_count)}</strong>x de <strong>${escapeHtml(formatBRLFromCents(plan.installment_price_cents))}</strong></div>`
        : '';

    return `
      <article class="price">
        <h3>${escapeHtml(plan.name || '')}</h3>
        <p class="price-value">${escapeHtml(price)}</p>
        ${desc}
        ${benefitsLis ? `<ul>${benefitsLis}</ul>` : ''}
        ${installments}
        <a class="btn btn-outline" href="inscricao.php?plan=${encodeURIComponent(plan.slug || '')}">Inscrever agora</a>
      </article>
    `;
  }

  async function loadPlans() {
    container.innerHTML = '<div style="color:var(--color-muted)">Carregando planos…</div>';
    try {
      const res = await fetch('public-plans.php', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const plans = (data && data.plans) || [];

      if (!Array.isArray(plans) || plans.length === 0) {
        container.innerHTML = '<div style="color:var(--color-muted)">Nenhum plano disponível no momento.</div>';
        return;
      }

      container.innerHTML = plans.map(renderPlan).join('');
    } catch (err) {
      console.warn('[plans] Falha ao carregar planos:', err);
      container.innerHTML = '<div style="color:var(--color-muted)">Não foi possível carregar os planos agora. Tente atualizar a página.</div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPlans);
  } else {
    loadPlans();
  }
})();
