import { SingleSheetData } from '../../scripts/types.js'

/**
 * @typedef {{
 *  weekday: string,
 *  times: string,
 * }} OpeningHour
 */

var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * 
 * @param {string} url 
 */
const buildOpeningHoursTable = async (url) => {
    try {
        const response = await fetch(url);
        /** @type {SingleSheetData} */
        const data = await response.json();
        /** @type {OpeningHour[]} */
        const openingHours = data.data;
        const today =  new Date();
        const children = [];

        openingHours.forEach(openingHour => {
            const isActiveWeekday = openingHour.weekday === weekdays[today.getDay()];

            for (let key in openingHour) {
                const elem = document.createElement('div');
                elem.classList.add(key);

                if (isActiveWeekday) {
                    elem.classList.add('active');
                }

                elem.textContent = openingHour[key];
                children.push(elem);
            }
        });
        
        return children;
    } catch (err) {
        console.warn('failed to load opening hours data!');
    }
}

/**
 * 
 * @param {Element} block 
 */
export default async function decorate(block) {
    const link = block.querySelector('a');

    if (!link) {
        console.warn('Missing link for opening hours block!');
    } else {
        const children = await buildOpeningHoursTable(link.href);
        block.replaceChildren(...children);
    }
}