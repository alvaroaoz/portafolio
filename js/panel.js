/* ============================================
   panel.js — Espacio privado de Álvaro Orozco
   Datos 100% locales (localStorage). Sin backend.

   ⚠️ La "clave" es privacidad ligera: oculta de
   miradas casuales, NO es seguridad real. Cualquiera
   con acceso al navegador puede leer localStorage.
   Exporta tus datos con frecuencia para respaldar.
   ============================================ */

(function () {
  'use strict';

  const KEY_HASH = 'aoz-panel-key';     // hash SHA-256 de la clave
  const KEY_DATA = 'aoz-panel-data';    // datos del panel
  const KEY_THEME = 'aoz-theme';
  const KEY_BACKUP = 'aoz-panel-backup'; // timestamp del último export

  const ESTADOS = [
    { id: 'nuevo',     label: 'Nuevo' },
    { id: 'proceso',   label: 'En proceso' },
    { id: 'audiencia', label: 'Audiencia' },
    { id: 'cerrado',   label: 'Cerrado' },
  ];

  /* ── utilidades ── */
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, m => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
  ));

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* ── estado en memoria ── */
  let data = { casos: [], tareas: [] };

  const ESTADO_IDS = ESTADOS.map(e => e.id);
  const PRIO_IDS   = ['alta', 'media', 'baja'];
  const ID_RE      = /^[a-z0-9]{1,32}$/i;
  const FECHA_RE   = /^\d{4}-\d{2}-\d{2}$/;

  // Coacciona a string seguro y acotado (defensa contra payloads gigantes)
  function str(v, max) {
    if (v === null || v === undefined) return '';
    return String(v).slice(0, max || 200);
  }
  // id seguro: conserva el original solo si es alfanumérico corto; si no, regenera
  function safeId(v) { return ID_RE.test(v) ? v : uid(); }
  function inList(v, list, def) { return list.includes(v) ? v : def; }
  function dateOr(v) { return FECHA_RE.test(v) ? v : ''; }

  // Etiquetas: array de strings cortos, sin vacíos, sin duplicados, máx. 12
  function cleanTags(v) {
    if (!Array.isArray(v)) return [];
    const out = [];
    for (const t of v) {
      const s = str(t, 24).trim();
      if (s && !out.some(x => x.toLowerCase() === s.toLowerCase())) out.push(s);
      if (out.length >= 12) break;
    }
    return out;
  }

  // Subtareas: checklist con deadline opcional, máx. 50
  function cleanSubtareas(v) {
    if (!Array.isArray(v)) return [];
    return v
      .filter(s => s && typeof s === 'object')
      .slice(0, 50)
      .map(s => ({
        id:    safeId(s.id),
        texto: str(s.texto, 160),
        fecha: dateOr(s.fecha),
        hecha: s.hecha === true,
      }))
      .filter(s => s.texto);
  }

  // Sanea cualquier dato que entre desde localStorage o un import.
  // Es la frontera de confianza: nada se renderiza sin pasar por aquí.
  function normalizeData(parsed) {
    const casos = (Array.isArray(parsed && parsed.casos) ? parsed.casos : [])
      .filter(c => c && typeof c === 'object')
      .map(c => ({
        id:          safeId(c.id),
        titulo:      str(c.titulo, 120),
        cliente:     str(c.cliente, 80),
        estado:      inList(c.estado, ESTADO_IDS, 'nuevo'),
        prioridad:   inList(c.prioridad, PRIO_IDS, 'media'),
        nota:        str(c.nota, 2000),
        vencimiento: dateOr(c.vencimiento),
        tags:        cleanTags(c.tags),
        subtareas:   cleanSubtareas(c.subtareas),
        creado:      Number.isFinite(c.creado) ? c.creado : Date.now(),
        actualizado: Number.isFinite(c.actualizado) ? c.actualizado : Date.now(),
      }));

    const tareas = (Array.isArray(parsed && parsed.tareas) ? parsed.tareas : [])
      .filter(t => t && typeof t === 'object')
      .map(t => ({
        id:     safeId(t.id),
        texto:  str(t.texto, 160),
        fecha:  FECHA_RE.test(t.fecha) ? t.fecha : '',
        hecha:  t.hecha === true,
        creado: Number.isFinite(t.creado) ? t.creado : Date.now(),
      }))
      .filter(t => t.texto);

    return { casos, tareas };
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(KEY_DATA);
      data = raw ? normalizeData(JSON.parse(raw)) : { casos: [], tareas: [] };
    } catch (e) {
      console.warn('Datos corruptos, empezando vacío.', e);
      data = { casos: [], tareas: [] };
    }
  }

  let saveTimer = null;
  function saveData() {
    try {
      localStorage.setItem(KEY_DATA, JSON.stringify(data));
      flashSaved();
    } catch (e) {
      alert('No se pudo guardar (¿almacenamiento lleno o modo privado?).');
    }
  }

  const savedEl = () => $('#psaved');
  function flashSaved() {
    const el = savedEl();
    if (!el) return;
    el.textContent = '✓ guardado · ' + new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    el.classList.add('show');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  /* ════════════════ GATE ════════════════ */
  const gate      = $('#gate');
  const app       = $('#app');
  const gateForm  = $('#gate-form');
  const gateIn    = $('#gate-input');
  const gateIn2   = $('#gate-input2');
  const gateBtn   = $('#gate-btn');
  const gateErr   = $('#gate-error');
  const gateTitle = $('#gate-title');
  const gateSub   = $('#gate-sub');

  let isSetup = false;

  // Recalcula el modo del gate según exista o no una clave guardada.
  // Debe ejecutarse al arrancar y cada vez que se bloquea, para no
  // quedar atrapado en modo "crear clave" tras el primer registro.
  function refreshGateMode() {
    isSetup = !localStorage.getItem(KEY_HASH);
    if (isSetup) {
      gateTitle.textContent = 'Crea tu clave';
      gateSub.textContent = 'Es la primera vez. Define una clave para proteger este espacio.';
      gateIn.placeholder = 'Nueva clave';
      gateIn.autocomplete = 'new-password';
      gateIn2.style.display = '';
      gateBtn.textContent = 'Crear clave';
    } else {
      gateTitle.textContent = 'Espacio privado';
      gateSub.textContent = 'Introduce tu clave para continuar.';
      gateIn.placeholder = 'Clave';
      gateIn.autocomplete = 'current-password';
      gateIn2.style.display = 'none';
      gateBtn.textContent = 'Entrar';
    }
  }

  function initGate() {
    refreshGateMode();
    gateIn.focus();
  }

  function showError(msg) {
    gateErr.textContent = msg;
    gateErr.hidden = false;
  }

  gateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    gateErr.hidden = true;
    const val = gateIn.value;

    if (isSetup) {
      if (val.length < 4) return showError('Mínimo 4 caracteres.');
      if (val !== gateIn2.value) return showError('Las claves no coinciden.');
      localStorage.setItem(KEY_HASH, await sha256(val));
      unlock();
      return;
    }

    const hash = await sha256(val);
    if (hash === localStorage.getItem(KEY_HASH)) {
      unlock();
    } else {
      showError('Clave incorrecta.');
      gateIn.select();
    }
  });

  function unlock() {
    gate.hidden = true;
    app.hidden = false;
    loadData();
    renderAll();
  }

  function lock() {
    app.hidden = true;
    gate.hidden = false;
    gateIn.value = '';
    if (gateIn2) gateIn2.value = '';
    gateErr.hidden = true;
    refreshGateMode();   // evita quedar en modo "crear clave" tras el primer registro
    gateIn.focus();
  }

  /* ════════════════ FECHAS / CUENTA REGRESIVA ════════════════ */
  function todayStr() { return new Date().toISOString().slice(0, 10); }

  // Días desde hoy hasta una fecha YYYY-MM-DD (negativo = ya venció). null si inválida.
  function diasHasta(fecha) {
    if (!FECHA_RE.test(fecha)) return null;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const d = new Date(fecha + 'T00:00:00');
    return Math.round((d - hoy) / 86400000);
  }

  // Info para la cuenta regresiva de un caso: clase de color + texto humano.
  function countdownInfo(fecha) {
    const d = diasHasta(fecha);
    if (d === null) return null;
    const plural = n => Math.abs(n) === 1 ? ' día' : ' días';
    if (d < 0)   return { cls: 'venc', txt: 'Venció hace ' + Math.abs(d) + plural(d) };
    if (d === 0) return { cls: 'venc', txt: 'Vence hoy' };
    if (d === 1) return { cls: 'urg',  txt: 'Vence mañana' };
    if (d <= 3)  return { cls: 'urg',  txt: 'Faltan ' + d + ' días' };
    if (d <= 7)  return { cls: 'prox', txt: 'Faltan ' + d + ' días' };
    return { cls: 'ok', txt: 'Faltan ' + d + ' días' };
  }

  /* ════════════════ DASHBOARD ════════════════ */
  function renderDash() {
    const activos = data.casos.filter(c => c.estado !== 'cerrado').length;
    const proceso = data.casos.filter(c => c.estado === 'proceso').length;
    const audi    = data.casos.filter(c => c.estado === 'audiencia').length;
    const vencer  = data.casos.filter(c => {
      if (c.estado === 'cerrado') return false;
      const d = diasHasta(c.vencimiento);
      return d !== null && d <= 7;          // incluye casos ya vencidos
    }).length;
    const pend    = data.tareas.filter(t => !t.hecha).length;
    const venc    = data.tareas.filter(t => !t.hecha && t.fecha && t.fecha < todayStr()).length;
    $('#st-total').textContent     = activos;
    $('#st-proceso').textContent   = proceso;
    $('#st-audiencia').textContent = audi;
    $('#st-vencer').textContent    = vencer;
    $('#st-tareas').textContent    = pend;
    $('#st-vencidas').textContent  = venc;
  }

  /* ════════════════ INDICADOR DE ORIGEN / RESPALDO ════════════════ */
  function originLabel() {
    if (location.protocol === 'file:') return 'Archivo local (file://)';
    const host = location.host || location.hostname;
    if (/^(localhost|127\.0\.0\.1)/.test(host)) return host + ' · servidor local';
    if (/github\.io$/.test(location.hostname)) return host + ' · publicado';
    return host;
  }

  function renderOrigin() {
    const loc = $('#porigin-loc');
    if (loc) loc.textContent = originLabel();

    const wrap = $('#porigin-backup');
    const txt  = $('#porigin-backup-txt');
    if (!wrap || !txt) return;

    const ts = parseInt(localStorage.getItem(KEY_BACKUP), 10);
    if (!ts) {
      txt.textContent = 'Sin respaldo aún — exporta para tener copia';
      wrap.classList.add('warn');
      return;
    }
    const dias = Math.floor((Date.now() - ts) / 86400000);
    const fecha = new Date(ts).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    let cuando;
    if (dias <= 0) cuando = 'hoy';
    else if (dias === 1) cuando = 'ayer';
    else cuando = 'hace ' + dias + ' días';
    txt.textContent = 'Último respaldo: ' + fecha + ' (' + cuando + ')';
    wrap.classList.toggle('warn', dias >= 7);
  }

  /* ════════════════ TAREAS ════════════════ */
  const taskForm  = $('#task-form');
  const taskText  = $('#task-text');
  const taskDate  = $('#task-date');
  const taskList  = $('#task-list');
  const taskEmpty = $('#task-empty');

  function renderTasks() {
    const items = [...data.tareas].sort((a, b) => {
      if (a.hecha !== b.hecha) return a.hecha ? 1 : -1;       // pendientes primero
      const fa = a.fecha || '9999', fb = b.fecha || '9999';   // por fecha
      return fa.localeCompare(fb);
    });

    taskList.innerHTML = items.map(t => {
      const overdue = !t.hecha && t.fecha && t.fecha < todayStr();
      const fechaTxt = t.fecha
        ? new Date(t.fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
        : '';
      return `
      <li class="task-item ${t.hecha ? 'done' : ''} ${overdue ? 'overdue' : ''}" data-id="${esc(t.id)}">
        <button class="task-check" data-act="toggle" aria-label="Marcar tarea"><i class="fa-solid fa-check" aria-hidden="true"></i></button>
        <span class="task-item__text">${esc(t.texto)}</span>
        ${fechaTxt ? `<span class="task-item__date">${overdue ? '⚠ ' : ''}${fechaTxt}</span>` : ''}
        <button class="task-del" data-act="del" aria-label="Eliminar tarea"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
      </li>`;
    }).join('');

    taskEmpty.style.display = items.length ? 'none' : 'block';
  }

  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const txt = taskText.value.trim();
    if (!txt) return;
    data.tareas.push({ id: uid(), texto: txt, fecha: taskDate.value || '', hecha: false, creado: Date.now() });
    taskText.value = '';
    taskDate.value = '';
    saveData();
    renderTasks();
    renderDash();
    taskText.focus();
  });

  taskList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const li = btn.closest('.task-item');
    const id = li.dataset.id;
    const t = data.tareas.find(x => x.id === id);
    if (!t) return;
    if (btn.dataset.act === 'toggle') t.hecha = !t.hecha;
    if (btn.dataset.act === 'del') {
      if (!confirm('¿Eliminar esta tarea?')) return;
      data.tareas = data.tareas.filter(x => x.id !== id);
    }
    saveData();
    renderTasks();
    renderDash();
  });

  /* ════════════════ KANBAN DE CASOS ════════════════ */
  const kanban    = $('#kanban');
  const tagFilter = $('#case-tagfilter');
  const searchIn  = $('#case-search');

  const PRIO_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' };

  let filtroTexto = '';
  let filtroTag   = '';   // '' = todas

  function matchFiltro(c) {
    if (filtroTag && !c.tags.some(t => t.toLowerCase() === filtroTag.toLowerCase())) return false;
    const q = filtroTexto.trim().toLowerCase();
    if (q) {
      const heno = (c.titulo + ' ' + c.cliente + ' ' + c.nota + ' ' + c.tags.join(' ')).toLowerCase();
      if (!heno.includes(q)) return false;
    }
    return true;
  }

  // Barra de filtros por etiqueta (se reconstruye con la unión de tags existentes)
  function renderFilters() {
    if (!tagFilter) return;
    const tags = [...new Set(data.casos.flatMap(c => c.tags))].sort((a, b) => a.localeCompare(b));
    // Si el filtro activo ya no existe (etiqueta editada/borrada), vuelve a "Todas"
    if (filtroTag && !tags.some(t => t.toLowerCase() === filtroTag.toLowerCase())) filtroTag = '';
    const chip = (val, label, active) =>
      `<button class="ftag ${active ? 'active' : ''}" data-tag="${esc(val)}">${esc(label)}</button>`;
    tagFilter.innerHTML =
      chip('', 'Todas', filtroTag === '') +
      tags.map(t => chip(t, t, filtroTag.toLowerCase() === t.toLowerCase())).join('');
    tagFilter.style.display = tags.length ? '' : 'none';
  }

  function renderKanban() {
    renderFilters();
    const visibles = data.casos.filter(matchFiltro);
    kanban.innerHTML = ESTADOS.map(col => {
      const casos = visibles.filter(c => c.estado === col.id);
      const cards = casos.map(c => renderCaseCard(c, col.id)).join('') ||
        `<p class="empty">—</p>`;
      return `
      <div class="kcol" data-estado="${col.id}">
        <div class="kcol__head">${col.label} <span class="kcol__count">${casos.length}</span></div>
        <div class="kcards">${cards}</div>
      </div>`;
    }).join('');
    bindKanban();
  }

  function renderCaseCard(c, estado) {
    const idx  = ESTADOS.findIndex(e => e.id === estado);
    const prev = idx > 0 ? ESTADOS[idx - 1] : null;
    const next = idx < ESTADOS.length - 1 ? ESTADOS[idx + 1] : null;

    const cd = countdownInfo(c.vencimiento);
    const cdHTML = cd
      ? `<span class="kcd kcd--${cd.cls}" title="Fecha límite: ${esc(c.vencimiento)}"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i> ${cd.txt}</span>`
      : '';

    const tagsHTML = c.tags.length
      ? `<div class="kcard__tags">${c.tags.map(t => `<span class="ktag">${esc(t)}</span>`).join('')}</div>`
      : '';

    const total = c.subtareas.length;
    const done  = c.subtareas.filter(s => s.hecha).length;
    const pct   = total ? Math.round(done / total * 100) : 0;
    const subHTML = total
      ? `<div class="kcard__sub" title="${done} de ${total} subtareas completadas">
           <div class="kcard__subbar"><span style="width:${pct}%"></span></div>
           <span class="kcard__subtxt"><i class="fa-solid fa-list-check" aria-hidden="true"></i> ${done}/${total}</span>
         </div>`
      : '';

    return `
    <article class="kcard" data-id="${esc(c.id)}" draggable="true">
      <div class="kcard__top">
        <h4 class="kcard__titulo">${esc(c.titulo)}</h4>
        <span class="kcard__prio kcard__prio--${esc(c.prioridad || 'media')}" title="Prioridad ${PRIO_LABEL[c.prioridad] || 'Media'}"></span>
      </div>
      ${c.cliente ? `<p class="kcard__cliente"><i class="fa-solid fa-user" aria-hidden="true"></i>${esc(c.cliente)}</p>` : ''}
      ${cdHTML}
      ${tagsHTML}
      ${c.nota ? `<p class="kcard__nota">${esc(c.nota)}</p>` : ''}
      ${subHTML}
      <div class="kcard__actions">
        <button class="kbtn" data-act="prev" aria-label="Mover a etapa anterior" ${prev ? '' : 'disabled'}><i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>
        <button class="kbtn" data-act="next" aria-label="Mover a siguiente etapa" ${next ? '' : 'disabled'}><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>
        <button class="kbtn kbtn--edit" data-act="edit" aria-label="Editar caso"><i class="fa-solid fa-pen" aria-hidden="true"></i></button>
        <button class="kbtn kbtn--del" data-act="del" aria-label="Eliminar caso"><i class="fa-solid fa-trash" aria-hidden="true"></i></button>
      </div>
    </article>`;
  }

  // Filtros: clic en etiqueta + búsqueda
  tagFilter?.addEventListener('click', (e) => {
    const btn = e.target.closest('.ftag');
    if (!btn) return;
    filtroTag = btn.dataset.tag;
    renderKanban();
  });
  searchIn?.addEventListener('input', () => {
    filtroTexto = searchIn.value;
    renderKanban();
  });

  function moveCase(id, dir) {
    const c = data.casos.find(x => x.id === id);
    if (!c) return;
    const idx = ESTADOS.findIndex(e => e.id === c.estado);
    const nidx = idx + (dir === 'next' ? 1 : -1);
    if (nidx < 0 || nidx >= ESTADOS.length) return;
    c.estado = ESTADOS[nidx].id;
    c.actualizado = Date.now();
    saveData();
    renderKanban();
    renderDash();
  }

  function setEstado(id, estado) {
    const c = data.casos.find(x => x.id === id);
    if (!c || c.estado === estado) return;
    c.estado = estado;
    c.actualizado = Date.now();
    saveData();
    renderKanban();
    renderDash();
  }

  function bindKanban() {
    // botones
    $$('.kcard__actions .kbtn', kanban).forEach(btn => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.kcard');
        const id = card.dataset.id;
        const act = btn.dataset.act;
        if (act === 'prev' || act === 'next') moveCase(id, act);
        else if (act === 'edit') openCaseModal(id);
        else if (act === 'del') {
          if (confirm('¿Eliminar este caso? No se puede deshacer.')) {
            data.casos = data.casos.filter(x => x.id !== id);
            saveData(); renderKanban(); renderDash();
          }
        }
      });
    });

    // drag & drop
    let dragId = null;
    $$('.kcard', kanban).forEach(card => {
      card.addEventListener('dragstart', () => { dragId = card.dataset.id; card.classList.add('dragging'); });
      card.addEventListener('dragend',   () => { dragId = null; card.classList.remove('dragging'); });
    });
    $$('.kcol', kanban).forEach(col => {
      col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('dragover'); });
      col.addEventListener('dragleave', () => col.classList.remove('dragover'));
      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('dragover');
        if (dragId) setEstado(dragId, col.dataset.estado);
      });
    });
  }

  /* ── modal de caso ── */
  const modal     = $('#case-modal');
  const caseForm  = $('#case-form');
  const fId       = $('#case-id');
  const fTitulo   = $('#case-titulo');
  const fCliente  = $('#case-cliente');
  const fEstado   = $('#case-estado');
  const fPrio     = $('#case-prioridad');
  const fVenc     = $('#case-vencimiento');
  const fTags     = $('#case-tags');
  const fNota     = $('#case-nota');
  const subList   = $('#case-subtasks');
  const modalTitle = $('#case-modal-title');

  // Crea una fila editable de subtarea (checkbox + texto + fecha + borrar).
  // El estado "hecha" vive como clase .done en la fila; al guardar se lee del DOM.
  function addSubtaskRow(s) {
    s = s || { id: '', texto: '', fecha: '', hecha: false };
    const row = document.createElement('div');
    row.className = 'subt' + (s.hecha ? ' done' : '');
    row.dataset.id = ID_RE.test(s.id) ? s.id : uid();

    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'subt__check';
    check.setAttribute('aria-label', 'Completar subtarea');
    check.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i>';
    check.addEventListener('click', () => {
      const done = row.classList.toggle('done');
      check.setAttribute('aria-pressed', done ? 'true' : 'false');
    });

    const txt = document.createElement('input');
    txt.type = 'text'; txt.className = 'subt__text';
    txt.placeholder = 'Subtarea…'; txt.maxLength = 160; txt.value = s.texto || '';

    const date = document.createElement('input');
    date.type = 'date'; date.className = 'subt__date'; date.value = s.fecha || '';
    date.setAttribute('aria-label', 'Fecha límite de la subtarea');

    const del = document.createElement('button');
    del.type = 'button'; del.className = 'subt__del';
    del.setAttribute('aria-label', 'Eliminar subtarea');
    del.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    del.addEventListener('click', () => row.remove());

    row.append(check, txt, date, del);
    subList.appendChild(row);
    return row;
  }

  function collectSubtasks() {
    return $$('.subt', subList).map(row => ({
      id:    row.dataset.id,
      texto: row.querySelector('.subt__text').value.trim().slice(0, 160),
      fecha: dateOr(row.querySelector('.subt__date').value),
      hecha: row.classList.contains('done'),
    })).filter(s => s.texto).slice(0, 50);
  }

  function openCaseModal(id) {
    caseForm.reset();
    subList.innerHTML = '';
    if (id) {
      const c = data.casos.find(x => x.id === id);
      if (!c) return;
      modalTitle.textContent = 'Editar caso';
      fId.value = c.id;
      fTitulo.value  = c.titulo || '';
      fCliente.value = c.cliente || '';
      fEstado.value  = c.estado || 'nuevo';
      fPrio.value    = c.prioridad || 'media';
      fVenc.value    = c.vencimiento || '';
      fTags.value    = (c.tags || []).join(', ');
      fNota.value    = c.nota || '';
      (c.subtareas || []).forEach(addSubtaskRow);
    } else {
      modalTitle.textContent = 'Nuevo caso';
      fId.value = '';
      fEstado.value = 'nuevo';
      fPrio.value = 'media';
    }
    modal.hidden = false;
    setTimeout(() => fTitulo.focus(), 50);
  }

  function closeModal() { modal.hidden = true; }

  modal.addEventListener('click', (e) => { if (e.target.matches('[data-close]')) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  $('#btn-add-subtask').addEventListener('click', () => {
    const row = addSubtaskRow();
    row.querySelector('.subt__text').focus();
  });

  caseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const titulo = fTitulo.value.trim();
    if (!titulo) return;
    const payload = {
      titulo,
      cliente:     fCliente.value.trim(),
      estado:      fEstado.value,
      prioridad:   fPrio.value,
      vencimiento: dateOr(fVenc.value),
      tags:        cleanTags(fTags.value.split(',')),
      nota:        fNota.value.trim(),
      subtareas:   collectSubtasks(),
      actualizado: Date.now(),
    };
    if (fId.value) {
      const c = data.casos.find(x => x.id === fId.value);
      if (c) Object.assign(c, payload);
    } else {
      data.casos.push({ id: uid(), creado: Date.now(), ...payload });
    }
    saveData();
    renderKanban();
    renderDash();
    closeModal();
  });

  $('#btn-new-case').addEventListener('click', () => openCaseModal(null));

  /* ════════════════ EXPORT / IMPORT ════════════════ */
  $('#btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aoz-panel-' + todayStr() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(KEY_BACKUP, Date.now().toString());
    renderOrigin();
  });

  const importFile = $('#import-file');
  $('#btn-import').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== 'object') throw new Error('formato');
        if (!confirm('Esto reemplazará tus datos actuales. ¿Continuar?')) return;
        data = normalizeData(parsed);   // sanea antes de usar/guardar
        saveData();
        renderAll();
      } catch (err) {
        alert('Archivo no válido.');
      }
    };
    reader.readAsText(file);
    importFile.value = '';
  });

  /* ════════════════ TEMA + LOCK ════════════════ */
  const btnTheme = $('#btn-theme');
  const themeIcon = btnTheme.querySelector('i');
  function syncThemeIcon() {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    themeIcon.className = light ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  syncThemeIcon();
  btnTheme.addEventListener('click', () => {
    const light = document.documentElement.getAttribute('data-theme') === 'light';
    if (light) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem(KEY_THEME, 'dark'); }
    else { document.documentElement.setAttribute('data-theme', 'light'); localStorage.setItem(KEY_THEME, 'light'); }
    syncThemeIcon();
  });

  $('#btn-lock').addEventListener('click', lock);

  /* ════════════════ RENDER GLOBAL ════════════════ */
  function renderAll() {
    renderOrigin();
    renderDash();
    renderTasks();
    renderKanban();
  }

  /* ── arranque ── */
  initGate();
})();
