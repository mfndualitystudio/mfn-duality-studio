import { $ } from './dom.js';

const DESKTOP = window.matchMedia('(min-width: 56.25em)');

/** Menú móvil accesible y sombra del encabezado al hacer scroll. */
export function initHeader() {
  const header = $('[data-header]');
  const toggle = $('[data-nav-toggle]');
  const nav = $('[data-nav]');
  if (!header || !toggle || !nav) return;

  const isOpen = () => header.classList.contains('is-open');
  const setOpen = (open) => {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('click', (event) => { if (isOpen() && !header.contains(event.target)) setOpen(false); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
  });
  DESKTOP.addEventListener('change', (event) => { if (event.matches) setOpen(false); });

  let queued = false;
  const update = () => { header.classList.toggle('is-scrolled', window.scrollY > 8); queued = false; };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}
