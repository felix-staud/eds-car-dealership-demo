import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';
import { SingleSheetData, SwiperApi } from '../../scripts/types.js';
import { createOptimizedPictureFromExternalSource, extractUrlFromBlock } from '../../scripts/utils.js';
import { buildSlide } from '../../scripts/slider.js';

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
 * @param {CarModel[]} carModels 
 */
function setCarModels(carModels) {
    state.carModels = carModels;
    onCarModelsChange();
}

/**
 * @param {string} type 
 * @returns {CarModel[]} all car models of given type 
 */
function getCarModelsByType(type) {
    return state.carModels.filter(carModel => carModel.type === type);
}

/**
 * @returns {string[]} car model types
 */
function getCarModelTypes() {
    const { carModels } = state;
    const typeArr = carModels.map(carModel => carModel.type);
    const set = new Set(typeArr);

    return [...set];
}

/**
 * @returns {CarModel[]}
 */
function getCarModelsByActiveIndex() {
    const { activePillIndex } = state
    const types = getCarModelTypes();
    const activeType = types[activePillIndex];

    return getCarModelsByType(activeType);
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
    const { block } = state

    const navPills = block.querySelector('.nav-pills');
    const types = getCarModelTypes();
    const pills = types.map((text, index) => buildNavPill(text, index));
    
    navPills.replaceChildren(...pills);
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
}

/**
 * 
 * @param {CarModel} carModel 
 */
function carModelToSwiperSlide(carModel) {
    const picture = createOptimizedPictureFromExternalSource(carModel.image);
    const header = document.createElement('h3');
    header.textContent = carModel.model;

    let slide = document.createElement('div');
    slide = buildSlide(slide);
    slide.replaceChildren(picture, header);

    return slide;
}

/**
 * 
 * @param {string} url 
 * @returns {Promise<CarModel[]>}
 */
async function loadCarModels(url) {
    try {
        const response = await fetch(url);
        /** @type {SingleSheetData} */
        const sheetData = await response.json();

        return sheetData.data;
    } catch (err) {
        console.warn(err);
    }

    return [];
}

/**
 * decorate block
 * @param {Element} block 
 */
export default async function (block) {
    const url = extractUrlFromBlock(block);

    if (!url) return;

    block.innerHTML = `
        <div class="nav-pills"></div>
        <div class="swiper">
            <div class="swiper-wrapper"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
        </div>`;
    state.block = block;
    state.swiper = new Swiper(block.querySelector('.swiper'), {
        direction: 'horizontal',
        slidesPerView: 'auto',
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