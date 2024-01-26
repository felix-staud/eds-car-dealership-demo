/* eslint-disable import/no-mutable-exports */

/**
 * @typedef {{
 *  ":type": 'sheet' | 'multi-sheet'
 * }} BaseSheetData
 *
 * @typedef {BaseSheetData & {
 *  total: number,
 *  offset: number,
 *  limit: number,
 *  data: any[],
 * }} SingleSheetData
 *
 * @typedef {BaseSheetData & {
 *  [key: string]: SingleSheetData,
 *  ":version": number,
 *  ":names" : string[],
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
 *  condition: 'new' | 'pre-owned' | 'certified',
 *  year: string,
 *  make: string,
 *  model: string,
 *  trim: string,
 *  bodyStyle: string,
 *  price: number,
 *  images: string[],
 *  exteriorColor: string,
 *  interiorColor: string,
 *  miles: number,
 *  seats: number,
 *  fuelEconomy: string,
 *  transmission: string,
 *  drivetrain: string,
 *  engine: string,
 *  fuelType: string,
 *  horsepower: number,
 *  vin: string,
 *  features: string[],
 *  notes: string,
 * }} Car
 */

export let SingleSheetData;
export let MultiSheetData;
export let SwiperApi;
export let Car;
