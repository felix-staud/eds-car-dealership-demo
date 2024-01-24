import { buildSwiper } from "../../scripts/slider.js";

/**
 * @param {Element} block 
 */
export default function decorate(block) {
    buildSwiper(block, {
        direction: 'horizontal',
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}