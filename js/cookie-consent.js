/* ============================================
   Cookie Consent Banner
   PECR-compliant: Apollo tracker and GA4 full
   tracking only activate after explicit consent.
   GA4 uses Google Consent Mode v2 — denied by
   default, granted on accept.

   Consent record is versioned + timestamped.
   - POLICY_VERSION bumps invalidate prior consent
     (re-prompts everyone). Bump on any material
     change: new vendor, new purpose, scope
     expansion, or privacy-notice rewrite.
   - MAX_AGE_MS forces periodic refresh (12 months).
   - Legacy unversioned string values
     ('accepted'/'rejected') are treated as invalid
     so the v1 → v2 migration re-prompts cleanly.
   ============================================ */

(function () {
  'use strict';

  var CONSENT_KEY = 'pmai_cookie_consent';
  var POLICY_VERSION = 2;
  var MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 12 months
  var APOLLO_APP_ID = '69b2e785b0ac0e001572c2bb';

  /**
   * Returns 'accepted' | 'rejected' | null.
   * null means "no valid current consent on file" — show the banner.
   * Anything stale/invalid/expired returns null so the user re-decides.
   */
  function getConsent() {
    try {
      var raw = localStorage.getItem(CONSENT_KEY);
      if (!raw) return null;
      // Legacy unversioned values from the v1 implementation — treat as invalid.
      if (raw === 'accepted' || raw === 'rejected') return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      if (parsed.version !== POLICY_VERSION) return null;
      if (typeof parsed.timestamp !== 'number') return null;
      if (Date.now() - parsed.timestamp > MAX_AGE_MS) return null;
      if (parsed.decision !== 'accepted' && parsed.decision !== 'rejected') return null;
      return parsed.decision;
    } catch (e) {
      return null;
    }
  }

  function setConsent(decision) {
    try {
      var record = {
        version: POLICY_VERSION,
        decision: decision,
        timestamp: Date.now()
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
    } catch (e) {
      // localStorage unavailable
    }
  }

  /**
   * Banner styles are injected by the script itself rather than living in a
   * stylesheet, so the banner works on every page regardless of which CSS
   * is loaded. The marketing site's css/style.css and the Vite-bundled demo
   * stylesheets don't need to know about each other.
   * Idempotent — safe to call repeatedly.
   */
  function injectStyles() {
    if (document.getElementById('pmai-cookie-banner-styles')) return;
    var css =
      '.cookie-banner{position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
      'background:#131B2E;border-top:1px solid #1E2A42;padding:1.5rem 2rem;' +
      'box-shadow:0 -4px 24px rgba(0,0,0,0.4);' +
      "font-family:'DM Sans','Helvetica Neue',sans-serif;" +
      'animation:pmaiCookieSlideUp 0.3s ease-out;}' +
      '.cookie-banner--hidden{animation:pmaiCookieSlideDown 0.3s ease-in forwards;}' +
      '@keyframes pmaiCookieSlideUp{' +
      'from{transform:translateY(100%);opacity:0;}' +
      'to{transform:translateY(0);opacity:1;}}' +
      '@keyframes pmaiCookieSlideDown{' +
      'from{transform:translateY(0);opacity:1;}' +
      'to{transform:translateY(100%);opacity:0;}}' +
      '.cookie-banner__inner{max-width:1140px;margin:0 auto;display:flex;' +
      'align-items:center;justify-content:space-between;gap:2rem;}' +
      '.cookie-banner__text{font-size:0.875rem;color:#8A8780;' +
      'line-height:1.5;margin:0;}' +
      '.cookie-banner__text a{color:#D4A853;text-decoration:underline;}' +
      '.cookie-banner__buttons{display:flex;gap:0.5rem;flex-shrink:0;}' +
      '.cookie-banner__btn{font-family:inherit;font-size:0.875rem;' +
      'font-weight:600;padding:0.5rem 1.5rem;border-radius:8px;border:none;' +
      'cursor:pointer;white-space:nowrap;' +
      'transition:background 0.2s,color 0.2s,border-color 0.2s;}' +
      '.cookie-banner__btn--accept{background:#D4A853;color:#0B1120;}' +
      '.cookie-banner__btn--accept:hover{background:#C49A45;}' +
      '.cookie-banner__btn--reject{background:transparent;color:#8A8780;' +
      'border:1px solid #1E2A42;}' +
      '.cookie-banner__btn--reject:hover{border-color:#8A8780;color:#C8C5BE;}' +
      '@media (max-width:768px){' +
      '.cookie-banner__inner{flex-direction:column;text-align:center;}' +
      '.cookie-banner__buttons{width:100%;justify-content:center;}}';
    var style = document.createElement('style');
    style.id = 'pmai-cookie-banner-styles';
    style.textContent = css;
    document.head.appendChild(style);
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

  function grantGA4() {
    if (typeof gtag !== 'function') return;
    gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
    // Fire the FIRST page_view of the session here, after consent grants.
    // The inline gtag('config', ..., { send_page_view: false }) suppresses
    // the auto page_view that would otherwise fire on every page load,
    // because that auto page_view runs pre-consent (gcs=G1-0) and GA4
    // refuses to use denied events for session attribution — resulting in
    // First user source = (direct) even for properly UTM-tagged inbound
    // links. With send_page_view: false + this explicit post-grant fire,
    // session_start is created by a granted event carrying full URL
    // context, so UTMs attribute correctly.
    //
    // Trade-off: visitors who reject consent send no events at all (not
    // even cookieless pings). That's stricter GDPR posture and a clean
    // signal that "denied means denied," at the cost of losing GA4's
    // modeled aggregate data from rejectors.
    gtag('event', 'page_view');
  }

  function denyGA4() {
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        analytics_storage: 'denied'
      });
    }
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
    injectStyles();
    var banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');

    banner.innerHTML =
      '<div class="cookie-banner__inner">' +
        '<p class="cookie-banner__text">' +
          'We use cookies and analytics to understand which businesses visit our site ' +
          'and how visitors use it. This helps us improve our services. ' +
          'No personal browsing profiles are built. ' +
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
      grantGA4();
      hideBanner();
    });

    document.getElementById('cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
      denyGA4();
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
        denyGA4();
        showBanner();
      });
    }
  }

  // Main logic
  var consent = getConsent();

  if (consent === 'accepted') {
    loadApollo();
    grantGA4();
  } else if (consent === null) {
    // No choice made yet — show banner
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showBanner);
    } else {
      showBanner();
    }
  }
  // If 'rejected', do nothing (no Apollo, GA4 stays denied)

  // Bind footer link
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSettingsLink);
  } else {
    bindSettingsLink();
  }
})();
