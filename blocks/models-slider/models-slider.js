import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'; // eslint-disable-line import/extensions, import/no-unresolved
import { createOptimizedPicture, loadCSS } from '../../scripts/aem.js';
import { SingleSheetData, SwiperApi } from '../../scripts/types.js'; // eslint-disable-line no-unused-vars
import { extractHrefFromBlock } from '../../scripts/utils.js';
import { buildSlide } from '../slider/slider.js';

/**
 * @typedef {{
 *  type: string,
 *  model: string,
 *  image: string,
 * }} CarModel
 *
 * @typedef {{
 *  activePillIndex: number,
 *  carModels: CarModel[],
 *  block: Element | null,
 *  swiper: SwiperApi | null,
 * }} State
 */

/** @type {State} */
const state = {
  activePillIndex: -1,
  carModels: [],
  block: null,
  swiper: null,
};

/**
 * @returns {string[]} car model types
 */
function getCarModelTypes() {
  const { carModels } = state;
  const typeArr = carModels.map((carModel) => carModel.type);
  const set = new Set(typeArr);

  return [...set];
}

/**
 * @param {string} type
 * @returns {CarModel[]} all car models of given type
 */
function getCarModelsByType(type) {
  return state.carModels.filter((carModel) => carModel.type === type);
}

/**
 * @returns {CarModel[]}
 */
function getCarModelsByActiveIndex() {
  const { activePillIndex } = state;
  const types = getCarModelTypes();
  const activeType = types[activePillIndex];

  return getCarModelsByType(activeType);
}

function createSwiperPreloader() {
  const div = document.createElement('div');
  div.classList.add('swiper-lazy-preloader', 'swiper-lazy-preloader-black');
  return div;
}

/**
 *
 * @param {CarModel} carModel
 */
function carModelToSwiperSlide(carModel) {
  const picture = createOptimizedPicture(carModel.image, carModel.model);
  const preloader = createSwiperPreloader();
  const header = document.createElement('div');
  header.textContent = carModel.model;

  let slide = document.createElement('div');
  slide = buildSlide(slide);
  slide.replaceChildren(picture, preloader, header);

  return slide;
}

/**
 * render slider element
 */
function renderSlider() {
  const { swiper } = state;

  const carModels = getCarModelsByActiveIndex();
  const slides = carModels.map(carModelToSwiperSlide);
  swiper.removeAllSlides();
  slides.forEach(swiper.appendSlide);
  swiper.update();
}

/**
 * event handler for state.activeIndex changes
 */
function onActiveIndexChange() {
  const { block, activePillIndex } = state;

  const navPills = block.querySelector('.nav-pills');
  const pills = navPills.querySelectorAll('.pill');

  pills.forEach((pill, index) => {
    if (index === activePillIndex) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
  renderSlider();
}

/**
 * @param {number} nextIndex
 */
function setActivePillIndex(nextIndex) {
  if (nextIndex !== state.activePillIndex) {
    state.activePillIndex = nextIndex;
    onActiveIndexChange();
  }
}

/**
 * build a nav-pill element
 * @param {string} text
 * @param {number} index
 * @returns {HTMLLIElement}
 */
function buildNavPill(text, index) {
  const pill = document.createElement('li');
  pill.classList.add('pill');
  pill.textContent = text;

  pill.addEventListener('click', () => {
    setActivePillIndex(index);
  });

  return pill;
}

/**
 * render nav-pills element
 */
function renderNavPills() {
  const { block } = state;

  const navPills = block.querySelector('.nav-pills');
  const types = getCarModelTypes();
  const pills = types.map((text, index) => buildNavPill(text, index));

  navPills.replaceChildren(...pills);
}

/**
 * event handler for state.carModels changes
 */
function onCarModelsChange() {
  renderNavPills();
  setActivePillIndex(0);
  renderSlider();
}

/**
 * @param {CarModel[]} carModels
 */
function setCarModels(carModels) {
  state.carModels = carModels;
  onCarModelsChange();
}

/**
 *
 * @param {string} href
 * @returns {Promise<CarModel[]>}
 */
async function loadCarModels(href) {
  try {
    const url = new URL(href);

    url.searchParams.append('time', Date.now());

    const response = await fetch(url.toString());
    /** @type {SingleSheetData} */
    const sheetData = await response.json();

    return sheetData.data;
  } catch (err) {
    console.warn('failed to loda car models!', err); // eslint-disable-line no-console
  }

  return [];
}

/**
 * decorate block
 * @param {Element} block
 */
export default async function decorate(block) {
  const url = extractHrefFromBlock(block);

  if (!url) return;
  await loadCSS('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css');

  block.innerHTML = `
        <div class="nav-pills"></div>
        <div class="swiper">
            <div class="swiper-wrapper"></div>
            <div class="swiper-navigation">
                <div class="swiper-button-prev"></div>
                <div class="swiper-button-next"></div>
            </div>
        </div>`;
  state.block = block;
  state.swiper = new Swiper(block.querySelector('.swiper'), {
    direction: 'horizontal',
    slidesPerView: 'auto',
    mousewheel: true,
    autoHeight: true,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    centeredSlides: true,
    centeredSlidesBounds: true,
  });
  const data = await loadCarModels(url);
  setCarModels(data);
}
