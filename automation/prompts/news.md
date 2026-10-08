# MODU 대시보드 — 마켓 뉴스(news.json) 주간 갱신

## 실행 환경 (무인 실행)
- 작업 폴더는 저장소 루트다. 상대 경로(`data/...`, `scripts/...`)를 쓴다.
- 먼저 `CLAUDE.md`의 "데이터 신뢰성 원칙"과 §5 news.json 절차를 읽는다.
- 쓸 수 있는 도구: Read, Edit/Write(`data/news.json`만), WebFetch(기사 본문 확인용), Bash는 `python3 scripts/refresh_news.py`, `python3 scripts/check_data.py`, `python3 -m json.tool data/news.json`, `git status`, `git diff`만.
- **git commit / push는 하지 않는다.** 워크플로가 검증 후 커밋·push한다.
- 오늘 날짜는 환경 변수 `TODAY`(YYYY-MM-DD) 기준.

## 할 일
1. `python3 scripts/refresh_news.py` 실행 → 지난 10일 RSS 후보가 `news_candidates.json`에 저장되고(이미 있는 기사 제외), 180일 지난 뉴스는 자동 삭제된다.
2. `news_candidates.json`을 읽고 해양 E&P·드릴링·FPSO 실무자에게 중요한 기사 **최대 5건**을 고른다. 육상·파이프라인 단독·무관한 기사는 제외한다. 우선순위: 계약(특히 리그·FPSO), FID·first oil, 실적, M&A, 시장 전망.
3. 고른 기사마다 `data/news.json` `items` 맨 앞(최신순)에 추가한다:
   ```json
   {"id": <next_id부터 1씩>, "date": "YYYY-MM-DD", "sector": "Drilling|FPSO/FLNG|E&P/CAPEX",
    "category": "Contract|Earnings|Fleet|M&A|Outlook", "title": "영문 제목 80자 이내",
    "summary": "한국어 2~3문장 요약", "companies": ["회사명"], "source": "매체명", "url": "https://..."}
   ```
   - summary는 RSS 설명만으로 사실관계(금액, 리그명, 기간 등)가 불분명하면 WebFetch로 기사 본문을 확인해 쓴다. 확인 안 된 수치는 쓰지 않는다.
   - sector 기준: Drilling = 드릴십·반잠수식·잭업 계약/실적/시장, FPSO/FLNG = 부유식 생산설비, E&P/CAPEX = 운영사 투자·FID·전망.
4. 후보가 없거나 중요한 기사가 없으면 추가하지 않는다(`updated`만 오늘로).
5. `updated`를 오늘 날짜로 바꾸고 `python3 scripts/check_data.py`로 ERROR 0 확인.

## 보고 (한국어, 짧게)
- 추가한 기사(날짜 · 제목 · sector/category), 후보 수, 제외 사유 요약
