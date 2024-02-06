import { FormDefinition } from '../../scripts/types.js'; // eslint-disable-line no-unused-vars
import createField from '../form/form-fields.js';
import { formatNumber, scrollToElement } from '../../scripts/utils.js';

/**
 * @param {HTMLElement} block
 */
export default async function decorate(block) {
  /** @type {FormDefinition[]} */
  const fieldDefs = [
    {
      Label: 'Auto price / $',
      Name: 'auto-price',
      Type: 'number',
      Value: 50000,
    },
    {
      Label: 'Loan term / Months',
      Name: 'loan-term',
      Type: 'number',
      Value: 60,
    },
    {
      Label: 'Interest Rate / %',
      Name: 'interest-rate',
      Type: 'number',
      Value: 5,
    },
    {
      Label: 'Down Payment / $',
      Name: 'down-payment',
      Type: 'number',
      Value: 0,
    },
    {
      Label: 'Trade-in Value / $',
      Name: 'trade-in-value',
      Type: 'number',
      Value: 0,
    },
    {
      Label: 'Calculate',
      Id: 'calc-btn',
      Type: 'button',
    },
    {
      Label: 'Monthly Payment',
      Id: 'monthly-payment',
      Type: 'text',
      Style: 'hidden readonly',
    },
    {
      Label: 'Total',
      Id: 'total-payment',
      Type: 'text',
      Style: 'hidden readonly',
    },
    {
      Label: 'Interest',
      Id: 'interest-payment',
      Type: 'text',
      Style: 'hidden readonly',
    },
  ];
  const fields = await Promise.all(fieldDefs.map((field) => createField(field)));

  const form = document.createElement('form');
  form.id = 'payment-calculator-form';
  form.target = '#result';
  form.replaceChildren(...fields);
  block.append(form);

  const autoPriceEl = form.querySelector('[name="auto-price"]');
  const loanTermEl = form.querySelector('[name="loan-term"]');
  const interestRateEl = form.querySelector('[name="interest-rate"]');
  const downPaymentEl = form.querySelector('[name="down-payment"]');
  const tradeInValueEl = form.querySelector('[name="trade-in-value"]');
  const monthlyPaymentEl = form.querySelector('#monthly-payment');
  const interestPaymentEl = form.querySelector('#interest-payment');
  const totalPaymentEl = form.querySelector('#total-payment');

  form.querySelectorAll('.readonly > input').forEach((el) => el.setAttribute('readonly', 'readonly'));

  const calcBtn = block.querySelector('#calc-btn');
  calcBtn.addEventListener('click', () => {
    const autoPrice = autoPriceEl.value;
    const loanTerm = loanTermEl.value;
    const interestRate = interestRateEl.value;
    const downPayment = downPaymentEl.value;
    const tradeInValue = tradeInValueEl.value;

    const P = autoPrice - downPayment - tradeInValue; // principal
    const r = interestRate / 100; // rate in %
    const n = 12; // number of payments per year;
    const t = loanTerm / 12; // time in years

    const numerator = P * (r / n); // P*(r/n)
    const denominator = 1 - (1 + r / n) ** -(n * t); // 1 - (1 + r/n)⁻ⁿᵗ
    const monthlyPayment = numerator / denominator;
    const total = monthlyPayment * loanTerm;
    const interestPayment = total - P;

    monthlyPaymentEl.value = `$${formatNumber(monthlyPayment.toFixed(2))}`;
    totalPaymentEl.value = `$${formatNumber(total.toFixed(2))}`;
    interestPaymentEl.value = `$${formatNumber(interestPayment.toFixed(2))}`;

    form.querySelectorAll('.hidden').forEach((el) => el.classList.remove('hidden'));
    scrollToElement(calcBtn);
  });

  document.addEventListener('payment-calculator/autoPrice/set', (event) => {
    const { autoPrice } = event.detail;
    autoPriceEl.value = autoPrice;
  });

  document.dispatchEvent(new CustomEvent('payment-calculator/ready'));
}
