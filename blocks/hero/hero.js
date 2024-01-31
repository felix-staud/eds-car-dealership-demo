/**
 * @param {HTMLElement} block 
 */
export default function decorate(block) {
  const imgEl = block.querySelector('img');
  imgEl.setAttribute('fetchpriority', 'high');
}
