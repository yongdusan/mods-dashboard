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
  /* The page chrome is written in English; in Korean mode whole labels are
     swapped from this table (exact match on the trimmed text node, so names
     of companies, projects and fields are never touched). Industry terms that
     Korean practitioners use as-is (FPSO, FEED, FID, Drillship…) stay English. */
  var UI_KO = {
    // header / nav / footer
    'Deepwater offshore market dashboard': '심해 해양 시장 대시보드',
    'Overview': '개요', 'Pipeline': '파이프라인', 'Drilling': '시추 리그', 'FPSO & FLNG': 'FPSO·FLNG',
    'Driller Financials': '시추사 실적', 'FPSO Financials': 'FPSO 실적', 'News': '뉴스',
    'Updated': '갱신', 'Updated:': '갱신:',
    'Offshore Market Intelligence · deepwater drilling, FPSO/FLNG and E&P capex': 'Offshore Market Intelligence · 심해 시추, FPSO/FLNG, E&P 투자',
    // overview
    'Market readout': '시장 요약',
    'of offshore projects in execution.': '규모 해양 프로젝트가 실행 중.',
    'of deepwater rigs on contract.': '~의 심해 리그가 계약 중.',
    'FPSO/FLNG units under construction.': '~척의 FPSO/FLNG가 건조 중.',
    'Deepwater drilling, floating production and offshore E&P capex, tracked from operator IR, contract disclosures and trade press. Project capex uses operator figures where published and indicative estimates otherwise. Each figure carries its as-of date; overdue sources are flagged.':
      '심해 시추, 부유식 생산설비, 해양 E&P 투자를 운영사 IR·계약 공시·전문지 기준으로 추적합니다. 프로젝트 사업비는 공시값이 있으면 공시값, 없으면 추정치입니다. 수치마다 기준일을 표시하고 갱신이 늦은 출처는 따로 표시합니다.',
    'UDW drillship dayrate': 'UDW 드릴십 일일 용선료', 'indicative': '추정', 'k/day': 'k/일',
    'Drillship UDW': 'Drillship UDW', 'Semi-sub DW': 'Semi-sub DW',
    'Pre-FID pipeline': 'FID 전 파이프라인', 'Deepwater rigs': '심해 리그', 'Avg drillship rate': '드릴십 평균 용선료',
    'Global FPSO fleet': '전 세계 FPSO 선대', 'units': '척', 'Tracked orderbook': '추적 중인 오더북', 'floaters': '척',
    'Dashboards': '대시보드', 'Demand → assets → contractor financials → news': '수요 → 설비 → 컨트랙터 실적 → 뉴스',
    'Demand': '수요', 'E&P Pipeline': 'E&P 파이프라인', 'projects': '건', 'Assets': '설비',
    'Offshore projects by phase, region and operator capex; FID and first-oil timing.': '단계·지역·운영사별 해양 프로젝트 사업비, FID와 첫 생산 시점.',
    'Deepwater Drilling': '심해 시추', 'rigs': '척',
    'Drillship and semi-sub fleet status, contract coverage and dayrates.': '드릴십·반잠수식 리그 가동 현황, 계약 커버리지, 용선료.',
    'FPSO / FLNG Assets': 'FPSO / FLNG 설비',
    'Operating floaters, orderbook and charter rates by contractor.': '컨트랙터별 운영 선박, 오더북, 용선료.',
    'Financials': '실적', 'Drilling Financials': '시추사 실적', 'companies': '개사',
    'Contractor revenue, EBITDA margin, utilisation and backlog by quarter.': '컨트랙터 분기별 매출, EBITDA 마진, 가동률, 수주잔고.',
    'FPSO / FLNG Financials': 'FPSO / FLNG 실적',
    'Lessor earnings, lease fleet, turnkey exposure and backlog.': '리스사 실적, 리스 선대, 턴키 비중, 수주잔고.',
    'Wire': '뉴스', 'Market News': '시장 뉴스', 'Contracts, FIDs, M&A and earnings, filtered by sector.': '계약·FID·M&A·실적 뉴스, 분야별 필터.',
    'items': '건', 'Project funnel': '프로젝트 단계별 분포', 'Open E&P pipeline →': 'E&P 파이프라인 열기 →',
    'capex · count': '사업비 · 건수', 'Execution capex by region': '지역별 실행 단계 사업비',
    'Largest pre-FID projects (FEED)': 'FID 전 대형 프로젝트 (FEED)', 'Latest from the wire': '최근 뉴스', 'All market news →': '뉴스 전체 보기 →',
    'Deepwater drilling': '심해 시추', 'E&P capex': 'E&P 투자',
    // pipeline
    'E&P Pipeline · IOC/NOC Upstream CAPEX · FID Tracking': 'E&P 파이프라인 · IOC/NOC 업스트림 투자 · FID 추적',
    'Offshore E&P Pipeline': '해양 E&P 파이프라인', 'Active Pipeline': '진행 중 파이프라인', 'EPC Demand Pipeline': 'EPC 수요 파이프라인',
    'FID Imminent': 'FID 임박', 'FEED phase · FID targeted': 'FEED 단계 · FID 목표', 'Upstream CAPEX 2026E by Company': '회사별 2026E 업스트림 투자',
    'Upstream 2026E': '업스트림 2026E', 'Phase × Region Matrix': '단계 × 지역 매트릭스', 'Region \\ Phase': '지역 \\ 단계',
    'EPC Demand Detail': 'EPC 수요 상세', 'Regional CAPEX Breakdown': '지역별 사업비', 'Sanctioned (Execution)': '승인 (Execution)',
    'Pre-FID est. (FEED)': 'FID 전 추정 (FEED)', 'Annual EPC Spend Profile (est. linear)': '연도별 EPC 집행 추정 (선형 배분)',
    'Sanctioned': '승인', 'Pre-FID (indicative)': 'FID 전 (추정)', 'Projects': '프로젝트', 'Project': '프로젝트',
    'Company': '회사', 'Region': '지역', 'Phase': '단계', 'CAPEX ($B)': '사업비 ($B)', 'First Production': '첫 생산',
    'Type': '유형', 'Verified': '확인일', 'All': '전체', 'Notes': '비고', 'Note': '비고', 'Source': '출처',
    'Update log': '업데이트 기록',
    // drilling
    'UDW & Deepwater Drilling — Fleet, Dayrate & Asset Values': 'UDW·심해 시추 — 선대, 용선료, 자산가치',
    'UDW / Deepwater Rig Market': 'UDW / 심해 리그 시장', 'Deepwater Rigs': '심해 리그', 'Deepwater focus': '심해 중심',
    'On Contract': '계약 중', 'Filtered view': '필터 적용', 'Idle + Stacked': '유휴 + 스택',
    'Avg Dayrate (UDW Drillship)': '평균 용선료 (UDW 드릴십)', 'US$k/day': 'US$k/일', 'Global · not filtered': '전체 · 필터 미적용',
    'Deepwater Contractor Summary': '심해 컨트랙터 요약', 'Contractor': '컨트랙터', 'Drillships': '드릴십', 'Semi-subs': '반잠수식',
    'Contracted': '계약', 'Utilization': '가동률', 'Avg Dayrate (US$k/d)': '평균 용선료 (US$k/일)',
    'RIG TYPE': '리그 유형', 'CONTRACTOR': '컨트랙터', 'Deepwater': '심해', 'All MODU': '전체 MODU',
    'Fleet Status': '선대 현황', 'Rig Name': '리그명', 'Status': '상태', 'Operator': '운영사', 'Location': '위치',
    'Start': '시작', 'End': '종료', 'Dayrate (US$k/d)': '용선료 (US$k/일)', 'Dayrate Trend': '용선료 추이',
    'US$k/day · quarterly': 'US$k/일 · 분기', 'ℹ mixed confidence': 'ℹ 신뢰도 혼재', 'ℹ medium confidence': 'ℹ 신뢰도 중간',
    'Rig': '리그', 'Rate (k$)': '용선료 (k$)', 'MODU Asset Value Benchmarks': 'MODU 자산가치 기준',
    'Newbuild obligations, acquired hulls and cancelled-order transactions.': '신조 잔금, 선체 인수, 발주 취소 선박 거래.',
    'Date': '일자', 'Rig Type': '리그 유형', 'Yard': '조선소', 'Value ($M)': '금액 ($M)', 'Basis': '기준',
    'Idle': '유휴', 'Cold Stacked': '콜드 스택', 'Warm Stacked': '웜 스택', 'Shipyard': '조선소', 'Ultra-deepwater': '초심해',
    'Water Depth': '수심', 'Contract': '계약', 'Specs': '사양', 'Data Note': '데이터 메모', 'Build Year': '건조 연도', 'Design': '설계',
    // fpso
    'FPSO / FLNG — Assets & Orderbook': 'FPSO / FLNG — 설비 및 오더북', '⚠ some figures unverified': '⚠ 일부 수치 미확인',
    'Deepwater FPSO / FLNG Assets': '심해 FPSO / FLNG 설비', 'Active Fleet': '운영 선대', '─ No change': '─ 변동 없음',
    'On Production': '생산 중', 'Under Construction': '건조 중', 'FLNG Active': 'FLNG 운영',
    'Contractor Summary': '컨트랙터 요약', 'Major deepwater FPSO / FLNG lessors & operators': '주요 심해 FPSO / FLNG 리스사·운영사',
    'Fleet': '선대', 'In Operation': '운영 중', 'Newbuilds (Own)': '신조 (자사)', 'Newbuilds (Op.)': '신조 (운영)',
    'Backlog ($B)': '수주잔고 ($B)', 'Notable Vessels': '주요 선박', 'Deepwater production assets — click row for detail': '심해 생산설비 — 행을 누르면 상세',
    'Owner': '소유주', 'Asset': '설비', 'Field / Block': '유전 / 광구', 'Capacity (kboed)': '용량 (kboed)', 'Contract End': '계약 종료',
    '✕ Close': '✕ 닫기', 'Orderbook': '오더북', 'Deepwater / FLNG newbuilds & confirmed orders — click row for detail': '심해 / FLNG 신조 및 확정 발주 — 행을 누르면 상세',
    'Client': '발주사', 'Field / Project': '유전 / 프로젝트', 'Delivery': '인도', 'Contract ($B)': '계약액 ($B)',
    // earnings
    'Deepwater Drilling Contractors — Financials, Fleet Mix & Backlog': '심해 시추 컨트랙터 — 실적, 선대 구성, 수주잔고',
    'Deepwater Drilling Contractor Financials': '심해 시추 컨트랙터 실적', 'Period': '기간', 'Revenue ($M)': '매출 ($M)',
    'Adj. EBITDA ($M)': '조정 EBITDA ($M)', 'EBITDA Margin (%)': 'EBITDA 마진 (%)', 'Utilization (%)': '가동률 (%)',
    'Avg Day Rate (k$)': '평균 용선료 (k$)', 'Revenue & EBITDA Margin — Quarterly': '매출 및 EBITDA 마진 — 분기',
    'All Quarters': '전체 분기', 'Key Highlights': '주요 내용', 'FPSO / FLNG Operators — Financials & Backlog': 'FPSO / FLNG 운영사 — 실적 및 수주잔고',
    '⚠ source URLs pending': '⚠ 출처 URL 확인 중', 'Deepwater FPSO / FLNG Operator Financials': '심해 FPSO / FLNG 운영사 실적',
    'Quarterly earnings · backlog · leased asset overview': '분기 실적 · 수주잔고 · 리스 설비 현황', 'Units on Lease': '리스 선박',
    // news
    'Offshore Market News': '해양 시장 뉴스', 'Sector': '분야', 'Category': '분류', 'Earnings': '실적', 'Outlook': '전망',
    // detail drawers
    'Asset Type': '자산 유형', 'Data Freshness': '확인 시점', 'FID Date': 'FID 일자', 'Current Contract': '현재 계약',
    'Operation Area': '작업 해역', 'Rig Specifications': '리그 사양', 'Dayrate': '용선료', 'Build Yard': '건조 조선소',
    'Generation': '세대', 'Max Drill Depth': '최대 굴착 심도', 'Max Water Depth': '최대 수심', 'BOP Rating': 'BOP 등급', 'DP Class': 'DP 등급',
    'Redeployment': '재배치', 'On Charter': '용선 중', 'Idle/Warm Stacked': '유휴 / 웜 스택',
    '▼ more': '▼ 더보기', '▲ less': '▲ 접기', 'Original article': '원문 기사',
    // subtitles / footer / misc
    'Rigs': '리그', 'Floaters': '부유식 설비',
    'Offshore projects by phase, region and operator capex; FID and first-oil tracking.': '단계·지역·운영사별 해양 프로젝트 사업비, FID와 첫 생산 추적.',
    'Drillship and semi-sub fleet status, contract coverage and dayrate trend.': '드릴십·반잠수식 리그 가동 현황, 계약 커버리지, 용선료 추이.',
    'Operating floaters, orderbook and charter rates by contractor and basin.': '컨트랙터·해역별 운영 선박, 오더북, 용선료.',
    'Newbuild obligations, acquired hulls and cancelled-order transactions': '신조 잔금, 선체 인수, 발주 취소 선박 거래',
    'Sources: company IR, contract disclosures, trade press. Figures marked indicative are estimates.': '출처: 회사 IR, 계약 공시, 전문지. 「추정」 표시 수치는 추정치입니다.',
    'Failed to load data. Please ensure the local server is running and data files exist.': '데이터를 불러오지 못했습니다. 로컬 서버 실행 여부와 데이터 파일을 확인하세요.',
    'Offshore projects · Deepwater, shallow offshore & fixed platforms · IOC/NOC CAPEX · FID and first-oil tracking': '해양 프로젝트 · 심해, 천해, 고정식 플랫폼 · IOC/NOC 투자 · FID와 첫 생산 추적',
    'UDW drillship · deepwater / harsh-environment semi-sub · contract utilization · dayrate · asset values': 'UDW 드릴십 · 심해 / 혹한 해역 반잠수식 · 계약 가동률 · 용선료 · 자산가치',
    'Deepwater floating production · harsh/offshore basins · contractors · orderbook': '심해 부유식 생산설비 · 해역별 · 컨트랙터 · 오더북',
    'Global fleet estimates — Rystad Energy / Westwood Global · Contractor-level data from individual company IR': '전 세계 선대는 Rystad Energy / Westwood Global 추정 · 컨트랙터별 수치는 각 사 IR 기준',
    'Quarterly revenue · adj. EBITDA margin · utilization · average dayrate · backlog — select a company for its quarterly history': '분기 매출 · 조정 EBITDA 마진 · 가동률 · 평균 용선료 · 수주잔고 — 회사를 선택하면 분기별 추이',
    'Market News — Deepwater drilling, FPSO / FLNG, E&P CAPEX, contracts & earnings': '시장 뉴스 — 심해 시추, FPSO / FLNG, E&P 투자, 계약, 실적',
    'Contracts, FIDs, M&A, earnings and outlook across deepwater drilling, FPSO / FLNG and E&P capex · refreshed weekly': '심해 시추, FPSO / FLNG, E&P 투자 분야의 계약·FID·M&A·실적·전망 · 매주 갱신'
  };
  var UI_KO_RE = [
    [/^(\d+) of (\d+) projects$/, '$2건 중 $1건'],
    [/^projects · (\d+) in Production \(excl\.\)$/, '건 · 생산 단계 $1건 제외'],
    [/^(\d+) deepwater rigs$/, '심해 리그 $1척'],
    [/^(\$[\d.]+B) · (\d+) projects$/, '$1 · $2건'],
    [/^\$([\d.]+)B Sanctioned · \$([\d.]+)B Pre-FID$/, '승인 $$$1B · FID 전 $$$2B'],
    [/^(\d+) FEED · (\d+) pre-FEED projects$/, 'FEED $1건 · pre-FEED $2건'],
    [/^(\d+)% contracted$/, '계약률 $1%'],
    [/^(\d+) contracted drillships$/, '계약 드릴십 $1척'],
    [/^(\d+) producing · Rystad\/Westwood est\.$/, '생산 $1척 · Rystad/Westwood 추정'],
    [/^(\d{4}-\d{2}-\d{2}) · overdue$/, '$1 · 갱신 지연'],
    [/^· ([+-]?[\d.]+%) since (\d{4}-\d{2})$/, '· $2 대비 $1'],
    [/^([▲▼]) (\d+) QoQ$/, '$1 전분기 대비 $2'],
    [/^\$([\d.]+)B disclosed \(some undisclosed\)$/, '공시 $$$1B (일부 미공시)'],
    [/^LATEST REPORTED QUARTER — (.+)$/i, '최근 발표 분기 — $1'],
    [/^(.+) · first oil (\d{4})$/, '$1 · 첫 생산 $2'],
    [/^(HIGH|MEDIUM|LOW) confidence$/i, '신뢰도 $1'],
    [/^(\d+) updates?$/, '기록 $1건'],
    [/^today$/, '오늘'], [/^(\d+)d ago$/, '$1일 전'], [/^(\d+)mo ago( ⚠)?$/, '$1개월 전$2']
  ];
  var HANGUL = /[가-힣]/, LATIN = /[A-Za-z]/;
  var NEEDS = LANG === 'en' ? HANGUL : LATIN;
  function trText(s) {
    if (LANG === 'en') {
      for (var i = 0; i < UI_EN.length; i++) if (s.indexOf(UI_EN[i][0]) !== -1) s = s.split(UI_EN[i][0]).join(UI_EN[i][1]);
      return s;
    }
    var core = s.trim();
    if (!core) return s;
    var ko = Object.prototype.hasOwnProperty.call(UI_KO, core) ? UI_KO[core] : null;
    for (var j = 0; ko == null && j < UI_KO_RE.length; j++) if (UI_KO_RE[j][0].test(core)) ko = core.replace(UI_KO_RE[j][0], UI_KO_RE[j][1]);
    if (ko == null) return s;
    if (ko.charAt(0) === '~') { ko = ko.slice(1); s = s.replace(/^\s+/, ''); }
    return s.replace(core, function () { return ko; });
  }
  // Wide letter-spacing made for Latin caps reads as broken Korean words.
  function calmTracking(el) {
    if (LANG !== 'ko' || !el || el.nodeType !== 1 || el.__omiTrack) return;
    el.__omiTrack = 1;
    var ls = parseFloat(getComputedStyle(el).letterSpacing);
    if (ls > 1) el.style.letterSpacing = '0.02em';
  }
  function trAttrs(el) {
    if (LANG !== 'ko' || !el.getAttribute) return;
    ['title', 'aria-label', 'placeholder'].forEach(function (a) {
      var v = el.getAttribute(a);
      if (v && LATIN.test(v)) { var t = trText(v); if (t !== v) el.setAttribute(a, t); }
    });
  }
  function trTree(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) if (NEEDS.test(n.nodeValue) && !(n.parentNode && /^(SCRIPT|STYLE|OPTION|TEXTAREA)$/.test(n.parentNode.nodeName))) list.push(n);
    list.forEach(function (t) { var v = trText(t.nodeValue); if (v !== t.nodeValue) t.nodeValue = v; if (HANGUL.test(t.nodeValue)) calmTracking(t.parentNode); });
    if (LANG === 'ko' && root.querySelectorAll) {
      trAttrs(root);
      root.querySelectorAll('[title],[aria-label],[placeholder]').forEach(trAttrs);
    }
  }
  function startUiTranslate() {
    if (!document.body) return;
    trTree(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        if (m.type === 'characterData') {
          if (NEEDS.test(m.target.nodeValue)) { var v = trText(m.target.nodeValue); if (v !== m.target.nodeValue) m.target.nodeValue = v; }
          if (HANGUL.test(m.target.nodeValue)) calmTracking(m.target.parentNode);
          return;
        }
        m.addedNodes.forEach(function (nd) {
          if (nd.nodeType === 3) { if (NEEDS.test(nd.nodeValue)) { var v2 = trText(nd.nodeValue); if (v2 !== nd.nodeValue) nd.nodeValue = v2; } if (HANGUL.test(nd.nodeValue)) calmTracking(nd.parentNode); }
          else if (nd.nodeType === 1) trTree(nd);
        });
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function addLangToggle() {
    var hdr = document.querySelector('.header-right') || document.querySelector('.header');
    if (!hdr || hdr.querySelector('.omi-lang')) return;
    // Group the "updated" meta and the switch so they position as one unit.
    var host = document.createElement('div');
    host.className = 'omi-tools';
    var meta = hdr.querySelector('.header-meta');
    hdr.appendChild(host);
    if (meta) host.appendChild(meta);
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

  /* ── Notes: separate the description from dated update entries ─────────
     Data notes accumulate entries like "[2026-10-08] …", "[정정 2026-10-08] …",
     "[2026-10-13 audit] …". Tables show only the description; drawers show
     the entries as an update log, newest first. */
  var LOG_TAG = /\[[^\]\d]{0,24}(\d{4}-\d{2}-\d{2})[^\]]{0,40}\]/g;
  function escHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function splitNotes(text) {
    text = String(text || '');
    var marks = [], m;
    LOG_TAG.lastIndex = 0;
    while ((m = LOG_TAG.exec(text))) marks.push({ at: m.index, end: LOG_TAG.lastIndex, date: m[1] });
    if (!marks.length) return { summary: text.trim(), log: [] };
    var log = marks.map(function (mk, i) {
      var body = text.slice(mk.end, i + 1 < marks.length ? marks[i + 1].at : text.length).trim();
      return { date: mk.date, text: body };
    }).filter(function (e) { return e.text; });
    log.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
    return { summary: text.slice(0, marks[0].at).trim(), log: log };
  }
  function logHtml(log) {
    if (!log || !log.length) return '';
    return '<ol class="omi-log">' + log.map(function (e) {
      return '<li><time>' + escHtml(e.date) + '</time><span>' + escHtml(e.text) + '</span></li>';
    }).join('') + '</ol>';
  }
  window.OMI = Object.assign(window.OMI || {}, { splitNotes: splitNotes, logHtml: logHtml, esc: escHtml, lang: LANG });

  /* Short nav labels so the full menu fits; full names stay in title/aria. */
  var NAV_SHORT = {
    'index.html': 'Overview', 'pipeline.html': 'Pipeline', 'drilling.html': 'Drilling',
    'fpso.html': 'FPSO & FLNG', 'earnings.html': 'Driller Financials',
    'fpso_earnings.html': 'FPSO Financials', 'news.html': 'News'
  };
  function shortenNav() {
    var here = (location.pathname.split('/').pop() || 'index.html');
    Array.prototype.forEach.call(document.querySelectorAll('.header-nav .nav-link'), function (a) {
      var key = (a.getAttribute('href') || '').split(/[?#]/)[0] || (a.classList.contains('active') ? here : '');
      var short = NAV_SHORT[key];
      if (!short || a.textContent.trim() === short) return;
      a.title = a.textContent.trim();
      a.setAttribute('aria-label', a.title);
      a.textContent = short;
    });
    // On narrow screens the menu scrolls sideways: bring the current page into view.
    var nav = document.querySelector('.header-nav'), cur = nav && nav.querySelector('.nav-link.active');
    if (nav && cur && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = Math.max(0, cur.offsetLeft - (nav.clientWidth - cur.offsetWidth) / 2);
    }
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
  /* ── "Last 30 days" strip under each page title ──────────────────────────
     Built only from sourced records already in data/: news items for the
     page's sector, ranked up when they name something this page tracks, plus
     a count of dated correction/verification entries in this page's notes.
     Nothing is computed or estimated here. */
  var CHANGES = {
    'pipeline.html': { sector: ['E&P/CAPEX'], files: ['pipeline'], weak: true,
      names: function (d) { return d.pipeline.projects.map(function (p) { return { n: p.project, c: p.company }; }); },
      notes: function (d) { return d.pipeline.projects.map(function (p) { return p.notes; }); } },
    'drilling.html': { sector: ['Drilling'], files: ['fleet'],
      names: function (d) { return d.fleet.rigs.map(function (r) { return { n: r.name, c: r.contractor }; }); },
      notes: function (d) { return d.fleet.rigs.map(function (r) { return r.data_note; }); } },
    'fpso.html': { sector: ['FPSO/FLNG'], files: ['fpso'],
      names: function (d) { return d.fpso.vessels.concat(d.fpso.orderbook).map(function (v) { return { n: v.name, c: v.owner }; }); },
      notes: function (d) { return d.fpso.vessels.concat(d.fpso.orderbook, d.fpso.contractors).map(function (v) { return v.notes; }); } },
    'earnings.html': { sector: ['Drilling'], files: ['earnings'], cats: ['Earnings', 'Contract', 'M&A'],
      names: function (d) { return d.earnings.companies.map(function (c) { return { n: c.name }; }); } },
    'fpso_earnings.html': { sector: ['FPSO/FLNG'], files: ['fpso_earnings'], cats: ['Earnings', 'Contract', 'M&A'],
      names: function (d) { return d.fpso_earnings.companies.map(function (c) { return { n: c.name }; }); } }
  };
  var CAT_KO = { 'Contract': '계약', 'M&A': 'M&A', 'Outlook': '전망', 'Earnings': '실적', 'Fleet': '선대', 'Project': '프로젝트' };
  function nameKeys(n) {
    // "Búzios 6 (P-78)" → ["Búzios 6 (P-78)", "Búzios 6", "P-78"]; "Masela / Abadi LNG" → both halves
    var out = [String(n || '').trim()], m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(out[0]);
    if (m) out.push(m[1], m[2]);
    out.slice().forEach(function (s) { if (s.indexOf(' / ') > 0) out = out.concat(s.split(' / ')); });
    return out.map(function (s) { return s.trim(); }).filter(function (s) { return s.length >= 4 && !/^(FPSO|FLNG|LNG|Phase \d)$/i.test(s); });
  }
  function hits(text, key) {
    var i = text.indexOf(key.toLowerCase());
    if (i < 0) return false;
    var a = text.charAt(i - 1), b = text.charAt(i + key.length);
    return !/[a-z0-9]/i.test(a) && !/[a-z0-9]/i.test(b);
  }
  function firstSentence(s) {
    s = String(s || '').replace(/\s+/g, ' ').trim();
    var m = /^(.{20,}?(?:다|요|음)\.|.{20,}?\.)(\s|$)/.exec(s);
    s = m ? m[1] : s;
    return s.length > 150 ? s.slice(0, 148) + '…' : s;
  }
  function renderChanges() {
    var page = (location.pathname.split('/').pop() || 'index.html');
    var cfg = CHANGES[page], anchor = document.querySelector('.page-title-section');
    if (!cfg || !anchor || document.querySelector('.omi-changes') || !window.fetch) return;
    var files = ['news'].concat(cfg.files), D = {};
    Promise.all(files.map(function (f) {
      return fetch('data/' + f + '.json').then(function (r) { return r.json(); }).then(function (j) { D[f] = j; });
    })).then(function () {
      var ko = LANG === 'ko', DAY = 864e5, now = Date.now(), days = 30;
      var since = function (n) { return new Date(now - n * DAY).toISOString().slice(0, 10); };
      var names = [];
      cfg.names(D).forEach(function (o) { nameKeys(o.n).forEach(function (k) { names.push({ key: k, label: o.n, strong: true }); }); if (o.c && cfg.weak) names.push({ key: String(o.c), label: null, strong: false }); });
      var pool = function (cut) {
        return (D.news.items || []).filter(function (it) {
          return it.date >= cut && cfg.sector.indexOf(it.sector) >= 0 && (!cfg.cats || cfg.cats.indexOf(it.category) >= 0);
        });
      };
      var items = pool(since(days));
      if (items.length < 2) { days = 60; items = pool(since(days)); }
      items.forEach(function (it) {
        var text = ((it.title || '') + ' ' + (it.summary || '')).toLowerCase(), tag = null, score = 0;
        names.forEach(function (n) {
          if (!hits(text, n.key)) return;
          if (n.strong) { if (score < 3) { score = 3; tag = n.label; } } else score = Math.max(score, 1);
        });
        if (it.category === 'Contract' || it.category === 'M&A' || it.category === 'Earnings') score += 1;
        it._score = score; it._tag = tag;
      });
      var top = items.slice().sort(function (a, b) { return b._score - a._score || (a.date < b.date ? 1 : -1); }).slice(0, 4)
        .sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      var fixes = 0;
      // Count records touched, not log lines, so KO and EN notes give the same number.
      if (cfg.notes) cfg.notes(D).forEach(function (t) { if (splitNotes(t).log.some(function (e) { return e.date >= since(days); })) fixes++; });
      if (!top.length && !fixes) { srcLegend(); return; }
      var rows = top.map(function (it) {
        var line = ko ? firstSentence(it.summary) || it.title : it.title;
        return '<li><time>' + escHtml(it.date.slice(5)) + '</time>' +
          '<span class="omi-ch-cat">' + escHtml(ko ? (CAT_KO[it.category] || it.category) : it.category) + '</span>' +
          '<span class="omi-ch-text">' + escHtml(line) +
          (it._tag ? ' <span class="omi-ch-tag" title="' + (ko ? '이 페이지에서 추적 중' : 'Tracked on this page') + '">' + escHtml(it._tag) + '</span>' : '') + '</span>' +
          (it.url ? '<a class="omi-ch-src" href="' + escHtml(it.url) + '" target="_blank" rel="noopener" title="' + escHtml(it.title) + '">' + escHtml(it.source || 'source') + ' ↗</a>' : '<span class="omi-ch-src">' + escHtml(it.source || '') + '</span>') +
          '</li>';
      }).join('');
      var foot = fixes
        ? '<p class="omi-ch-foot">' + (ko ? '최근 ' + days + '일 출처 대조로 정정·확인한 항목 ' + fixes + '건 · 행을 열면 업데이트 기록이 보입니다'
                                        : fixes + ' records corrected or re-verified against sources in the last ' + days + ' days · open a row for its update log') + '</p>'
        : '';
      var box = document.createElement('section');
      box.className = 'omi-changes';
      box.setAttribute('aria-label', ko ? '최근 핵심 변화' : 'Recent key changes');
      box.innerHTML =
        '<div class="omi-ch-head"><h3>' + (ko ? '최근 ' + days + '일 핵심 변화' : 'Key changes · last ' + days + ' days') + '</h3>' +
        '<span>' + (ko ? '뉴스 출처 기준 · 자동 선별 · ' : 'from sourced news · auto-selected · ') + escHtml(new Date(now).toISOString().slice(0, 10)) +
        ' · <a href="news.html">' + (ko ? '뉴스 전체 →' : 'All news →') + '</a></span></div>' +
        (rows ? '<ol class="omi-ch-list">' + rows + '</ol>' : '') + foot;
      anchor.parentNode.insertBefore(box, anchor.nextSibling);
      srcLegend();
    }).catch(srcLegend);
  }
  window.OMI.renderChanges = renderChanges;

  /* ── Per-figure source mark ───────────────────────────────────────────
     OMI.src(record) → a small dot placed next to a figure. Colour = age of
     the record's own check date (verified / as_of); click opens source_url;
     hover shows source, check date and confidence. Only fields already in the
     record are shown — a missing date is shown as missing, never inferred. */
  function srcMark(rec, opt) {
    if (!rec) return '';
    opt = opt || {};
    var ko = LANG === 'ko';
    var date = rec.verified || rec.as_of || null;
    if (date && !/^\d{4}-\d{2}(-\d{2})?$/.test(date)) date = null;
    var age = date ? Math.floor((Date.now() - new Date(date.length === 7 ? date + '-01' : date).getTime()) / 864e5) : null;
    var cls = age == null ? (rec.period ? 'is-period' : 'is-nodate') : age <= 90 ? 'is-fresh' : age <= 180 ? 'is-aging' : 'is-stale';
    if (rec.confidence === 'low') cls += ' is-low';
    var lines = [];
    if (rec.source) lines.push((ko ? '출처: ' : 'Source: ') + rec.source);
    var dl = rec.verified ? (ko ? '확인일: ' : 'Checked: ') : (ko ? '기준일: ' : 'As of: ');
    lines.push(date ? dl + date + (ko ? ' (' + age + '일 전)' : ' (' + age + ' days ago)')
                    : rec.period ? (ko ? '기준: ' + rec.period + ' 실적 공시' : 'Basis: ' + rec.period + ' reported results')
                    : (ko ? '확인일 기록 없음' : 'No check date recorded'));
    if (rec.confidence) lines.push((ko ? '신뢰도: ' : 'Confidence: ') + rec.confidence);
    if (opt.note) lines.push(opt.note);
    if (rec.source_url) lines.push(ko ? '점을 누르면 원문이 열립니다' : 'Click to open the source');
    var title = escHtml(lines.join('\n'));
    return rec.source_url
      ? '<a class="omi-src ' + cls + '" href="' + escHtml(rec.source_url) + '" target="_blank" rel="noopener" title="' + title + '" aria-label="' + (ko ? '출처' : 'Source') + '" onclick="event.stopPropagation()"></a>'
      : '<span class="omi-src ' + cls + '" title="' + title + '"></span>';
  }
  function srcLegend() {
    var anchor = document.querySelector('.omi-changes') || document.querySelector('.page-title-section');
    if (!anchor || document.querySelector('.omi-src-legend')) return;
    var ko = LANG === 'ko', p = document.createElement('p');
    p.className = 'omi-src-legend';
    p.innerHTML = (ko ? '수치 옆 점 — ' : 'Dot beside a figure — ') +
      '<span><i class="omi-src is-fresh"></i>' + (ko ? '확인·기준일 90일 이내' : 'checked / as-of ≤90 days') + '</span>' +
      '<span><i class="omi-src is-aging"></i>' + (ko ? '180일 이내' : '≤180 days') + '</span>' +
      '<span><i class="omi-src is-stale"></i>' + (ko ? '180일 초과' : '>180 days') + '</span>' +
      '<span><i class="omi-src is-nodate"></i>' + (ko ? '확인일 기록 없음' : 'no check date') + '</span>' +
      (document.querySelector('.omi-src.is-period') || /earnings/.test(location.pathname) ? '<span><i class="omi-src is-period"></i>' + (ko ? '분기 실적 공시 기준' : 'quarterly filing') + '</span>' : '') +
      '<span>' + (ko ? '점을 누르면 원문 출처' : 'click a dot for the source') + '</span>';
    anchor.parentNode.insertBefore(p, anchor.nextSibling);
  }
  window.OMI.src = srcMark;

  /* ── Cross-page links ─────────────────────────────────────────────────
     OMI.related(kind, record, el) appends a "Related" block to a detail
     panel. Links come only from name matches in the data, and say how they
     matched: "direct" (the field / unit name contains the project name) or
     "mentioned" (the name appears in the other record's notes).
     Targets open via #open=<key> (OMI.whenOpen) or news.html#q=<term>. */
  var dataCache = {};
  function loadData(f) {
    if (!dataCache[f]) dataCache[f] = fetch('data/' + f + '.json').then(function (r) { return r.json(); });
    return dataCache[f];
  }
  function hitText(text, key) { return hits(String(text || '').toLowerCase(), key); }
  function anyKey(text, keys) { for (var i = 0; i < keys.length; i++) if (hitText(text, keys[i])) return true; return false; }
  function link(href, label, meta) {
    if (meta && LANG === 'ko') meta = meta.split(' · ').map(function (x) { return UI_KO[x] || x; }).join(' · ');
    return '<a class="omi-rel-link" href="' + escHtml(href) + '">' + escHtml(label) + (meta ? '<small>' + escHtml(meta) + '</small>' : '') + '</a>';
  }
  function openHref(page, key) { return page + '#open=' + encodeURIComponent(key); }
  function relRelated(kind, rec, el) {
    if (!rec || !el) return;
    var ko = LANG === 'ko';
    var old = el.querySelector('.omi-rel'); if (old) old.remove();
    var box = document.createElement('div');
    box.className = 'omi-rel' + (el.classList.contains('ob-detail-grid') || /detail-grid/.test(el.id) ? ' ob-detail-item full' : '');
    el.appendChild(box);
    Promise.all(['pipeline', 'fpso', 'fleet', 'news', 'earnings', 'fpso_earnings'].map(loadData)).then(function (a) {
      var P = a[0].projects, F = a[1], R = a[2].rigs, N = a[3].items, E = a[4].companies, FE = a[5].companies;
      var units = F.vessels.map(function (v) { return { v: v, k: 'v:' }; }).concat(F.orderbook.map(function (v) { return { v: v, k: 'o:' }; }));
      var groups = [];
      var add = function (title, items) { if (items.length) groups.push({ title: title, items: items }); };
      var newsFor = function (keys) {
        return N.filter(function (n) { return anyKey(n.title + ' ' + n.summary, keys); }).slice(0, 4).map(function (n) {
          return '<a class="omi-rel-link" href="' + escHtml(n.url || 'news.html') + '" target="_blank" rel="noopener">' + escHtml(n.title) + '<small>' + escHtml(n.date + ' · ' + (n.source || '')) + ' ↗</small></a>';
        });
      };
      var uniq = function (arr) { var s = {}; return arr.filter(function (x) { return s[x] ? false : (s[x] = 1); }); };
      if (kind === 'project') {
        var pk = nameKeys(rec.project);
        var direct = units.filter(function (u) { return anyKey(u.v.field, pk) || anyKey(u.v.name, pk); });
        var ment = units.filter(function (u) { return direct.indexOf(u) < 0 && anyKey(rec.project + ' ' + (rec.notes || ''), nameKeys(u.v.name)); });
        var ul = function (u) { return link(openHref('fpso.html', u.k + u.v.name), u.v.name, [u.k === 'o:' ? (ko ? '건조 중' : 'orderbook') : u.v.status, u.v.owner].filter(Boolean).join(' · ')); };
        add(ko ? '이 프로젝트의 FPSO·FLNG' : 'FPSO / FLNG for this project', direct.map(ul));
        add(ko ? '메모에 언급된 설비' : 'Units mentioned in notes', ment.map(ul));
        add(ko ? '관련 뉴스' : 'Related news', newsFor(pk));
        add(ko ? '더 보기' : 'More', [link('news.html#q=' + encodeURIComponent(rec.company), (ko ? rec.company + ' 뉴스 전체' : 'All ' + rec.company + ' news') + ' →')]);
      } else if (kind === 'unit') {
        var uk = nameKeys(rec.name);
        var dp = P.filter(function (p) { return anyKey(rec.field, nameKeys(p.project)) || anyKey(rec.name, nameKeys(p.project)); });
        var mp = P.filter(function (p) { return dp.indexOf(p) < 0 && anyKey(p.project + ' ' + (p.notes || ''), uk); });
        var pl = function (p) { return link(openHref('pipeline.html', p.id), p.project, [p.company, p.phase].join(' · ')); };
        add(ko ? '파이프라인 프로젝트' : 'Pipeline project', dp.map(pl));
        add(ko ? '이 설비를 언급한 프로젝트' : 'Projects mentioning this unit', mp.map(pl));
        var fin = FE.filter(function (c) { return rec.owner && (rec.owner === c.name || rec.owner.indexOf(c.name) === 0); });
        add(ko ? '소유주 실적' : 'Owner financials', fin.map(function (c) { return link(openHref('fpso_earnings.html', c.name), c.name, ko ? 'FPSO 실적' : 'FPSO financials'); }));
        add(ko ? '관련 뉴스' : 'Related news', newsFor(uk));
      } else if (kind === 'rig') {
        var rk = nameKeys(rec.name);
        var rp = P.filter(function (p) { return anyKey((rec.location || '') + ' ' + (rec.data_note || ''), nameKeys(p.project)); });
        add(ko ? '언급된 프로젝트' : 'Projects mentioned', rp.map(function (p) { return link(openHref('pipeline.html', p.id), p.project, p.company); }));
        var ef = E.filter(function (c) { return c.name === rec.contractor; });
        add(ko ? '컨트랙터' : 'Contractor', ef.map(function (c) { return link(openHref('earnings.html', c.name), c.name, ko ? '시추사 실적' : 'driller financials'); })
          .concat([link('news.html#q=' + encodeURIComponent(rec.contractor), (ko ? rec.contractor + ' 뉴스 전체' : 'All ' + rec.contractor + ' news') + ' →')]));
        add(ko ? '관련 뉴스' : 'Related news', newsFor(rk));
      } else if (kind === 'company') {
        var isRigCo = E.some(function (c) { return c.name === rec.name; });
        var own = isRigCo
          ? [link('drilling.html#contractor=' + encodeURIComponent(rec.name), (ko ? '보유 리그 ' : 'Fleet: ') + R.filter(function (r) { return r.contractor === rec.name; }).length + (ko ? '척 보기' : ' rigs'))]
          : [link('fpso.html#owner=' + encodeURIComponent(rec.name), (ko ? '보유·운영 선박 보기' : 'Fleet & orderbook'))];
        add(ko ? '선대' : 'Fleet', own);
        add(ko ? '관련 뉴스' : 'Related news', newsFor([rec.name]).concat([link('news.html#q=' + encodeURIComponent(rec.name), (ko ? '뉴스 전체' : 'All news') + ' →')]));
      }
      if (!groups.length) { box.remove(); return; }
      box.innerHTML = '<div class="omi-rel-title">' + (ko ? '관련 항목' : 'Related') + '<span>' + (ko ? '이름 일치 기준' : 'matched by name') + '</span></div>' +
        groups.map(function (g) { return '<div class="omi-rel-group"><h5>' + escHtml(g.title) + '</h5><div class="omi-rel-items">' + uniq(g.items).join('') + '</div></div>'; }).join('');
    }).catch(function () { box.remove(); });
  }
  function hashParam(name) {
    var m = new RegExp('[#&]' + name + '=([^&]*)').exec(location.hash);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function whenOpen(fn, name) {
    name = name || 'open';
    var run = function () { var v = hashParam(name); if (v != null) setTimeout(function () { fn(v); }, 0); };
    run();
    window.addEventListener('hashchange', run);
  }
  window.OMI.related = relRelated;
  window.OMI.whenOpen = whenOpen;
  window.OMI.hashParam = hashParam;
  window.OMI.srcLegend = srcLegend;

  function boot() { decorate(); shortenNav(); addLangToggle(); tidyMeta(); startUiTranslate(); renderChanges(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
