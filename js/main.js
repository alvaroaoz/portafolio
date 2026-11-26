/* ============================================
   main.js — Álvaro Orozco
   Lógica general: nav, scroll reveal base
   Los proyectos los maneja renderer.js
   ============================================ */

// ── Nav mobile toggle ──
// El icono (hamburguesa/X) lo controla el CSS vía [aria-expanded]
const toggle = document.querySelector('.nav__toggle');
const menu   = document.querySelector('.nav__menu');

function setMenu(open) {
  menu?.classList.toggle('open', open);
  toggle?.setAttribute('aria-expanded', String(open));
  toggle?.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
}

toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('open')));

menu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenu(false));
});

// Cerrar con Escape o tocando fuera del menú
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.classList.contains('open')) setMenu(false);
});
document.addEventListener('click', (e) => {
  if (menu?.classList.contains('open') && !e.target.closest('.nav')) setMenu(false);
});

// ── Scroll reveal (elementos fuera del accordion) ──
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ── Toggle de tema claro / oscuro ──
// El icono (luna/sol) lo controla el CSS vía [data-theme]
const themeToggle = document.getElementById('theme-toggle');
const themeColor  = document.querySelector('meta[name="theme-color"]');

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeToggle?.setAttribute('aria-label', 'Cambiar a tema oscuro');
    themeColor?.setAttribute('content', '#f5f7f4');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggle?.setAttribute('aria-label', 'Cambiar a tema claro');
    themeColor?.setAttribute('content', '#111614');
  }
}

// Estado inicial del icono (el tema ya lo aplicó el script inline del <head>)
applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

themeToggle?.addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  try { localStorage.setItem('aoz-theme', next); } catch (e) {}
});

// ── Barra de progreso de scroll (transform: no provoca relayout) ──
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  if (!progressBar) return;
  const h = document.documentElement;
  const scrolled = h.scrollHeight - h.clientHeight;
  const ratio = scrolled > 0 ? h.scrollTop / scrolled : 0;
  progressBar.style.transform = 'scaleX(' + ratio + ')';
}

// ── Botón volver arriba ──
const toTop = document.getElementById('to-top');
toTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Scroll combinado (progreso + botón + sombra de la nav) con rAF ──
const navBar = document.querySelector('.nav');
let ticking = false;
function onScrollFrame() {
  updateProgress();
  if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
  navBar?.classList.toggle('is-scrolled', window.scrollY > 8);
  ticking = false;
}
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(onScrollFrame);
    ticking = true;
  }
}, { passive: true });
onScrollFrame();

// ── Nav activo según sección visible ──
const navLinks = Array.from(document.querySelectorAll('.nav__menu a[href^="#"]'));
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (sections.length) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => { l.classList.remove('active'); l.removeAttribute('aria-current'); });
        const active = navLinks.find(l => l.getAttribute('href') === '#' + e.target.id);
        active?.classList.add('active');
        active?.setAttribute('aria-current', 'true');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => navObserver.observe(s));
}

// ── Contadores de impacto ──
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  if (prefersReduced) { el.textContent = prefix + target.toLocaleString('es-CO') + suffix; return; }
  const dur = 1400;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = prefix + val.toLocaleString('es-CO') + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCount(e.target); countObserver.unobserve(e.target); }
  });
}, { threshold: 0.5 });
// El HTML trae el valor final (visible sin JS); aquí se pone en 0 para animarlo
document.querySelectorAll('.impact-stat__num[data-count]').forEach(el => {
  if (!prefersReduced) el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || '');
  countObserver.observe(el);
});

// ── Halo del hero que sigue al puntero (solo ratón y sin "reducir movimiento") ──
const heroEl   = document.querySelector('.hero');
const heroGlow = document.querySelector('.hero__glow');
if (heroEl && heroGlow && !prefersReduced && window.matchMedia('(pointer: fine)').matches) {
  let glowFrame = 0;
  heroEl.addEventListener('pointermove', (e) => {
    if (glowFrame) return;
    glowFrame = requestAnimationFrame(() => {
      const r = heroEl.getBoundingClientRect();
      heroGlow.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      heroGlow.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      glowFrame = 0;
    });
  });
}

// ── Enlaces "Consultar" de los servicios: preseleccionan el tema del formulario ──
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-tipo]');
  const select = document.getElementById('cf-tipo');
  if (link && select) select.value = link.dataset.tipo;
});

// ── Formularios Web3Forms (contacto y testimonios, sin backend) ──
const W3F_MSGS = {
  'contact-form': { ok: '✓ ¡Mensaje enviado! Te responderé pronto.', err: '✗ No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp.' },
  'testi-form':   { ok: '✓ ¡Gracias por tu testimonio! Lo revisaré antes de publicarlo.', err: '✗ No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp.' },
};
document.querySelectorAll('#contact-form, #testi-form').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msgs = W3F_MSGS[form.id];
    const status = form.querySelector('.contact-form__status');
    const submit = form.querySelector('[type="submit"]');

    submit.disabled = true;
    submit.classList.add('is-loading');
    form.setAttribute('aria-busy', 'true');
    status.className = 'contact-form__status';
    status.textContent = 'Enviando…';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'error');
      status.className = 'contact-form__status ok';
      status.textContent = msgs.ok;
      form.reset();
    } catch (err) {
      status.className = 'contact-form__status err';
      status.textContent = msgs.err;
    } finally {
      submit.disabled = false;
      submit.classList.remove('is-loading');
      form.removeAttribute('aria-busy');
    }
  });
});

// ── Service Worker (offline + instalable) ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// ── Console easter egg ──
console.log('%c aoz363 ', 'background:#111614;color:#00e1f4;font-family:monospace;font-size:16px;padding:4px 8px;border:1px solid #00e1f4;border-radius:3px;');
console.log('%c github.com/alvaroaoz | linkedin.com/in/alvaroaoz', 'color:#3d7a3d;font-family:monospace;');
