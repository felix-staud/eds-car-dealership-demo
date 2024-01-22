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
 */

export let SingleSheetData;
export let MultiSheetData;