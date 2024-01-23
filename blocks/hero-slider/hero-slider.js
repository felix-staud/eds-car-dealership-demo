import { buildSwiper } from "../../scripts/slider.js";

export default function decorate(block) {
    buildSwiper(block, {
        direction: 'horizontal',
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });
}