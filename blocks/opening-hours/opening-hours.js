import { SingleSheetData } from '../../scripts/types.js';
import { extractUrlFromBlock } from '../../scripts/utils.js';

/**
 * @typedef {{
 *  weekday: string,
 *  times: string,
 * }} OpeningHour
 */

/**
 * load opening hour data from url
 * @param {string} href
 * @returns {Promise<OpeningHour[]>}
 */
async function loadOpeningHoursData(href) {
    try {
        const url = new URL(href);
        url.searchParams.append('time', Date.now());

        const response = await fetch(url.toString());
        /** @type {SingleSheetData} */
        const data = await response.json();

        return data.data;
    } catch (err) {
        console.warn('failed to load opening hours data!', err);
    }

    return [];
}

/**
 * 
 * @param {OpeningHour[]} openingHours 
 * @returns 
 */
function buildOpeningHoursCells(openingHours) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayIndex = new Date().getDay();
    /** @type {HTMLElement[]} */
    const cells = [];

    openingHours.forEach(openingHour => {
        const { weekday } = openingHour;
        const isActiveWeekday = weekday.toLowerCase() === weekdays[dayIndex];

        for (let key in openingHour) {
            const elem = document.createElement('div');
            elem.classList.add(key);

            if (isActiveWeekday) {
                elem.classList.add('active');
            }

            elem.textContent = openingHour[key];
            cells.push(elem);
        }
    });

    return cells;
}

/**
 * 
 * @param {Element} block 
 */
export default async function decorate(block) {
    const url = extractUrlFromBlock(block);

    if (!url) return;

    const openingHours = await loadOpeningHoursData(url);
    const cells = buildOpeningHoursCells(openingHours);

    block.replaceChildren(...cells);
}