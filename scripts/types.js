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
 * 
 * @typedef {{
 *  id: number,
 *  year: string,
 *  make: string,
 *  model: string,
 *  trim: string,
 *  exteriorColor: string,
 *  interiorColor: string,
 *  vin: string,
 *  price: number,
 *  miles: number,
 *  features?: string[],
 *  images?: string[],
 *  link: string,
 * }} Car
 */

export let SingleSheetData;
export let MultiSheetData;
export let SwiperApi;
export let Car;