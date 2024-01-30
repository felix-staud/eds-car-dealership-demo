import { loadCSS, loadScript } from '../../scripts/aem.js';

/**
 * @typedef {{rows: number, columns: number}} SwiperGridConfig
 *
 * @typedef {{ prevEl: string, nextEl: string }} SwiperNavigationConfig
 *
 * @typedef {Record<number, SwiperConfig} SwiperBreakpointsConfig
 *
 * https://swiperjs.com/swiper-api
 * @typedef {{
 *  direction: 'vertical' | 'horizontal',
 *  slidesPerView: number | 'auto',
 *  grid: SwiperGridConfig,
 *  navigation: SwiperNavigationConfig,
 *  breakpoints: SwiperBreakpointsConfig,
 *  spaceBetween: number,
 *  zoom: boolean,
 * }} SwiperConfig
 */

/**
 *
 * @param {Element} element
 * @returns {Element}
 */
export function buildSlide(element) {
  element.classList.add('swiper-slide');
  return element;
}

/**
 *
 * @param {Element[]} slideElements
 * @returns {HTMLDivElement}
 */
export function buildSwiperWrapper(slideElements) {
  const swiperWrapper = document.createElement('div');
  swiperWrapper.classList.add('swiper-wrapper');

  slideElements.forEach((slideElement) => {
    const slide = buildSlide(slideElement);
    swiperWrapper.appendChild(slide);
  });

  return swiperWrapper;
}

/**
 * @param {SwiperNavigationConfig} navConfig
 */
export function buildSwiperNavigation({ prevEl, nextEl }) {
  const prevBtn = document.createElement('div');
  prevBtn.classList.add(prevEl ? prevEl.substring(1) : 'swiper-button-prev');
  const nextBtn = document.createElement('div');
  nextBtn.classList.add(nextEl ? nextEl.substring(1) : 'swiper-button-next');
  const navigation = document.createElement('div');
  navigation.classList.add('swiper-navigation');
  navigation.replaceChildren(prevBtn, nextBtn);

  return navigation;
}

/**
 *
 * @param {Element} parent
 * @param {boolean} [controls=true]
 * @param {SwiperConfig} [config={}]
 * @returns
 */
export async function buildSwiper(parent, config = {}) {
  await loadScript('../../vendor/swiper@11.0.5/swiper-bundle.min.js');
  await loadCSS('../../vendor/swiper@11.0.5/swiper-bundle.min.css');

  parent.classList.add('swiper');
  const slides = parent.querySelectorAll(':scope > div');
  /** @type {HTMLElement[]} */
  const children = [];
  const swiperWrapper = buildSwiperWrapper(slides);
  children.push(swiperWrapper);

  if (config.navigation) {
    const navigation = buildSwiperNavigation(config.navigation);
    children.push(navigation);
  }

  parent.replaceChildren(...children);
  const swiper = new Swiper(parent, config); // eslint-disable-line no-undef

  return swiper;
}

/**
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  buildSwiper(block, {
    direction: 'horizontal',
    slidesPerView: 'auto',
    spaceBetween: 50,
    grid: {
      rows: 1,
    },
    navigation: {
      prevEl: '.swiper-button-prev',
      nextEl: '.swiper-button-next',
    },
  });
}
