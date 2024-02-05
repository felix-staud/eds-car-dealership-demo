import { Car } from './types.js'; // eslint-disable-line no-unused-vars

/**
 * iframe proof window grab
 * @returns {Window} the true window
 */
export function getWindowSafe() {
  return window.location.href === 'about:srcdoc' ? window.parent : window;
}

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
 * @param {any[]} rawCarData
 */
export function parseRawCarData(rawCarData) {
  const splitter = { features: ', ', images: '\n' };

  return rawCarData.map((car) => {
    delete car._originLink; // eslint-disable-line no-underscore-dangle
    return ({
      ...car,
      price: Number(car.price),
      // year: Number(car.year),
      miles: Number(car.miles),
      seats: Number(car.seats),
      horsepower: Number(car.horsepower),
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
 * @param {string} image
 */
export function setPageImage(image) {
  const metaElems = document.head.querySelectorAll('meta[property*=":image"], meta[name$=":image"]');

  /** @type {URL} */
  let url;

  if (image.startsWith(getWindowSafe().location.origin)) {
    url = new URL(image);
  } else if (image.startsWith('/')) {
    url = new URL(image, getWindowSafe().location.origin);
  } else {
    const imgUrl = new URL(image);
    url = new URL(imgUrl.pathname, getWindowSafe().location.origin);
  }

  metaElems.forEach((metaEl) => metaEl.setAttribute('content', url.toString()));
}

/**
 * @param {Car} car
 * @returns {string} dealership code
 */
export function getDealershipCode(car) {
  const inventory = car.condition.toLowerCase() === 'new' ? 'new' : 'used';

  return `${inventory.substring(0, 1).toUpperCase()}${car.id}`;
}

/**
 * @param {'availability' | 'test drive' | 'other'} reason
 * @param {Car} car
 */
export function createContactFormSearchParamsForCar(reason, car) {
  const {
    condition,
    year,
    make,
    model,
    trim,
    bodyStyle,
  } = car;
  const searchParams = new URLSearchParams();
  searchParams.append('contact-reason', reason);
  searchParams.append('contact-comments', `\n\n${condition} ${year} ${make} ${model} ${trim} ${bodyStyle} (Code: ${getDealershipCode(car)})`);

  return searchParams;
}

/**
 * @param {string} ccText
 */
export function camelCaseToLabel(camelCase) {
  const label = camelCase.replace(/([A-Z])/g, ' $1');

  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * @param {Array} array
 */
export function toUniqueArray(array) {
  return [...new Set(array)];
}
