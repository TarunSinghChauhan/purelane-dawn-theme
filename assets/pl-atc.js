/* Progressive-enhancement add to cart for form[data-pl-atc].
   Without JS (or if anything fails) the form posts to /cart/add as normal.
   With Dawn's cart-drawer / cart-notification present, it reuses their renderContents() so the
   header bubble and drawer update exactly like Dawn's own product form. */
(function () {
  if (window.__plAtc) return;
  window.__plAtc = true;

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.matches || !form.matches('form[data-pl-atc]')) return;
    if (!window.fetch || !window.routes || !window.routes.cart_add_url) return;

    event.preventDefault();
    var button = form.querySelector('button[type="submit"]');
    var status = form.querySelector('[data-pl-atc-status]');
    var label = button ? button.textContent : '';
    if (button) { button.setAttribute('aria-busy', 'true'); button.disabled = true; button.textContent = 'Adding…'; }

    var cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    var body = new FormData(form);
    if (cart && cart.getSectionsToRender) {
      body.append('sections', cart.getSectionsToRender().map(function (s) { return s.id; }));
      body.append('sections_url', window.location.pathname);
    }

    fetch(window.routes.cart_add_url, {
      method: 'POST',
      headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/javascript' },
      body: body
    })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        if (json.status) throw new Error(json.description || json.message || 'Could not add to cart');
        if (cart && cart.renderContents) cart.renderContents(json);
        if (status) status.textContent = 'Added to cart';
      })
      .catch(function (err) {
        if (status) status.textContent = err && err.message ? err.message : 'Could not add to cart';
      })
      .finally(function () {
        if (button) { button.removeAttribute('aria-busy'); button.disabled = false; button.textContent = label; }
      });
  });
})();
