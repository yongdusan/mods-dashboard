#!/usr/bin/env python3
"""News candidate collector for the Offshore Market Intelligence dashboard (no LLM, no API cost).

Collects the last N days of offshore-relevant items from trade-press RSS feeds,
drops items already in data/news.json, prunes news items older than 180 days,
and writes the remaining candidates to a JSON file. A Claude session (subscription,
see automation/prompts/news.md) then picks up to 5 items and writes Korean summaries.

Usage:
  python3 scripts/refresh_news.py                      # writes news_candidates.json in repo root
  python3 scripts/refresh_news.py --out /tmp/c.json --days 10
"""
from __future__ import annotations

import argparse
import json
import pathlib
import re
import sys
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree as ET

import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
NEWS_PATH = ROOT / "data" / "news.json"

RSS_FEEDS = [
    "https://www.offshore-energy.biz/feed/",
    "https://www.rigzone.com/news/rss/rigzone_news.aspx",
    "https://www.oedigital.com/feed/",
]

KEYWORDS = [
    "drillship", "jackup", "jack-up", "semi-submersible", "semisubmersible",
    "offshore rig", "rig contract", "day rate", "dayrate", "backlog",
    "FPSO", "FLNG", "offshore drilling", "deepwater", "subsea",
    "Transocean", "Valaris", "Noble", "Seadrill", "Borr",
    "SBM Offshore", "BW Offshore", "Golar", "Yinson", "MODEC",
    "Petrobras", "ExxonMobil", "Shell", "Equinor", "TotalEnergies",
    "bp ", "Chevron", "ADNOC", "Saudi Aramco", "QatarEnergy",
]


def fetch_rss(url: str, cutoff: datetime) -> list[dict]:
    try:
        resp = requests.get(url, timeout=15, headers={"User-Agent": "modu-dashboard/1.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except Exception as e:
        print(f"Warning: failed to fetch {url}: {e}", file=sys.stderr)
        return []

    items = []
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        description = (item.findtext("description") or "").strip()
        try:
            pub = parsedate_to_datetime((item.findtext("pubDate") or "").strip())
            if pub.tzinfo is None:
                pub = pub.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        if pub < cutoff:
            continue
        text = (title + " " + description).lower()
        if not any(kw.lower() in text for kw in KEYWORDS):
            continue
        items.append({
            "title": title,
            "url": link,
            "date": pub.strftime("%Y-%m-%d"),
            "source_feed": url.split("/")[2],
            "description": re.sub(r"<[^>]+>", "", description)[:500],
        })
    return items


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(ROOT / "news_candidates.json"))
    ap.add_argument("--days", type=int, default=10)
    a = ap.parse_args()

    news = json.loads(NEWS_PATH.read_text(encoding="utf-8"))
    have_urls = {i.get("url", "") for i in news["items"]}
    have_titles = {i.get("title", "").lower() for i in news["items"]}

    cutoff = datetime.now(timezone.utc) - timedelta(days=a.days)
    seen, candidates = set(), []
    for feed in RSS_FEEDS:
        for c in fetch_rss(feed, cutoff):
            if c["url"] in have_urls or c["title"].lower() in have_titles or c["url"] in seen:
                continue
            seen.add(c["url"])
            candidates.append(c)
    candidates.sort(key=lambda c: c["date"], reverse=True)

    six_months_ago = (datetime.now(timezone.utc) - timedelta(days=180)).strftime("%Y-%m-%d")
    before = len(news["items"])
    news["items"] = [i for i in news["items"] if i.get("date", "9999") >= six_months_ago]
    if len(news["items"]) != before:
        NEWS_PATH.write_text(json.dumps(news, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    out = {
        "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "next_id": max((i.get("id", 0) for i in news["items"]), default=0) + 1,
        "pruned_older_than_180d": before - len(news["items"]),
        "candidates": candidates,
    }
    pathlib.Path(a.out).write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(candidates)} new candidates -> {a.out} (pruned {out['pruned_older_than_180d']}, next id {out['next_id']})")


if __name__ == "__main__":
    main()
