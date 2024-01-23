/**
 * @typedef {{
 *  total: number,
 *  offset: number,
 *  limit: number,
 *  data: any[],
 *  ":type": 'sheet',
 * }} SingleSheetData
 *
 * @typedef {{
 *  [key: string]: SingleSheetData,
 *  ":version": number,
 *  ":names" : string[],
 *  ":type": 'multi-sheet',
 * }} MultiSheetData
 * 
 * https://swiperjs.com/swiper-api
 * @typedef {{
 *  el: HTMLElement,
 *  activeIndex: number,
 *  slides: HTMLElement[],
 *  wrapperEl: HTMLElement,
 *  init: (el: HTMLElement) => SwiperApi,
 *  update: () => void,
 *  updateSlides: () => void,
 *  addSlide: (index: number, slide: HTMLElement) => void,
 *  appendSlide: (slide: HTMLElement) => void,
 *  prependSlide: (slide: HTMLElement) => void,
 *  removeAllSlides: () => void,
 *  removeSlide: (number | number[]),
 * }} SwiperApi
 */

export let SingleSheetData;
export let MultiSheetData;
export let SwiperApi;