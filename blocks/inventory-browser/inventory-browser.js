import { createOptimizedPicture, decorateIcons } from '../../scripts/aem.js';
import { SingleSheetData, MultiSheetData } from '../../scripts/types.js'
import { toRelativeUrl } from '../../scripts/utils.js';

/**
 * @typedef {'all' | 'new' | 'used'} SheetName
 * 
 * @typedef {{
 *  year: string,
 *  make: string,
 *  model: string,
 *  trim: string,
 *  exteriorColor: string,
 *  interiorColor: string,
 *  vin: string,
 *  price: number,
 *  miles: number,
 *  features?: string[],
 *  images?: string[],
 *  link: string,
 * }} Item
 * 
 * @typedef {{
 *  items: Item[],
 *  inventoryUl: HTMLUListElement,
 * }} State
 */

/** @type {State} */
const state = {
    items: [],
    sheet: "",
    inventoryUl: {},
}

/**
 * async load for items from sheet/s
 * @param {SheetName} sheet
 * @param {boolean} sort
 * @returns {Promise<Item[]>} promise
 */
async function loadItems(sheet, sort = true) {
    const splitter = '\n';

    const url = new URL("/data/inventory.json", window.location.origin);

    if (sheet !== 'all') {
        query.append('sheet', sheet);
    }

    url.searchParams.append('time', Date.now());

    const response = await fetch(url.toString());
    let rawItems = [];

    if (sheet === 'all') {
        /** @type {MultiSheetData} */
        const multiSheet = await response.json();
        const { used, new: neo } = multiSheet;
        rawItems = [...used.data, ...neo.data];
    } else {
        /** @type {SingleSheetData} */
        const singleSheet = await response.json();
        rawItems = singleSheet.data;
    }

    /** @type {Item[]} */
    const items = rawItems.map((item) => {
        delete item._originLink;
        return ({
            ...item,
            features: item.features.split(splitter),
            images: item.images.split(splitter),
        });
    });

    return items.sort((a, b) => getItemHeader(a) > getItemHeader(b) ? -1 : 1);
}

/**
 * Get the header for an inventory item
 * @param {Item} item
 * @returns {string} header
 */
function getItemHeader({ year, make, model, trim }) {
    return `${year} ${make} ${model} - ${trim}`;
}

/**
 * fill inventory browser with items
 * @param {Item[]} items 
 * @param {HTMLUListElement} parentUl 
 */
function renderItemElements(items) {
    const itemElements = items.map((item) => createItemElement(item));
    state.inventoryUl.replaceChildren(...itemElements);
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
 * @param {Item} item 
 * @returns {HTMLLIElement}
 */
function createItemElement(item) {
    if (!item) return;
    const itemElement = document.createElement('li');
    itemElement.classList.add('inventory-item');
    itemElement.appendChild(createItemImageElement(item));
    itemElement.appendChild(createItemBodyElement(item));

    return itemElement;
}

/**
 * creates an item image element
 * @param {Item} item 
 * @returns {HTMLDivElement}
 */
function createItemImageElement(item) {
    const { images, link } = item;
    const itemImageElement = document.createElement('div');
    itemImageElement.classList.add('inventory-item-image');
    
    const itemImageAnchor = document.createElement('a');
    itemImageAnchor.href = link;
    itemImageElement.appendChild(itemImageAnchor);

    let src, alt;

    if (images && images.length > 0) {
        src = images[0];
        alt = `Image of ${getItemHeader(item)}`;
    } else {
        src = 'https://placehold.co/600x400';
        alt = 'placeholder image';
    }

    const pictureElement = createOptimizedPicture(src, alt);

    itemImageAnchor.appendChild(pictureElement);

    return itemImageElement;
}

/**
 * creates an item image element
 * @param {Item} item 
 * @returns {HTMLDivElement}
 */
function createItemBodyElement(item) {
    const itemBodyElement = document.createElement('div');
    itemBodyElement.classList.add('inventory-item-body');

    const itemBodyHeaderAnchor = document.createElement('a');
    itemBodyHeaderAnchor.href = toRelativeUrl(item.link);
    itemBodyHeaderAnchor.textContent = getItemHeader(item);
    const itemBodyHeader = document.createElement('h4');
    itemBodyHeader.appendChild(itemBodyHeaderAnchor);

    const nFormat = new Intl.NumberFormat();
    const price = item.price ? item.price : -1;
    const priceHeader = document.createElement('h5');
    priceHeader.classList.add('item-price');
    if (price > 0) {
        priceHeader.textContent = `$${nFormat.format(price)}`;
    } else {
        priceHeader.textContent = "$ TBD";
        priceHeader.classList.add('tbd');
    }

    const itemFeaturesDiv = document.createElement('div');
    itemFeaturesDiv.classList.add('inventory-item-features');
    const itemFeaturesListHeader = document.createElement('h5');
    itemFeaturesListHeader.classList.add('item-features-header');
    itemFeaturesListHeader.textContent = 'Features:';

    if (item.features && item.features.length > 0) {
        const itemFeaturesList = document.createElement('ul');
        itemFeaturesList.classList.add('item-features');

        for (let i = 0; i < item.features.length && i < 3; i++) {
            const itemFeatureLi = document.createElement('li');
            itemFeatureLi.classList.add('item-feature');
            itemFeatureLi.textContent = item.features[i];
            itemFeaturesList.appendChild(itemFeatureLi);
        }

        if (item.features.length > 3) {
            const moreIndicatorLi = document.createElement('li');
            moreIndicatorLi.classList.add('item-feature-more-indicator');
            moreIndicatorLi.textContent = 'and much more...';
            itemFeaturesList.appendChild(moreIndicatorLi);
        }

        itemFeaturesDiv.appendChild(itemFeaturesListHeader);
        itemFeaturesDiv.appendChild(itemFeaturesList);
    }

    itemBodyElement.appendChild(itemBodyHeader);
    itemBodyElement.appendChild(priceHeader);
    itemBodyElement.appendChild(itemFeaturesDiv);

    return itemBodyElement;
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
        renderItemElements(state.items);
    } else {
        const filteredItems = state.items.filter(({ year, make, model, trim }) => {
            const searchStr = (year + make + model + trim).toLowerCase();

            return searchStr.includes(query);
        });

        if (filteredItems.length > 0) {
            renderItemElements(filteredItems);
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
    state.items = await loadItems(sheet);
    state.inventoryUl = document.createElement('ul');
    state.inventoryUl.classList.add('inventory-item-list');

    const inventoryDiv = document.createElement('div');
    inventoryDiv.classList.add('inventory');

    const searchElement = createSearchElement();

    inventoryDiv.appendChild(searchElement);
    inventoryDiv.appendChild(state.inventoryUl);

    renderItemElements(state.items);

    block.replaceChildren(inventoryDiv);

    /** some changes to force a reload? */
}