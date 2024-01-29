import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { Car, MultiSheetData, SingleSheetData } from '../../scripts/types.js'; // eslint-disable-line no-unused-vars
import {
  createContactFormSearchParamsForCar,
  createIconElement,
  extractHrefFromBlock,
  formatNumber,
  getDealershipCode,
  loadMultiSheetData,
  loadSingleSheetData,
  parseRawCarData,
} from '../../scripts/utils.js';

/**
 * @typedef {{
 *  cars: Car[],
 *  inventoryUl: HTMLUListElement,
 *  inputCount: number,
 * }} State
 */

/** @type {State} */
const state = {
  cars: [],
  inventoryUl: {},
  inputCount: 0,
};

/**
 * @param {string} prefix,
 * @returns {string}
 */
function generateInputId(prefix = 'input') {
  const id = `${prefix}-${state.inputCount}`;
  state.inputCount += 1;
  return id;
}

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
 * get the details link for a car
 * @param {Car} car
 * @returns {string} car-details link
 */
function getCarDetailsLink({ condition, id }) {
  const path = ['', 'inventory'];
  const lCondition = condition.toLowerCase();

  switch (lCondition) {
    case 'new':
      path.push('new');
      break;
    default: // used
      path.push('used');
      break;
  }

  path.push(id);

  return path.join('/');
}

/**
 * async load for cars from sheet/s
 * @param {string} href
 * @param {boolean} sort
 * @returns {Promise<Car[]>} promise
 */
async function loadCars(href) {
  const url = new URL(href);

  url.searchParams.append('time', Date.now());

  const rawCarData = [];
  const response = await fetch(url.toString());
  /** @type {MultiSheetData | SingleSheetData} */
  const sheetData = await response.json();

  switch (sheetData[':type']) {
    case 'multi-sheet':
      rawCarData.push(...loadMultiSheetData(sheetData));
      break;
    case 'sheet':
      rawCarData.push(...loadSingleSheetData(sheetData));
      break;
    default:
      throw new Error(`unknown sheet-type: ${sheetData[':type']}`);
  }

  const cars = parseRawCarData(rawCarData);

  return cars.sort((a, b) => (getCarHeader(a) > getCarHeader(b) ? -1 : 1));
}

/**
 * @param {{label: string, key: string}} filter
 * @param {string[]} options
 * @returns {string} HTML string
 */
function createAccordionElement(filter, options = []) {
  const searchParams = new URLSearchParams(window.location.search);
  const checkboxId = generateInputId('checkbox');

  const searchParam = searchParams.get(filter.key);
  const searchParamArr = searchParam ? searchParam.split(',') : [];

  return `
  <div class="accordion">
    <input type="checkbox" id="${checkboxId}" class="accordion-label-checkbox">
    <label class="accordion-label" for="${checkboxId}">${filter.label}</label>
    <div class="accordion-content">
      ${options.map((option, index) => `<input type="checkbox" id="${checkboxId}-option-${index}" name="${filter.key}" value="${option}"${searchParamArr.includes(option) ? ' checked ' : ''}/><label for="${`${checkboxId}-option-${index}`}">${option}</label>`).join('\n')}
    </div>
  </div>`;
}

/**
 * @param {Car[]} cars
 */
function createFiltersElement(cars) {
  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('filters-wrapper');

  /** @type {{label: string, key: string}[]} */
  const filters = [
    { label: 'Year', key: 'year' },
    { label: 'Make', key: 'make' },
    { label: 'Model', key: 'model' },
    { label: 'Trim', key: 'trim' },
    { label: 'Body Style', key: 'bodyStyle' },
    { label: 'Exterior Color', key: 'exteriorColor' },
    { label: 'Interior Color', key: 'interiorColor' },
    { label: 'Transmission', key: 'transmission' },
    { label: 'Fuel Type', key: 'fuelType' },
  ];

  /** @type {Record<string, Set>} */
  const filterOptions = {};

  filters.forEach(({ key }) => {
    if (!filterOptions[key]) {
      filterOptions[key] = new Set();
    }

    cars.forEach((car) => {
      filterOptions[key].add(car[key]);
    });
  });

  const innerHTML = `
    <button id="open-filter-dialog-btn" class="secondary">${createIconElement('filters').outerHTML} Filter / Sort</button>
    
    <div id="filter-dialog" class="hidden">
      <div class="dialog-content">
        <div class="content-header">
          <h3>Filter / Sort</h3>
        </div>
        <div class="content-body">
          <div class="filters">
            ${filters.map((filter) => createAccordionElement(filter, [...filterOptions[filter.key]])).join('\n')}
          </div>
        </div>
        <div class="content-footer">
          <button id="show-filter-results-btn" class="primary">Show Results</button>
        </div>
      </div>
    </div>
  `;

  wrapperEl.innerHTML = innerHTML;
  /** @type {HTMLButtonElement} */
  const openFilterDialogBtn = wrapperEl.querySelector('#open-filter-dialog-btn');
  /** @type {HTMLDivElement} */
  const filterDialog = wrapperEl.querySelector('#filter-dialog');
  /** @type {HTMLButtonElement} */
  const showFilterResultsBtn = wrapperEl.querySelector('#show-filter-results-btn');
  /** @type {HTMLDivElement} */
  const filtersEl = wrapperEl.querySelector('.filters');
  const filterCheckboxes = filtersEl.querySelectorAll("input[type='checkbox'][name]");

  const searchParams = new URLSearchParams(window.location.search);

  openFilterDialogBtn.addEventListener('click', () => {
    filterDialog.classList.remove('hidden');
    document.body.classList.add('dialog-open');
  });

  showFilterResultsBtn.addEventListener('click', () => {
    filterDialog.classList.add('hidden');
    document.body.classList.remove('dialog-open');
    window.location.search = searchParams.toString();
  });

  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const { name, value, checked } = event.target;
      const currentValue = searchParams.get(name);

      if (checked) {
        if (currentValue) {
          const currentValueArr = currentValue.split(',');
          if (!currentValueArr.includes(value)) {
            searchParams.set(name, [...currentValueArr, value]);
          }
        } else {
          searchParams.append(name, [value]);
        }
      } else if (currentValue) {
        const currentValueArr = currentValue.split(',');
        searchParams.set(name, currentValueArr.filter((currVal) => currVal !== value));
      }
    });
  });

  decorateIcons(wrapperEl);

  return wrapperEl;
}

/**
 * creates an car image element
 * @param {Car} car
 * @returns {HTMLDivElement}
 */
function createCarImageElement(car) {
  const { images } = car;
  const carImageEl = document.createElement('div');
  carImageEl.classList.add('inventory-car-image');

  const carImageAnchor = document.createElement('a');
  carImageAnchor.href = getCarDetailsLink(car);
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

  const overlay = document.createElement('div');
  overlay.classList.add('overlay');
  pictureEl.append(overlay);

  return carImageEl;
}

/**
 * creates a car image element
 * @param {Car} car
 * @returns {HTMLDivElement}
 */
function createCarBodyElement(car) {
  const {
    price,
    exteriorColor,
    interiorColor,
    miles,
    bodyStyle,
    seats,
    fuelEconomy,
    transmission,
    drivetrain,
    horsepower,
    engine,
    fuelType,
    vin,
  } = car;

  const carBodyEl = document.createElement('div');
  carBodyEl.classList.add('inventory-car-body');

  /** @type {{label: string, value?: string | number | null}[]} */
  const mainDetails = [
    { label: 'Exterior Color', value: exteriorColor ? `<div class="color-preview" style="background-color: ${exteriorColor}"></div> ${exteriorColor}` : null },
    { label: 'interior Color', value: interiorColor ? `<div class="color-preview" style="background-color: ${interiorColor}"></div> ${interiorColor}` : null },
    { label: 'Odometer', value: miles ? `${formatNumber(miles)} miles` : null },
    { label: 'Body/Seating', value: bodyStyle && seats ? `${bodyStyle}/${seats} ${seats > 1 ? 'seats' : 'seat'}` : null },
    { label: 'Fuel Economy', value: fuelEconomy || null },
    { label: 'Transmission', value: transmission || null },
    { label: 'Drivetrain', value: drivetrain ? `${drivetrain}${horsepower ? ` (${horsepower}hp)` : ''}` : null },
    { label: 'Engine', value: engine ? `${engine}${fuelType ? ` (${fuelType})` : ''}` : null },
    { label: 'VIN', value: vin || null },
    { label: 'Dealership Code', value: getDealershipCode(car) },
    { label: 'Body Style', value: bodyStyle || null },
  ];
  const filteredMainDetails = mainDetails.filter((detail) => detail.value !== null);

  const innerHTML = `
    <h4 class="car-header">
      <a href="${getCarDetailsLink(car)}">${getCarHeader(car)}</a>
    </h4>
    <h5 class="car-price">
      <div class="${price > 0 ? 'highlight-container' : ''}"><div class="${price > 0 ? 'highlight' : 'tbd'}">$${price > 0 ? formatNumber(price) : ' TBD'}</div></div>
    </h5>
    <ul class="car-main-details">
      ${filteredMainDetails.map((detail) => `<li>${detail.label}</li>\n<li>${detail.value}</li>`).join('\n')}
    </ul>
    <div class="button-group">
      <a href="/about-us?${createContactFormSearchParamsForCar('availability', car).toString()}#contact-us" class="button primary"> Check Availability</a>
      <a href="/about-us?${createContactFormSearchParamsForCar('test drive', car).toString()}#contact-us" class="button secondary">Schedule Test-Drive</a>
    </div>
  `;

  carBodyEl.innerHTML = innerHTML;

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
      const searchStr = `${year} ${make} ${model} ${trim}`.toLowerCase();

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

  const icon = createIconElement('search');
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
  const filterEl = createFiltersElement(state.cars);

  inventoryDiv.appendChild(searchEl);
  inventoryDiv.appendChild(filterEl);
  inventoryDiv.appendChild(state.inventoryUl);

  renderCarElement(state.cars);

  block.replaceChildren(inventoryDiv);

  /** some changes to force a reload? */
}
