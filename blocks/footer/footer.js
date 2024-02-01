import { getMetadata } from '../../scripts/aem.min.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  block.setAttribute('id', 'footer');
  const footerMeta = getMetadata('footer');
  block.textContent = '';

  // load footer fragment
  const footerPath = footerMeta.footer || '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  block.append(footer);

  const fullYearTextNode = document.createTextNode(new Date().getFullYear());
  const yearAnchor = footer.querySelector('a[href="#year"]');

  yearAnchor.replaceWith(fullYearTextNode);
}
