// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';
import initCookieConsent from './delayed/cookie-consent.js';

// add more delayed functionality here
initCookieConsent();

// Core Web Vitals RUM collection
sampleRUM('cwv');
