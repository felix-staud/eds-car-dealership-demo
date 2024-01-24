import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { SingleSheetData, MultiSheetData, Car } from '../../scripts/types.js'
import { toRelativeUrl } from '../../scripts/utils.js';

/**
 * @typedef {'all' | 'new' | 'used'} SheetName
 * 
 * @typedef {{
 *  cars: Car[],
 *  sheet: string,
 *  inventoryUl: HTMLUListElement,
 * }} State
 */

/** @type {State} */
const state = {
    cars: [],
    sheet: "",
    inventoryUl: {},
}

/**
 * async load for cars from sheet/s
 * @param {SheetName} sheet
 * @param {boolean} sort
 * @returns {Promise<Car[]>} promise
 */
async function loadCars(sheet, sort = true) {
    const splitter = '\n';

    const url = new URL("/data/inventory.json", window.location.origin);

    if (sheet !== 'all') {
        query.append('sheet', sheet);
    }

    url.searchParams.append('time', Date.now());

    const response = await fetch(url.toString());
    let rawCars = [];

    if (sheet === 'all') {
        /** @type {MultiSheetData} */
        const multiSheet = await response.json();
        const { used, new: neo } = multiSheet;
        rawCars = [...used.data, ...neo.data];
    } else {
        /** @type {SingleSheetData} */
        const singleSheet = await response.json();
        rawCars = singleSheet.data;
    }

    /** @type {Car[]} */
    const cars = rawCars.map((car) => {
        delete car._originLink;
        return ({
            ...car,
            features: car.features.split(splitter),
            images: car.images.split(splitter),
        });
    });

    return cars.sort((a, b) => getCarHeader(a) > getCarHeader(b) ? -1 : 1);
}

/**
 * Get the header for a car
 * @param {Car} car
 * @returns {string} header
 */
function getCarHeader({ year, make, model, trim }) {
    return `${year} ${make} ${model} - ${trim}`;
}

/**
 * fill inventory browser with cars
 * @param {Car[]} cars 
 * @param {HTMLUListElement} parentUl 
 */
function renderCarElement(cars) {
    const carElements = cars.map((car) => createCarElement(car));
    state.inventoryUl.replaceChildren(...carElements);
}

/**
 * inform user about no results
 */
function renderNoResultsElement() {
    const noResultsElement = document.createElement('li');
    noResultsElement.textContent = "No results...";
    state.inventoryUl.replaceChildren(noResultsElement);
}

/**
 * 
 * @param {Car} car 
 * @returns {HTMLLIElement}
 */
function createCarElement(car) {
    if (!car) return;
    const carEl = document.createElement('li');
    carEl.classList.add('inventory-car');
    carEl.appendChild(createCarImageElement(car));
    carEl.appendChild(createCarBodyElement(car));

    return carEl;
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

    let src, alt;

    if (images && images.length > 0) {
        src = images[0];
        alt = `Image of ${getCarHeader(car)}`;
    } else {
        src = 'https://placehold.co/600x400';
        alt = 'placeholder image';
    }

    const pictureElement = createOptimizedPicture(src, alt);

    carImageAnchor.appendChild(pictureElement);

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
    carBodyHeaderAnchor.href = toRelativeUrl(car.link);
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
        priceHeader.textContent = "$ TBD";
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

        for (let i = 0; i < car.features.length && i < 3; i++) {
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
 * create search element div
 * @returns {HTMLDivElement} searchElement
 */
function createSearchElement() {
    const searchElement = document.createElement('div');
    searchElement.classList.add('inventory-search');
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.classList.add('inventory-search-input');
    searchInput.setAttribute('placeholder', "Search our inventory...");
    searchInput.addEventListener('keyup', ({ key }) => {
        if (key === 'Enter') {
            handleSearch(searchInput.value);
        }
    });
    searchInput.addEventListener('focus', () => {
        searchElement.classList.add('active');
    });
    searchInput.addEventListener('blur', () => {
        searchElement.classList.remove('active');
    });

    const icon = document.createElement('span');
    icon.classList.add('icon');
    icon.classList.add('icon-search');
    icon.addEventListener('click', () => {
        handleSearch(searchInput.value);
    });

    searchElement.appendChild(searchInput);
    searchElement.appendChild(icon);

    decorateIcons(searchElement);

    return searchElement;
}

/**
 * @param {?string} query 
 */
function handleSearch(query) {
    query = query.toLowerCase();

    if (!query || query.length === 0) {
        renderCarElement(state.cars);
    } else {
        const filteredCars = state.cars.filter(({ year, make, model, trim }) => {
            const searchStr = (year + make + model + trim).toLowerCase();

            return searchStr.includes(query);
        });

        if (filteredCars.length > 0) {
            renderCarElement(filteredCars);
        } else {
            renderNoResultsElement();
        }
    }
}

/**
 * decorate inventory browser
 * @param {Element} block 
 */
export default async function decorate(block) {
    const sheet = block.textContent ? block.textContent.trim() : "all";
    state.cars = await loadCars(sheet);
    state.inventoryUl = document.createElement('ul');
    state.inventoryUl.classList.add('inventory-car-list');

    const inventoryDiv = document.createElement('div');
    inventoryDiv.classList.add('inventory');

    const searchElement = createSearchElement();

    inventoryDiv.appendChild(searchElement);
    inventoryDiv.appendChild(state.inventoryUl);

    renderCarElement(state.cars);

    block.replaceChildren(inventoryDiv);

    /** some changes to force a reload? */
}