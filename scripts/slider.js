import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

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
 * @param {Element[]} slideElements 
 * @returns {HTMLDivElement}
 */
export function buildSwiperWrapper(slideElements) {
    const swiperWrapper = document.createElement('div');
    swiperWrapper.classList.add('swiper-wrapper');

    slideElements.forEach(slideElement => {
        const slide = buildSlide(slideElement);
        swiperWrapper.appendChild(slide);
    });

    return swiperWrapper;
}

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
 * @param {SwiperNavigationConfig} navConfig  
 */
export function buildSwiperNavigation({prevEl, nextEl}) {
    const prevBtn = document.createElement('div');
    prevBtn.classList.add(prevEl ? prevEl.substring(1) : 'swiper-button-prev');
    const nextBtn = document.createElement('div');
    nextBtn.classList.add(nextEl ? nextEl.substring(1) : 'swiper-button-next');

    return [
        prevBtn,
        nextBtn
    ]
}

/**
 * 
 * @param {Element} parent 
 * @param {boolean} [controls=true] 
 * @param {SwiperConfig} [config={}] 
 * @returns 
 */
export function buildSwiper(parent, config = {}) {
    parent.classList.add('swiper');
    const slides = parent.querySelectorAll(':scope > div');
    /** @type {HTMLElement[]} */
    const children = [];
    const swiperWrapper = buildSwiperWrapper(slides);
    children.push(swiperWrapper);

    if (config.navigation) {
        const navigation = buildSwiperNavigation(config.navigation);
        children.push(...navigation);
    }

    parent.replaceChildren(...children);
    const swiper = new Swiper(parent, config);

    return swiper;
}

/**
 * 
 * @param {Element} block 
 */
export default function (block) {
    buildSwiper(block, {
        direction: 'horizontal',
        slidesPerView: "auto",
        spaceBetween: 50,
        grid: {
          rows: 1,
        },
        navigation: true,
    })
}