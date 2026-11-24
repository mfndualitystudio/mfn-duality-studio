/**
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {Element | null}
 */
export const $ = (selector, scope = document) => scope.querySelector(selector);

/**
 * @param {string} selector
 * @param {ParentNode} [scope]
 * @returns {Element[]}
 */
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
