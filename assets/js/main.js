// Home page instrument: today's positions of Earth and Mars and when a message
// sent now reaches Isidis. The astronomy lives in the kit (window.InterImm.astro),
// which also keeps the distance and delay readings live.
(() => {
  const root = document.querySelector('[data-instrument]');
  const astro = window.InterImm && window.InterImm.astro;
  if (!root || !astro) return;

  const SCALE = 100; // svg units per AU; y is flipped so ecliptic north is up
  const pt = ([x, y]) => [x * SCALE, -y * SCALE];

  // Orbits: trace one full revolution through the mean anomaly.
  ['earth', 'mars'].forEach((planet) => {
    const now = Date.now();
    let d = '';
    for (let k = 0; k <= 180; k += 1) {
      const [x, y] = pt(astro.position(planet, now, k * 2 - 180));
      d += `${k ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    root.querySelector(`[data-orbit="${planet}"]`).setAttribute('d', `${d}Z`);
  });

  const beam = root.querySelector('[data-beam]');
  const utc = root.querySelector('[data-arrive-utc]');
  const mtc = root.querySelector('[data-arrive-mtc]');

  const draw = () => {
    const now = Date.now();
    const pos = { earth: pt(astro.position('earth', now)), mars: pt(astro.position('mars', now)) };
    Object.entries(pos).forEach(([planet, [x, y]]) => {
      const dot = root.querySelector(`[data-planet="${planet}"]`);
      dot.setAttribute('cx', x);
      dot.setAttribute('cy', y);
      const r = Math.hypot(x, y) || 1;
      const label = root.querySelector(`[data-planet-label="${planet}"]`);
      label.setAttribute('x', x + (x / r) * 10);
      label.setAttribute('y', y + (y / r) * 10 + 3);
      label.setAttribute('text-anchor', x >= 0 ? 'start' : 'end');
    });
    beam.setAttribute('x1', pos.earth[0]);
    beam.setAttribute('y1', pos.earth[1]);
    beam.setAttribute('x2', pos.mars[0]);
    beam.setAttribute('y2', pos.mars[1]);

    const arrive = now + astro.distance(now) * astro.AU_LIGHT_S * 1000;
    utc.textContent = new Date(arrive).toISOString().slice(11, 19);
    mtc.textContent = astro.mtc(arrive);
  };
  draw();
  setInterval(draw, 1000);
})();
