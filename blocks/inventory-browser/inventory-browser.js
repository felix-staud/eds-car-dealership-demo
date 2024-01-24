import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { Car, MultiSheetData, SingleSheetData } from '../../scripts/types.js'; // eslint-disable-line no-unused-vars
import {
  extractHrefFromBlock,
  loadMultiSheetData,
  loadSingleSheetData,
} from '../../scripts/utils.js';

/**
 * @typedef {{
 *  cars: Car[],
 *  inventoryUl: HTMLUListElement,
 * }} State
 */

/** @type {State} */
const state = {
  cars: [],
  inventoryUl: {},
};

/**
 * Get the header for a car
 * @param {Car} car
 * @returns {string} header
 */
function getCarHeader({
  year, make, model, trim,
}) {
  return `${year} ${make} ${model} - ${trim}`;
}

/**
 * async load for cars from sheet/s
 * @param {string} href
 * @param {boolean} sort
 * @returns {Promise<Car[]>} promise
 */
async function loadCars(href) {
  const splitter = { features: ', ', images: ', ' };

  const url = new URL(href);

  url.searchParams.append('time', Date.now());

  const data = [];
  const response = await fetch(url.toString());
  /** @type {MultiSheetData | SingleSheetData} */
  const sheetData = await response.json();

  switch (sheetData[':type']) {
    case 'multi-sheet':
      data.push(...loadMultiSheetData(sheetData));
      break;
    case 'sheet':
      data.push(...loadSingleSheetData(sheetData));
      break;
    default:
      throw new Error(`unknown sheet-type: ${sheetData[':type']}`);
  }

  /** @type {Car[]} */
  const cars = data.map((car) => {
    delete car._originLink; // eslint-disable-line no-underscore-dangle
    return ({
      ...car,
      features: car.features.split(splitter.features),
      images: car.images.split(splitter.images),
    });
  });

  return cars.sort((a, b) => (getCarHeader(a) > getCarHeader(b) ? -1 : 1));
}

/**
 * creates an car image element
 * @param {Car} car
 * @returns {HTMLDivElement}
 */
function createCarImageElement(car) {
  const { images, link } = car;
  const carImageEl = document.createElement('div');
  carImageEl.classList.add('inventory-car-image');

  const carImageAnchor = document.createElement('a');
  carImageAnchor.href = link;
  carImageEl.appendChild(carImageAnchor);

  let src;
  let alt;

  if (images && images.length > 0) {
    [src] = images;
    alt = `Image of ${getCarHeader(car)}`;
  } else {
    src = 'https://placehold.co/600x400';
    alt = 'placeholder image';
  }

  const pictureEl = createOptimizedPicture(src, alt);

  carImageAnchor.appendChild(pictureEl);

  return carImageEl;
}

/**
 * creates a car image element
 * @param {Car} car
 * @returns {HTMLDivElement}
 */
function createCarBodyElement(car) {
  const carBodyEl = document.createElement('div');
  carBodyEl.classList.add('inventory-car-body');

  const carBodyHeaderAnchor = document.createElement('a');
  carBodyHeaderAnchor.href = car.link;
  carBodyHeaderAnchor.textContent = getCarHeader(car);
  const carBodyHeader = document.createElement('h4');
  carBodyHeader.appendChild(carBodyHeaderAnchor);

  const nFormat = new Intl.NumberFormat();
  const price = car.price ? car.price : -1;
  const priceHeader = document.createElement('h5');
  priceHeader.classList.add('car-price');
  if (price > 0) {
    priceHeader.textContent = `$${nFormat.format(price)}`;
  } else {
    priceHeader.textContent = '$ TBD';
    priceHeader.classList.add('tbd');
  }

  const carFeaturesDiv = document.createElement('div');
  carFeaturesDiv.classList.add('inventory-car-features');
  const carFeaturesListHeader = document.createElement('h5');
  carFeaturesListHeader.classList.add('car-features-header');
  carFeaturesListHeader.textContent = 'Features:';

  if (car.features && car.features.length > 0) {
    const carFeaturesList = document.createElement('ul');
    carFeaturesList.classList.add('car-features');

    for (let i = 0; i < car.features.length && i < 3; i += 1) {
      const carFeatureLi = document.createElement('li');
      carFeatureLi.classList.add('car-feature');
      carFeatureLi.textContent = car.features[i];
      carFeaturesList.appendChild(carFeatureLi);
    }

    if (car.features.length > 3) {
      const moreIndicatorLi = document.createElement('li');
      moreIndicatorLi.classList.add('car-feature-more-indicator');
      moreIndicatorLi.textContent = 'and much more...';
      carFeaturesList.appendChild(moreIndicatorLi);
    }

    carFeaturesDiv.appendChild(carFeaturesListHeader);
    carFeaturesDiv.appendChild(carFeaturesList);
  }

  carBodyEl.appendChild(carBodyHeader);
  carBodyEl.appendChild(priceHeader);
  carBodyEl.appendChild(carFeaturesDiv);

  return carBodyEl;
}

/**
 *
 * @param {Car} car
 * @returns {HTMLLIElement}
 */
function createCarElement(car) {
  const carEl = document.createElement('li');
  carEl.classList.add('inventory-car');
  carEl.appendChild(createCarImageElement(car));
  carEl.appendChild(createCarBodyElement(car));

  return carEl;
}

/**
 * fill inventory browser with cars
 * @param {Car[]} cars
 * @param {HTMLUListElement} parentUl
 */
function renderCarElement(cars) {
  const { inventoryUl } = state;

  const carElements = cars.map((car) => createCarElement(car));
  inventoryUl.replaceChildren(...carElements);
}

/**
 * inform user about no results
 */
function renderNoResultsElement() {
  const noResultsEl = document.createElement('li');
  noResultsEl.textContent = 'No results...';
  state.inventoryUl.replaceChildren(noResultsEl);
}

/**
 * @param {?string} query
 */
function handleSearch(query) {
  const lQuery = query.toLowerCase();

  if (!lQuery || lQuery.length === 0) {
    renderCarElement(state.cars);
  } else {
    const filteredCars = state.cars.filter(({
      year, make, model, trim,
    }) => {
      const searchStr = (year + make + model + trim).toLowerCase();

      return searchStr.includes(lQuery);
    });

    if (filteredCars.length > 0) {
      renderCarElement(filteredCars);
    } else {
      renderNoResultsElement();
    }
  }
}

/**
 * create search element div
 * @returns {HTMLDivElement} searchElement
 */
function createSearchElement() {
  const searchEl = document.createElement('div');
  searchEl.classList.add('inventory-search');
  const searchInput = document.createElement('input');
  searchInput.setAttribute('type', 'text');
  searchInput.classList.add('inventory-search-input');
  searchInput.setAttribute('placeholder', 'Search our inventory...');
  searchInput.addEventListener('keyup', ({ key }) => {
    if (key === 'Enter') {
      handleSearch(searchInput.value);
    }
  });
  searchInput.addEventListener('focus', () => {
    searchEl.classList.add('active');
  });
  searchInput.addEventListener('blur', () => {
    searchEl.classList.remove('active');
  });

  const icon = document.createElement('span');
  icon.classList.add('icon');
  icon.classList.add('icon-search');
  icon.addEventListener('click', () => {
    handleSearch(searchInput.value);
  });

  searchEl.appendChild(searchInput);
  searchEl.appendChild(icon);

  decorateIcons(searchEl);

  return searchEl;
}

/**
 * decorate inventory browser
 * @param {Element} block
 */
export default async function decorate(block) {
  const url = extractHrefFromBlock(block);

  if (!url) return;

  state.cars = await loadCars(url);
  state.inventoryUl = document.createElement('ul');
  state.inventoryUl.classList.add('inventory-car-list');

  const inventoryDiv = document.createElement('div');
  inventoryDiv.classList.add('inventory');

  const searchEl = createSearchElement();

  inventoryDiv.appendChild(searchEl);
  inventoryDiv.appendChild(state.inventoryUl);

  renderCarElement(state.cars);

  block.replaceChildren(inventoryDiv);

  /** some changes to force a reload? */
}
