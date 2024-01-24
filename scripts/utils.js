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

/**
 * transforms an absolute url into a relative one
 * @param {string} absoluteUrl 
 * @returns {string}
 */
export function toRelativeUrl(absoluteUrl) {
  try {
    return new URL(absoluteUrl).pathname;
  } catch (err) {
    console.warn(`invalid absolute url given: ${absoluteUrl}`, err);
    return absoluteUrl;
  }

}