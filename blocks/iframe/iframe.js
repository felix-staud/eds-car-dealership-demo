import { extractHrefFromBlock } from '../../scripts/utils.js';

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const href = extractHrefFromBlock(block);
  if (!href) return;

  const { dataset } = block.closest('.iframe-container');
  const iframe = document.createElement('iframe');
  iframe.src = href;

  Object.keys(dataset).forEach((key) => {
    const value = dataset[key];
    if (key === 'allowfullscreen' && value.toLowerCase() === 'yes') {
      iframe.setAttribute(key, '');
    } else {
      iframe.setAttribute(key, value);
    }
  });

  block.replaceChildren(iframe);
}
