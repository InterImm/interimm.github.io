// Live Mars clock on the home page (NASA Mars24 algorithm, Allison & McEwen 2000).
(() => {
  const el = document.querySelector('[data-mars-clock]');
  if (!el) return;
  const mtc = el.querySelector('[data-mtc]');
  const msd = el.querySelector('[data-msd]');
  const utc = el.querySelector('[data-utc]');
  const TT_MINUS_UTC = 37 + 32.184; // TAI-UTC (leap seconds since 2017) + TT-TAI, in seconds
  const pad = (n) => String(Math.floor(n)).padStart(2, '0');
  const hms = (hours) => {
    const s = hours * 3600;
    return `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;
  };
  const tick = () => {
    const now = Date.now();
    const jdTT = now / 86400000 + 2440587.5 + TT_MINUS_UTC / 86400;
    const sol = (jdTT - 2405522.0028779) / 1.0274912517;
    mtc.textContent = hms((((sol % 1) + 1) % 1) * 24);
    msd.textContent = sol.toFixed(5);
    utc.textContent = new Date(now).toISOString().slice(11, 19);
  };
  tick();
  setInterval(tick, 1000);
})();
