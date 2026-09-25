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

/* ── iconos SVG (Heroicons outline, MIT) — clave = campo `icono` de projects.js ── */
const ICONOS = {
  balanza:      '<path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>',
  calculadora:  '<path d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>',
  reloj:        '<path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  recibo:       '<path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"/>',
  chip:         '<path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"/>',
  carpeta:      '<path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>',
  rayo:         '<path d="M13 10V3L4 14h7v7l9-11h-7z"/>',
  portapapeles: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>',
  documento:    '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>',
  busqueda:     '<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>',
  codigo:       '<path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>',
  terminal:     '<path d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
};

function renderIcono(nombre) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[nombre] || ICONOS.codigo}</svg>`;
}

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
    ? `<div class="pac__footer"><a href="${p.github}" class="project-link" target="_blank" rel="noopener noreferrer">ver código en GitHub<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg><span class="sr-only">(se abre en una pestaña nueva)</span></a></div>`
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
        <div class="stack-pills">${stackHTML}</div>
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

/* ── card completa ──
   Patrón accordion accesible: <h3><button aria-expanded aria-controls>…</button></h3>
   (dentro del botón solo contenido de frase: spans). Nombre accesible corto
   = título + tipo; el resumen va como descripción. */
function renderCard(p, visible) {
  const badge   = BADGE[p.tipo] || BADGE.publico;
  const tagsStr = p.tags.join(' ');
  const style   = visible ? '' : ' style="display:none"';
  const bodyId  = `pac-body-${p.id}`;

  return `
<article class="pac reveal" data-tags="${tagsStr}" data-id="${p.id}"${style}>
  <h3 class="pac__heading">
    <button type="button" class="pac__trigger" aria-expanded="false" aria-controls="${bodyId}"
            aria-labelledby="pac-title-${p.id} pac-badge-${p.id}" aria-describedby="pac-sum-${p.id}">
      <span class="pac__trigger-left">
        <span class="pac__icon">${renderIcono(p.icono)}</span>
        <span class="pac__trigger-info">
          <span class="pac__title" id="pac-title-${p.id}">${p.titulo}</span>
          <span class="pac__summary" id="pac-sum-${p.id}">${p.resumen}</span>
        </span>
      </span>
      <span class="pac__trigger-right">
        <span class="project-tags">${p.tags.map(t => `<span class="tag tag-${t}">${t}</span>`).join('')}</span>
        <span class="pac__badge ${badge.cls}" id="pac-badge-${p.id}">${badge.txt}</span>
        <svg class="pac__chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 9l-7 7-7-7"/></svg>
      </span>
    </button>
  </h3>
  <div class="pac__body" id="${bodyId}">
    <div class="pac__body-inner">
      <div class="pac__body-content">
        ${renderBody(p)}
      </div>
    </div>
  </div>
</article>`;
}

/* ── botón ver más ── */
function renderVerMas(restantes) {
  if (restantes <= 0) return '';
  return `
<button type="button" class="ver-mas" id="ver-mas-btn">
  Ver más proyectos
  <span class="ver-mas__count" id="ver-mas-count">${restantes} restantes</span>
</button>`;
}

/* ── DEMO: Calculadora de perjuicios ── */
function montarCalculadora(slot) {
  slot.innerHTML = `
<div class="calc-demo">
  <div class="calc-demo__top">
    <p class="calc-demo__base">SMMLV 2026: <strong>$1.750.905</strong> · Ley 1564/2012 · Solo orientativo</p>
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
        <p class="moral-cop" id="cd-moral-cop">= $87.545.250</p>
      </div>
    </div>
    <div class="calc-demo__results">
      <p class="calc-group__label">Resultado estimado</p>
      <div class="result-item"><span class="result-item__label">Daño emergente</span><span class="result-item__val" id="cd-r-emergente">$0</span></div>
      <div class="result-item"><span class="result-item__label">Lucro ces. consolidado</span><span class="result-item__val" id="cd-r-lc-cons">$0</span><span class="result-item__sub" id="cd-r-lc-sub">0 meses</span></div>
      <div class="result-item"><span class="result-item__label">Lucro ces. futuro</span><span class="result-item__val" id="cd-r-lc-fut">$0</span><span class="result-item__sub" id="cd-r-lc-fut-sub">0 meses</span></div>
      <div class="result-item"><span class="result-item__label">Daño moral</span><span class="result-item__val" id="cd-r-moral">$87.545.250</span><span class="result-item__sub" id="cd-r-moral-sub">50 SMMLV</span></div>
      <div class="result-total">
        <span class="result-total__label">Total estimado</span>
        <span class="result-total__val" id="cd-r-total">$87.545.250</span>
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

/* ── DEMO: Verificador de prescripción SIMIT ── */
function montarPrescripcion(slot) {
  slot.innerHTML = `
<div class="calc-demo">
  <div class="calc-demo__top">
    <p class="calc-demo__base">Regla general: <strong>3 años</strong> desde la ejecutoria · art. 159 Ley 769/2002 · Solo orientativo</p>
  </div>
  <div class="calc-demo__body calc-demo__body--single">
    <div class="calc-demo__inputs">
      <div class="calc-group">
        <p class="calc-group__label">Datos de la multa</p>
        <div class="calc-row">
          <div class="calc-field">
            <label for="pr-ejec">Fecha de ejecutoria</label>
            <input type="date" id="pr-ejec">
          </div>
          <div class="calc-field">
            <label for="pr-actuacion">Última actuación de cobro <span class="calc-group__note">opcional · interrumpe</span></label>
            <input type="date" id="pr-actuacion">
          </div>
        </div>
      </div>
    </div>
    <div class="calc-demo__results" id="pr-results">
      <p class="calc-group__label">Resultado orientativo</p>
      <div class="result-item"><span class="result-item__label">Fecha base de conteo</span><span class="result-item__val" id="pr-base">—</span></div>
      <div class="result-item"><span class="result-item__label">Tiempo transcurrido</span><span class="result-item__val" id="pr-transcurrido">—</span></div>
      <div class="result-item"><span class="result-item__label">Prescribiría el</span><span class="result-item__val" id="pr-fecha">—</span></div>
      <div class="result-total" id="pr-verdict-box">
        <span class="result-total__label">Veredicto</span>
        <span class="result-total__val result-total__val--sm" id="pr-verdict">Ingresa la fecha</span>
        <span class="result-total__sub" id="pr-verdict-sub">—</span>
      </div>
      <a href="#contacto" class="calc-cta">Consultar mi caso →</a>
      <p class="calc-disclaimer">Estimación orientativa. El término puede interrumpirse o suspenderse por actuaciones de la entidad. No constituye concepto jurídico.</p>
    </div>
  </div>
</div>`;

  const $ = id => slot.querySelector('#' + id);
  function fmtFecha(d) { return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }); }

  function calcular() {
    const ejec = $('pr-ejec').value;
    const act  = $('pr-actuacion').value;
    if (!ejec) return;
    const base = new Date((act || ejec) + 'T00:00:00');
    const hoy  = new Date(); hoy.setHours(0, 0, 0, 0);
    const prescribe = new Date(base); prescribe.setFullYear(prescribe.getFullYear() + 3);

    const meses = Math.max(0, (hoy.getFullYear() - base.getFullYear()) * 12 + (hoy.getMonth() - base.getMonth()));
    const años = Math.floor(meses / 12);
    $('pr-base').textContent = fmtFecha(base) + (act ? ' (por actuación)' : '');
    $('pr-transcurrido').textContent = años + ' años, ' + (meses % 12) + ' meses';
    $('pr-fecha').textContent = fmtFecha(prescribe);

    // El color lo ponen las clases (tokens por tema); el texto ya expresa el estado
    const v = $('pr-verdict'), sub = $('pr-verdict-sub'), box = $('pr-verdict-box');
    const prescrita = hoy >= prescribe;
    box.classList.toggle('result-total--ok', prescrita);
    box.classList.toggle('result-total--warn', !prescrita);
    if (prescrita) {
      v.textContent = 'Posiblemente PRESCRITA';
      sub.textContent = 'Superó los 3 años. Vale la pena revisarla.';
    } else {
      const faltanMeses = (prescribe.getFullYear() - hoy.getFullYear()) * 12 + (prescribe.getMonth() - hoy.getMonth());
      v.textContent = 'Aún VIGENTE';
      sub.textContent = 'Faltan ~' + faltanMeses + ' meses para el término.';
    }
  }

  slot.querySelectorAll('input').forEach(el => el.addEventListener('input', calcular));
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
            else if (id === 'verificador-prescripcion') montarPrescripcion(slot);
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
        // El botón se re-renderiza: el foco pasa al primer proyecto nuevo (no se pierde)
        const primeraNueva = contenedor.querySelectorAll('.pac')[visibles - 4];
        if (primeraNueva) {
          primeraNueva.querySelector('.pac__trigger').focus({ preventScroll: true });
          setTimeout(() => primeraNueva.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        }
      });
    }
  }

  // Filtros (estado expuesto con aria-pressed)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
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
