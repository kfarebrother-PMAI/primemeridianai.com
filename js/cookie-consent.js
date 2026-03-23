/* ============================================
   Cookie Consent Banner
   PECR-compliant: Apollo tracker only loads
   after user gives explicit consent.
   ============================================ */

(function () {
  'use strict';

  var CONSENT_KEY = 'pmai_cookie_consent';
  var APOLLO_APP_ID = '69b2e785b0ac0e001572c2bb';

  function getConsent() {
    try {
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch (e) {
      // localStorage unavailable
    }
  }

  function loadApollo() {
    var n = Math.random().toString(36).substring(7);
    var o = document.createElement('script');
    o.src = 'https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=' + n;
    o.async = true;
    o.defer = true;
    o.onload = function () {
      if (window.trackingFunctions) {
        window.trackingFunctions.onLoad({ appId: APOLLO_APP_ID });
      }
    };
    document.head.appendChild(o);
  }

  function hideBanner() {
    var banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.classList.add('cookie-banner--hidden');
      setTimeout(function () {
        banner.remove();
      }, 300);
    }
  }

  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');

    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__text">' +
          'We use cookies to understand which businesses visit our site. ' +
          'This helps us tailor our services. No personal browsing profiles are built. ' +
          '<a href="/privacy.html">Privacy policy</a>' +
        '</p>' +
        '<div class="cookie-banner__buttons">' +
          '<button id="cookie-reject" class="cookie-banner__btn cookie-banner__btn--reject">Reject</button>' +
          '<button id="cookie-accept" class="cookie-banner__btn cookie-banner__btn--accept">Accept</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById('cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      loadApollo();
      hideBanner();
    });

    document.getElementById('cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
      hideBanner();
    });
  }

  // "Cookie settings" link in footer — resets consent and shows banner
  function bindSettingsLink() {
    var link = document.getElementById('cookie-settings-link');
    if (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        try {
          localStorage.removeItem(CONSENT_KEY);
        } catch (err) {
          // ignore
        }
        showBanner();
      });
    }
  }

  // Main logic
  var consent = getConsent();

  if (consent === 'accepted') {
    loadApollo();
  } else if (consent === null) {
    // No choice made yet — show banner
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
  // If 'rejected', do nothing (no Apollo, no banner)

  // Bind footer link
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSettingsLink);
  } else {
    bindSettingsLink();
  }
})();
