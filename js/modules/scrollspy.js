import { $$ } from './dom.js';

/** Marca en el menú la sección que se está viendo (aria-current="location"). */
export function initScrollSpy() {
  const links = $$('[data-nav] a[href^="/#"]');
  if (!links.length || !('IntersectionObserver' in window)) return;

  const linkById = new Map(links.map((link) => [link.getAttribute('href').slice(2), link]));
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((link) => link.removeAttribute('aria-current'));
      linkById.get(entry.target.id)?.setAttribute('aria-current', 'location');
    }
  }, { rootMargin: '-45% 0px -50% 0px' });

  [...linkById.keys()]
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .forEach((section) => observer.observe(section));
}
