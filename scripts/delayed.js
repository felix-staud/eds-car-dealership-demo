// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './aem.js';

// add more delayed functionality here
import './delayed/cookie-consent.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');
