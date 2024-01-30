import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'; // eslint-disable-line import/extensions, import/no-unresolved
import { createOptimizedPicture, decorateIcons, loadCSS } from '../../scripts/aem.js';
import { Car, SingleSheetData, SwiperApi } from '../../scripts/types.js'; // eslint-disable-line no-unused-vars
import {
  createContactFormSearchParamsForCar,
  createIconElement,
  extractHrefFromBlock,
  formatNumber,
  getDealershipCode,
  parseRawCarData,
  setPageDescription,
  setPageImage,
  setPageTitle,
} from '../../scripts/utils.js';

/**
 * get the api url to be used to extract the car from
 * @param {Element} block
 * @returns {string} api url
 */
function getApiUrl(block) {
  const href = extractHrefFromBlock(block);
  if (!href) throw new Error('No <a> element for href extraction found!');
  return href;
}

/**
 * get the cars id from the location pathname
 * @returns {number} car id
 */
function getCarId() {
  const pathArr = window.location.pathname;
  const id = pathArr[pathArr.length - 1];

  if (!id || Number.isNaN(id)) throw new Error('No car ID found in location path!');

  return Number(id);
}

/**
 * load the car data
 * @param {string} href
 * @param {number} id
 * @returns {Promise<Car>} car data
 */
async function loadCar(href, id) {
  const url = new URL(href);
  url.searchParams.append('limit', 1);
  url.searchParams.append('offset', id - 1);
  url.searchParams.append('time', Date.now());

  const response = await fetch(url);
  /** @type {SingleSheetData} */
  const singleSheetData = await response.json();
  const carData = parseRawCarData(singleSheetData.data);

  return carData[0];
}

/**
 * auto distinguish an icon for a feature
 * @param {string} feature
 * @returns {string} icon html
 */
function getFeatureIcon(feature) {
  const str = feature.toLowerCase();
  let iconname = 'check-circle';
  /** @type {Record<string, string[]>} */
  const iconMapping = {
    'air-conditioner': ['temperature control', 'climate control'],
    'alloy-wheel': ['alloy wheel'],
    'app-link': ['sync'],
    'bluetooth-signal': ['bluetooth'],
    camera: ['camera'],
    'car-driver-seat': ['driver seat'],
    'car-seat': ['seat'],
    'car-window-down': ['front window', 'rear window'],
    compass: ['compass'],
    'door-mirror': ['door mirror', 'outside mirror', 'blind zone', 'side-mirror', 'side mirror'],
    headlight: ['headlight', 'headlamp', 'fog light'],
    park: ['park', 'parking'],
    'power-plug': ['power outlet'],
    radio: ['radio'],
    'rear-wiper': ['rear wiper'],
    'rearview-mirror': ['rearview mirror', 'rear-view mirror'],
    'remote-control': ['remote'],
    security: ['security'],
    sensor: ['sensor', 'cross traffic', 'cross-traffic'],
    speaker: ['speaker'],
    speed: ['speed'],
    'steering-wheel': ['steering wheel'],
    suspension: ['suspension'],
    temperature: ['a/c', 'air condition', 'temperature'],
    trailer: ['trailer'],
    'wireless-communication': ['wireless'],
  };

  Object.keys(iconMapping).some((icon) => {
    const matchers = iconMapping[icon];
    if (matchers.some((matcher) => str.includes(matcher))) {
      iconname = icon;
      return true;
    }

    return false;
  });

  return createIconElement(iconname).outerHTML;
}

/**
 * @param {Element} block
 */
export default async function decorate(block) {
  const apiUrl = getApiUrl(block);
  const carId = getCarId();
  const car = await loadCar(apiUrl, carId);
  const {
    condition,
    year,
    make,
    model,
    trim,
    bodyStyle,
    price,
    images,
    exteriorColor,
    interiorColor,
    miles,
    seats,
    fuelEconomy,
    transmission,
    drivetrain,
    engine,
    fuelType,
    horsepower,
    vin,
    features,
    notes,
  } = car;

  setPageTitle(`${year} ${make} ${model} ${trim} (${getDealershipCode(car)}) | Cars & Cars`);
  setPageDescription(`Check out this ${condition} ${year} ${make} ${model} ${trim} ${bodyStyle} on Cars & Cars!`);
  setPageImage(images[0]);

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

  block.innerHTML = `
    <div class="car-images swiper">
      <div class="swiper-wrapper">
          ${images.map((image, index) => `<div class="swiper-slide">${createOptimizedPicture(image, `${condition} ${year} ${make} ${model} ${trim} ${bodyStyle} ${index}`).outerHTML}<div class="swiper-lazy-preloader swiper-lazy-preloader-black"></div></div>`).join('\n')}
        </div>
      <div class="swiper-navigation">
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
      <div class="swiper-pagination"></div>
    </div>

    <ul class="car-sections">
      <li id="car-header" class="car-section bg-secondary">
        <div class="car-section-content">
          <h1>
            <small>${condition} ${year} ${make}</small>
            ${model} ${trim} ${bodyStyle}
          </h1>
        </div>
      </li>
     
      <li id="car-pricing" class="car-section">
        <div class="car-section-content">
          <h2>Detailed Pricing</h2>
          <div id="car-price">
            <div>Price</div>
            <div class="${price > 0 ? 'highlight-container' : ''}"><div class="${price > 0 ? 'highlight' : 'tbd'}">$${price > 0 ? formatNumber(price) : ' TBD'}</div></div>
          </div>
          <div class="button-group">
            <a href="/about-us?${createContactFormSearchParamsForCar('availability', car).toString()}#contact-us" class="button primary"> Check Availability</a>
            <a href="/about-us?${createContactFormSearchParamsForCar('test drive', car).toString()}#contact-us" class="button secondary">Schedule Test-Drive</a>
          </div>
          <div>
            We're here to help <a href="tel:+1-1234567890">+1-1234567890</a>
          </div>
        </div>
      </li>
      
      <li id="car-details-main" class="car-section">
        <div class="car-section-content">
          <ul>
            ${filteredMainDetails.map((detail) => `<li>${detail.label}</li>\n<li>${detail.value}</li>`).join('\n')}
          </ul>
        </div>
      </li>
      
      <li id="car-feature-highlights" class="car-section">
        <div class="car-section-content">
          <h2>Highlighted Features</h2>
          <ul>
            ${features.map((feature) => `<li>${getFeatureIcon(feature)} ${feature}</li>`).join('\n')}
          </ul>
        </div>
      </li>

      <li id="car-notes" class="car-section bg-secondary">
        <div class="car-section-content">
        <h2>Notes</h2>
        <p>${notes}</p> 
        </div>
      </li>
    </ul>`;

  decorateIcons(block);
  await loadCSS('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css');
  /** @type {SwiperApi} */
  const swiper = new Swiper(block.querySelector('.swiper'), {
    direction: 'horizontal',
    initialSlide: 1,
    spaceBetween: 1,
    loop: true,
    mousewheel: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    slidesPerView: 'auto',
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });

  window.addEventListener('resize', () => {
    swiper.update();
  });
}
