/**
 * extract the first anchor url from a block
 * @param {Element} block 
 * @returns {string | null}
 */
export function extractUrlFromBlock(block) {
  const anchor = block.querySelector('a');

  if (!anchor) {
    console.warn('Anchor element missing!');
    return null;
  }

  return anchor.href;
}
