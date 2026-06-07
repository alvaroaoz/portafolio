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

// ── Console easter egg ──
console.log('%c aoz363 ', 'background:#111614;color:#00e1f4;font-family:monospace;font-size:16px;padding:4px 8px;border:1px solid #00e1f4;border-radius:3px;');
console.log('%c github.com/alvaroaoz | linkedin.com/in/alvaroaoz', 'color:#3d7a3d;font-family:monospace;');
