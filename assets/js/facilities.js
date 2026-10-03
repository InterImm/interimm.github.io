// City pages: refresh the facility readings from the live Mars Open Facilities
// index. The section lists the data URLs to try in order (data-facilities).
(() => {
  const root = document.querySelector('[data-facilities]');
  if (!root) return;
  const urls = JSON.parse(root.dataset.facilities || '[]');
  const fmt = (v) => (v == null ? '–' : Number(v).toLocaleString(document.documentElement.lang, { maximumFractionDigits: 1, minimumFractionDigits: 1 }));

  const apply = (index) => {
    index.facilities.forEach((f) => {
      const item = root.querySelector(`[data-facility="${CSS.escape(f.id)}"]`);
      if (!item) return;
      const status = item.querySelector('[data-status]');
      if (status) {
        status.dataset.status = f.status;
        status.textContent = status.getAttribute(`data-label-${f.status}`) || f.status;
      }
      (f.kpis || []).forEach((k) => {
        const v = item.querySelector(`[data-kpi="${CSS.escape(k.tag)}"] [data-value]`);
        if (v) v.textContent = fmt(k.value);
      });
    });
  };

  const load = async () => {
    for (const url of urls) {
      try {
        const r = await fetch(url, { cache: 'no-cache' });
        if (r.ok) return apply(await r.json());
      } catch { /* try the next source */ }
    }
    return undefined;
  };
  load();
  setInterval(load, 10 * 60 * 1000);
})();
