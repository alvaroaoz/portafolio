/* ============================================
   renderer.js — Álvaro Orozco
   Genera el HTML del accordion desde PROYECTOS[]
   No editar para agregar proyectos — usar projects.js
   ============================================ */

const VISIBLE_INICIAL = 4;
const SMMLV = 1750905;

/* ── badges por tipo ── */
const BADGE = {
  demo:    { cls: 'pac__badge--demo',     txt: 'demo en vivo' },
  publico: { cls: 'pac__badge--public',   txt: 'público'      },
  interno: { cls: 'pac__badge--internal', txt: 'interno'      },
};

/* ── pills de stack ── */
function renderStack(stack) {
  return stack.map(s => `<span class="stack-pill">${s}</span>`).join('');
}

/* ── lista de features ── */
function renderFeatures(features) {
  return features.map(f => `<li>${f}</li>`).join('');
}

/* ── cuerpo expandido según tipo ── */
function renderBody(p) {
  const stackHTML    = renderStack(p.stack);
  const featuresHTML = renderFeatures(p.features);
  const githubHTML   = p.github
    ? `<div class="pac__footer"><a href="${p.github}" class="project-link" target="_blank" rel="noopener noreferrer">→ ver código en GitHub</a></div>`
    : '';
  const internaHTML  = p.razonInterna
    ? `<div class="pac__detail-block">
         <p class="pac__detail-label">Por qué es interno</p>
         <p class="pac__detail-note">${p.razonInterna}</p>
       </div>`
    : '';

  const baseContent = `
    <p class="pac__desc">${p.desc}</p>
    <div class="pac__detail-grid">
      <div class="pac__detail-block">
        <p class="pac__detail-label">Características</p>
        <ul class="pac__feature-list">${featuresHTML}</ul>
      </div>
      <div class="pac__detail-block">
        <p class="pac__detail-label">Stack técnico</p>
        <div class="stack-pills" style="margin-top:0.6rem;">${stackHTML}</div>
        ${internaHTML}
      </div>
    </div>
    ${githubHTML}`;

  if (p.tipo === 'demo') {
    return `
      ${baseContent}
      <div id="demo-${p.id}" class="pac__demo-slot"></div>`;
  }

  return baseContent;
}

/* ── card completa ── */
function renderCard(p, visible) {
  const badge   = BADGE[p.tipo] || BADGE.publico;
  const tagsStr = p.tags.join(' ');
  const style   = visible ? '' : ' style="display:none"';

  return `
<article class="pac reveal" data-tags="${tagsStr}" data-id="${p.id}"${style}>
  <button class="pac__trigger" aria-expanded="false">
    <div class="pac__trigger-left">
      <span class="pac__emoji" aria-hidden="true">${p.emoji}</span>
      <div class="pac__trigger-info">
        <h3 class="pac__title">${p.titulo}</h3>
        <p class="pac__summary">${p.resumen}</p>
      </div>
    </div>
    <div class="pac__trigger-right">
      <div class="project-tags">${p.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('')}</div>
      <span class="pac__badge ${badge.cls}">${badge.txt}</span>
      <span class="pac__chevron" aria-hidden="true">›</span>
    </div>
  </button>
  <div class="pac__body">
    <div class="pac__body-inner">
      ${renderBody(p)}
    </div>
  </div>
</article>`;
}

/* ── botón ver más ── */
function renderVerMas(restantes) {
  if (restantes <= 0) return '';
  return `
<button class="ver-mas" id="ver-mas-btn">
  Ver más proyectos
  <span class="ver-mas__count" id="ver-mas-count">${restantes} restantes</span>
</button>`;
}

/* ── DEMO: Calculadora de perjuicios ── */
function montarCalculadora(slot) {
  slot.innerHTML = `
<div class="calc-demo">
  <div class="calc-demo__top">
    <p class="calc-demo__base">SMMLV 2026: <strong>$1,750,905</strong> · Ley 1564/2012 · Solo orientativo</p>
  </div>
  <div class="calc-demo__body">
    <div class="calc-demo__inputs">
      <div class="calc-group">
        <p class="calc-group__label">Datos del caso</p>
        <div class="calc-row">
          <div class="calc-field"><label for="cd-fecha-hecho">Fecha del hecho</label><input type="date" id="cd-fecha-hecho" value="2023-01-15"></div>
          <div class="calc-field"><label for="cd-fecha-liq">Fecha liquidación</label><input type="date" id="cd-fecha-liq"></div>
        </div>
        <div class="calc-row">
          <div class="calc-field"><label for="cd-edad">Edad víctima</label><input type="number" id="cd-edad" value="35" min="1" max="100"></div>
          <div class="calc-field"><label for="cd-ingresos">Ingresos/mes (COP)</label><input type="number" id="cd-ingresos" value="2000000" step="100000"></div>
        </div>
      </div>
      <div class="calc-group">
        <p class="calc-group__label">Daño emergente</p>
        <div class="calc-row">
          <div class="calc-field"><label for="cd-gastos-med">Gastos médicos (COP)</label><input type="number" id="cd-gastos-med" value="0" step="50000"></div>
          <div class="calc-field"><label for="cd-otros">Otros gastos (COP)</label><input type="number" id="cd-otros" value="0" step="50000"></div>
        </div>
      </div>
      <div class="calc-group">
        <p class="calc-group__label">Lucro cesante</p>
        <div class="calc-row">
          <div class="calc-field"><label for="cd-m-inca">Meses incapacidad</label><input type="number" id="cd-m-inca" value="3" min="0"></div>
          <div class="calc-field"><label for="cd-m-fut">Meses futuros</label><input type="number" id="cd-m-fut" value="0" min="0"></div>
        </div>
      </div>
      <div class="calc-group">
        <p class="calc-group__label">Daño moral <span class="calc-group__note">máx. 100 SMMLV · C.E. 26251</span></p>
        <div class="moral-row">
          <span class="moral-lim">0</span>
          <input type="range" id="cd-moral" min="0" max="100" value="50" step="1">
          <span class="moral-lim">100</span>
          <span class="moral-val" id="cd-moral-val">50 SMMLV</span>
        </div>
        <p class="moral-cop" id="cd-moral-cop">= $87,545,250</p>
      </div>
    </div>
    <div class="calc-demo__results">
      <p class="calc-group__label">Resultado estimado</p>
      <div class="result-item"><span class="result-item__label">Daño emergente</span><span class="result-item__val" id="cd-r-emergente">$0</span></div>
      <div class="result-item"><span class="result-item__label">Lucro ces. consolidado</span><span class="result-item__val" id="cd-r-lc-cons">$0</span><span class="result-item__sub" id="cd-r-lc-sub">0 meses</span></div>
      <div class="result-item"><span class="result-item__label">Lucro ces. futuro</span><span class="result-item__val" id="cd-r-lc-fut">$0</span><span class="result-item__sub" id="cd-r-lc-fut-sub">0 meses</span></div>
      <div class="result-item"><span class="result-item__label">Daño moral</span><span class="result-item__val" id="cd-r-moral">$87,545,250</span><span class="result-item__sub" id="cd-r-moral-sub">50 SMMLV</span></div>
      <div class="result-total">
        <span class="result-total__label">Total estimado</span>
        <span class="result-total__val" id="cd-r-total">$87,545,250</span>
        <span class="result-total__sub" id="cd-r-meses">—</span>
      </div>
      <a href="#contacto" class="calc-cta">Consultar caso →</a>
      <p class="calc-disclaimer">Estimación orientativa. No constituye concepto jurídico. Los montos reales dependen de pruebas y criterio del juez.</p>
    </div>
  </div>
</div>`;

  // Lógica de la calculadora
  function fmt(n) { return '$' + Math.round(n).toLocaleString('es-CO'); }
  function mesesEntre(d1, d2) {
    const a = new Date(d1), b = new Date(d2);
    return Math.max(0, (b.getFullYear()-a.getFullYear())*12 + (b.getMonth()-a.getMonth()));
  }
  function calcular() {
    const fechaHecho = document.getElementById('cd-fecha-hecho').value;
    const fechaLiq   = document.getElementById('cd-fecha-liq').value || new Date().toISOString().slice(0,10);
    const ingresos   = parseFloat(document.getElementById('cd-ingresos').value) || 0;
    const gasMed     = parseFloat(document.getElementById('cd-gastos-med').value) || 0;
    const otros      = parseFloat(document.getElementById('cd-otros').value) || 0;
    const mInca      = parseFloat(document.getElementById('cd-m-inca').value) || 0;
    const mFut       = parseFloat(document.getElementById('cd-m-fut').value) || 0;
    const moralSML   = parseFloat(document.getElementById('cd-moral').value) || 0;
    const mesesTrans = fechaHecho ? mesesEntre(fechaHecho, fechaLiq) : 0;
    const factorIdx  = Math.pow(1.08, mesesTrans/12);
    const emergente  = gasMed + otros;
    const lcCons     = ingresos * mInca * factorIdx;
    const tasaM      = 0.06/12;
    const lcFut      = mFut > 0 ? ingresos * ((1 - Math.pow(1+tasaM,-mFut)) / tasaM) : 0;
    const moral      = moralSML * SMMLV;
    const total      = emergente + lcCons + lcFut + moral;
    document.getElementById('cd-r-emergente').textContent   = fmt(emergente);
    document.getElementById('cd-r-lc-cons').textContent     = fmt(lcCons);
    document.getElementById('cd-r-lc-sub').textContent      = mInca + ' meses · ×' + factorIdx.toFixed(2) + ' idx';
    document.getElementById('cd-r-lc-fut').textContent      = fmt(lcFut);
    document.getElementById('cd-r-lc-fut-sub').textContent  = mFut + ' meses (VP 6% anual)';
    document.getElementById('cd-r-moral').textContent       = fmt(moral);
    document.getElementById('cd-r-moral-sub').textContent   = moralSML + ' SMMLV';
    document.getElementById('cd-r-total').textContent       = fmt(total);
    document.getElementById('cd-r-meses').textContent       = mesesTrans > 0 ? mesesTrans + ' meses desde el hecho' : '—';
  }
  document.getElementById('cd-fecha-liq').value = new Date().toISOString().slice(0,10);
  document.getElementById('cd-moral').addEventListener('input', function() {
    document.getElementById('cd-moral-val').textContent = this.value + ' SMMLV';
    document.getElementById('cd-moral-cop').textContent = '= ' + fmt(parseInt(this.value) * SMMLV);
    calcular();
  });
  slot.querySelectorAll('input').forEach(el => el.addEventListener('input', calcular));
  calcular();
}

/* ── MOTOR PRINCIPAL ── */
function iniciarProyectos() {
  const contenedor = document.getElementById('projects-accordion');
  if (!contenedor) return;

  let visibles     = VISIBLE_INICIAL;
  let filtroActivo = 'all';

  function proyectosFiltrados() {
    if (filtroActivo === 'all') return PROYECTOS;
    return PROYECTOS.filter(p => p.tags.includes(filtroActivo));
  }

  function render() {
    const lista      = proyectosFiltrados();
    const restantes  = Math.max(0, lista.length - visibles);

    contenedor.innerHTML =
      lista.map((p, i) => renderCard(p, i < visibles)).join('') +
      renderVerMas(restantes);

    // Scroll reveal
    contenedor.querySelectorAll('.pac').forEach(el => {
      revealObserver.observe(el);
    });

    // Accordion
    contenedor.querySelectorAll('.pac__trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const pac    = trigger.closest('.pac');
        const isOpen = pac.classList.contains('open');

        contenedor.querySelectorAll('.pac.open').forEach(p => {
          p.classList.remove('open');
          p.querySelector('.pac__trigger').setAttribute('aria-expanded', 'false');
        });

        if (!isOpen) {
          pac.classList.add('open');
          trigger.setAttribute('aria-expanded', 'true');

          // Montar demo si aplica
          const id   = pac.dataset.id;
          const slot = document.getElementById('demo-' + id);
          if (slot && !slot.dataset.mounted) {
            slot.dataset.mounted = 'true';
            if (id === 'calculadora-perjuicios') montarCalculadora(slot);
          }

          setTimeout(() => pac.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
        }
      });
    });

    // Ver más
    const btnVerMas = document.getElementById('ver-mas-btn');
    if (btnVerMas) {
      btnVerMas.addEventListener('click', () => {
        visibles += 4;
        render();
        // Scroll al primer proyecto nuevo
        const todas = contenedor.querySelectorAll('.pac');
        if (todas[visibles - 4]) {
          setTimeout(() => todas[visibles - 4].scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        }
      });
    }
  }

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroActivo = btn.dataset.filter;
      visibles     = VISIBLE_INICIAL; // resetear al filtrar
      render();
    });
  });

  render();
}

/* ── Scroll reveal compartido ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });

document.addEventListener('DOMContentLoaded', iniciarProyectos);
