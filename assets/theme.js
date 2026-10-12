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

  /* ── KO / EN language switch ──────────────────────────────────────────
     Data: any field "x" with a sibling "x_en" is swapped in when lang=en
     (done by wrapping fetch for data/*.json, so pages need no changes).
     UI: fixed Korean labels are replaced from the dictionary below. */
  var LANG = (function () {
    try { var s = localStorage.getItem('omi-lang'); if (s === 'ko' || s === 'en') return s; } catch (e) {}
    return /^ko\b/i.test(navigator.language || '') ? 'ko' : 'en';
  })();
  document.documentElement.lang = LANG;

  function swapEn(o) {
    if (Array.isArray(o)) { o.forEach(swapEn); return o; }
    if (o && typeof o === 'object') {
      Object.keys(o).forEach(function (k) {
        if (/_en$/.test(k)) return;
        var en = o[k + '_en'];
        if (en != null && (typeof en === 'string' ? en : en.length)) o[k] = en;
        else swapEn(o[k]);
      });
    }
    return o;
  }
  if (LANG === 'en' && window.fetch) {
    var _fetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : (input && input.url) || '';
      var p = _fetch(input, init);
      if (!/(^|\/)data\/[^/?]+\.json(\?|$)/.test(url)) return p;
      return p.then(function (r) {
        if (!r.ok) return r;
        return r.clone().json().then(function (obj) {
          return new Response(JSON.stringify(swapEn(obj)), { status: r.status, statusText: r.statusText, headers: r.headers });
        }, function () { return r; });
      });
    };
  }

  var UI_EN = [
    ['프로젝트 검증일 180일 초과', 'Project verification older than 180 days'],
    ['검증 계약 기준점 (Drillship/Semi-sub 중심 · Jack-up 관측치 미반영)', 'Verified contract fixtures (mainly drillship/semisub · jack-up observations not included)'],
    ['기준 · Jack-up 제외 · 평균 dayrate', 'basis · excl. jack-ups · average dayrate'],
    ['는 반기(H1/FY) 보고서에서만 공개', ' is disclosed only in half-year (H1/FY) reports'],
    ['로컬 서버로 실행하세요:', 'Run via a local server:'],
    ['데이터 로드 실패:', 'Failed to load data:'],
    ['데이터 로딩 중...', 'Loading data...'],
    ['검색 결과가 없습니다', 'No results found'],
    ['필터 초기화', 'Reset filters'],
    ['원문 기사', 'Original article'],
    ['재확인 필요', 'Needs re-check'],
    ['주요 내용 없음', 'No highlights'],
    ['주요 보유 설비', 'Key assets'],
    ['주요 특징 / 기자재', 'Key features / equipment'],
    ['주요 특징', 'Key features'],
    ['주요 고객', 'Key customers'],
    ['주요 리그', 'Key rigs'],
    ['금융 / 계약 구조', 'Financing / contract structure'],
    ['계약 / 금융 구조', 'Contract / financing structure'],
    ['가스 처리 용량', 'Gas processing capacity'],
    ['처리 용량', 'Processing capacity'],
    ['저장 용량', 'Storage capacity'],
    ['지분 구조', 'Ownership'],
    ['선형 / 선체', 'Design / hull'],
    ['계류 방식', 'Mooring'],
    ['실적 공개 일정', 'Results calendar'],
    ['각 사 최신 기준)', 'latest per company)'],
    ['건조 진행률', 'Construction progress'],
    ['시추 수요:', 'Drilling demand:'],
    ['인도 연도', 'Delivery year'],
    ['누적 인도', 'Cumulative deliveries'],
    ['임대 운영', 'Leased & operated'],
    ['건조 중', 'Under construction'],
    ['생산 중', 'In production'],
    ['설립연도', 'Founded'],
    ['직원 수', 'Employees'],
    ['신용등급', 'Credit rating'],
    ['시가총액', 'Market cap'],
    ['설비명', 'Unit'],
    ['발주사', 'Client'],
    ['리그명', 'Rig'],
    ['본사', 'HQ'],
    ['지역', 'Region'],
    ['수심', 'Water depth'],
    ['상태', 'Status'],
    ['유형', 'Type'],
    ['용량', 'Capacity'],
    ['일자', 'Date']
  ];
  var HANGUL = /[가-힣]/;
  function trText(s) {
    for (var i = 0; i < UI_EN.length; i++) if (s.indexOf(UI_EN[i][0]) !== -1) s = s.split(UI_EN[i][0]).join(UI_EN[i][1]);
    return s;
  }
  function trTree(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) if (HANGUL.test(n.nodeValue) && !(n.parentNode && /^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))) list.push(n);
    list.forEach(function (t) { var v = trText(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; });
  }
  function startUiTranslate() {
    if (LANG !== 'en' || !document.body) return;
    trTree(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') { if (HANGUL.test(m.target.nodeValue)) trTree(m.target.parentNode || m.target); return; }
        m.addedNodes.forEach(function (nd) {
          if (nd.nodeType === 3) { if (HANGUL.test(nd.nodeValue)) nd.nodeValue = trText(nd.nodeValue); }
          else if (nd.nodeType === 1) trTree(nd);
        });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function addLangToggle() {
    var host = document.querySelector('.header-right') || document.querySelector('.header');
    if (!host || host.querySelector('.omi-lang')) return;
    var g = document.createElement('div');
    g.className = 'omi-lang';
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', 'Language');
    ['ko', 'en'].forEach(function (l) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = l === 'ko' ? '한' : 'EN';
      b.title = l === 'ko' ? '한국어' : 'English';
      b.setAttribute('aria-pressed', String(l === LANG));
      b.addEventListener('click', function () {
        if (l === LANG) return;
        try { localStorage.setItem('omi-lang', l); } catch (e) {}
        location.reload();
      });
      g.appendChild(b);
    });
    host.appendChild(g);
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
  function boot() { decorate(); addLangToggle(); tidyMeta(); startUiTranslate(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
