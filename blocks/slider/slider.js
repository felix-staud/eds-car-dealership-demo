import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

/**
 * @typedef {{
 *  direction: 'vertical' | 'horizontal',
 *  slidesPerView: number | 'auto',
 *  grid: {
 *      rows: number,
 *      columns: number,
 *  },
 *  navigation: {
 *      nextEl: string,
 *      prevEl: string,
 *  },
 *  breakpoints: {
 *      [key: string]: SwiperConfig,
 *  }
 *  spaceBetween: number,
 *  zoom: boolean,
 * }} SwiperConfig - https://swiperjs.com/swiper-api
 */

/**
 * 
 * @param {Element[]} slideElements 
 * @returns {HTMLDivElement}
 */
const buildWrapper = (slideElements) => {
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
const buildSlide = (element) => {
    element.classList.add('swiper-slide');
    return element;
}

/**
 * 
 * @param {Element} block 
 */
const decorateControls = (block) => {
    const prevBtn = document.createElement('div');
    prevBtn.classList.add('swiper-button-prev');
    const nextBtn = document.createElement('div');
    nextBtn.classList.add('swiper-button-next');

    block.appendChild(prevBtn);
    block.appendChild(nextBtn);
}

/**
 * 
 * @param {Element} block 
 * @param {SwiperConfig} config 
 * @returns 
 */
export const buildSwiper = (block, config = {}) => {
    block.classList.add('swiper')
    const slides = block.querySelectorAll(':scope > div');
    const swiperWrapper = buildWrapper(slides);
    block.replaceChildren(swiperWrapper);

    decorateControls(block);
    const swiper = new Swiper(block, config);

    return swiper
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
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        zoom: true,
    })
}