/* eslint-disable no-use-before-define */
import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.min.js';
import { Car, MultiSheetData, SingleSheetData } from '../../scripts/types.js'; // eslint-disable-line no-unused-vars
import {
  camelCaseToLabel,
  createContactFormSearchParamsForCar,
  createIconElement,
  extractHrefFromBlock,
  formatNumber,
  getDealershipCode,
  getWindowSafe,
  loadMultiSheetData,
  loadSingleSheetData,
  parseRawCarData,
  toUniqueArray,
} from '../../scripts/utils.js';

/**
 * @typedef {string | number} FilterOptionValue
 *
 * @typedef {{
 *  value: FilterOptionValue,
 *  active: boolean,
 * }} FilterOption
 *
 * @typedef {{
 *  key: string,
 *  options: FilterOption[],
 * }} Filter
 *
 * @typedef {"asc" | "desc"} SortDirection
 *
 * @typedef {{
 *  block: Element | null,
 *  filterDialogEl: HTMLDivElement | null,
 *  cars: Car[],
 *  inventoryUl: HTMLUListElement,
 *  inputCount: number,
 *  search: string,
 *  sortBy: {key: string, direction: SortDirection},
 *  filters: Filter[],
 * }} State
 */

const blockName = 'inventory-browser';
const Event = {
  carsLoaded: `${blockName}/carsLoaded`,
  filterOption: {
    add: `${blockName}/filterOption/add`,
    remove: `${blockName}/filterOption/remove`,
  },
  clearAll: `${blockName}/clearAll`,
  sortBy: {
    update: `${blockName}/sortBy/update`,
  },
  filterDialog: {
    open: `${blockName}/filterDialog/open`,
    confirm: `${blockName}/filterDialog/confirm`,
  },
};

/** @type {State} */
const state = {
  block: null,
  filterDialogEl: null,
  cars: [],
  inventoryUl: {},
  inputCount: 0,
  search: '',
  sortBy: { key: 'year', direction: 'desc' },
  filters: [],
};

/**
 * @param {string} search
 */
function setSearch(search) {
  state.search = search;
  const el = state.block.querySelector('.inventory-search-input');
  if (el) {
    el.value = search;
  }
}

/**
 * @param {string} key
 * @param {SortDirection} [direction="desc"]
 */
function setSortBy(key, direction = 'desc') {
  state.sortBy.key = key;
  state.sortBy.direction = direction;
  const el = state.filterDialogEl.querySelector('#sort-by-select');
  if (el) {
    el.value = `${key};${direction}`;
  }
}

/**
 * @param {string} key
 * @param {FilterOptionValue[]} values
 */
function setFilter(key, values) {
  const filterIndex = state.filters.findIndex((filter) => filter.key === key);
  const filterOptions = values.map((value) => ({ value, active: false }));

  if (filterIndex >= 0) {
    state.filters[filterIndex].options = filterOptions;
  } else {
    state.filters.push({ key, options: filterOptions });
  }
}

/**
 * @param {string} key
 * @param {FilterOptionValue} value
 * @param {boolean} removeable
 * @returns {HTMLDivElement}
 */
function createActiveFilterTagElement(key, value, removeable = true) {
  const tagEl = document.createElement('div');
  tagEl.classList.add('tag');
  tagEl.setAttribute('title', `${key}: ${value}`);
  tagEl.setAttribute('data-key', key);
  tagEl.setAttribute('data-value', value);
  tagEl.textContent = value;

  if (removeable) {
    const removeIcon = createIconElement('cancel-white');
    removeIcon.classList.add('remove-tag');
    tagEl.appendChild(removeIcon);
    decorateIcons(tagEl);
    removeIcon.addEventListener('click', () => {
      state.block.dispatchEvent(new CustomEvent(Event.filterOption.remove, {
        detail: {
          filterKey: key,
          optionValue: value,
        },
      }));
    });
  }

  return tagEl;
}

/**
 * @param {string} key
 * @param {FilterOptionValue} value
 * @param {boolean} active
 */
function toggleFilterOption(key, value, active) {
  const { block } = state;

  if (!active) {
    const deleteEvent = new CustomEvent(Event.filterOption.remove, {
      detail: {
        filterKey: key,
        optionValue: value,
      },
    });
    block.dispatchEvent(deleteEvent);
  } else {
    const addEvent = new CustomEvent(Event.filterOption.add, {
      detail: {
        filterKey: key,
        optionValue: value,
      },
    });
    block.dispatchEvent(addEvent);
  }
}

/**
 * @param {CustomEvent<{
 *  filterKey: string,
 *  optionValue: FilterOptionValue,
 * }>} event filter-option-remove-event
 */
function handleFilterOptionRemove(event) {
  const { filterKey, optionValue } = event.detail;
  const { block, filterDialogEl, filters } = state;
  const filterIndex = filters.findIndex((filter) => filter.key === filterKey);

  if (filterIndex >= 0) {
    const { options } = filters[filterIndex];
    const optionIndex = options.findIndex((option) => option.value === optionValue);

    if (optionIndex >= 0) {
      filters[filterIndex].options[optionIndex].active = false;
      const checkbox = filterDialogEl.querySelector(`.filters input[name="${filterKey}"][value="${optionValue}"]`);
      checkbox.checked = false;

      const activeFilterTags = block.querySelectorAll(`.active-filters .tag[data-key="${filterKey}"][data-value="${optionValue}"]`);
      activeFilterTags.forEach((el) => el.remove());
    }
  }
}

/**
 * @param {CustomEvent<{
*  filterKey: string,
*  optionValue: FilterOptionValue,
* }>} event filter-option-add-event
*/
function handleFilterOptionAdd(event) {
  const { filterKey, optionValue } = event.detail;
  const { block, filterDialogEl, filters } = state;
  const filterIndex = filters.findIndex((filter) => filter.key === filterKey);

  if (filterIndex >= 0) {
    const { options } = filters[filterIndex];
    const optionIndex = options.findIndex((option) => option.value === optionValue);

    if (optionIndex >= 0) {
      filters[filterIndex].options[optionIndex].active = true;
      const checkbox = filterDialogEl.querySelector(`.filters input[name="${filterKey}"][value="${optionValue}"]`);
      checkbox.checked = true;

      const activeFiltersElems = block.querySelectorAll('.active-filters');
      activeFiltersElems.forEach((el) => {
        const tagEl = createActiveFilterTagElement(filterKey, optionValue, !el.classList.contains('outside'));
        el.appendChild(tagEl);
      });
    }
  }
}

/**
 * @param {CustomEvent} event clear-all-event
 */
function handleClearAll() {
  state.filters.forEach((filter) => filter.options.forEach((option) => {
    option.active = false;
  }));
  state.sortBy.key = '';
  state.sortBy.direction = '';
  getWindowSafe().location.search = getAllAsUrlSearchParams();
}

/**
 * @param {CustomEvent<{value: string}>} event sort-by-update-event
 */
function handleSortByUpdate(event) {
  const { value } = event.detail;

  if (!value || !value.includes(';')) {
    setSortBy('');
  } else {
    const [key, direction] = value.split(';');
    setSortBy(key, direction);
  }
}

function handleFilterDialogOpen() {
  const { block } = state;
  const { body } = document;
  const filterDialogEl = block.querySelector('#filter-dialog');

  filterDialogEl.classList.remove('hidden');
  body.classList.add('dialog-open');
}

function handleFilterDialogConfirm() {
  const { block } = state;
  const filterDialogEl = block.querySelector('#filter-dialog');

  filterDialogEl.classList.add('hidden');
  document.body.classList.remove('dialog-open');
  getWindowSafe().location.search = getAllAsUrlSearchParams();
}

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
  year,
  make,
  model,
  trim,
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

  const carData = parseRawCarData(rawCarData);
  state.block.dispatchEvent(new CustomEvent(Event.carsLoaded, {
    detail: {
      cars: carData,
    },
  }));

  return carData;
}

/**
 * @param {{label: string, key: string}} filter
 * @param {string[]} options
 * @returns {string} HTML string
 */
function renderFilterAccordions() {
  const { filterDialogEl, filters } = state;

  const multiOptionsFilters = filters.filter((filter) => filter.options.length > 1);

  const innerHTML = multiOptionsFilters.map(({ key, options }) => {
    const checkboxId = generateInputId('checkbox');
    const label = camelCaseToLabel(key);
    return `
      <div class="accordion">
        <input type="checkbox" id="${checkboxId}" class="accordion-label-checkbox">
        <label class="accordion-label" for="${checkboxId}">${label}</label>
        <div class="accordion-content">
          ${options.map((option, index) => `<input type="checkbox" id="${checkboxId}-option-${index}" name="${key}" value="${option.value}"${option.active ? ' checked ' : ''}/><label for="${checkboxId}-option-${index}">${option.value}</label>`).join('\n')}
        </div>
      </div>`;
  }).join('\n');

  const filtersEl = filterDialogEl.querySelector('.filters');
  filtersEl.innerHTML = innerHTML;
  decorateIcons(filtersEl);

  const filterCheckboxes = filtersEl.querySelectorAll("input[type='checkbox'][name]");
  filterCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (event) => {
      const { name, value, checked } = event.target;
      const eventName = checked ? Event.filterOption.add : Event.filterOption.remove;
      state.block.dispatchEvent(new CustomEvent(eventName, {
        detail: {
          filterKey: name,
          optionValue: value,
        },
      }));
    });
  });
}

/**
 * @returns {URLSearchParams};
 */
function getAllAsUrlSearchParams() {
  const { filters, search, sortBy } = state;
  const searchParams = new URLSearchParams();

  filters.forEach((filter) => {
    const activeOptions = filter.options.filter((option) => option.active);

    if (activeOptions.length > 0) {
      searchParams.append(filter.key, activeOptions.map((option) => option.value));
    }
  });

  if (search) {
    searchParams.append('q', search);
  }

  if (sortBy) {
    searchParams.append('sortBy', `${sortBy.key};${sortBy.direction}`);
  }

  return searchParams;
}

/**
 * @param {URLSearchParams} searchParams
 */
function setActiveFilterValuesFromUrlSearchParams(searchParams) {
  searchParams.forEach((value, key) => {
    const valueArr = value.split(',');
    valueArr.forEach((val) => {
      toggleFilterOption(key, val, true);
    });
  });
}

/**
 * @param {URLSearchParams} searchParams
 */
function setSearchValueFromUrlSearchParams(searchParams) {
  const qParam = searchParams.get('q');

  if (qParam) {
    setSearch(qParam);
  }
}

/**
 * @param {URLSearchParams} searchParams
 */
function setSortByFromUrlSearchParams(searchParams) {
  const sortByParam = searchParams.get('sortBy');

  state.block.dispatchEvent(new CustomEvent(Event.sortBy.update, {
    detail: {
      value: sortByParam,
    },
  }));
}

/**
 * @param {Element} block
 */
function createFiltersElement() {
  const { cars, block } = state;
  const wrapperEl = document.createElement('div');
  wrapperEl.classList.add('filters-wrapper');

  const filterKeys = [
    'condition',
    'year',
    'make',
    'model',
    'trim',
    'bodyStyle',
    'exteriorColor',
    'interiorColor',
    'transmission',
    'fuelType',
  ];

  filterKeys.forEach((key) => {
    const options = cars.map((car) => car[key]);
    setFilter(key, toUniqueArray(options).sort());
  });

  const sortKeys = ['year', 'price', 'miles', 'horsepower'];

  const innerHTML = `
    <div class="button-group">
      <button id="open-filter-dialog-btn" class="primary">${createIconElement('filters-white').outerHTML}&nbsp;Filter/Sort</button>
      <button class="clear-btn secondary">${createIconElement('cancel-btn-secondary').outerHTML}&nbsp;Clear</button>
    </div>
    <div class="active-filters outside"></div>
    <div id="filter-dialog" class="hidden">
      <div class="dialog-content">
        <div class="content-header">
          <h3>Filter/Sort <button class="clear-btn secondary">Clear Filters</button></h3>
          <div class="form-control">
            <label for="sort-by-select">Sort By: </label>
            <select name="sort-by" id="sort-by-select">
              <option value="">- none -</option>
              ${sortKeys.map((key) => `<option value="${key};asc">${key} - Ascending</option>\n<option value="${key};desc">${key} - Descending</option>`).join('\n')}
            </select>
          </div>
          <div class="active-filters inside"></div>
        </div>
        <div class="content-body">
          <div class="filters"></div>
        </div>
        <div class="content-footer">
          <button id="show-filter-results-btn" class="primary">Show Results</button>
      </div>
    </div>`;

  wrapperEl.innerHTML = innerHTML;
  /** @type {HTMLButtonElement} */
  const openFilterDialogBtn = wrapperEl.querySelector('#open-filter-dialog-btn');
  /** @type {HTMLDivElement} */
  const filterDialogEl = wrapperEl.querySelector('#filter-dialog');
  /** @type {HTMLButtonElement} */
  const showFilterResultsBtn = filterDialogEl.querySelector('#show-filter-results-btn');
  /** @type {HTMLButtonElement[]} */
  const clearBtns = wrapperEl.querySelectorAll('.clear-btn');
  /** @type {HTMLSelectElement} */
  const soryByEl = filterDialogEl.querySelector('#sort-by-select');

  openFilterDialogBtn.addEventListener('click', () => {
    block.dispatchEvent(new CustomEvent(Event.filterDialog.open));
  });

  showFilterResultsBtn.addEventListener('click', () => {
    block.dispatchEvent(new CustomEvent(Event.filterDialog.confirm));
  });

  clearBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      block.dispatchEvent(new CustomEvent(Event.clearAll));
    });
  });

  soryByEl.addEventListener('change', () => {
    block.dispatchEvent(new CustomEvent(Event.sortBy.update, {
      detail: {
        value: soryByEl.value,
      },
    }));
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
    alt = `Image of ${getCarHeader(car)} `;
  } else {
    src = 'https://placehold.co/600x400';
    alt = 'placeholder image';
  }

  const pictureEl = createOptimizedPicture(src, alt, true, [{ width: '500' }, { media: '(width >= 600px)', width: '400' }, { media: '(width >= 900px)', width: '300' }]);
  const imgEl = pictureEl.querySelector('img');
  imgEl.setAttribute('fetchpriority', 'high');
  imgEl.width = 356;
  imgEl.height = 275;
  imgEl.addEventListener('load', () => {
    imgEl.setAttribute('width', imgEl.width);
    imgEl.setAttribute('height', imgEl.height);
  });

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
    { label: 'Exterior Color', value: exteriorColor ? `<div class="color-preview" style = "background-color: ${exteriorColor}"></div> ${exteriorColor}` : null },
    { label: 'interior Color', value: interiorColor ? `<div class="color-preview" style = "background-color: ${interiorColor}"></div> ${interiorColor}` : null },
    { label: 'Odometer', value: miles ? `${formatNumber(miles)} miles` : null },
    { label: 'Body/Seating', value: bodyStyle && seats ? `${bodyStyle} /${seats} ${seats > 1 ? 'seats' : 'seat'}` : null },
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
 * @param {Car[]} cars
 * @returns {Car[]} sorted cars
 */
function sortCars(cars) {
  if (cars.length <= 1) return cars;

  const { sortBy } = state;
  const firstCar = cars[0];
  const keys = Object.keys(firstCar);

  if (keys.includes(sortBy.key)) {
    const sortedCars = cars.sort((carA, carB) => {
      const a = carA[sortBy.key];
      const b = carB[sortBy.key];

      if (a < b) return sortBy.direction === 'asc' ? -1 : 1;
      if (a > b) return sortBy.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedCars;
  }

  return cars; // unknown sortBy keys are ignored
}

/**
 * @returns {Car[]}
 */
function getFilteredCars() {
  const { filters, cars } = state;

  const activeFilters = filters.filter((filter) => filter.options.some((option) => option.active));

  if (activeFilters.length > 0) {
    const filteredCars = cars.filter((car) => {
      let doShow = true;
      activeFilters.some((filter) => {
        const activeOptions = filter.options.filter((option) => option.active);
        const values = activeOptions.map((option) => option.value);
        if (!values.includes(car[filter.key])) {
          doShow = false;
        }

        if (!doShow) {
          return true;
        }

        return false;
      });

      return doShow;
    });

    return filteredCars;
  }

  return cars;
}

/**
 * @param {string} query
 */
function handleSearch(query) {
  const lQuery = query.toLowerCase();
  const filteredCars = getFilteredCars();

  if (!lQuery || lQuery.length === 0) {
    if (filteredCars.length > 0) {
      renderCarElement(sortCars(filteredCars));
    } else {
      renderNoResultsElement();
    }
  } else {
    const foundCars = filteredCars.filter(({
      year, make, model, trim,
    }) => {
      const searchStr = `${year} ${make} ${model} ${trim}`.toLowerCase();

      return searchStr.includes(lQuery);
    });

    if (foundCars.length > 0) {
      renderCarElement(sortCars(foundCars));
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
 * @param {CustomEvent<{cars: Car[]}>} cars loaded event
 */
function handleCarsLoaded(event) {
  const { cars } = event.detail;
  const { block } = state;
  state.cars = cars;
  state.inventoryUl = document.createElement('ul');
  state.inventoryUl.classList.add('inventory-car-list');

  const inventoryDiv = document.createElement('div');
  inventoryDiv.classList.add('inventory');

  const searchEl = createSearchElement();
  const filterEl = createFiltersElement(block);

  inventoryDiv.appendChild(searchEl);
  inventoryDiv.appendChild(filterEl);
  inventoryDiv.appendChild(state.inventoryUl);

  block.replaceChildren(inventoryDiv);
  state.filterDialogEl = block.querySelector('#filter-dialog');
  renderFilterAccordions();
  const urlSearchParams = new URLSearchParams(getWindowSafe().location.search);
  setActiveFilterValuesFromUrlSearchParams(urlSearchParams);
  setSearchValueFromUrlSearchParams(urlSearchParams);
  setSortByFromUrlSearchParams(urlSearchParams);

  handleSearch(block.querySelector('.inventory-search-input').value);
}

/**
 * @param {HTMLElement} block
 */
function bindEvents(block) {
  block.addEventListener(Event.carsLoaded, handleCarsLoaded);
  block.addEventListener(Event.filterOption.add, handleFilterOptionAdd);
  block.addEventListener(Event.filterOption.remove, handleFilterOptionRemove);
  block.addEventListener(Event.clearAll, handleClearAll);
  block.addEventListener(Event.sortBy.update, handleSortByUpdate);
  block.addEventListener(Event.filterDialog.open, handleFilterDialogOpen);
  block.addEventListener(Event.filterDialog.confirm, handleFilterDialogConfirm);
}

/**
 * decorate inventory browser
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  const url = extractHrefFromBlock(block);

  if (!url) return;
  state.block = block;
  bindEvents(block);
  await loadCars(url);
}
