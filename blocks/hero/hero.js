/**
 * @typedef {{
 *  slides: HTMLElement[],
 *  activeSlide: number,
 * }} Store
 */

/** @type {Store} */
const store = {
    slides: [],
    activeSlide: -1,
}

/**
 * rendering of hero block with slides
 * @param {Element} container
 */
const renderHeroSlides = (container) => {
    container.classList.add('slides-container');

    setSlides(container.querySelectorAll('div'))
}

/**
 * set store.slides
 * @param {HTMLElement[]} slides 
 */
const setSlides = (slides) => {
    store.slides = slides;
    store.slides.forEach(decorateSlide);
    setActiveSlide(0); //todo: necessary?
};

/**
 * 
 * @param {HTMLElement} slide 
 * @param {number} index
 */
const decorateSlide = (slide, index) => {
    slide.classList.add('slide');

    slide.addEventListener('click', () => {
        setActiveSlide(index);
    });

    slide.querySelectorAll('ul > li > a').forEach(a => {
        a.classList.add('button');
    })
}

/**
 * set store.activeSlide
 * @param {number} index 
 */
const setActiveSlide = (nextActiveSlide) => {
    const { slides, activeSlide } = store;
    console.log('setActiveSlide:', slides, activeSlide, nextActiveSlide);

    if (nextActiveSlide === activeSlide) return;

    if (activeSlide >= 0) {
        slides[activeSlide].classList.remove('active');
    }
    slides[nextActiveSlide].classList.add('active');
    store.activeSlide = nextActiveSlide;
}

/**
 * 
 * @param {Element} block 
 */
export default function (block) {
    const container = block.firstElementChild;
    if (container && container.children && container.children.length > 1) {
        block.classList.add('with-slides');
        renderHeroSlides(container);
    }
}
