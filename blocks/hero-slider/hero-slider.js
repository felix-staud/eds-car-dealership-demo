import { buildSwiper } from "../slider/slider.js";

/**
 * @param {Element} block 
 */
export default async function decorate(block) {
    await buildSwiper(block, {
        direction: 'horizontal',
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}