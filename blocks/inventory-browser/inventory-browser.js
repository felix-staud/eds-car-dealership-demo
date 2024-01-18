import { decorateIcons } from '../../scripts/aem.js'

/**
 * @typedef {Object} RawItem
 * @property {string} year 
 * @property {string} make 
 * @property {string} model 
 * @property {string} trim 
 * @property {string} exteriorColor 
 * @property {string} interiorColor 
 * @property {string} vin 
 * @property {string} price 
 * @property {string} miles 
 * @property {string} features
 * @property {string} images
 * @property {string} link 
 * 
 * @typedef {RawItem} Item
 * @property {number} price 
 * @property {number} miles 
 * @property {string[]} features - optional 
 * @property {string[]} images - optional
 * 
 * @typedef {Object} Store
 * @property {Item[]} items
 * @property {HTMLUListElement} inventoryUl;
 */

/** @type {Store} */
const store = {
    items: [],
    inventoryUl: {},
}

/**
 * 
 * @param {"new" | "used" | "all"} type 
 * @returns {Promise<Item[]>} promise
 */
const loadItems = async (sheet) => {
    const splitter = '\n';
    const query = new URLSearchParams();

    if (sheet !== 'all') {
        query.append('sheet', sheet);
    }

    const response = await fetch('/data/inventory.json?' + query.toString(), { method: 'get' });
    const json = await response.json();
    /** @type {RawItem} */
    const items = json.data;

    return items.map((item) => {
        delete item._originLink;
        return ({
            ...item,
            features: item.features.split(splitter),
            images: item.images.split(splitter),
        })
    })
}

/**
 * fill inventory browser with items
 * @param {Item[]} items 
 * @param {HTMLUListElement} parentUl 
 */
const renderItemElements = (items) => {
    const itemElements = items.map((item) => createItemElement(item));
    store.inventoryUl.replaceChildren(...itemElements);
}

/**
 * inform user about no results
 */
const renderNoResultsElement = () => {
    const noResultsElement = document.createElement('li');
    noResultsElement.textContent = "No results...";
    store.inventoryUl.replaceChildren(noResultsElement);
}

/**
 * 
 * @param {Item} item 
 * @returns {HTMLLIElement}
 */
const createItemElement = (item) => {
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
const createItemImageElement = ({images, year, make, model}) => {
    const itemImageElement = document.createElement('div');
    itemImageElement.classList.add('inventory-item-image');

    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.setAttribute('type', 'image/webp');
    const img = document.createElement('img');
    img.setAttribute('loading', 'lazy');

    if (images && images.length > 0) {
        source.setAttribute('srcset', images[0]);
        img.setAttribute('src', images[0]);
        img.setAttribute('alt', `image of ${year} ${make} ${model}`);
    } else {
        source.setAttribute('srcset', 'https://placehold.co/600x400');
        img.setAttribute('src', 'https://placehold.co/600x400');
        img.setAttribute('alt', `placeholder image`);
    }

    picture.appendChild(source);
    picture.appendChild(img);
    itemImageElement.appendChild(img);

    return itemImageElement;
}

/**
 * creates an item image element
 * @param {Item} item 
 * @returns {HTMLDivElement}
 */
const createItemBodyElement = (item) => {
    const itemBodyElement = document.createElement('div');
    itemBodyElement.classList.add('inventory-item-body');

    const itemBodyHeader = document.createElement('h4');
    itemBodyHeader.textContent = `${item.year} ${item.make} ${item.model} - ${item.trim}`;

    const nFormat = new Intl.NumberFormat();
    const price = item.price ? item.price : -1;
    const priceHeader = document.createElement('h5');
    priceHeader.classList.add('item-price');
    if (price > 0) {
        priceHeader.textContent = `$${nFormat.format(price)}`;
    } else {
        priceHeader.textContent = "$ TBD";
        priceHeader.classList.add('tbd')
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
const createSearchElement = () => {
    const searchElement = document.createElement('div');
    searchElement.classList.add('inventory-search');
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.classList.add('inventory-search-input');
    searchInput.setAttribute('placeholder', "Search our inventory...")
    searchInput.addEventListener('keyup', ({key}) => {
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
const handleSearch = (query) => {
    query = query.toLowerCase();

    if (!query || query.length === 0) {
        renderItemElements(store.items);
    } else {
        const filteredItems = store.items.filter(({year, make, model, trim}) => {
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
    store.items = await loadItems(sheet);
    store.inventoryUl = document.createElement('ul');
    store.inventoryUl.classList.add('inventory-item-list');

    const inventoryDiv = document.createElement('div');
    inventoryDiv.classList.add('inventory');

    const searchElement = createSearchElement();

    inventoryDiv.appendChild(searchElement);
    inventoryDiv.appendChild(store.inventoryUl);

    renderItemElements(store.items);

    block.replaceChildren(inventoryDiv);
}