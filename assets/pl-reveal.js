/* Scroll reveal for .pl-rv elements. Loaded (deferred) by every pl-* section; idempotent.
   - Theme editor: everything is shown immediately, and re-scanned when a section is (re)loaded,
     so adding / reordering / editing sections never leaves content stuck invisible.
   - Reduced motion or no IntersectionObserver: shown immediately. */
(function () {
  if (window.__plReveal) return;
  window.__plReveal = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = null;

  function show(el) { el.classList.add('is-in'); }

  function scan(root) {
    var els = (root || document).querySelectorAll('.pl-rv:not(.is-in)');
    if (!els.length) return;
    var designMode = window.Shopify && window.Shopify.designMode;
    if (reduce || designMode || !('IntersectionObserver' in window)) {
      els.forEach(show);
      return;
    }
    io = io || new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }

  scan();
  document.addEventListener('shopify:section:load', function (e) { scan(e.target); });
})();
