#!/usr/bin/env python3
"""Data health check for the Offshore Market Intelligence dashboard.

Two kinds of findings:
  ERROR    integrity problems that make the dashboard wrong (fails the run)
  OVERDUE  a data file has not been refreshed within its cadence (reported, does not fail)

Usage:
  python3 scripts/check_data.py              # human-readable report, exit 1 on ERROR
  python3 scripts/check_data.py --markdown   # report formatted for a GitHub issue
  python3 scripts/check_data.py --today 2026-10-08
"""
import argparse
import os
import datetime as dt
import json
import pathlib
import re
import sys
from collections import Counter, defaultdict

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = pathlib.Path(os.environ.get("OMI_DATA_DIR", ROOT / "data"))

# Maximum age in days before a file counts as overdue (CLAUDE.md update cadence + grace).
CADENCE = {
    "news.json": 10,
    "fleet.json": 14,
    "pipeline.json": 40,
    "fpso.json": 40,
    "earnings.json": 100,
    "fpso_earnings.json": 100,
    "rates.json": 100,
    "capex.json": 100,
}

PHASES = {"Pre-FEED", "FEED", "FID", "Execution", "Production"}
CATEGORIES = {"Contract", "Earnings", "Fleet", "M&A", "Outlook"}
SECTORS = {"Drilling", "FPSO/FLNG", "E&P/CAPEX"}
RIG_STATUS = {"On Contract", "Idle", "Cold Stacked", "Shipyard"}


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def quarter_index(period):
    m = re.match(r"Q([1-4]) (\d{4})", period or "")
    return int(m.group(2)) * 4 + int(m.group(1)) if m else None


def p_numbers(text):
    return set(re.findall(r"\bP-(\d{2,3})\b", text or ""))


def run(today):
    errors, overdue, notes = [], [], []

    # ---------- freshness ----------
    for name, max_age in CADENCE.items():
        d = load(name)
        upd = d.get("updated")
        if not upd:
            errors.append(f"{name}: missing 'updated'")
            continue
        age = (today - dt.date.fromisoformat(upd)).days
        if age > max_age:
            overdue.append(f"{name}: last updated {upd} ({age} days; cadence {max_age} days)")

    # ---------- fleet ----------
    fleet = load("fleet.json")
    names = Counter(r["name"] for r in fleet["rigs"])
    for n, c in names.items():
        if c > 1:
            errors.append(f"fleet.json: duplicate rig '{n}'")
    month = today.strftime("%Y-%m")
    expired = []
    for r in fleet["rigs"]:
        if r.get("status") not in RIG_STATUS:
            errors.append(f"fleet.json: {r['name']} has invalid status '{r.get('status')}'")
        ce = r.get("contract_end")
        if r.get("status") == "On Contract" and ce and ce < month:
            expired.append(f"{r['name']} ({r['contractor']}, ended {ce})")
    if expired:
        overdue.append(f"fleet.json: {len(expired)} rigs still 'On Contract' after contract_end — " + "; ".join(expired[:8]) + (" …" if len(expired) > 8 else ""))

    # ---------- pipeline ----------
    pipe = load("pipeline.json")["projects"]
    for pid, c in Counter(p["id"] for p in pipe).items():
        if c > 1:
            errors.append(f"pipeline.json: duplicate id '{pid}'")
    for p in pipe:
        if p.get("phase") not in PHASES:
            errors.append(f"pipeline.json: {p['id']} invalid phase '{p.get('phase')}'")
        for k, v in p.items():
            if v == "":
                errors.append(f"pipeline.json: {p['id']}.{k} is empty string (use null)")
        if p.get("phase") in ("Pre-FEED", "FEED") and p.get("fid_date"):
            errors.append(f"pipeline.json: {p['id']} is {p['phase']} but has fid_date {p['fid_date']}")
        if p.get("phase") == "Execution" and not p.get("fid_date"):
            errors.append(f"pipeline.json: {p['id']} is Execution without fid_date")
        fp = p.get("first_production")
        if p.get("phase") in ("Execution", "FID") and fp and fp < str(today.year):
            overdue.append(f"pipeline.json: {p['id']} first_production {fp} has passed but phase is still {p['phase']}")
        v = p.get("verified")
        if p.get("phase") != "Production" and v and (today - dt.date.fromisoformat(v)).days > 180:
            overdue.append(f"pipeline.json: {p['id']} verified {v} (>180 days)")

    # P-number must map to one project
    pmap = defaultdict(set)
    for p in pipe:
        for n in p_numbers(p.get("project")):
            pmap[n].add(p["id"])
    for n, ids in pmap.items():
        if len(ids) > 1:
            errors.append(f"pipeline.json: P-{n} appears in the project name of several entries: {sorted(ids)}")

    # ---------- fpso ----------
    fpso = load("fpso.json")
    vessel_p, order_p = defaultdict(list), defaultdict(list)
    for v in fpso["vessels"]:
        for n in p_numbers(v["name"]):
            vessel_p[n].append(v["name"])
    for o in fpso["orderbook"]:
        for n in p_numbers(o["name"]):
            order_p[n].append(o["name"])
        if o.get("delivery") and o["delivery"][:4] < str(today.year - 1):
            overdue.append(f"fpso.json: orderbook '{o['name']}' delivery {o['delivery']} has passed — move to vessels?")
    for n in set(vessel_p) & set(order_p):
        errors.append(f"fpso.json: P-{n} is both an operating vessel {vessel_p[n]} and in the orderbook {order_p[n]}")
    for n, lst in list(vessel_p.items()) + list(order_p.items()):
        if len(lst) > 1:
            errors.append(f"fpso.json: P-{n} listed more than once: {lst}")
    # the same P-number should describe the same field in pipeline and fpso
    field_words = lambda s: set(w for w in re.findall(r"[a-zà-ú]+", (s or "").lower()) if len(w) > 3)
    for n, names_ in order_p.items():
        for pid in pmap.get(n, []):
            proj = next(p for p in pipe if p["id"] == pid)
            if not (field_words(names_[0]) & field_words(proj["project"])):
                notes.append(f"P-{n}: fpso orderbook '{names_[0]}' vs pipeline '{proj['project']}' — check field names match")
    # Búzios module numbers must agree between files ("P-79 (Búzios 8)" vs "Búzios Phase 8 (P-79)")
    buz = lambda s: (re.search(r"b[uú]zios(?:\s+phase)?\s+(\d{1,2})\b", (s or "").lower()) or [None, None])[1]
    for n, lst in list(vessel_p.items()) + list(order_p.items()):
        fn = buz(lst[0])
        for pid in pmap.get(n, []):
            proj = next(p for p in pipe if p["id"] == pid)
            pn = buz(proj["project"])
            if fn and pn and fn != pn:
                errors.append(f"P-{n}: fpso says Búzios {fn} ('{lst[0]}') but pipeline says Búzios {pn} ('{proj['project']}')")
    owners = Counter(v.get("owner") for v in fpso["vessels"])
    for c in fpso["contractors"]:
        fo = c.get("fleet_owned")
        if fo is not None and owners.get(c["name"], 0) != fo:
            notes.append(f"fpso.json: {c['name']} fleet_owned={fo} but {owners.get(c['name'], 0)} vessels listed")

    # ---------- earnings ----------
    expected_q = (today.year * 4 + (today.month - 1) // 3 + 1) - 1  # last completed quarter
    for name in ("earnings.json", "fpso_earnings.json"):
        for c in load(name)["companies"]:
            qs = [quarter_index(q.get("period")) for q in c.get("quarters", [])]
            qs = [q for q in qs if q]
            if not qs:
                errors.append(f"{name}: {c['name']} has no quarters")
                continue
            lag = expected_q - max(qs)
            # results arrive 4-10 weeks after quarter end; two quarters behind is always overdue
            if lag >= 2 or (lag == 1 and today.month in (3, 6, 9, 12)):
                last = c["quarters"][-1]["period"]
                overdue.append(f"{name}: {c['name']} latest quarter is {last}")
            for q in c.get("quarters", []):
                r, e, m = q.get("revenue_musd"), q.get("adj_ebitda_musd"), q.get("ebitda_margin_pct")
                if r and e is not None and m is not None and abs(e / r * 100 - m) > 0.6:
                    errors.append(f"{name}: {c['name']} {q['period']} margin {m} != ebitda/revenue {e / r * 100:.1f}")

    # ---------- rates ----------
    rates = load("rates.json")
    last = max(x["date"] for x in rates["day_rates"])
    q_start = f"{today.year}-{((today.month - 1) // 3) * 3 + 1:02d}"
    if last < q_start and today.day > 20 or last < (dt.date(today.year, ((today.month - 1) // 3) * 3 + 1, 1) - dt.timedelta(days=95)).strftime("%Y-%m"):
        overdue.append(f"rates.json: latest day_rates entry is {last} (current quarter starts {q_start})")

    # ---------- news ----------
    news = load("news.json")["items"]
    for i in news:
        if i.get("category") not in CATEGORIES:
            errors.append(f"news.json: id {i.get('id')} invalid category '{i.get('category')}'")
        if i.get("sector") not in SECTORS:
            errors.append(f"news.json: id {i.get('id')} invalid sector '{i.get('sector')}'")
        if i.get("date", "") > today.isoformat():
            errors.append(f"news.json: id {i.get('id')} dated in the future ({i.get('date')})")
    for u, c in Counter(i.get("url") for i in news).items():
        if c > 1:
            notes.append(f"news.json: {c} items share one URL {u}")
    for k, c in Counter(i.get("id") for i in news).items():
        if c > 1:
            errors.append(f"news.json: duplicate id {k}")

    return errors, overdue, notes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--today")
    ap.add_argument("--markdown", action="store_true")
    a = ap.parse_args()
    today = dt.date.fromisoformat(a.today) if a.today else dt.date.today()
    errors, overdue, notes = run(today)

    if a.markdown:
        out = [f"Data health check — {today.isoformat()}", ""]
        for title, items in (("Errors (dashboard shows wrong data)", errors),
                             ("Overdue (refresh needed)", overdue),
                             ("Notes (review)", notes)):
            out.append(f"### {title} — {len(items)}")
            out += [f"- {x}" for x in items] or ["- none"]
            out.append("")
        print("\n".join(out))
    else:
        for label, items in (("ERROR", errors), ("OVERDUE", overdue), ("NOTE", notes)):
            for x in items:
                print(f"{label:8s} {x}")
        print(f"\n{len(errors)} errors · {len(overdue)} overdue · {len(notes)} notes")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
