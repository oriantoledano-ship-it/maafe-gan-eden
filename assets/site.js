/* מאפה גן עדן - interactions: hero sign-on, reveals, parallax, open-now status,
   mobile drawer, lazy map, mobile call bar, refresh-at-top. */
(function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var motionOff = function () {
    return root.getAttribute('data-motion') === 'off' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };

  /* refresh always opens at the top; a hash link lands once, then the hash is dropped */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  if (nav && nav.type === 'reload') window.scrollTo(0, 0);
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    if (target) setTimeout(function () { target.scrollIntoView(); }, 30);
    history.replaceState(null, '', location.pathname + location.search);
  }

  /* hero: the sign switches on */
  setTimeout(function () { document.body.classList.add('is-live'); root.setAttribute('data-ready', '1'); }, 60);

  /* reveals */
  var rvs = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (el, i) {
      var sib = el.parentElement ? $$('.rv', el.parentElement).indexOf(el) : 0;
      el.style.transitionDelay = Math.min(sib, 4) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    rvs.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* sticky nav shadow, hero parallax, mobile call bar */
  var navEl = $('#nav');
  var hero = $('.hero');
  var heroImg = $('.hero__bg img');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    navEl.classList.toggle('is-stuck', y > 10);
    if (heroImg && !motionOff() && y < hero.offsetHeight) heroImg.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
    document.body.classList.toggle('mcta-on', y > hero.offsetHeight * 0.72);
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* open-now status (Asia/Jerusalem): Sun-Thu 06:00-20:00, Fri 06:00-17:00, Sat closed */
  var status = $('#openNow');
  if (status) {
    try {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
      var get = function (t) { return (parts.filter(function (p) { return p.type === t; })[0] || {}).value; };
      var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      var mins = parseInt(get('hour'), 10) % 24 * 60 + parseInt(get('minute'), 10);
      var close = day <= 4 ? 20 * 60 : day === 5 ? 17 * 60 : -1;
      if (close > 0 && mins >= 360 && mins < close) {
        status.textContent = 'פתוח עכשיו · עד ' + (close / 60) + ':00';
        status.classList.add('is-open');
      } else if (close > 0 && mins < 360) {
        status.textContent = 'סגור עכשיו · נפתח היום ב-06:00';
      } else {
        status.textContent = day === 5 || day === 6 ? 'סגור עכשיו · נפתח ביום א׳ ב-06:00' : 'סגור עכשיו · נפתח מחר ב-06:00';
      }
    } catch (e) { /* keep the static hours text */ }
  }

  /* mobile drawer */
  var burger = $('.nav__burger');
  var drawer = $('#drawer');
  function setDrawer(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'סגירת תפריט' : 'פתיחת תפריט');
    navEl.classList.toggle('is-open', open);
    drawer.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () { setDrawer(drawer.hidden); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) { setDrawer(false); burger.focus(); } });
  }

  /* in-page links: smooth scroll without leaving a hash in the URL */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var el = id === 'top' ? document.body : document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var top = id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - navEl.offsetHeight + 1;
      window.scrollTo({ top: top, behavior: motionOff() ? 'auto' : 'smooth' });
    });
  });

  /* Google map: inserted only when the visitor reaches it */
  var map = $('#map');
  if (map && 'IntersectionObserver' in window) {
    var mo = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      mo.disconnect();
      setTimeout(function () {
        var f = document.createElement('iframe');
        f.src = map.getAttribute('data-src');
        f.title = 'מפה: מאפה גן עדן, מבוא האתרוג 7, אשדוד';
        f.loading = 'lazy';
        f.referrerPolicy = 'no-referrer-when-downgrade';
        map.appendChild(f);
      }, 350);
    }, { rootMargin: '250px 0px' });
    mo.observe(map);
  }
})();
