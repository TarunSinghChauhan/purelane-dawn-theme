/* Reviews rail: turns the scrollable strip into a seamless marquee.
   The prototype hand-duplicated every card in the markup (screen readers read each review twice).
   Here the markup has each review once; the clones are made in JS, are aria-hidden, and sized so the
   loop always fills the viewport however many reviews the merchant adds. */
(function () {
  if (window.__plReviews) return;
  window.__plReviews = true;

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(rail) {
    var track = rail.querySelector('.pl-revtrack');
    if (!track || rail.__plTeardown) return;
    var pauseBtn = rail.parentNode.querySelector('[data-pl-revpause]');
    var resizeTimer = null;
    var userPaused = false;

    function clear() {
      [].slice.call(track.querySelectorAll('[data-pl-clone]')).forEach(function (n) { n.remove(); });
      rail.classList.remove('is-marquee');
      if (pauseBtn) pauseBtn.hidden = true;
    }

    function build() {
      clear();
      if (motion.matches) return;
      var originals = [].slice.call(track.children);
      if (!originals.length) return;

      var setWidth = track.scrollWidth;                       // one full set, margins included
      if (!setWidth) return;
      var copies = Math.max(1, Math.ceil(rail.clientWidth / setWidth));   // sets needed per half
      for (var i = 0; i < copies * 2 - 1; i++) {
        originals.forEach(function (card) {
          var clone = card.cloneNode(true);
          clone.setAttribute('aria-hidden', 'true');
          clone.setAttribute('data-pl-clone', '');
          track.appendChild(clone);
        });
      }
      var perCard = window.matchMedia('(max-width: 760px)').matches ? 8 : 10.4;   // seconds, as in the prototype
      rail.style.setProperty('--pl-marq-duration', (originals.length * copies * perCard).toFixed(1) + 's');
      rail.scrollLeft = 0;
      rail.classList.add('is-marquee');
      if (pauseBtn) pauseBtn.hidden = false;
    }

    function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 200); }
    function onMotion() { build(); }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        userPaused = !userPaused;
        rail.classList.toggle('is-paused', userPaused);
        pauseBtn.setAttribute('aria-pressed', String(userPaused));
        pauseBtn.textContent = userPaused ? 'Play reviews' : 'Pause reviews';
      });
    }
    window.addEventListener('resize', onResize);
    if (motion.addEventListener) motion.addEventListener('change', onMotion);
    build();

    rail.__plTeardown = function () {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      if (motion.removeEventListener) motion.removeEventListener('change', onMotion);
      rail.__plTeardown = null;
    };
  }

  function initAll(scope) { (scope || document).querySelectorAll('[data-pl-revrail]').forEach(init); }

  initAll();
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  document.addEventListener('shopify:section:unload', function (e) {
    e.target.querySelectorAll('[data-pl-revrail]').forEach(function (r) { if (r.__plTeardown) r.__plTeardown(); });
  });
})();
