#!/usr/bin/env python3
"""Weekly news refresh for MODU Intelligence Dashboard.

RSS 피드 수집 → Haiku API 1회 호출 → news.json 업데이트
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree as ET

import anthropic
import requests

RSS_FEEDS = [
    "https://www.offshore-energy.biz/feed/",
    "https://www.rigzone.com/news/rss/rigzone_news.aspx",
    "https://www.oedigital.com/feed/",
]

KEYWORDS = [
    "drillship", "jackup", "semi-submersible", "semisubmersible",
    "offshore rig", "rig contract", "day rate", "dayrate", "backlog",
    "FPSO", "FLNG", "offshore drilling", "deepwater", "subsea",
    "Transocean", "Valaris", "Noble", "Seadrill", "Borr",
    "SBM Offshore", "BW Offshore", "Golar", "Yinson", "MODEC",
    "Petrobras", "ExxonMobil", "Shell", "Equinor", "TotalEnergies",
    "bp ", "Chevron", "ADNOC", "Saudi Aramco",
]

NEWS_PATH = "data/news.json"


def fetch_rss(url: str, cutoff: datetime) -> list[dict]:
    try:
        resp = requests.get(url, timeout=15, headers={"User-Agent": "modu-dashboard/1.0"})
        resp.raise_for_status()
        root = ET.fromstring(resp.content)
    except Exception as e:
        print(f"Warning: Failed to fetch {url}: {e}", file=sys.stderr)
        return []

    items = []
    for item in root.findall(".//item"):
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        pub_date_str = (item.findtext("pubDate") or "").strip()
        description = (item.findtext("description") or "").strip()

        try:
            pub_date = parsedate_to_datetime(pub_date_str)
            if pub_date.tzinfo is None:
                pub_date = pub_date.replace(tzinfo=timezone.utc)
        except Exception:
            continue

        if pub_date < cutoff:
            continue

        text = (title + " " + description).lower()
        if not any(kw.lower() in text for kw in KEYWORDS):
            continue

        items.append({
            "title": title,
            "url": link,
            "date": pub_date.strftime("%Y-%m-%d"),
            "description": re.sub(r"<[^>]+>", "", description)[:400],
        })

    return items


def main():
    with open(NEWS_PATH, encoding="utf-8") as f:
        news_data = json.load(f)

    existing_urls = {item.get("url", "") for item in news_data["items"]}
    existing_titles = {item.get("title", "").lower() for item in news_data["items"]}
    max_id = max((item.get("id", 0) for item in news_data["items"]), default=0)
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # 최근 10일치 RSS 수집
    cutoff = datetime.now(timezone.utc) - timedelta(days=10)
    candidates = []
    for url in RSS_FEEDS:
        candidates.extend(fetch_rss(url, cutoff))

    # 중복 제거
    new_candidates = [
        c for c in candidates
        if c["url"] not in existing_urls
        and c["title"].lower() not in existing_titles
    ]

    # 6개월 초과 항목 제거
    six_months_ago = (datetime.now(timezone.utc) - timedelta(days=180)).strftime("%Y-%m-%d")
    news_data["items"] = [
        item for item in news_data["items"]
        if item.get("date", "9999") >= six_months_ago
    ]

    if not new_candidates:
        print("No new candidates from RSS feeds.")
        news_data["updated"] = today
        with open(NEWS_PATH, "w", encoding="utf-8") as f:
            json.dump(news_data, f, ensure_ascii=False, indent=2)
        return

    # Haiku API 1회 호출
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    prompt = f"""You are updating the MODU Intelligence Dashboard news feed.

Today: {today}
Next available ID: {max_id + 1}

From the RSS candidates below, select up to 5 most significant items for offshore oil & gas professionals.
Skip items about onshore, pipeline-only, or unrelated topics.

Return ONLY a valid JSON array, no markdown fences, no explanation.
Each object MUST have all fields:

[
  {{
    "id": {max_id + 1},
    "date": "YYYY-MM-DD",
    "sector": "Drilling|FPSO/FLNG|E&P/CAPEX",
    "category": "Contract|Earnings|Fleet|M&A|Outlook",
    "title": "Concise English title under 80 chars",
    "summary": "한국어 2~3문장 요약",
    "companies": ["CompanyName"],
    "source": "Source name",
    "url": "https://..."
  }}
]

sector 분류 기준:
- "Drilling": drillship/semi/jackup 계약·실적·시장 동향 (Transocean, Valaris, Noble, Seadrill, Borr 등)
- "FPSO/FLNG": FPSO·FLNG 계약·실적·프로젝트 (SBM Offshore, BW Offshore, Golar, Yinson, MODEC 등)
- "E&P/CAPEX": IOC·NOC CAPEX 가이던스·투자계획·시장 전망 보고서

category 허용값: Contract | Earnings | Fleet | M&A | Outlook

RSS candidates:
{json.dumps(new_candidates, ensure_ascii=False, indent=2)}"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()

    try:
        new_items = json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\[.*\]", raw, re.DOTALL)
        if match:
            new_items = json.loads(match.group())
        else:
            print(f"Error: Could not parse Haiku response:\n{raw}", file=sys.stderr)
            sys.exit(1)

    if not isinstance(new_items, list) or not new_items:
        print("Haiku returned no new items — nothing to add.")
        news_data["updated"] = today
        with open(NEWS_PATH, "w", encoding="utf-8") as f:
            json.dump(news_data, f, ensure_ascii=False, indent=2)
        return

    # 최신순 정렬 후 앞에 삽입
    new_items_sorted = sorted(new_items, key=lambda x: x.get("date", ""), reverse=True)
    news_data["items"] = new_items_sorted + news_data["items"]
    news_data["updated"] = today

    with open(NEWS_PATH, "w", encoding="utf-8") as f:
        json.dump(news_data, f, ensure_ascii=False, indent=2)

    added_titles = [i.get("title", "")[:60] for i in new_items]
    print(f"Added {len(new_items)} items: {added_titles}")


if __name__ == "__main__":
    main()
