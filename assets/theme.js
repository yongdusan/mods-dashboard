/* Offshore Market Intelligence — shared runtime theming.
   Loaded in <head> right after Chart.js so defaults apply before any page chart is built. */
(function () {
  var T = {
    foam: '#e6edf2', silt: '#8a9bae', line: 'rgba(40,67,96,.55)', hull2: '#102134',
    body: "'IBM Plex Sans', 'IBM Plex Sans KR', system-ui, sans-serif",
    mono: "'IBM Plex Mono', 'IBM Plex Sans KR', ui-monospace, monospace"
  };

  if (window.Chart) {
    var d = Chart.defaults;
    d.font.family = T.body;
    d.font.size = 11;
    d.color = T.silt;
    d.borderColor = T.line;
    d.animation = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? false : { duration: 700, easing: 'easeOutQuart' };
    d.elements.line.tension = 0.32;
    d.elements.line.borderWidth = 2;
    d.elements.point.radius = 0;
    d.elements.point.hoverRadius = 5;
    d.elements.point.hitRadius = 12;
    d.elements.bar.borderRadius = 1;
    d.plugins.legend.labels.usePointStyle = true;
    d.plugins.legend.labels.pointStyle = 'rectRounded';
    d.plugins.legend.labels.boxWidth = 8;
    d.plugins.legend.labels.boxHeight = 8;
    d.plugins.legend.labels.padding = 14;
    d.plugins.legend.labels.color = T.silt;
    var tt = d.plugins.tooltip;
    tt.backgroundColor = T.hull2;
    tt.borderColor = 'rgba(40,67,96,1)';
    tt.borderWidth = 1;
    tt.titleColor = T.foam;
    tt.bodyColor = T.foam;
    tt.titleFont = { family: T.mono, size: 11, weight: '600' };
    tt.bodyFont = { family: T.body, size: 12 };
    tt.padding = 10;
    tt.cornerRadius = 2;
    tt.boxPadding = 4;
    tt.usePointStyle = true;
    ['category', 'linear', 'time', 'logarithmic'].forEach(function (k) {
      var s = d.scales && d.scales[k];
      if (!s) return;
      s.grid = Object.assign({}, s.grid, { color: 'rgba(40,67,96,.35)', tickColor: 'transparent' });
      s.border = Object.assign({}, s.border, { color: 'rgba(40,67,96,.8)' });
      s.ticks = Object.assign({}, s.ticks, { color: T.silt, font: { family: T.mono, size: 10.5 } });
    });
  }

  if (!document.querySelector('link[rel="icon"]')) {
    var ic = document.createElement('link');
    ic.rel = 'icon';
    ic.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%2306101b'/%3E%3Ccircle cx='16' cy='16' r='11' fill='none' stroke='%23284360' stroke-width='2'/%3E%3Cpath d='M16 6l3 10-3 10-3-10z' fill='%23ff7a3d'/%3E%3C/svg%3E";
    document.head.appendChild(ic);
  }

  function decorate() {
    var h1 = document.querySelector('.header-title h1');
    if (h1 && !h1.querySelector('a')) {
      var a = document.createElement('a');
      a.href = 'index.html';
      a.setAttribute('aria-label', 'Overview');
      a.textContent = h1.textContent;
      h1.textContent = '';
      h1.appendChild(a);
    }
    if (!document.querySelector('.omi-footer')) {
      var f = document.createElement('footer');
      f.className = 'omi-footer';
      f.innerHTML =
        '<span>Offshore Market Intelligence · deepwater drilling, FPSO/FLNG and E&amp;P capex</span>' +
        '<span>Sources: company IR, contract disclosures, trade press. Figures marked indicative are estimates.</span>';
      document.body.appendChild(f);
    }
  }
  function tidyMeta() {
    var m = document.getElementById('header-meta');
    if (!m) return;
    var page = (location.pathname.split('/').pop() || 'index.html').replace(/\?.*$/, '');
    var cadence = { 'pipeline.html': 40, 'drilling.html': 14, 'fpso.html': 40, 'earnings.html': 100, 'fpso_earnings.html': 100, 'news.html': 10 }[page];
    var fix = function () {
      Array.prototype.forEach.call(m.querySelectorAll('span, div'), function (el) {
        if (/^\s*(last\s+)?updated\s*:?\s*$/i.test(el.textContent)) el.classList.add('label');
      });
      var hit = (m.textContent || '').match(/\d{4}-\d{2}-\d{2}/);
      if (!cadence || !hit || m.querySelector('.omi-overdue')) return;
      var age = Math.floor((Date.now() - new Date(hit[0] + 'T00:00:00').getTime()) / 864e5);
      if (age > cadence) {
        m.classList.add('is-overdue');
        var b = document.createElement('span');
        b.className = 'omi-overdue';
        b.title = 'Data last updated ' + age + ' days ago (refresh cadence ' + cadence + ' days)';
        b.textContent = 'overdue';
        m.appendChild(b);
      }
    };
    fix();
    new MutationObserver(fix).observe(m, { childList: true, subtree: true });
  }
  function boot() { decorate(); tidyMeta(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
