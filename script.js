(function () {
  'use strict';

  /* ========================================================
     1. COOKIE CONSENT BAR
     ======================================================== */
  var cookie = document.getElementById('cookie');
  var ok = document.getElementById('cookie-ok');
  if (cookie && ok) {
    try {
      if (localStorage.getItem('cw-cookie') === '1') {
        cookie.classList.add('hide');
      }
    } catch (e) { }

    ok.addEventListener('click', function () {
      cookie.classList.add('hide');
      try {
        localStorage.setItem('cw-cookie', '1');
      } catch (e) { }
    });
  }

  /* ========================================================
     2. MOBILE NAVIGATION DRAWER
     ======================================================== */
  var navToggle = document.getElementById('nav-toggle');
  var mobileNav = document.getElementById('mobile-nav');
  var mobileClose = document.getElementById('mobile-nav-close');
  var mobileBackdrop = document.getElementById('mobile-nav-backdrop');

  function openMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-locked');
  }

  function closeMobileNav() {
    if (!mobileNav || !navToggle) return;
    mobileNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-locked');
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (mobileNav && mobileNav.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileNav);

  // Mobile Accordion
  var mTriggers = document.querySelectorAll('.m-trigger');
  mTriggers.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.closest('.m-group');
      if (group) {
        var isOpen = group.classList.contains('active');
        document.querySelectorAll('.m-group').forEach(function (g) {
          g.classList.remove('active');
        });
        if (!isOpen) group.classList.add('active');
      }
    });
  });

  /* ========================================================
     3. "TIME REALLY IS MONEY" CALCULATOR
     ======================================================== */
  var amount = document.getElementById('amount');
  var freq = document.getElementById('freq');
  var span = document.getElementById('span');
  var currency = document.getElementById('currency');
  var rTotal = document.getElementById('r-total');
  var rFund = document.getElementById('r-fund');
  var rBank = document.getElementById('r-bank');

  // Illustrative annual rates
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

  function formatMoney(sym, n) {
    return sym + Math.round(n).toLocaleString('en-US');
  }

  // Smooth numeric counter animation
  var animationFrames = {};
  function animateValue(el, targetValue, sym) {
    if (!el) return;
    var elId = el.id || 'calc-el';
    if (animationFrames[elId]) cancelAnimationFrame(animationFrames[elId]);

    var currentText = el.textContent || '';
    var startValue = parseInt(currentText.replace(/\D/g, ''), 10) || 0;
    var endValue = Math.round(targetValue);
    var duration = 350;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      var ease = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(startValue + (endValue - startValue) * ease);
      el.textContent = formatMoney(sym, current);
      if (progress < 1) {
        animationFrames[elId] = requestAnimationFrame(step);
      } else {
        el.textContent = formatMoney(sym, endValue);
      }
    }
    animationFrames[elId] = requestAnimationFrame(step);
  }

  function calculate(animate) {
    if (!amount || !freq || !span || !currency) return;

    var p = parseInt(amount.value.replace(/\D/g, ''), 10) || 0;
    var perYear = parseInt(freq.value, 10);
    var years = parseInt(span.value, 10);
    var c = CONFIG[currency.value] || CONFIG.NGN;

    var invested = perYear === 0 ? p : p * perYear * years;
    var fundValue = futureValue(p, perYear, years, c.fund);
    var bankValue = futureValue(p, perYear, years, c.bank);

    var totalVal = Math.max(0, fundValue);
    var fundGain = Math.max(0, fundValue - invested);
    var bankGain = Math.max(0, bankValue - invested);

    if (animate) {
      animateValue(rTotal, totalVal, c.sym);
      animateValue(rFund, fundGain, c.sym);
      animateValue(rBank, bankGain, c.sym);
    } else {
      if (rTotal) rTotal.textContent = formatMoney(c.sym, totalVal);
      if (rFund) rFund.textContent = formatMoney(c.sym, fundGain);
      if (rBank) rBank.textContent = formatMoney(c.sym, bankGain);
    }
  }

  if (amount) {
    amount.addEventListener('input', function () {
      var digits = amount.value.replace(/\D/g, '').slice(0, 12);
      amount.value = digits ? Number(digits).toLocaleString('en-US') : '';
      calculate(false);
    });
  }

  if (currency) {
    currency.addEventListener('change', function () {
      var digits = amount.value.replace(/\D/g, '');
      if (currency.value === 'USD' && digits === '100000') {
        amount.value = '1,000';
      } else if (currency.value === 'NGN' && digits === '1000') {
        amount.value = '100,000';
      }
      calculate(true);
    });
  }

  [freq, span].forEach(function (el) {
    if (el) {
      el.addEventListener('change', function () {
        calculate(true);
      });
    }
  });

  /* ========================================================
     4. CUSTOMER TESTIMONIAL STORIES MODAL
     ======================================================== */
  var storyModal = document.getElementById('story-modal');
  var storyClose = document.getElementById('story-close');
  var storyBackdrop = document.getElementById('story-backdrop');
  var modalImg = document.getElementById('modal-img');
  var modalAuthor = document.getElementById('modal-author');
  var modalSince = document.getElementById('modal-since');
  var modalQuote = document.getElementById('modal-quote');
  var modalText = document.getElementById('modal-text');

  var STORIES_DATA = {
    Moyosoluwa: {
      text: "Before discovering Cowrywise, keeping track of savings and staying disciplined with investments was tough. Setting up automated plans helped me hit my personal milestones faster and stress-free."
    },
    Conscience: {
      text: "With Cowrywise, my business idle funds and personal funds are always working for me. Mutual funds give me high peace of mind while earning steady, transparent returns."
    },
    Funmilola: {
      text: "Locking away savings and investing with discipline completely turned my financial life around. I now have an emergency fund and long-term plans that grow reliably."
    },
    Oyindamola: {
      text: "The consistency Cowrywise fosters is unmatched. Automation removes the hesitation, and tracking my portfolio growth in real time gives me absolute clarity."
    }
  };

  function openStoryModal(figure) {
    if (!storyModal || !figure) return;
    var name = figure.getAttribute('data-name') || 'Customer';
    var quote = figure.getAttribute('data-quote') || '';
    var since = figure.getAttribute('data-since') || '';
    var imgEl = figure.querySelector('img');
    var imgSrc = imgEl ? imgEl.src : '';

    if (modalAuthor) modalAuthor.textContent = name;
    if (modalSince) modalSince.textContent = since;
    if (modalQuote) modalQuote.textContent = '"' + quote.replace(/^["']|["']$/g, '') + '"';
    if (modalImg && imgSrc) modalImg.src = imgSrc;
    if (modalText && STORIES_DATA[name]) {
      modalText.textContent = '"' + STORIES_DATA[name].text + '"';
    }

    storyModal.classList.add('open');
    storyModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-locked');
  }

  function closeStoryModal() {
    if (!storyModal) return;
    storyModal.classList.remove('open');
    storyModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-locked');
  }

  var peopleCards = document.querySelectorAll('.pp');
  peopleCards.forEach(function (card) {
    card.addEventListener('click', function (e) {
      e.preventDefault();
      openStoryModal(card);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openStoryModal(card);
      }
    });
  });

  if (storyClose) storyClose.addEventListener('click', closeStoryModal);
  if (storyBackdrop) storyBackdrop.addEventListener('click', closeStoryModal);

  // Global ESC key handler
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobileNav();
      closeStoryModal();
    }
  });

  // Initial calculation on page load
  calculate(false);

  /* ========================================================
     5. USER AUTH STATE RENDERING
     ======================================================== */
  function renderAuthState() {
    var navCta = document.getElementById('nav-cta');
    var mobileNavCta = document.getElementById('mobile-nav-cta');
    if (!navCta) return;

    var currentUser = null;
    try {
      var raw = localStorage.getItem('cw_current_user');
      if (raw) currentUser = JSON.parse(raw);
    } catch (e) {}

    if (currentUser) {
      var name = currentUser.firstName || 'User';
      var initials = (name.slice(0, 1) + (currentUser.lastName ? currentUser.lastName.slice(0, 1) : '')).toUpperCase();

      // Desktop nav CTA
      navCta.innerHTML =
        '<div class="user-menu-wrap" id="user-menu-wrap">' +
          '<button type="button" class="user-pill-btn" id="user-pill-btn" aria-haspopup="true">' +
            '<span class="user-avatar-badge">' + initials + '</span>' +
            '<span class="user-pill-name">Hi, ' + name + '</span>' +
            '<i class="chev"></i>' +
          '</button>' +
          '<div class="user-dropdown-card" id="user-dropdown-card">' +
            '<div class="user-dropdown-info">' +
              '<strong>' + (currentUser.firstName + ' ' + (currentUser.lastName || '')).trim() + '</strong>' +
              '<span>' + (currentUser.email || '') + '</span>' +
            '</div>' +
            '<div class="user-dropdown-sep"></div>' +
            '<button type="button" class="user-dropdown-action" id="header-logout-btn">' +
              '<span>Log out</span>' +
            '</button>' +
          '</div>' +
        '</div>';

      // Mobile nav CTA
      if (mobileNavCta) {
        mobileNavCta.innerHTML =
          '<div class="mobile-user-card">' +
            '<span class="user-avatar-badge">' + initials + '</span>' +
            '<div>' +
              '<strong>' + (currentUser.firstName + ' ' + (currentUser.lastName || '')).trim() + '</strong>' +
              '<span>' + (currentUser.email || '') + '</span>' +
            '</div>' +
          '</div>' +
          '<button type="button" class="btn btn-outline" id="mobile-logout-btn">Log out</button>';
      }

      function handleLogout() {
        try {
          localStorage.removeItem('cw_current_user');
        } catch (e) {}
        renderAuthState();
      }

      var headerLogout = document.getElementById('header-logout-btn');
      if (headerLogout) headerLogout.addEventListener('click', handleLogout);

      var mobileLogout = document.getElementById('mobile-logout-btn');
      if (mobileLogout) mobileLogout.addEventListener('click', handleLogout);

      var pillBtn = document.getElementById('user-pill-btn');
      var menuWrap = document.getElementById('user-menu-wrap');
      if (pillBtn && menuWrap) {
        pillBtn.addEventListener('click', function () {
          menuWrap.classList.toggle('active');
        });
      }
    } else {
      // Not logged in: Default buttons
      navCta.innerHTML =
        '<a href="login.html" class="login">Log in</a>' +
        '<a href="signup.html" class="btn">Sign up for free</a>';

      if (mobileNavCta) {
        mobileNavCta.innerHTML =
          '<a href="login.html" class="btn btn-outline">Log in</a>' +
          '<a href="signup.html" class="btn">Sign up for free</a>';
      }
    }
  }

  renderAuthState();
})();
