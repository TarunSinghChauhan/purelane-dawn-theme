/* Hero: product-stage rotation (1 -> 2 -> 3 products) and the scroll / pointer parallax on the stage.
   One instance per [data-pl-hero]; re-initialised on shopify:section:load and torn down on unload,
   so the editor can add, remove, reorder and reconfigure the section without stray timers or listeners. */
(function () {
  if (window.__plHero) return;
  window.__plHero = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(root) {
    var stage = root.querySelector('[data-pl-stage]');
    if (!stage || root.__plTeardown) return;

    var slides = [].slice.call(stage.querySelectorAll('.pl-hslide'));
    var dots = [].slice.call(root.querySelectorAll('[data-pl-dot]'));
    var pauseBtn = root.querySelector('[data-pl-pause]');
    var prod = root.querySelector('[data-pl-prod]');
    var interval = (parseInt(stage.getAttribute('data-interval'), 10) || 4) * 1000;
    var autoplay = stage.getAttribute('data-autoplay') === 'true' && !reduce && slides.length > 1;

    var index = 0, timer = null, hovering = false, userPaused = false, inView = true;
    var raf = null, mx = 0, my = 0;
    var cleanups = [];

    function on(target, type, fn, opts) {
      target.addEventListener(type, fn, opts);
      cleanups.push(function () { target.removeEventListener(type, fn, opts); });
    }

    /* ---- slides ---- */
    function go(n) {
      index = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        s.classList.toggle('is-on', i === index);
        s.setAttribute('aria-hidden', i === index ? 'false' : 'true');
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-on', i === index);
        d.setAttribute('aria-current', i === index ? 'true' : 'false');
      });
    }
    function sync() {
      var shouldRun = autoplay && !userPaused && !hovering && inView;
      if (shouldRun && !timer) timer = setInterval(function () { go(index + 1); }, interval);
      if (!shouldRun && timer) { clearInterval(timer); timer = null; }
      stage.setAttribute('aria-live', shouldRun ? 'off' : 'polite');
    }
    dots.forEach(function (d, i) { on(d, 'click', function () { go(i); }); });
    if (pauseBtn) {
      on(pauseBtn, 'click', function () {
        userPaused = !userPaused;
        pauseBtn.setAttribute('aria-pressed', String(userPaused));
        pauseBtn.textContent = userPaused ? 'Play slideshow' : 'Pause slideshow';
        sync();
      });
    }
    on(stage, 'mouseenter', function () { hovering = true; sync(); });
    on(stage, 'mouseleave', function () { hovering = false; sync(); });
    on(stage, 'focusin', function () { hovering = true; sync(); });
    on(stage, 'focusout', function () { hovering = false; sync(); });

    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { inView = e.isIntersecting; sync(); });
      }, { threshold: 0.2 });
      io.observe(stage);
      cleanups.push(function () { io.disconnect(); });
    }
    go(0);
    sync();

    /* ---- parallax on the stage (transform + opacity only) ---- */
    if (prod && !reduce) {
      var wide = window.matchMedia('(min-width: 1024px)').matches;
      var frame = function () {
        raf = null;
        var y = window.pageYOffset || 0;
        var f = Math.min(y / 700, 1);
        prod.style.transform = 'translate3d(' + (mx * -16).toFixed(2) + 'px,' + (-f * 54 + my * -10).toFixed(2) + 'px,0) scale(' + (1 - f * 0.06).toFixed(3) + ')';
        prod.style.opacity = (1 - f * 0.55).toFixed(3);
      };
      var request = function () { if (!raf) raf = requestAnimationFrame(frame); };
      on(window, 'scroll', request, { passive: true });
      if (wide) {
        on(window, 'mousemove', function (e) {
          mx = (e.clientX / window.innerWidth - 0.5) * 2;
          my = (e.clientY / window.innerHeight - 0.5) * 2;
          request();
        }, { passive: true });
      }
      frame();
    }

    root.__plTeardown = function () {
      if (timer) clearInterval(timer);
      if (raf) cancelAnimationFrame(raf);
      cleanups.forEach(function (fn) { fn(); });
      root.__plTeardown = null;
    };
  }

  function initAll(scope) {
    (scope || document).querySelectorAll('[data-pl-hero]').forEach(init);
  }

  initAll();
  document.addEventListener('shopify:section:load', function (e) { initAll(e.target); });
  document.addEventListener('shopify:section:unload', function (e) {
    e.target.querySelectorAll('[data-pl-hero]').forEach(function (r) { if (r.__plTeardown) r.__plTeardown(); });
  });
})();
