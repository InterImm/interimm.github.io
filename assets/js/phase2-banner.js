// Close button for the phase 2 notice. The choice is kept in localStorage so
// the notice stays closed on every page of the site.
(function () {
  const banner = document.querySelector('.phase2-banner');
  const close = banner && banner.querySelector('.phase2-close');
  if (!close) return;
  close.addEventListener('click', function () {
    try { localStorage.setItem('interimm-phase2-banner', 'dismissed'); } catch (e) { /* private mode: closes for this page only */ }
    document.documentElement.classList.add('phase2-dismissed');
    const brand = document.querySelector('.site-header .brand');
    if (brand) brand.focus({ preventScroll: true });
  });
})();
