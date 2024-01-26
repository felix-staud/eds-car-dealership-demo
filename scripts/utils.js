import { Car } from './types.js'; // eslint-disable-line no-unused-vars

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
 * load data from a single-sheet
 * @param {SingleSheetData} singleSheetData;
 * @returns {SingleSheetData["data"]} data
 */
export function loadSingleSheetData(singleSheetData) {
  return singleSheetData.data;
}

/**
 * load data from a multi-sheet
 * @param {MultiSheetData} multiSheetData
 * @returns {MultiSheetData["data"]} data
 */
export function loadMultiSheetData(multiSheetData) {
  const data = [];

  multiSheetData[':names'].forEach((name) => {
    data.push(...multiSheetData[name].data);
  });

  return data;
}

/**
 * i18n formatting for a number
 * @param {number} num
 * @returns {string} i18n formatted number
 */
export function formatNumber(num) {
  const nFormat = new Intl.NumberFormat();

  return nFormat.format(num);
}

/**
 * create a span icon element with the given iconname.
 * make sure to run aem.js::decorateIcons() on the parent element to load the actual icon image!
 * @param {string} iconname
 * @param {boolean} [asString=false]
 * @returns {HTMLSpanElement} icon span element
 */
export function createIconElement(iconname) {
  const icon = document.createElement('span');
  icon.classList.add('icon', `icon-${iconname}`);

  return icon;
}

/**
 * parse any[] car data to Car[]
 * @param {an6[]} rawCarData
 */
export function parseRawCarData(rawCarData) {
  const splitter = { features: ', ', images: '\n' };

  return rawCarData.map((car) => {
    delete car._originLink; // eslint-disable-line no-underscore-dangle
    return ({
      ...car,
      features: car.features.split(splitter.features),
      images: car.images.split(splitter.images),
    });
  });
}

/**
 * Set page title including meta tags
 * @param {string} title
 */
export function setPageTitle(title) {
  document.title = title;

  const metaElems = document.head.querySelectorAll('meta[property$=":title"], meta[name$=":title"]');

  metaElems.forEach((metaEl) => metaEl.setAttribute('content', title));
}

/**
 * Set page meta description
 * @param {string} desc
 */
export function setPageDescription(desc) {
  const metaElems = document.head.querySelectorAll('meta[name="description"], meta[property$=":description"], meta[name$=":description"]');

  metaElems.forEach((metaEl) => metaEl.setAttribute('content', desc));
}

/**
 * Set page meta image
 * @param {string | URL} image
 */
export function setPageImage(image) {
  const metaElems = document.head.querySelectorAll('meta[property*=":image"], meta[name$=":image"]');

  metaElems.forEach((metaEl) => metaEl.setAttribute('content', image.toString()));
}
