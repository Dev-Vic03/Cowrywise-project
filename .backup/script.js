(function () {
  'use strict';

  /* ---------- Cookie bar ---------- */
  var cookie = document.getElementById('cookie');
  var ok = document.getElementById('cookie-ok');
  try { if (localStorage.getItem('cw-cookie') === '1') cookie.classList.add('hide'); } catch (e) {}
  ok.addEventListener('click', function () {
    cookie.classList.add('hide');
    try { localStorage.setItem('cw-cookie', '1'); } catch (e) {}
  });

  /* ---------- "Time really is money" calculator ---------- */
  var amount = document.getElementById('amount');
  var freq = document.getElementById('freq');
  var span = document.getElementById('span');
  var currency = document.getElementById('currency');
  var rTotal = document.getElementById('r-total');
  var rFund = document.getElementById('r-fund');
  var rBank = document.getElementById('r-bank');

  // Illustrative annual rates only (not real Cowrywise figures)
  var CONFIG = {
    NGN: { sym: '\u20A6', fund: 0.12, bank: 0.005 },
    USD: { sym: '$', fund: 0.06, bank: 0.001 }
  };

  function futureValue(p, perYear, years, annual) {
    if (perYear === 0) return p * Math.pow(1 + annual, years);
    var r = Math.pow(1 + annual, 1 / perYear) - 1;
    var n = perYear * years;
    return p * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  }

  function fmt(sym, n) {
    return sym + Math.round(n).toLocaleString('en-US');
  }

  function calculate() {
    var p = parseInt(amount.value.replace(/\D/g, ''), 10) || 0;
    var perYear = parseInt(freq.value, 10);
    var years = parseInt(span.value, 10);
    var c = CONFIG[currency.value];

    var invested = perYear === 0 ? p : p * perYear * years;
    var fundValue = futureValue(p, perYear, years, c.fund);
    var bankValue = futureValue(p, perYear, years, c.bank);

    rTotal.textContent = fmt(c.sym, fundValue);
    rFund.textContent = fmt(c.sym, fundValue - invested);
    rBank.textContent = fmt(c.sym, bankValue - invested);
  }

  amount.addEventListener('input', function () {
    var digits = amount.value.replace(/\D/g, '').slice(0, 12);
    amount.value = digits ? Number(digits).toLocaleString('en-US') : '';
    calculate();
  });
  [freq, span, currency].forEach(function (el) {
    el.addEventListener('change', calculate);
  });

  calculate();
})();