/* ========================================================
   COWRYWISE SUBPAGES INTERACTIVE LOGIC (pages.js)
   Powers interactive calculators, filters, tabs and tools
   ======================================================== */

(function () {
  'use strict';

  // 1. SAVINGS CALCULATOR (save.html)
  var saveSlider = document.getElementById('save-slider');
  var saveAmountDisplay = document.getElementById('save-amount-display');
  var saveResultDisplay = document.getElementById('save-result-display');
  var savePrincipalDisplay = document.getElementById('save-principal-display');
  var saveInterestDisplay = document.getElementById('save-interest-display');
  var saveDurationTabs = document.querySelectorAll('.save-duration-tab');
  var saveFrequencyTabs = document.querySelectorAll('.save-frequency-tab');

  var currentDurationMonths = 12;
  var currentFrequency = 'monthly';
  var annualRate = 0.145; // 14.5% annual return

  function updateSavingsCalc() {
    if (!saveSlider) return;
    var baseVal = parseFloat(saveSlider.value);
    if (saveAmountDisplay) {
      saveAmountDisplay.textContent = '₦' + baseVal.toLocaleString();
    }

    var totalDeposits = 0;
    var totalInterest = 0;
    var totalBalance = 0;

    if (currentFrequency === 'monthly') {
      // Monthly compounding savings
      var monthlyRate = annualRate / 12;
      for (var i = 0; i < currentDurationMonths; i++) {
        totalDeposits += baseVal;
        totalBalance = (totalBalance + baseVal) * (1 + monthlyRate);
      }
      totalInterest = totalBalance - totalDeposits;
    } else if (currentFrequency === 'weekly') {
      var weeks = currentDurationMonths * 4.33;
      var weeklyRate = annualRate / 52;
      for (var w = 0; w < weeks; w++) {
        totalDeposits += baseVal;
        totalBalance = (totalBalance + baseVal) * (1 + weeklyRate);
      }
      totalInterest = totalBalance - totalDeposits;
    } else {
      // One-time deposit
      totalDeposits = baseVal;
      totalBalance = baseVal * Math.pow(1 + annualRate, currentDurationMonths / 12);
      totalInterest = totalBalance - totalDeposits;
    }

    if (saveResultDisplay) {
      saveResultDisplay.textContent = '₦' + Math.round(totalBalance).toLocaleString();
    }
    if (savePrincipalDisplay) {
      savePrincipalDisplay.textContent = '₦' + Math.round(totalDeposits).toLocaleString();
    }
    if (saveInterestDisplay) {
      saveInterestDisplay.textContent = '₦' + Math.round(totalInterest).toLocaleString();
    }
  }

  if (saveSlider) {
    saveSlider.addEventListener('input', updateSavingsCalc);
  }

  saveDurationTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      saveDurationTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentDurationMonths = parseInt(tab.getAttribute('data-months'), 10) || 12;
      updateSavingsCalc();
    });
  });

  saveFrequencyTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      saveFrequencyTabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      currentFrequency = tab.getAttribute('data-freq') || 'monthly';
      updateSavingsCalc();
    });
  });

  updateSavingsCalc();

  // 2. MUTUAL FUNDS FILTERING (mutual-funds.html)
  var fundPills = document.querySelectorAll('.funds-container .fund-filter-pill');
  var fundRows = document.querySelectorAll('.fund-row');

  fundPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      fundPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var filter = pill.getAttribute('data-filter');

      fundRows.forEach(function (row) {
        var category = row.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Risk Assessment Quiz
  var quizSubmit = document.getElementById('quiz-submit');
  if (quizSubmit) {
    quizSubmit.addEventListener('click', function () {
      var goal = document.querySelector('input[name="quiz-goal"]:checked');
      var horizon = document.querySelector('input[name="quiz-horizon"]:checked');
      var risk = document.querySelector('input[name="quiz-risk"]:checked');
      var resultBox = document.getElementById('quiz-result');

      if (!goal || !horizon || !risk) {
        alert('Please answer all 3 questions to see your investor profile.');
        return;
      }

      var score = parseInt(goal.value, 10) + parseInt(horizon.value, 10) + parseInt(risk.value, 10);
      var profileName = 'Moderate Investor';
      var profileDesc = 'A balanced 50/50 mix of fixed-income instruments and diversified mutual funds to grow capital steadily with low volatility.';

      if (score <= 4) {
        profileName = 'Conservative Investor';
        profileDesc = 'Prioritize capital safety and liquidity. Recommended: Money Market Funds and Treasury Bills (14.5% - 15.5% annual yields).';
      } else if (score >= 8) {
        profileName = 'Aggressive Growth Investor';
        profileDesc = 'Aim for maximum capital appreciation. Recommended: Equity mutual funds and top-tier NGX dividend stocks.';
      }

      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML =
          '<div style="background:#eff8ff; border:1px solid #b2ccff; border-radius:12px; padding:20px; margin-top:20px;">' +
            '<h4 style="color:#0066f5; font-size:18px; margin:0 0 8px;">Your Match: ' + profileName + '</h4>' +
            '<p style="color:#344054; font-size:14px; margin:0 0 16px;">' + profileDesc + '</p>' +
            '<a href="signup.html" class="btn" style="display:inline-block;">Open Your Recommended Portfolio</a>' +
          '</div>';
      }
    });
  }

  // 3. SPROUT TREASURY CALCULATOR (sprout.html)
  var sproutSlider = document.getElementById('sprout-slider');
  var sproutAmountDisplay = document.getElementById('sprout-amount-display');
  var sproutYieldDisplay = document.getElementById('sprout-yield-display');

  if (sproutSlider) {
    sproutSlider.addEventListener('input', function () {
      var val = parseFloat(sproutSlider.value);
      if (sproutAmountDisplay) sproutAmountDisplay.textContent = '₦' + val.toLocaleString();
      var estimatedYield = Math.round(val * 0.165); // 16.5% corporate rate
      if (sproutYieldDisplay) sproutYieldDisplay.textContent = '₦' + estimatedYield.toLocaleString() + ' / year';
    });
  }

  // 4. CODE TABS (embed.html & developers.html)
  var terminalTabs = document.querySelectorAll('.terminal-tab');
  terminalTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var group = tab.closest('.code-terminal');
      if (!group) return;
      group.querySelectorAll('.terminal-tab').forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var lang = tab.getAttribute('data-lang');
      group.querySelectorAll('.terminal-snippet').forEach(function (snippet) {
        if (snippet.getAttribute('data-lang') === lang) {
          snippet.style.display = 'block';
        } else {
          snippet.style.display = 'none';
        }
      });
    });
  });

  // 5. GLOSSARY SEARCH & A-Z FILTER (learn.html)
  var glossaryInput = document.getElementById('glossary-search');
  var letterBtns = document.querySelectorAll('.letter-btn');
  var glossaryCards = document.querySelectorAll('.glossary-card');

  function filterGlossary() {
    var query = glossaryInput ? glossaryInput.value.toLowerCase().trim() : '';
    var activeLetter = document.querySelector('.letter-btn.active');
    var letter = activeLetter ? activeLetter.getAttribute('data-letter') : 'ALL';

    glossaryCards.forEach(function (card) {
      var term = (card.querySelector('.glossary-term') ? card.querySelector('.glossary-term').textContent : '').toLowerCase();
      var def = (card.querySelector('.glossary-definition') ? card.querySelector('.glossary-definition').textContent : '').toLowerCase();
      var firstChar = term.charAt(0).toUpperCase();

      var matchesQuery = !query || term.indexOf(query) !== -1 || def.indexOf(query) !== -1;
      var matchesLetter = letter === 'ALL' || firstChar === letter;

      if (matchesQuery && matchesLetter) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

  if (glossaryInput) {
    glossaryInput.addEventListener('input', filterGlossary);
  }

  letterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      letterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      filterGlossary();
    });
  });

  // 6. BLOG FILTER TABS (blog.html)
  var blogPills = document.querySelectorAll('.blog-filter-pill');
  var blogCards = document.querySelectorAll('.blog-card');

  blogPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      blogPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var cat = pill.getAttribute('data-cat');

      blogCards.forEach(function (card) {
        var cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();
