(function () {
  'use strict';

  /* ========================================================
     LOCAL USER DATABASE & SESSION MANAGEMENT
     ======================================================== */
  var USERS_KEY = 'cw_users';
  var CURRENT_USER_KEY = 'cw_current_user';

  // Seed default demo user if storage is empty
  function initUsers() {
    try {
      var raw = localStorage.getItem(USERS_KEY);
      if (!raw) {
        var defaultUsers = [
          {
            email: 'demo@cowrywise.com',
            password: 'password123',
            firstName: 'Demo',
            lastName: 'User',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
        return defaultUsers;
      }
      return JSON.parse(raw) || [];
    } catch (e) {
      return [];
    }
  }

  function getUsers() {
    return initUsers();
  }

  function saveUser(user) {
    try {
      var users = getUsers();
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {}
  }

  function findUser(email) {
    var users = getUsers();
    var clean = (email || '').trim().toLowerCase();
    for (var i = 0; i < users.length; i++) {
      if ((users[i].email || '').trim().toLowerCase() === clean) {
        return users[i];
      }
    }
    return null;
  }

  function setCurrentUser(user) {
    try {
      var sessionData = {
        email: user.email,
        firstName: user.firstName || 'User',
        lastName: user.lastName || '',
        phone: user.phone || '',
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
    } catch (e) {}
  }

  // Pre-initialize users on load
  initUsers();

  /* ========================================================
     1. PASSWORD VISIBILITY TOGGLE
     ======================================================== */
  var pwEyeBtns = document.querySelectorAll('.pw-eye-btn');
  pwEyeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.pw-input-wrap');
      if (!wrap) return;
      var input = wrap.querySelector('input');
      if (!input) return;

      var isPassword = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPassword ? 'text' : 'password');

      var eyeSvg = btn.querySelector('.icon-eye');
      var eyeOffSvg = btn.querySelector('.icon-eye-off');
      if (eyeSvg && eyeOffSvg) {
        eyeSvg.style.display = isPassword ? 'none' : 'block';
        eyeOffSvg.style.display = isPassword ? 'block' : 'none';
      }
      btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });

  /* ========================================================
     2. GOOGLE & APPLE AUTH MODALS
     ======================================================== */
  var googleModal = document.getElementById('google-auth-modal');
  var googleCloseBtn = document.getElementById('google-modal-close');
  var googleBackdrop = document.getElementById('google-modal-backdrop');
  var googleAccountsView = document.getElementById('google-accounts-view');
  var googleCustomView = document.getElementById('google-custom-view');
  var googleSigningView = document.getElementById('google-signing-in-view');
  var googleProgressBar = document.getElementById('google-progress-bar');
  var googleUseAnotherBtn = document.getElementById('google-use-another-btn');
  var googleBackBtn = document.getElementById('google-btn-back');
  var googleCustomForm = document.getElementById('google-custom-form');
  var googleSigningEmail = document.getElementById('google-signing-email');

  function openGoogleModal() {
    if (!googleModal) return;
    googleModal.classList.add('open');
    googleModal.setAttribute('aria-hidden', 'false');
    // Reset views
    if (googleAccountsView) googleAccountsView.style.display = 'block';
    if (googleCustomView) googleCustomView.style.display = 'none';
    if (googleSigningView) googleSigningView.style.display = 'none';
    if (googleProgressBar) googleProgressBar.classList.remove('active');
  }

  function closeGoogleModal() {
    if (!googleModal) return;
    googleModal.classList.remove('open');
    googleModal.setAttribute('aria-hidden', 'true');
  }

  function completeGoogleAuth(name, email) {
    if (googleProgressBar) googleProgressBar.classList.add('active');
    if (googleAccountsView) googleAccountsView.style.display = 'none';
    if (googleCustomView) googleCustomView.style.display = 'none';
    if (googleSigningView) {
      googleSigningView.style.display = 'flex';
      if (googleSigningEmail) googleSigningEmail.textContent = email;
    }

    var parts = name.trim().split(' ');
    var firstName = parts[0] || 'User';
    var lastName = parts.slice(1).join(' ') || '';

    var gUser = findUser(email);
    if (!gUser) {
      gUser = {
        email: email.toLowerCase(),
        firstName: firstName,
        lastName: lastName,
        password: 'google_oauth_verified',
        createdAt: new Date().toISOString()
      };
      saveUser(gUser);
    }
    setCurrentUser(gUser);

    setTimeout(function () {
      window.location.href = 'index.html';
    }, 700);
  }

  // Listen for Google Auth success from popup window
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'CW_GOOGLE_SUCCESS') {
      if (e.data.user) {
        setCurrentUser(e.data.user);
      }
      window.location.href = 'index.html';
    }
  });

  window.addEventListener('storage', function (e) {
    if (e.key === CURRENT_USER_KEY && e.newValue) {
      window.location.href = 'index.html';
    }
  });

  function triggerGoogleSignIn() {
    var width = 500;
    var height = 620;
    var left = Math.max(0, Math.round((window.screen.width - width) / 2));
    var top = Math.max(0, Math.round((window.screen.height - height) / 2));
    var popupUrl = 'google-auth.html';
    var popupFeatures = 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left + ',toolbar=no,menubar=no,status=no,resizable=yes';

    var popup = null;
    try {
      popup = window.open(popupUrl, 'GoogleSignIn', popupFeatures);
    } catch (err) {
      popup = null;
    }

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // If popup blocker blocked the window, open in-page modal fallback
      openGoogleModal();
    } else {
      popup.focus();
    }
  }

  // Hook all Google buttons
  var googleBtns = document.querySelectorAll('.btn-google');
  googleBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      triggerGoogleSignIn();
    });
  });

  if (googleCloseBtn) googleCloseBtn.addEventListener('click', closeGoogleModal);
  if (googleBackdrop) googleBackdrop.addEventListener('click', closeGoogleModal);

  // Click on an existing Google account item
  var googleAccountItems = document.querySelectorAll('.google-account-item:not(#google-use-another-btn)');
  googleAccountItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var email = item.getAttribute('data-email') || 'esther@gmail.com';
      var name = item.getAttribute('data-name') || 'Esther';
      completeGoogleAuth(name, email);
    });
  });

  // "Use another account" toggle
  if (googleUseAnotherBtn) {
    googleUseAnotherBtn.addEventListener('click', function () {
      if (googleAccountsView) googleAccountsView.style.display = 'none';
      if (googleCustomView) googleCustomView.style.display = 'block';
      var nameInput = document.getElementById('google-custom-name');
      if (nameInput) nameInput.focus();
    });
  }

  // Back button in custom account view
  if (googleBackBtn) {
    googleBackBtn.addEventListener('click', function () {
      if (googleCustomView) googleCustomView.style.display = 'none';
      if (googleAccountsView) googleAccountsView.style.display = 'block';
    });
  }

  // Custom account submission
  if (googleCustomForm) {
    googleCustomForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var nameInput = document.getElementById('google-custom-name');
      var emailInput = document.getElementById('google-custom-email');
      var errorBox = document.getElementById('google-custom-error');

      var nameVal = (nameInput ? nameInput.value : '').trim();
      var emailVal = (emailInput ? emailInput.value : '').trim();

      if (!nameVal) {
        if (errorBox) {
          errorBox.style.display = 'block';
          errorBox.textContent = 'Please enter your name.';
        }
        return;
      }

      if (!emailVal || !/\S+@\S+\.\S+/.test(emailVal)) {
        if (errorBox) {
          errorBox.style.display = 'block';
          errorBox.textContent = 'Please enter a valid Google email address.';
        }
        return;
      }

      if (errorBox) errorBox.style.display = 'none';
      completeGoogleAuth(nameVal, emailVal);
    });
  }

  // Apple Modal handlers
  var appleModal = document.getElementById('apple-auth-modal');
  var appleCancelBtn = document.getElementById('apple-modal-cancel');
  var appleContinueBtn = document.getElementById('apple-modal-continue');
  var appleBackdrop = document.getElementById('apple-modal-backdrop');

  function openAppleModal() {
    if (!appleModal) return;
    appleModal.classList.add('open');
    appleModal.setAttribute('aria-hidden', 'false');
  }

  function closeAppleModal() {
    if (!appleModal) return;
    appleModal.classList.remove('open');
    appleModal.setAttribute('aria-hidden', 'true');
  }

  var appleBtns = document.querySelectorAll('.btn-apple');
  appleBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openAppleModal();
    });
  });

  if (appleCancelBtn) appleCancelBtn.addEventListener('click', closeAppleModal);
  if (appleBackdrop) appleBackdrop.addEventListener('click', closeAppleModal);

  if (appleContinueBtn) {
    appleContinueBtn.addEventListener('click', function () {
      var appleUser = findUser('esther@icloud.com');
      if (!appleUser) {
        appleUser = {
          email: 'esther@icloud.com',
          firstName: 'Esther',
          lastName: '',
          password: 'apple_oauth_verified',
          createdAt: new Date().toISOString()
        };
        saveUser(appleUser);
      }
      setCurrentUser(appleUser);
      appleContinueBtn.textContent = 'Signing in...';
      appleContinueBtn.disabled = true;
      setTimeout(function () {
        window.location.href = 'index.html';
      }, 600);
    });
  }

  /* ========================================================
     3. LOGIN FORM SUBMISSION (WITH REAL CREDENTIAL CHECK)
     ======================================================== */
  var loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = document.getElementById('email');
      var pwInput = document.getElementById('password');
      var alertBox = document.getElementById('auth-alert');
      var submitBtn = document.getElementById('submit-btn');

      var emailVal = (emailInput ? emailInput.value : '').trim();
      var pwVal = pwInput ? pwInput.value : '';

      if (emailInput) emailInput.classList.remove('has-error');
      if (pwInput) pwInput.classList.remove('has-error');

      // 1. Validation
      if (!emailVal || !/\S+@\S+\.\S+/.test(emailVal)) {
        if (emailInput) emailInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.textContent = 'Please enter a valid email address.';
        }
        return;
      }

      if (!pwVal) {
        if (pwInput) pwInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.textContent = 'Please enter your password.';
        }
        return;
      }

      // 2. Check credentials against registered users
      var user = findUser(emailVal);
      if (!user) {
        if (emailInput) emailInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.innerHTML = 'No account found with this email. <a href="signup.html" class="blue-link" style="text-decoration: underline;">Create an account here</a>';
        }
        return;
      }

      if (user.password !== pwVal) {
        if (pwInput) pwInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.innerHTML = 'Incorrect password. Please try again or <a href="#" id="alert-reset-link" class="blue-link" style="text-decoration: underline;">reset it</a>.';
          var resetLink = document.getElementById('alert-reset-link');
          if (resetLink) {
            resetLink.addEventListener('click', function (ev) {
              ev.preventDefault();
              openForgotModal();
            });
          }
        }
        return;
      }

      // 3. Credentials are valid! Log user in
      setCurrentUser(user);

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }
      if (alertBox) {
        alertBox.className = 'auth-msg success';
        alertBox.textContent = 'Welcome back, ' + (user.firstName || 'there') + '! Signing you in...';
      }

      setTimeout(function () {
        window.location.href = 'index.html';
      }, 900);
    });
  }

  /* ========================================================
     4. SIGNUP FORM (MULTI-STEP ACCOUNT CREATION)
     ======================================================== */
  var signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailInput = document.getElementById('signup-email');
      var extraFields = document.getElementById('signup-extra-fields');
      var firstNameInput = document.getElementById('first-name');
      var lastNameInput = document.getElementById('last-name');
      var pwInput = document.getElementById('signup-password');
      var alertBox = document.getElementById('auth-alert');
      var submitBtn = document.getElementById('submit-btn');
      var submitText = submitBtn ? submitBtn.querySelector('.submit-text') : null;

      var emailVal = (emailInput ? emailInput.value : '').trim();

      if (emailInput) emailInput.classList.remove('has-error');
      if (firstNameInput) firstNameInput.classList.remove('has-error');
      if (pwInput) pwInput.classList.remove('has-error');

      // Step 1: Validate email
      if (!emailVal || !/\S+@\S+\.\S+/.test(emailVal)) {
        if (emailInput) emailInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.textContent = 'Please enter a valid email address.';
        }
        return;
      }

      // Check if user already exists
      var existingUser = findUser(emailVal);
      if (existingUser) {
        if (emailInput) emailInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.innerHTML = 'An account with this email already exists. <a href="login.html" class="blue-link" style="text-decoration: underline;">Click here to Sign In</a>';
        }
        return;
      }

      // If extra fields are still hidden, reveal them (Step 1 -> Step 2)
      if (extraFields && extraFields.style.display === 'none') {
        extraFields.style.display = 'block';
        if (submitText) submitText.textContent = 'Create account';
        if (alertBox) alertBox.className = 'auth-msg';
        if (firstNameInput) firstNameInput.focus();
        return;
      }

      // Step 2: Validate details
      var firstNameVal = (firstNameInput ? firstNameInput.value : '').trim();
      var lastNameVal = (lastNameInput ? lastNameInput.value : '').trim();
      var pwVal = pwInput ? pwInput.value : '';

      if (!firstNameVal) {
        if (firstNameInput) firstNameInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.textContent = 'Please enter your first name.';
        }
        return;
      }

      if (!pwVal || pwVal.length < 6) {
        if (pwInput) pwInput.classList.add('has-error');
        if (alertBox) {
          alertBox.className = 'auth-msg error';
          alertBox.textContent = 'Password must be at least 6 characters long.';
        }
        return;
      }

      // Save new user account!
      var newUser = {
        email: emailVal.toLowerCase(),
        firstName: firstNameVal,
        lastName: lastNameVal,
        password: pwVal,
        createdAt: new Date().toISOString()
      };

      saveUser(newUser);
      setCurrentUser(newUser);

      if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
      }

      if (alertBox) {
        alertBox.className = 'auth-msg success';
        alertBox.textContent = 'Account created successfully! Welcome to Cowrywise, ' + firstNameVal + '.';
      }

      setTimeout(function () {
        window.location.href = 'index.html';
      }, 1000);
    });
  }

  /* ========================================================
     5. FORGOT PASSWORD MODAL (LOGIN PAGE)
     ======================================================== */
  var forgotLink = document.getElementById('forgot-password');
  var forgotModal = document.getElementById('forgot-modal');
  var forgotClose = document.getElementById('forgot-close');
  var forgotBackdrop = document.getElementById('forgot-backdrop');
  var forgotForm = document.getElementById('forgot-form');

  function openForgotModal() {
    if (!forgotModal) return;
    forgotModal.classList.add('open');
    forgotModal.setAttribute('aria-hidden', 'false');
    var input = document.getElementById('reset-email');
    if (input) {
      var loginEmail = document.getElementById('email');
      if (loginEmail && loginEmail.value) input.value = loginEmail.value;
      input.focus();
    }
  }

  function closeForgotModal() {
    if (!forgotModal) return;
    forgotModal.classList.remove('open');
    forgotModal.setAttribute('aria-hidden', 'true');
  }

  if (forgotLink) {
    forgotLink.addEventListener('click', function (e) {
      e.preventDefault();
      openForgotModal();
    });
  }

  if (forgotClose) forgotClose.addEventListener('click', closeForgotModal);
  if (forgotBackdrop) forgotBackdrop.addEventListener('click', closeForgotModal);

  if (forgotForm) {
    forgotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var resetEmail = document.getElementById('reset-email');
      var resetAlert = document.getElementById('reset-alert');
      var resetBtn = document.getElementById('reset-btn');

      var emailVal = (resetEmail ? resetEmail.value : '').trim();

      if (!emailVal || !/\S+@\S+\.\S+/.test(emailVal)) {
        if (resetAlert) {
          resetAlert.className = 'auth-msg error';
          resetAlert.textContent = 'Please enter a valid email address.';
        }
        return;
      }

      var user = findUser(emailVal);
      if (resetBtn) resetBtn.disabled = true;

      setTimeout(function () {
        if (resetAlert) {
          resetAlert.className = 'auth-msg success';
          if (user) {
            resetAlert.textContent = 'Reset instructions sent to ' + emailVal + '! Check your inbox.';
          } else {
            resetAlert.textContent = 'If an account exists for ' + emailVal + ', instructions have been sent.';
          }
        }
        setTimeout(closeForgotModal, 2200);
      }, 700);
    });
  }

  /* ========================================================
     6. FLOATING LIVE CHAT WIDGET
     ======================================================== */
  var chatBtn = document.querySelector('.floating-chat-btn');
  if (chatBtn) {
    chatBtn.addEventListener('click', function () {
      var alertBox = document.getElementById('auth-alert');
      if (alertBox) {
        alertBox.className = 'auth-msg success';
        alertBox.textContent = 'Need help? Our 24/7 support is active: email support@cowrywise.com or WhatsApp +2349022979297.';
      }
    });
  }

  // Global ESC handler
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeForgotModal();
      closeGoogleModal();
      closeAppleModal();
    }
  });
})();
