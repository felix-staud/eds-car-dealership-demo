import { loadCSS, loadScript } from '../aem.min.js';

export default async function init() {
  await loadScript(`${window.hlx.codeBasePath}/vendor/orestbida/cookieconsent_v3.0.0/cookieconsent.min.umd.js`);
  await loadCSS(`${window.hlx.codeBasePath}/vendor/orestbida/cookieconsent_v3.0.0/cookieconsent.min.css`);
  // eslint-disable-next-line no-undef
  CookieConsent.run({
    guiOptions: {
      consentModal: {
        layout: 'bar inline',
        position: 'bottom',
        equalWeightButtons: false,
        flipButtons: false,
      },
    },
    categories: {
      necessary: {
        readOnly: true,
      },
    },
    language: {
      default: 'en',
      autoDetect: 'browser',
      translations: {
        en: {
          consentModal: {
            title: "Hello traveller, it's cookie time!",
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Reject all',
          },
        },
      },
    },
  });
}
