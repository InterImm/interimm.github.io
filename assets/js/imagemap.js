// Renders the `imagemap` shortcode: a Leaflet map over a flat image with
// clickable markers. Marker data comes from the page's front matter.
(() => {
  const el = document.getElementById('imagemap');
  const source = document.getElementById('imagemap-markers');
  if (!el || !source || !window.L) return;

  const markers = JSON.parse(source.textContent);
  const width = Number(el.dataset.width);
  const height = Number(el.dataset.height);
  const bounds = [[0, 0], [height, width]];

  const map = L.map(el, {
    crs: L.CRS.Simple,
    attributionControl: false,
    scrollWheelZoom: false, // don't hijack page scrolling until the map is focused
  });
  L.imageOverlay(el.dataset.image, bounds, { alt: el.dataset.alt }).addTo(map);
  map.fitBounds(bounds);
  map.on('focus', () => map.scrollWheelZoom.enable());
  map.on('blur', () => map.scrollWheelZoom.disable());

  const pin = L.divIcon({
    className: 'map-pin',
    html: '<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true"><circle cx="14" cy="14" r="13" fill="#b0441c" stroke="#fff" stroke-width="2"/><path d="M14 5.5l2.6 5.7 6.2.7-4.6 4.2 1.3 6.1L14 19l-5.5 3.2 1.3-6.1-4.6-4.2 6.2-.7z" fill="#fff"/></svg>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

  const popupFor = (m) => {
    const box = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = m.name;
    const text = document.createElement('p');
    text.textContent = m.description;
    box.append(title, text);
    if (m.link) {
      const a = document.createElement('a');
      a.href = m.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = m.link.replace(/^\w+:\/\//, '').replace(/\/$/, '');
      a.setAttribute('aria-label', `${a.textContent} ${el.dataset.newTab}`);
      box.append(a);
    }
    return box;
  };

  markers.forEach((m) => {
    L.marker(m.position, { icon: pin, title: m.name, alt: m.name, riseOnHover: true })
      .bindPopup(popupFor(m), { maxWidth: 320 })
      .addTo(map);
  });
})();
