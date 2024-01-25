import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'; // eslint-disable-line import/extensions, import/no-unresolved
import { createOptimizedPicture, decorateIcons, loadCSS } from '../../scripts/aem.js';
import { Car, SingleSheetData, SwiperApi } from '../../scripts/types.js'; // eslint-disable-line no-unused-vars
import {
  createIconElement,
  extractHrefFromBlock,
  formatNumber,
  parseRawCarData,
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
    'air-conditioner': ['temperature control'],
    'alloy-wheel': ['alloy wheel'],
    'app-link': ['sync'],
    'bluetooth-signal': ['bluetooth'],
    camera: ['camera'],
    'car-driver-seat': ['driver seat'],
    'car-seat': ['seat'],
    'car-window-down': ['front window', 'rear window'],
    'door-mirror': ['door mirror'],
    headlight: ['headlight'],
    'power-plug': ['power outlet'],
    'rear-wiper': ['rear wiper'],
    'rearview-mirror': ['rearview mirror'],
    'remote-control': ['remote'],
    security: ['security'],
    sensor: ['sensor'],
    speaker: ['speaker'],
    'steering-wheel': ['steering wheel'],
    temperature: ['a/c', 'air condition', 'temperature'],
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
    images,
    condition,
    year,
    make,
    model,
    trim,
    price,
    exteriorColor,
    interiorColor,
    miles,
    vin,
    features,
  } = car;

  // TODO: all these have to be added to the list!
  const body = 'SUV';
  const seats = 5;
  const fuelEconomy = '20/30 MPG City/Hwy';
  const transmission = '6-Speed Automatic';
  const drivetrain = 'Front-wheel Drive';
  const engine = 'I-4 cyl';

  block.innerHTML = `
    <div class="car-images swiper">
      <div class="swiper-wrapper">
          ${images.map((image, index) => `<div class="swiper-slide">${createOptimizedPicture(image, `${condition} ${year} ${make} ${model} ${trim} ${body} ${index}`).outerHTML}</div>`).join('\n')}
        </div>
      <div class="swiper-navigation">
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
      <div class="swiper-pagination"></div>
    </div>

    <ul class="car-grid-layout">
      <li class="car-header bg-secondary">
        <h1>
          <small>${condition} ${year} ${make}</small>
          ${model} ${trim} ${body}
        </h1>
      </li>
     
      <li class="car-pricing">
        <h2>Detailed Pricing</h2>
        <div class="car-price">
          <div>Price</div>
          <div>$${formatNumber(price)}</div>
        </div>
        <a href="#" class="button primary">Schedule Test-Drive</a>
        <div>
          We're here to help <a href="tel:+1-1234567890">+1-1234567890</a>
        </div>
      </li>
      
      <li class="car-details-main">
        <ul>
          <li>Exterior Color</li>
          <li>${exteriorColor}</li>
          <li>Interior Color</li>
          <li>${interiorColor}</li>
          <li>Odometer</li>
          <li>${formatNumber(miles)} miles</li>
          <li>Body/Seating</li>
          <li>${body}/${seats} ${seats > 1 ? 'seats' : 'seat'}</li>
          <li>Fuel Economy</li>
          <li>${fuelEconomy}<a href="#"><small>Details</small></a></li>
          <li>Transmission</li>
          <li>${transmission}</li>
          <li>Drivetrain</li>
          <li>${drivetrain}</li>
          <li>Engine</li>
          <li>${engine}</li>
          <li>VIN</li>
          <li>${vin}</li>
          <li>Stock Number</li>
          <li>${carId}</li>
          <li>Body Style</li>
          <li>${body}</li>
        </ul>
      </li>
      
      <li class="car-feature-highlights">
        <h2>Highlighted Features</h2>
        <ul>
          ${features.map((feature) => `<li>${getFeatureIcon(feature)} ${feature}</li>`).join('\n')}
        </ul>
      </li>

      <li class="car-pending-section bg-secondary">
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
