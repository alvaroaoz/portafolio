/* ============================================
   main.js — Álvaro Orozco
   Lógica general: nav, scroll reveal base
   Los proyectos los maneja renderer.js
   ============================================ */

// ── Nav mobile toggle ──
const toggle     = document.querySelector('.nav__toggle');
const menu       = document.querySelector('.nav__menu');
const toggleIcon = toggle?.querySelector('i');

toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  if (toggleIcon) toggleIcon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
});

menu?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-bars';
  });
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
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = themeToggle?.querySelector('i');

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    themeToggle?.setAttribute('aria-label', 'Cambiar a tema oscuro');
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
    themeToggle?.setAttribute('aria-label', 'Cambiar a tema claro');
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

// ── Barra de progreso de scroll ──
const progressBar = document.getElementById('scroll-progress');
function updateProgress() {
  if (!progressBar) return;
  const h = document.documentElement;
  const scrolled = h.scrollHeight - h.clientHeight;
  const pct = scrolled > 0 ? (h.scrollTop / scrolled) * 100 : 0;
  progressBar.style.width = pct + '%';
}

// ── Botón volver arriba ──
const toTop = document.getElementById('to-top');
toTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Scroll combinado (progreso + botón) con rAF ──
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateProgress();
      if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
updateProgress();

// ── Nav activo según sección visible ──
const navLinks = Array.from(document.querySelectorAll('.nav__menu a[href^="#"]'));
const sections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (sections.length) {
  const navObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = navLinks.find(l => l.getAttribute('href') === '#' + e.target.id);
        active?.classList.add('active');
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
document.querySelectorAll('.impact-stat__num[data-count]').forEach(el => countObserver.observe(el));

// ── Formulario de contacto (Web3Forms, sin backend) ──
const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('cf-status');
  const submit = document.getElementById('cf-submit');
  const key = contactForm.querySelector('[name="access_key"]')?.value || '';

  if (key.includes('TU-ACCESS-KEY')) {
    status.className = 'contact-form__status err';
    status.textContent = '⚠ Falta configurar el Access Key de Web3Forms (ver comentario en el HTML). Mientras tanto, escríbeme por email o WhatsApp.';
    return;
  }

  submit.disabled = true;
  status.className = 'contact-form__status';
  status.textContent = 'Enviando…';

  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(contactForm),
    });
    const data = await res.json();
    if (data.success) {
      status.className = 'contact-form__status ok';
      status.textContent = '✓ ¡Mensaje enviado! Te responderé pronto.';
      contactForm.reset();
    } else {
      throw new Error(data.message || 'error');
    }
  } catch (err) {
    status.className = 'contact-form__status err';
    status.textContent = '✗ No se pudo enviar. Intenta por email o WhatsApp.';
  } finally {
    submit.disabled = false;
  }
});

// ── Estilo de nav activo (inyectado para no depender de orden CSS) ──
const navActiveStyle = document.createElement('style');
navActiveStyle.textContent = '.nav__menu a.active{color:var(--cyan);}';
document.head.appendChild(navActiveStyle);

// ── Service Worker (offline + instalable) ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// ── Console easter egg ──
console.log('%c aoz363 ', 'background:#111614;color:#00e1f4;font-family:monospace;font-size:16px;padding:4px 8px;border:1px solid #00e1f4;border-radius:3px;');
console.log('%c github.com/alvaroaoz | linkedin.com/in/alvaroaoz', 'color:#3d7a3d;font-family:monospace;');
