/**
 * extract the first anchor url from a block
 * @param {Element} block
 * @returns {string | null}
 */
export function extractHrefFromBlock(block) {
  const anchor = block.querySelector('a');

  if (!anchor) {
    console.warn('Anchor element missing!'); // eslint-disable-line no-console
    return null;
  }

  if (!anchor.href) {
    console.warn('Anchor element has no href value!'); // eslint-disable-line no-console
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
    console.info(`url "${absoluteUrl}" is not absolute`); // eslint-disable-line no-console
    return absoluteUrl;
  }
}
