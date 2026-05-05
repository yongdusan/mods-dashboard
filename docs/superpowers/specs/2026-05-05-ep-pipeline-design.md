# E&P Pipeline Page — Design Spec

**Date:** 2026-05-05
**Status:** Approved

---

## Overview

Add a dedicated **E&P Pipeline** page (`pipeline.html`) to the MODU Intelligence Dashboard. The page surfaces demand-side data — major offshore project pipelines from 9 tracked IOCs — separately from the supply-side drilling fleet data. The existing E&P CAPEX section is removed from `drilling.html`.

---

## Motivation

`drilling.html` currently mixes supply-side data (rig fleet, dayrates) with demand-side data (E&P CAPEX). CAPEX investment plans are relevant to both drilling and FPSO markets, so burying them inside the drilling page understates their cross-market significance. A dedicated page clarifies the analytical purpose of each section and gives the pipeline data room to grow.

---

## Scope

- **9 IOCs:** ExxonMobil, Shell, bp, Chevron, TotalEnergies, Saudi Aramco, ADNOC, Petrobras, PETRONAS
- **Offshore projects only**
- **$1B CAPEX or above** (or near-FID projects of strategic significance below that threshold)
- Phase coverage: Pre-FEED through Production

---

## Navigation

Insert **E&P Pipeline** immediately after Overview in the main nav:

```
Overview → E&P Pipeline → Drilling/MODU → FPSO/FLNG Assets → Drilling Financials → FPSO/FLNG Financials → Market News
```

No link card or remnant is left in `drilling.html`. Users discover the page through the nav.

---

## Files

| File | Action |
|------|--------|
| `pipeline.html` | Create — new page |
| `data/pipeline.json` | Create — project-level data (single source of truth) |
| `data/capex.json` | Keep — company annual CAPEX totals, read by pipeline.html for KPI cards |
| `drilling.html` | Remove CAPEX section (chart + table + drilldown + associated CSS) |

---

## Data: `pipeline.json`

### Top-level structure

```json
{
  "updated": "YYYY-MM-DD",
  "data_quality": {
    "confidence": "medium",
    "basis": "Company filings, earnings releases and project announcements",
    "notes": "Phase and CAPEX figures reflect latest disclosed status; subject to FID revision."
  },
  "projects": [ ... ]
}
```

### Project object schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Kebab-case slug, e.g. `"chevron-anchor"` |
| `company` | string | IOC name, must match `capex.json` company names |
| `project` | string | Project name |
| `region` | string | One of the 8 defined regions (see below) |
| `asset_type` | string | e.g. `"Deepwater Oil"`, `"Deepwater Gas"`, `"FPSO"` |
| `phase` | string | One of 5 defined phases (see below) |
| `capex_busd` | number \| null | Total project CAPEX in $B |
| `fid_date` | string \| null | `"YYYY-MM"` or `"YYYY"` if month unknown |
| `first_production` | string \| null | `"YYYY"` expected production start |
| `source` | string | Source description |
| `source_url` | string \| null | Direct URL to source document |
| `confidence` | string | `"high"` / `"medium"` / `"low"` |
| `notes` | string \| null | Key facts (rig type, capacity, partners, etc.) |

### Phase values

| Value | Meaning |
|-------|---------|
| `Pre-FEED` | Concept selection; FID multiple years away |
| `FEED` | Front-end engineering design underway; FID imminent |
| `FID` | Final investment decision taken; mobilisation underway |
| `Execution` | Under construction / installation |
| `Production` | First production achieved |

### Region values

`Gulf of Mexico` · `Brazil` · `West Africa` · `North Sea/Norway` · `Middle East` · `Asia Pacific` · `East Africa` · `Other`

---

## UI Layout

### 1. KPI Cards

Two rows of cards at the top of the page.

**Row A — Pipeline summary (from `pipeline.json`):**

| Card | Value |
|------|-------|
| Projects Tracked | Total project count |
| Total CAPEX | Sum of all `capex_busd` values ($B) |
| FID Imminent | Count of projects in `FEED` or `FID` phase |

**Row B — Company CAPEX totals (from `capex.json`):**

One card per IOC showing the latest annual upstream CAPEX guidance value. Same data previously shown in the CAPEX table on `drilling.html`, now surfaced here as compact reference cards.

### 2. Phase × Region Matrix

A grid with **Region as rows** and **Phase as columns**.

- Each cell shows the **project count** for that Region × Phase combination
- Cell background colour intensity is proportional to **total CAPEX** in that cell (heatmap)
- Empty cells display `·`
- Clicking a cell filters the project list below and highlights the cell with a border
- Clicking the same cell again clears the filter

### 3. Company Filter Buttons

A row of toggle buttons — `All` plus one per company — placed between the matrix and the project list. Interacts with the active matrix cell filter (both filters apply simultaneously).

### 4. Project List (Tabulator)

Columns:

| Column | Field | Notes |
|--------|-------|-------|
| Company | `company` | Bold |
| Project | `project` | |
| Region | `region` | |
| Phase | `phase` | Colour-coded badge |
| CAPEX ($B) | `capex_busd` | Right-aligned, mono |
| FID | `fid_date` | |
| First Production | `first_production` | |
| Type | `asset_type` | |

Clicking a row opens a right-side **drawer** with full project detail including notes and source link.

### 5. Drawer Detail

| Field | Displayed as |
|-------|-------------|
| Project name + company | Header |
| Region, Phase, Asset Type | Metadata row |
| CAPEX | Highlighted value |
| FID date | |
| First Production | |
| Notes | Free text |
| Source | Linked URL |

---

## `drilling.html` Changes

Remove entirely:
- `.capex-section` div (Operator CAPEX chart + table)
- `.capex-drilldown` div (drilldown panel)
- All CSS blocks prefixed with `.capex-` and `.capex-drilldown`
- `capex` variable and fetch from the data loading block
- `renderCapex()` function and related helpers
- `switchCapexMode()` function
- `capexChart` variable and Chart.js instance

The `capex.json` fetch is removed from `drilling.html` but retained in `pipeline.html`.

---

## Style Conventions

Follow the existing design system in `drilling.html`:

- CSS custom properties: `--accent`, `--blue`, `--yellow`, `--green`, `--orange`, `--text`, `--text-muted`, `--bg`, `--surface`
- Font: `var(--font-mono)` for all numeric values
- Tabulator: same config pattern as `contractor-table` and fleet table
- Drawer: same `.drawer` pattern as the rig detail drawer in `drilling.html`
- Phase badge colours: Pre-FEED=muted, FEED=yellow, FID=orange, Execution=accent, Production=green

---

## Out of Scope

- Editing or updating `capex.json` company totals (separate update cycle)
- Project-level operator equity / partner breakdown
- Timeline / Gantt view (potential future enhancement)
- PETRONAS / Saudi Aramco project data below FID (limited public disclosure)
