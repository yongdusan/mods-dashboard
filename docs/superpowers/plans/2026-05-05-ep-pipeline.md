# E&P Pipeline Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `pipeline.html` + `data/pipeline.json` to surface major offshore E&P project pipelines from 9 IOCs with a Phase×Region heatmap matrix and Tabulator project list; remove the legacy CAPEX section from `drilling.html`.

**Architecture:** Static HTML page. `pipeline.json` is the single source of truth for project data; `capex.json` supplies company-level annual CAPEX totals for KPI Row B. Filter state (active matrix cell + active company) is held in two module-scoped JS variables and applied to the Tabulator data array on every change. No build step — served by Python http.server.

**Tech Stack:** Vanilla JS (ES2020), Tabulator 6.x (CDN, same version as drilling.html), Chart.js not required for this page, CSS custom properties matching existing design system, Python http.server for local verification.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `data/pipeline.json` | **Create** | Project-level data: 20 offshore projects, $1B+, 9 IOCs |
| `pipeline.html` | **Create** | E&P Pipeline page: KPI cards, matrix, filter buttons, project list, drawer |
| `drilling.html` | **Modify** | Remove CAPEX section (HTML + CSS + JS); add nav link |
| `fpso.html` | **Modify** | Add nav link only |
| `earnings.html` | **Modify** | Add nav link only |
| `fpso_earnings.html` | **Modify** | Add nav link only |
| `news.html` | **Modify** | Add nav link only |

`index.html` must **not** be modified (CLAUDE.md constraint).

---

## Task 1: Create `data/pipeline.json`

**Files:**
- Create: `data/pipeline.json`

- [ ] **Step 1: Write the file**

```json
{
  "updated": "2026-05-05",
  "data_quality": {
    "confidence": "medium",
    "basis": "Company filings, earnings releases and project announcements",
    "notes": "Phase and CAPEX figures reflect latest disclosed status; subject to FID revision. Projects marked low confidence lack disclosed CAPEX or firm FID timeline."
  },
  "projects": [
    {
      "id": "chevron-anchor",
      "company": "Chevron",
      "project": "Anchor",
      "region": "Gulf of Mexico",
      "asset_type": "Deepwater Oil",
      "phase": "Production",
      "capex_busd": 5.7,
      "fid_date": "2019-08",
      "first_production": "2024",
      "source": "Chevron Q4 2023 Earnings",
      "source_url": null,
      "confidence": "high",
      "notes": "Semi-sub FPS; 75k boe/d peak. Chevron 62.5% (op), TotalEnergies 37.5%."
    },
    {
      "id": "shell-whale",
      "company": "Shell",
      "project": "Whale",
      "region": "Gulf of Mexico",
      "asset_type": "Deepwater Oil",
      "phase": "Execution",
      "capex_busd": 8.0,
      "fid_date": "2022",
      "first_production": "2026",
      "source": "Shell Annual Report 2022",
      "source_url": null,
      "confidence": "medium",
      "notes": "FPSO; ~100k boe/d. Shell 60% (op), Chevron 40%."
    },
    {
      "id": "bp-mad-dog-ph2",
      "company": "bp",
      "project": "Mad Dog Phase 2",
      "region": "Gulf of Mexico",
      "asset_type": "Deepwater Oil",
      "phase": "Production",
      "capex_busd": 9.0,
      "fid_date": "2017",
      "first_production": "2023",
      "source": "bp Annual Report 2023",
      "source_url": null,
      "confidence": "high",
      "notes": "Argos FPS; 140k bbl/d. bp 60.5% (op), BHP 23.9%, Union Oil 15.6%."
    },
    {
      "id": "exxonmobil-yellowtail",
      "company": "ExxonMobil",
      "project": "Yellowtail",
      "region": "Brazil",
      "asset_type": "Deepwater Oil",
      "phase": "Execution",
      "capex_busd": 10.0,
      "fid_date": "2022-04",
      "first_production": "2025",
      "source": "ExxonMobil Q2 2022 Earnings",
      "source_url": null,
      "confidence": "high",
      "notes": "Offshore Guyana (Stabroek Block). One Guyana FPSO; ~250k bbl/d. ExxonMobil 45% (op), Hess 30%, CNOOC 25%."
    },
    {
      "id": "exxonmobil-hammerhead",
      "company": "ExxonMobil",
      "project": "Hammerhead",
      "region": "Brazil",
      "asset_type": "Deepwater Oil",
      "phase": "FEED",
      "capex_busd": 7.0,
      "fid_date": null,
      "first_production": "2029",
      "source": "ExxonMobil 2024 Investor Day",
      "source_url": null,
      "confidence": "medium",
      "notes": "Offshore Guyana (Stabroek Block). 4th development FPSO. CAPEX estimate indicative."
    },
    {
      "id": "petrobras-buzios-6",
      "company": "Petrobras",
      "project": "Búzios Phase 6",
      "region": "Brazil",
      "asset_type": "Deepwater Oil",
      "phase": "Execution",
      "capex_busd": 3.5,
      "fid_date": "2023",
      "first_production": "2026",
      "source": "Petrobras 2025–2029 Business Plan",
      "source_url": null,
      "confidence": "medium",
      "notes": "FPSO Alexandre de Gusmão. Pre-salt Santos Basin."
    },
    {
      "id": "petrobras-buzios-7",
      "company": "Petrobras",
      "project": "Búzios Phase 7",
      "region": "Brazil",
      "asset_type": "Deepwater Oil",
      "phase": "FEED",
      "capex_busd": 3.5,
      "fid_date": null,
      "first_production": "2027",
      "source": "Petrobras 2025–2029 Business Plan",
      "source_url": null,
      "confidence": "medium",
      "notes": "7th FPSO for Búzios field. Pre-salt Santos Basin. CAPEX indicative."
    },
    {
      "id": "petrobras-sepia-2",
      "company": "Petrobras",
      "project": "Sépia Incremental",
      "region": "Brazil",
      "asset_type": "Deepwater Oil",
      "phase": "Execution",
      "capex_busd": 2.5,
      "fid_date": "2022",
      "first_production": "2025",
      "source": "Petrobras 2025–2029 Business Plan",
      "source_url": null,
      "confidence": "medium",
      "notes": "FPSO Carioca. TotalEnergies 28%, Petrogal Brasil 7% participate."
    },
    {
      "id": "bp-tortue-flng",
      "company": "bp",
      "project": "Greater Tortue Ahmeyim FLNG Ph1",
      "region": "West Africa",
      "asset_type": "Deepwater Gas / FLNG",
      "phase": "Execution",
      "capex_busd": 4.8,
      "fid_date": "2020-02",
      "first_production": "2025",
      "source": "bp Annual Report 2024",
      "source_url": null,
      "confidence": "high",
      "notes": "Mauritania/Senegal maritime border. bp 56% (op), Kosmos 27%, SMHPM/Petrosen 17%. ~2.5 Mtpa LNG."
    },
    {
      "id": "totalenergies-brulpadda",
      "company": "TotalEnergies",
      "project": "Brulpadda / Luiperd",
      "region": "West Africa",
      "asset_type": "Deepwater Gas",
      "phase": "FEED",
      "capex_busd": null,
      "fid_date": null,
      "first_production": null,
      "source": "TotalEnergies 2024 Investor Day",
      "source_url": null,
      "confidence": "low",
      "notes": "Offshore South Africa, Block 11B/12B. TotalEnergies 45% (op). FID timeline uncertain; gas monetisation route under evaluation."
    },
    {
      "id": "shell-jackdaw",
      "company": "Shell",
      "project": "Jackdaw",
      "region": "North Sea/Norway",
      "asset_type": "Deepwater Gas",
      "phase": "Execution",
      "capex_busd": 2.0,
      "fid_date": "2023",
      "first_production": "2025",
      "source": "Shell Annual Report 2023",
      "source_url": null,
      "confidence": "medium",
      "notes": "UK North Sea. Subsea tie-back to Shearwater hub. Shell 100% (op)."
    },
    {
      "id": "bp-clair-south",
      "company": "bp",
      "project": "Clair South",
      "region": "North Sea/Norway",
      "asset_type": "Deepwater Oil",
      "phase": "Pre-FEED",
      "capex_busd": null,
      "fid_date": null,
      "first_production": null,
      "source": "bp Annual Report 2024",
      "source_url": null,
      "confidence": "low",
      "notes": "West of Shetland. bp 45.1% (op). Concept selection stage; long lead-time development."
    },
    {
      "id": "adnoc-hail-ghasha",
      "company": "ADNOC",
      "project": "Hail & Ghasha",
      "region": "Middle East",
      "asset_type": "Offshore Gas",
      "phase": "Execution",
      "capex_busd": 17.0,
      "fid_date": "2023",
      "first_production": "2027",
      "source": "ADNOC project announcement 2023",
      "source_url": null,
      "confidence": "medium",
      "notes": "Offshore Abu Dhabi sour gas. ADNOC 55% (op), ENI, OMV, Wintershall Dea, Lukoil. ~1.5 Bcf/d."
    },
    {
      "id": "saudi-aramco-marjan",
      "company": "Saudi Aramco",
      "project": "Marjan Increment",
      "region": "Middle East",
      "asset_type": "Offshore Oil",
      "phase": "Execution",
      "capex_busd": 17.0,
      "fid_date": "2020",
      "first_production": "2025",
      "source": "Saudi Aramco Annual Report 2024",
      "source_url": null,
      "confidence": "medium",
      "notes": "Arabian Gulf offshore. +300k bbl/d increment. Saudi Aramco 100%."
    },
    {
      "id": "saudi-aramco-berri",
      "company": "Saudi Aramco",
      "project": "Berri Increment",
      "region": "Middle East",
      "asset_type": "Offshore Oil",
      "phase": "Execution",
      "capex_busd": 8.0,
      "fid_date": "2022",
      "first_production": "2026",
      "source": "Saudi Aramco Annual Report 2024",
      "source_url": null,
      "confidence": "medium",
      "notes": "Arabian Gulf offshore. +250k bbl/d increment. Saudi Aramco 100%."
    },
    {
      "id": "petronas-kasawari",
      "company": "PETRONAS",
      "project": "Kasawari",
      "region": "Asia Pacific",
      "asset_type": "Deepwater Gas",
      "phase": "Execution",
      "capex_busd": 3.0,
      "fid_date": "2021",
      "first_production": "2025",
      "source": "PETRONAS Annual Report 2024",
      "source_url": null,
      "confidence": "medium",
      "notes": "Offshore Sarawak, Malaysia. Largest offshore gas field in Malaysia. ~900 MMscfd. PETRONAS 100%."
    },
    {
      "id": "shell-crux",
      "company": "Shell",
      "project": "Crux",
      "region": "Asia Pacific",
      "asset_type": "Deepwater Gas",
      "phase": "Execution",
      "capex_busd": 3.0,
      "fid_date": "2023",
      "first_production": "2027",
      "source": "Shell Annual Report 2023",
      "source_url": null,
      "confidence": "medium",
      "notes": "Offshore Western Australia. Gas tied back to Prelude FLNG. Shell 82% (op)."
    },
    {
      "id": "totalenergies-papua-lng",
      "company": "TotalEnergies",
      "project": "Papua LNG",
      "region": "Asia Pacific",
      "asset_type": "Deepwater Gas / LNG",
      "phase": "FEED",
      "capex_busd": 10.0,
      "fid_date": null,
      "first_production": "2030",
      "source": "TotalEnergies 2024 Investor Day",
      "source_url": null,
      "confidence": "medium",
      "notes": "Papua New Guinea. TotalEnergies 40.1% (op), ExxonMobil 37.1%, Santos 22.8%. ~5.6 Mtpa LNG. FID targeted 2025/2026."
    },
    {
      "id": "exxonmobil-png-expansion",
      "company": "ExxonMobil",
      "project": "PNG LNG Expansion",
      "region": "Asia Pacific",
      "asset_type": "Deepwater Gas / LNG",
      "phase": "Pre-FEED",
      "capex_busd": null,
      "fid_date": null,
      "first_production": null,
      "source": "ExxonMobil 2024 Investor Day",
      "source_url": null,
      "confidence": "low",
      "notes": "Papua New Guinea. Potential 3rd LNG train. Contingent on Papua LNG FID and gas supply agreements."
    },
    {
      "id": "totalenergies-mozambique-lng",
      "company": "TotalEnergies",
      "project": "Mozambique LNG",
      "region": "East Africa",
      "asset_type": "Deepwater Gas / LNG",
      "phase": "FID",
      "capex_busd": 20.0,
      "fid_date": "2019-06",
      "first_production": null,
      "source": "TotalEnergies Annual Report 2024",
      "source_url": null,
      "confidence": "high",
      "notes": "Area 1, Cabo Delgado Province. FID taken 2019. Force majeure declared April 2021 due to security situation; restart contingent on stabilisation. ~13 Mtpa LNG at full build-out."
    }
  ]
}
```

- [ ] **Step 2: Validate JSON**

```bash
python3 -c "import json; data=json.load(open('data/pipeline.json')); print(len(data['projects']), 'projects loaded')"
```

Expected output: `20 projects loaded`

- [ ] **Step 3: Commit**

```bash
git add data/pipeline.json
git commit -m "data: add pipeline.json with 20 major offshore projects for E&P Pipeline page"
```

---

## Task 2: Create `pipeline.html` — skeleton and data loading

**Files:**
- Create: `pipeline.html`

- [ ] **Step 1: Write the HTML skeleton**

Create `/Users/ahn-yongsung/Project/modu-dashboard/pipeline.html` with this content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>E&P Pipeline | MODU Intelligence</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <link href="https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator_midnight.min.css" rel="stylesheet" />
  <script src="https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js"></script>
  <style>
    /* ─── Design tokens (mirror drilling.html) ─── */
    :root {
      --bg: #0a0e1a;
      --surface: #111827;
      --surface2: #1a2236;
      --border: #1e2d45;
      --text: #e2e8f0;
      --text-muted: #64748b;
      --accent: #3b82f6;
      --blue: #60a5fa;
      --green: #10b981;
      --yellow: #f59e0b;
      --orange: #f97316;
      --red: #ef4444;
      --purple: #8b5cf6;
      --font-mono: 'JetBrains Mono', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); color: var(--text); font-family: 'Inter', sans-serif; font-size: 14px; line-height: 1.5; min-height: 100vh; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ─── Layout ─── */
    .container { max-width: 1440px; margin: 0 auto; padding: 0 24px; }

    /* ─── Header ─── */
    header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 24px; position: sticky; top: 0; z-index: 100; }
    .header-inner { max-width: 1440px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 56px; gap: 24px; }
    .header-brand { font-size: 15px; font-weight: 600; color: var(--text); white-space: nowrap; }
    .header-nav { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
    .nav-link { color: var(--accent); text-decoration: none; font-size: 13px; font-weight: 500; }
    .nav-link:hover { text-decoration: underline; }
    .nav-link.active { color: var(--text); font-weight: 600; pointer-events: none; }

    /* ─── Page title ─── */
    .page-title-section { padding: 32px 24px 8px; max-width: 1440px; margin: 0 auto; }
    .page-title-section h2 { font-size: 22px; font-weight: 600; }
    .page-subtitle { color: var(--text-muted); font-size: 13px; margin-top: 4px; }

    /* ─── Panel ─── */
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; }
    .panel-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .panel-title { font-size: 13px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); display: inline-block; }
    .panel-body { padding: 20px; }

    /* ─── Content grid ─── */
    .content-grid { display: grid; gap: 20px; padding: 20px 24px; max-width: 1440px; margin: 0 auto; }

    /* ─── KPI grid ─── */
    .kpi-section { padding: 20px 24px 0; max-width: 1440px; margin: 0 auto; }
    .kpi-label { font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .kpi-card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
    .kpi-card-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 8px; }
    .kpi-card-value { font-size: 22px; font-weight: 600; font-family: var(--font-mono); color: var(--text); }
    .kpi-card-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .kpi-card-value.accent { color: var(--accent); }
    .kpi-card-value.green  { color: var(--green); }
    .kpi-card-value.yellow { color: var(--yellow); }
    .kpi-card-value.orange { color: var(--orange); }

    /* ─── Phase×Region Matrix ─── */
    .matrix-wrap { overflow-x: auto; padding: 4px; }
    .matrix-grid {
      display: grid;
      grid-template-columns: 180px repeat(5, 1fr);
      gap: 3px;
      min-width: 640px;
    }
    .matrix-cell {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 10px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: border-color 0.15s;
      min-height: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .matrix-cell:hover { border-color: var(--accent); }
    .matrix-cell.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
    .matrix-cell.header {
      background: transparent;
      border: none;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--text-muted);
      cursor: default;
    }
    .matrix-cell.header:hover { border-color: transparent; }
    .matrix-cell.region-label { cursor: default; font-weight: 500; font-size: 12px; }
    .matrix-cell.region-label:hover { border-color: var(--border); }
    .matrix-cell.empty { color: var(--text-muted); font-family: var(--font-mono); }
    .matrix-count { font-family: var(--font-mono); font-size: 16px; font-weight: 600; color: var(--text); }
    .matrix-capex { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

    /* ─── Phase badges ─── */
    .phase-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .phase-Pre-FEED  { background: rgba(100,116,139,0.18); color: var(--text-muted); }
    .phase-FEED      { background: rgba(245,158,11,0.15);  color: var(--yellow); }
    .phase-FID       { background: rgba(249,115,22,0.15);  color: var(--orange); }
    .phase-Execution { background: rgba(59,130,246,0.15);  color: var(--accent); }
    .phase-Production { background: rgba(16,185,129,0.15); color: var(--green); }

    /* ─── Confidence badge ─── */
    .conf-high   { color: var(--green); }
    .conf-medium { color: var(--yellow); }
    .conf-low    { color: var(--text-muted); }

    /* ─── Company filter buttons ─── */
    .filter-bar { display: flex; gap: 6px; flex-wrap: wrap; padding: 16px 20px 0; }
    .filter-btn {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 4px;
      color: var(--text-muted);
      cursor: pointer;
      font-size: 12px;
      padding: 5px 10px;
      transition: border-color 0.15s, color 0.15s;
    }
    .filter-btn:hover { border-color: var(--accent); color: var(--text); }
    .filter-btn.active { border-color: var(--accent); color: var(--text); background: rgba(59,130,246,0.1); }

    /* ─── Tabulator overrides ─── */
    #project-table .tabulator { background: transparent; border: none; }
    #project-table .tabulator-header { background: var(--surface2); border-bottom: 1px solid var(--border); }
    #project-table .tabulator-col { background: transparent; border-right: 1px solid var(--border); }
    #project-table .tabulator-col-title { color: var(--text-muted); font-size: 11px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    #project-table .tabulator-row { background: transparent; border-bottom: 1px solid var(--border); cursor: pointer; }
    #project-table .tabulator-row:hover { background: rgba(59,130,246,0.06); }
    #project-table .tabulator-row.row-selected { background: rgba(59,130,246,0.12); }
    #project-table .tabulator-cell { color: var(--text); border-right: 1px solid var(--border); }
    .mono { font-family: var(--font-mono); }

    /* ─── Drawer ─── */
    .drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; }
    .drawer-overlay.open { display: block; }
    .drawer {
      position: fixed; top: 0; right: -460px; width: 460px; height: 100vh;
      background: var(--surface); border-left: 1px solid var(--border);
      z-index: 201; transition: right 0.25s ease; overflow-y: auto;
      display: flex; flex-direction: column;
    }
    .drawer.open { right: 0; }
    .drawer-header { padding: 20px; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-shrink: 0; }
    .drawer-title { font-size: 16px; font-weight: 600; line-height: 1.3; }
    .drawer-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 20px; padding: 0 4px; flex-shrink: 0; }
    .close-btn:hover { color: var(--text); }
    .drawer-body { padding: 20px; flex: 1; }
    .drawer-section { margin-bottom: 24px; }
    .drawer-section-title { font-size: 11px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; }
    .detail-row { display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; border-bottom: 1px solid var(--border); gap: 12px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { font-size: 12px; color: var(--text-muted); flex-shrink: 0; }
    .detail-value { font-size: 13px; font-weight: 500; text-align: right; }
    .capex-highlight { font-family: var(--font-mono); font-size: 20px; font-weight: 600; color: var(--accent); }
    .notes-card { background: var(--surface2); border: 1px solid var(--border); border-radius: 6px; padding: 12px 14px; font-size: 12px; line-height: 1.6; color: var(--text-muted); }
    .source-link { font-size: 12px; }

    /* ─── Error state ─── */
    .error-banner { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; color: #fca5a5; font-size: 13px; margin: 20px 24px; padding: 12px 16px; }
  </style>
</head>
<body>

<header>
  <div class="header-inner">
    <span class="header-brand">MODU Intelligence</span>
    <nav class="header-nav">
      <a href="index.html" class="nav-link">Overview</a>
      <span class="nav-link active">E&amp;P Pipeline</span>
      <a href="drilling.html" class="nav-link">Drilling / MODU</a>
      <a href="fpso.html" class="nav-link">FPSO / FLNG Assets</a>
      <a href="earnings.html" class="nav-link">Drilling Financials</a>
      <a href="fpso_earnings.html" class="nav-link">FPSO / FLNG Financials</a>
      <a href="news.html" class="nav-link">Market News</a>
    </nav>
  </div>
</header>

<section class="page-title-section">
  <h2>E&amp;P Project Pipeline</h2>
  <p class="page-subtitle">Major offshore projects · 9 IOCs · $1B+ CAPEX · 2026-05-05</p>
</section>

<!-- KPI Row A: Pipeline summary -->
<div class="kpi-section">
  <div class="kpi-label">Pipeline Overview</div>
  <div class="kpi-grid" id="kpi-pipeline"></div>
  <div class="kpi-label" style="margin-top:12px">Company Upstream CAPEX Guidance 2026</div>
  <div class="kpi-grid" id="kpi-capex"></div>
</div>

<!-- Phase × Region Matrix -->
<div class="content-grid">
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title"><span class="dot" style="background:var(--orange)"></span>Phase × Region Matrix</span>
      <span style="font-size:12px;color:var(--text-muted)">Click a cell to filter the project list</span>
    </div>
    <div class="panel-body">
      <div class="matrix-wrap">
        <div class="matrix-grid" id="matrix-grid"></div>
      </div>
    </div>
  </div>

  <!-- Company filters + Project list -->
  <div class="panel">
    <div class="panel-header">
      <span class="panel-title"><span class="dot"></span>Projects</span>
      <span id="project-count-label" style="font-size:12px;color:var(--text-muted)"></span>
    </div>
    <div class="filter-bar" id="company-filters"></div>
    <div id="project-table" style="padding:0 0 4px"></div>
  </div>
</div>

<!-- Project Drawer -->
<div class="drawer-overlay" id="drawer-overlay"></div>
<div class="drawer" id="project-drawer">
  <div class="drawer-header">
    <div>
      <div class="drawer-title" id="drawer-title"></div>
      <div class="drawer-subtitle" id="drawer-subtitle"></div>
    </div>
    <button class="close-btn" id="close-drawer">×</button>
  </div>
  <div class="drawer-body" id="drawer-body"></div>
</div>

<script>
  /* ─────────────────────────────────────────
     Constants
  ───────────────────────────────────────── */
  const PHASES   = ['Pre-FEED', 'FEED', 'FID', 'Execution', 'Production'];
  const REGIONS  = ['Gulf of Mexico', 'Brazil', 'West Africa', 'North Sea/Norway', 'Middle East', 'Asia Pacific', 'East Africa', 'Other'];

  /* ─────────────────────────────────────────
     State
  ───────────────────────────────────────── */
  let activeCell    = null;   // { region, phase } | null
  let activeCompany = 'All';
  let projectTable  = null;
  let allProjects   = [];

  /* ─────────────────────────────────────────
     Utilities
  ───────────────────────────────────────── */
  function esc(str) {
    return String(str ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function fmt(v) { return v != null ? v.toFixed(1) : '—'; }

  /* ─────────────────────────────────────────
     Data loading
  ───────────────────────────────────────── */
  let pipeline, capex;
  try {
    [pipeline, capex] = await Promise.all([
      fetch('./data/pipeline.json').then(r => r.json()),
      fetch('./data/capex.json').then(r => r.json()),
    ]);
    allProjects = pipeline.projects;
  } catch (err) {
    document.body.insertAdjacentHTML('afterbegin',
      `<div class="error-banner">Failed to load data: ${esc(err.message)}</div>`);
    throw err;
  }

  /* ─────────────────────────────────────────
     KPI rendering
  ───────────────────────────────────────── */
  function renderKPIs() {
    const total    = allProjects.length;
    const totalCap = allProjects.reduce((s, p) => s + (p.capex_busd ?? 0), 0);
    const fidImm   = allProjects.filter(p => p.phase === 'FEED' || p.phase === 'FID').length;

    document.getElementById('kpi-pipeline').innerHTML = `
      <div class="kpi-card">
        <div class="kpi-card-label">Projects Tracked</div>
        <div class="kpi-card-value accent">${total}</div>
        <div class="kpi-card-sub">9 IOCs · offshore · $1B+</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-label">Total CAPEX</div>
        <div class="kpi-card-value accent">$${fmt(totalCap)}B</div>
        <div class="kpi-card-sub">Sum of disclosed values</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card-label">FID Imminent</div>
        <div class="kpi-card-value yellow">${fidImm}</div>
        <div class="kpi-card-sub">FEED or FID stage</div>
      </div>`;

    const capexCards = capex.companies.map(c => {
      const g2026 = c.capex_guidance?.find(g => g.year === 2026);
      const val   = g2026?.upstream_capex_busd ?? g2026?.total_capex_busd;
      return `<div class="kpi-card">
        <div class="kpi-card-label">${esc(c.name)}</div>
        <div class="kpi-card-value" style="font-size:18px;color:var(--blue)">${val != null ? '$' + val + 'B' : '—'}</div>
        <div class="kpi-card-sub">Upstream 2026E</div>
      </div>`;
    }).join('');
    document.getElementById('kpi-capex').innerHTML = capexCards;
  }

  /* ─────────────────────────────────────────
     Matrix rendering
  ───────────────────────────────────────── */
  function buildMatrixData() {
    const cells = {};
    for (const r of REGIONS) {
      cells[r] = {};
      for (const ph of PHASES) {
        cells[r][ph] = { count: 0, capex: 0 };
      }
    }
    for (const p of allProjects) {
      const r = REGIONS.includes(p.region) ? p.region : 'Other';
      if (PHASES.includes(p.phase)) {
        cells[r][p.phase].count  += 1;
        cells[r][p.phase].capex  += p.capex_busd ?? 0;
      }
    }
    return cells;
  }

  function renderMatrix() {
    const cells   = buildMatrixData();
    const maxCap  = Math.max(...REGIONS.flatMap(r => PHASES.map(ph => cells[r][ph].capex)), 1);
    const grid    = document.getElementById('matrix-grid');

    // Header row
    let html = `<div class="matrix-cell header"></div>`;
    for (const ph of PHASES) {
      html += `<div class="matrix-cell header">${esc(ph)}</div>`;
    }

    // Data rows
    for (const region of REGIONS) {
      html += `<div class="matrix-cell region-label">${esc(region)}</div>`;
      for (const phase of PHASES) {
        const { count, capex } = cells[region][phase];
        const intensity = capex > 0 ? 0.08 + 0.52 * (capex / maxCap) : 0;
        const isActive  = activeCell?.region === region && activeCell?.phase === phase;
        if (count === 0) {
          html += `<div class="matrix-cell empty" data-region="${esc(region)}" data-phase="${esc(phase)}">·</div>`;
        } else {
          html += `<div class="matrix-cell${isActive ? ' active' : ''}"
            data-region="${esc(region)}" data-phase="${esc(phase)}"
            style="background:rgba(59,130,246,${intensity.toFixed(2)})">
            <span class="matrix-count">${count}</span>
            ${capex > 0 ? `<span class="matrix-capex">$${capex.toFixed(1)}B</span>` : ''}
          </div>`;
        }
      }
    }
    grid.innerHTML = html;

    // Click handlers
    grid.querySelectorAll('.matrix-cell[data-region]').forEach(el => {
      el.addEventListener('click', () => {
        const r = el.dataset.region, ph = el.dataset.phase;
        if (activeCell?.region === r && activeCell?.phase === ph) {
          activeCell = null;
        } else if (el.classList.contains('empty')) {
          return;
        } else {
          activeCell = { region: r, phase: ph };
        }
        renderMatrix();
        applyFilters();
      });
    });
  }

  /* ─────────────────────────────────────────
     Company filter buttons
  ───────────────────────────────────────── */
  function renderCompanyFilters() {
    const companies = ['All', ...new Set(allProjects.map(p => p.company).sort())];
    const bar = document.getElementById('company-filters');
    bar.innerHTML = companies.map(c =>
      `<button class="filter-btn${activeCompany === c ? ' active' : ''}" data-company="${esc(c)}">${esc(c)}</button>`
    ).join('');
    bar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeCompany = btn.dataset.company;
        renderCompanyFilters();
        applyFilters();
      });
    });
  }

  /* ─────────────────────────────────────────
     Filter logic + Project table
  ───────────────────────────────────────── */
  function filteredProjects() {
    return allProjects.filter(p => {
      const regionMatch = !activeCell || p.region === activeCell.region;
      const phaseMatch  = !activeCell || p.phase  === activeCell.phase;
      const compMatch   = activeCompany === 'All' || p.company === activeCompany;
      return regionMatch && phaseMatch && compMatch;
    });
  }

  function applyFilters() {
    const data = filteredProjects();
    document.getElementById('project-count-label').textContent =
      `${data.length} of ${allProjects.length} projects`;
    if (projectTable) {
      projectTable.setData(data);
    }
  }

  function renderProjectTable() {
    const data = filteredProjects();
    document.getElementById('project-count-label').textContent =
      `${data.length} of ${allProjects.length} projects`;

    projectTable = new Tabulator('#project-table', {
      data,
      layout: 'fitColumns',
      columnHeaderVertAlign: 'middle',
      columns: [
        {
          title: 'Company', field: 'company', minWidth: 130,
          formatter: cell => `<strong>${esc(cell.getValue())}</strong>`,
        },
        {
          title: 'Project', field: 'project', minWidth: 200,
          formatter: cell => esc(cell.getValue()),
        },
        {
          title: 'Region', field: 'region', minWidth: 150,
          formatter: cell => esc(cell.getValue()),
        },
        {
          title: 'Phase', field: 'phase', width: 120,
          formatter: cell => {
            const ph = cell.getValue();
            return `<span class="phase-badge phase-${ph.replace(/\s/g,'')}">${esc(ph)}</span>`;
          },
        },
        {
          title: 'CAPEX ($B)', field: 'capex_busd', width: 110, hozAlign: 'right',
          formatter: cell => {
            const v = cell.getValue();
            return v != null
              ? `<span class="mono" style="color:var(--accent);font-weight:600">$${v.toFixed(1)}</span>`
              : '<span style="color:var(--text-muted)">—</span>';
          },
        },
        {
          title: 'FID', field: 'fid_date', width: 90, hozAlign: 'right',
          formatter: cell => cell.getValue() ? `<span class="mono">${esc(cell.getValue())}</span>` : '<span style="color:var(--text-muted)">—</span>',
        },
        {
          title: 'First Prod.', field: 'first_production', width: 100, hozAlign: 'right',
          formatter: cell => cell.getValue() ? `<span class="mono">${esc(cell.getValue())}</span>` : '<span style="color:var(--text-muted)">—</span>',
        },
        {
          title: 'Type', field: 'asset_type', minWidth: 150,
          formatter: cell => `<span style="color:var(--text-muted);font-size:12px">${esc(cell.getValue())}</span>`,
        },
      ],
    });

    projectTable.on('rowClick', (e, row) => {
      projectTable.getRows().forEach(r => r.getElement().classList.remove('row-selected'));
      row.getElement().classList.add('row-selected');
      openDrawer(row.getData());
    });
  }

  /* ─────────────────────────────────────────
     Drawer
  ───────────────────────────────────────── */
  function openDrawer(p) {
    document.getElementById('drawer-title').textContent   = p.project;
    document.getElementById('drawer-subtitle').textContent = `${p.company} · ${p.region}`;

    const confClass = `conf-${p.confidence}`;
    document.getElementById('drawer-body').innerHTML = `
      <div class="drawer-section">
        <div class="drawer-section-title">Project</div>
        <div class="detail-row">
          <span class="detail-label">Phase</span>
          <span class="detail-value"><span class="phase-badge phase-${(p.phase||'').replace(/\s/g,'')}">${esc(p.phase)}</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Asset Type</span>
          <span class="detail-value">${esc(p.asset_type)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Region</span>
          <span class="detail-value">${esc(p.region)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Confidence</span>
          <span class="detail-value ${confClass}">${esc(p.confidence)}</span>
        </div>
      </div>
      <div class="drawer-section">
        <div class="drawer-section-title">Investment & Timeline</div>
        <div class="detail-row">
          <span class="detail-label">CAPEX</span>
          <span class="detail-value">
            ${p.capex_busd != null
              ? `<span class="capex-highlight">$${p.capex_busd.toFixed(1)}B</span>`
              : '<span style="color:var(--text-muted)">Undisclosed</span>'}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">FID</span>
          <span class="detail-value mono">${p.fid_date ?? '—'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">First Production</span>
          <span class="detail-value mono">${p.first_production ?? '—'}</span>
        </div>
      </div>
      ${p.notes ? `<div class="drawer-section">
        <div class="drawer-section-title">Notes</div>
        <div class="notes-card">${esc(p.notes)}</div>
      </div>` : ''}
      <div class="drawer-section">
        <div class="drawer-section-title">Source</div>
        <div class="detail-row">
          <span class="detail-label">Source</span>
          <span class="detail-value">${p.source_url
            ? `<a href="${esc(p.source_url)}" target="_blank" rel="noopener" class="source-link">${esc(p.source)}</a>`
            : esc(p.source ?? '—')}</span>
        </div>
      </div>`;

    document.getElementById('project-drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('open');
  }

  function closeDrawer() {
    document.getElementById('project-drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.remove('open');
    if (projectTable) projectTable.getRows().forEach(r => r.getElement().classList.remove('row-selected'));
  }

  document.getElementById('close-drawer').addEventListener('click', closeDrawer);
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

  /* ─────────────────────────────────────────
     Init
  ───────────────────────────────────────── */
  renderKPIs();
  renderMatrix();
  renderCompanyFilters();
  renderProjectTable();
</script>
</body>
</html>
```

- [ ] **Step 2: Verify the page loads**

```bash
cd /Users/ahn-yongsung/Project/modu-dashboard && python3 -m http.server 8080
```

Open `http://localhost:8080/pipeline.html` in a browser. Verify:
- No console errors
- KPI Row A shows 20 projects
- KPI Row B shows 10 company cards with upstream CAPEX values
- Matrix grid renders (8 region rows × 5 phase columns)
- Project table shows 20 rows

- [ ] **Step 3: Commit**

```bash
git add pipeline.html
git commit -m "feat: add E&P Pipeline page with matrix and project list"
```

---

## Task 3: Update nav in `drilling.html`, `fpso.html`, `earnings.html`, `fpso_earnings.html`, `news.html`

**Files:**
- Modify: `drilling.html`
- Modify: `fpso.html`
- Modify: `earnings.html`
- Modify: `fpso_earnings.html`
- Modify: `news.html`

Add `<a href="pipeline.html" class="nav-link">E&amp;P Pipeline</a>` immediately after the Overview link in each file. Do not touch `index.html`.

- [ ] **Step 1: Update `drilling.html` nav**

Find this line in `drilling.html`:
```html
        <a href="index.html" class="nav-link">Overview</a>
```
Replace with:
```html
        <a href="index.html" class="nav-link">Overview</a>
        <a href="pipeline.html" class="nav-link">E&amp;P Pipeline</a>
```

- [ ] **Step 2: Update `fpso.html` nav**

Find:
```html
        <a href="index.html" class="nav-link">Overview</a>
```
Replace with:
```html
        <a href="index.html" class="nav-link">Overview</a>
        <a href="pipeline.html" class="nav-link">E&amp;P Pipeline</a>
```

- [ ] **Step 3: Update `earnings.html` nav**

Same pattern — add the `pipeline.html` link after the Overview `<a>` tag.

- [ ] **Step 4: Update `fpso_earnings.html` nav**

Same pattern.

- [ ] **Step 5: Update `news.html` nav**

Same pattern.

- [ ] **Step 6: Verify nav on each page**

Open each page (`http://localhost:8080/drilling.html`, etc.) and confirm "E&P Pipeline" appears in the nav between Overview and the page's own active link.

- [ ] **Step 7: Commit**

```bash
git add drilling.html fpso.html earnings.html fpso_earnings.html news.html
git commit -m "feat: add E&P Pipeline nav link to all pages"
```

---

## Task 4: Remove CAPEX section from `drilling.html`

**Files:**
- Modify: `drilling.html`

Remove these HTML blocks, CSS rules, JS variables and functions. Work section by section.

- [ ] **Step 1: Remove CSS blocks**

Delete all CSS from `drilling.html` that starts with `.capex-` or `.capex-drilldown`. This covers the following named blocks (lines shift as you edit — search by selector name):

```css
/* ─── CAPEX section ─── */
.capex-section { ... }

/* ─── CAPEX Drilldown ─── */
.capex-drilldown { ... }
.capex-drilldown.open { ... }
.capex-drilldown-inner { ... }
.capex-drilldown-header { ... }
.capex-drilldown-title { ... }
.capex-drilldown-body { ... }
@media ... { .capex-drilldown-body { ... } }
.capex-drilldown-body > div { ... }
.capex-drilldown-body > div:first-child { ... }
.capex-sub-label { ... }
.capex-toggle { ... }
.capex-toggle-btn { ... }
.capex-toggle-btn:hover { ... }
.capex-toggle-btn.active { ... }
.capex-section .section-label { ... }
.capex-chart-container { ... }
```

- [ ] **Step 2: Remove the CAPEX HTML section**

Delete the entire `<div class="capex-section">` block including its closing `</div>`, and the `<div class="capex-drilldown" id="capex-drilldown">` block including its closing `</div>`. These appear between the Dayrate panel and the Newbuild section in the HTML body.

- [ ] **Step 3: Remove JS variables**

Delete these two variable declarations from the JS data-loading block at the top of the `<script>`:
```js
let capexChart = null;
let capexTable = null;
```

Also remove `capex` from the `let fleet, rates, capex, earnings;` declaration line — change it to:
```js
let fleet, rates, earnings;
```

- [ ] **Step 4: Remove capex fetch**

Remove `fetch('./data/capex.json').then(r => r.json()),` from the `Promise.all([...])` call. Change:
```js
[fleet, rates, capex, earnings] = await Promise.all([
  fetch('./data/fleet.json').then(r => r.json()),
  fetch('./data/rates.json').then(r => r.json()),
  fetch('./data/capex.json').then(r => r.json()),
  fetch('./data/earnings.json').then(r => r.json()),
]);
```
To:
```js
[fleet, rates, earnings] = await Promise.all([
  fetch('./data/fleet.json').then(r => r.json()),
  fetch('./data/rates.json').then(r => r.json()),
  fetch('./data/earnings.json').then(r => r.json()),
]);
```

- [ ] **Step 5: Remove CAPEX JS functions**

Delete these four functions in their entirety:
- `function switchCapexMode(mode) { ... }`
- `function renderCapexChart() { ... }`
- `function renderCapexTable() { ... }`
- `function renderCapexDrilldown(company) { ... }`

Search for `function switchCapexMode`, `function renderCapexChart`, `function renderCapexTable`, `function renderCapexDrilldown` and delete each function block through its closing `}`.

Also delete the `closeCapexDrilldown` function:
```js
function closeCapexDrilldown() {
  document.getElementById('capex-drilldown').classList.remove('open');
  if (capexTable) capexTable.getRows().forEach(r => r.getElement().classList.remove('row-selected'));
}
```

- [ ] **Step 6: Remove CAPEX init calls**

At the bottom of the `<script>`, remove these two lines:
```js
renderCapexChart();
renderCapexTable();
```

Also remove the event listener that references `close-capex-drilldown`:
```js
document.getElementById('close-capex-drilldown').addEventListener('click', closeCapexDrilldown);
```

- [ ] **Step 7: Verify drilling.html loads cleanly**

Open `http://localhost:8080/drilling.html`. Verify:
- No console errors
- Page loads and renders fleet table, dayrate chart, contractor summary
- No CAPEX chart or table visible
- No errors about `capex` or undefined functions

- [ ] **Step 8: Commit**

```bash
git add drilling.html
git commit -m "feat: remove CAPEX section from drilling.html (moved to pipeline.html)"
```

---

## Self-Review

**Spec coverage check:**
- ✅ `pipeline.html` — new page created
- ✅ `data/pipeline.json` — 20 projects, 9 IOCs, offshore, $1B+ scope, phases, regions
- ✅ KPI Row A (pipeline stats) + Row B (company totals from capex.json)
- ✅ Phase × Region matrix with heatmap and click-to-filter
- ✅ Company filter buttons
- ✅ Project list (Tabulator) with all specified columns
- ✅ Project drawer with all specified fields
- ✅ Nav updated on all pages except index.html
- ✅ CAPEX section removed from drilling.html (HTML, CSS, JS, variables, functions, fetch)
- ✅ Style follows existing design system (CSS vars, Tabulator pattern, drawer pattern)
- ✅ Phase badge colours match spec (Pre-FEED=muted, FEED=yellow, FID=orange, Execution=accent, Production=green)
- ✅ `capex.json` retained, read by pipeline.html for KPI Row B

**Placeholder scan:** No TBD, TODO, or incomplete code blocks present.

**Type consistency:** `activeCell` is `{ region, phase } | null` throughout. `activeCompany` is a string throughout. `projectTable` is a Tabulator instance. All field names (`company`, `project`, `region`, `phase`, `capex_busd`, `fid_date`, `first_production`, `asset_type`, `source`, `source_url`, `confidence`, `notes`) match the pipeline.json schema in Task 1.
