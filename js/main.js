// Prime Meridian AI — Site Scripts

(function () {
  'use strict';

  // Mobile nav toggle
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('nav__links--open');
      toggle.setAttribute('aria-expanded', open);
      toggle.querySelector('.icon-menu').style.display = open ? 'none' : 'block';
      toggle.querySelector('.icon-close').style.display = open ? 'block' : 'none';
    });

    // Close nav when clicking a link
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        links.classList.remove('nav__links--open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.querySelector('.icon-menu').style.display = 'block';
        toggle.querySelector('.icon-close').style.display = 'none';
      });
    });
  }

  // Nav shadow on scroll
  var nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 10) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    }, { passive: true });
  }

  // Set active nav link
  var currentPath = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  document.querySelectorAll('.nav__link').forEach(function (link) {
    var href = link.getAttribute('href');
    if (!href) return;
    var linkPath = href.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
    if (currentPath === linkPath || (currentPath === '/' && linkPath === '/') || (currentPath === '' && linkPath === '/')) {
      link.classList.add('nav__link--active');
    }
  });
})();
