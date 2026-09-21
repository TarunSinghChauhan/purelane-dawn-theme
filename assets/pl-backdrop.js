/* Backdrop: picks the depth scene from whichever [data-pl-scene] section crosses the middle of the viewport,
   and drifts the water layers with scroll / pointer. The prototype re-measured every section's offsetTop on every
   scroll frame; an IntersectionObserver does the same job without forcing layout. */
(function () {
  if (window.__plBackdrop) return;
  window.__plBackdrop = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = null, scenes = [], layers = [], io = null, current = 1;
  var raf = null, mx = 0, my = 0, bound = false;

  function setScene(n) {
    if (!root || n === current) return;
    current = n;
    scenes.forEach(function (s, i) { s.classList.toggle('is-on', i + 1 === n); });
    root.setAttribute('data-d', String(n));
  }

  function observeZones() {
    if (io) io.disconnect();
    if (!('IntersectionObserver' in window)) return;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setScene(parseInt(e.target.getAttribute('data-pl-scene'), 10) || 1);
      });
    }, { rootMargin: '-49.9% 0px -49.9% 0px', threshold: 0 });
    document.querySelectorAll('[data-pl-scene]').forEach(function (z) { io.observe(z); });
  }

  var depth = [0.05, 0.09, 0.03, 0.02];
  function frame() {
    raf = null;
    var y = window.pageYOffset || 0;
    for (var i = 0; i < layers.length; i++) {
      var d = depth[i] || 0.05;
      layers[i].style.setProperty('--px', (mx * d * 130).toFixed(1) + 'px');
      layers[i].style.setProperty('--py', (-y * d + my * d * 90).toFixed(1) + 'px');
    }
  }
  function request() { if (!raf) raf = requestAnimationFrame(frame); }
  function onMove(e) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
    request();
  }

  function init() {
    root = document.querySelector('[data-pl-backdrop]');
    if (!root) return;
    scenes = [].slice.call(root.querySelectorAll('.pl-scene'));
    layers = [].slice.call(root.querySelectorAll('.pl-wl'));
    current = parseInt(root.getAttribute('data-d'), 10) || 1;
    observeZones();
    if (!reduce && !root.hasAttribute('data-static') && !bound) {
      bound = true;
      window.addEventListener('scroll', request, { passive: true });
      if (window.matchMedia('(min-width: 1024px)').matches) window.addEventListener('mousemove', onMove, { passive: true });
      frame();
    }
  }

  init();
  document.addEventListener('shopify:section:load', function () { init(); });
  document.addEventListener('shopify:section:unload', function () { setTimeout(observeZones, 0); });
})();
