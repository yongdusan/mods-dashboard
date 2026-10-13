#!/usr/bin/env python3
"""Source-audit queue: which records to re-check against a primary source next.

Records without a `source_url` come first (their numbers have never been traced
to a source), then the ones with the oldest `verified` date. Each scheduled
refresh takes the first N items, checks every number/date against a tier-1/2
source, and either corrects it or sets it to null. See automation/prompts/*.md.

Usage:
  python3 scripts/audit_queue.py pipeline --n 6
  python3 scripts/audit_queue.py fpso --n 8      # vessels + orderbook
  python3 scripts/audit_queue.py fleet --n 5
  python3 scripts/audit_queue.py --summary       # counts only
"""
from __future__ import annotations

import argparse
import json
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = pathlib.Path(os.environ.get("OMI_DATA_DIR", ROOT / "data"))


def records(kind: str):
    if kind == "pipeline":
        for i, p in enumerate(json.loads((DATA / "pipeline.json").read_text())["projects"]):
            yield f"projects/{i}", p.get("id"), p
    elif kind == "fpso":
        d = json.loads((DATA / "fpso.json").read_text())
        for sec in ("orderbook", "vessels"):
            for i, v in enumerate(d[sec]):
                yield f"{sec}/{i}", v.get("name"), v
    elif kind == "fleet":
        for i, r in enumerate(json.loads((DATA / "fleet.json").read_text())["rigs"]):
            yield f"rigs/{i}", r.get("name"), r
    else:
        raise SystemExit(f"unknown kind {kind}")


def queue(kind: str):
    items = list(records(kind))
    # unsourced first, then oldest verified (missing verified sorts first)
    items.sort(key=lambda t: (bool(t[2].get("source_url")), t[2].get("verified") or ""))
    return items


def unsourced_counts():
    out = {}
    for kind in ("pipeline", "fpso", "fleet"):
        items = list(records(kind))
        out[kind] = (sum(1 for _, _, r in items if not r.get("source_url")), len(items))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("kind", nargs="?", choices=["pipeline", "fpso", "fleet"])
    ap.add_argument("--n", type=int, default=5)
    ap.add_argument("--summary", action="store_true")
    a = ap.parse_args()
    if a.summary or not a.kind:
        for k, (u, t) in unsourced_counts().items():
            print(f"{k:9s} {u:3d} / {t} records without source_url")
        return
    for path, name, r in queue(a.kind)[: a.n]:
        print(f"{path:14s} {name}  (source_url: {'yes' if r.get('source_url') else 'NONE'}, verified: {r.get('verified') or '-'})")


if __name__ == "__main__":
    main()
