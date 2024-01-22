import { buildSwiper } from '../slider/slider.js'

/**
 * decorate multi view slider
 * @param {Element} block 
 */
export default function (block) {
    buildSwiper(block, {
        direction: 'horizontal',
        slidesPerView: 'auto',
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