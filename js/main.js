import { $$ } from './modules/dom.js';
import { initHeader } from './modules/header.js';
import { initScrollSpy } from './modules/scrollspy.js';
import { initForms } from './modules/forms.js';

$$('[data-year]').forEach((element) => { element.textContent = String(new Date().getFullYear()); });
initHeader();
initScrollSpy();
initForms();
