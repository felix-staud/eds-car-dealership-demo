/**
 * extract the first anchor url from a block
 * @param {Element} block
 * @returns {string | null}
 */
export function extractHrefFromBlock(block) {
  const anchor = block.querySelector('a');

  if (!anchor) {
    console.warn('Anchor element missing!'); // eslint-disable-line no-console
    return null;
  }

  if (!anchor.href) {
    console.warn('Anchor element has no href value!'); // eslint-disable-line no-console
    return null;
  }

  return anchor.href;
}

/**
 * load data from a single-sheet
 * @param {SingleSheetData} singleSheetData;
 * @returns {SingleSheetData["data"]} data
 */
export function loadSingleSheetData(singleSheetData) {
  return singleSheetData.data;
}

/**
 * load data from a multi-sheet
 * @param {MultiSheetData} multiSheetData
 * @returns {MultiSheetData["data"]} data
 */
export function loadMultiSheetData(multiSheetData) {
  const data = [];

  multiSheetData[':names'].forEach((name) => {
    data.push(...multiSheetData[name].data);
  });

  return data;
}
