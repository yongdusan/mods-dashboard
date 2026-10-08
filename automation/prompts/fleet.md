# MODU 대시보드 — 리그 현황(fleet.json) 주간 갱신

## 실행 환경 (GitHub Actions 클라우드 — 무인 실행)
- 작업 폴더는 저장소 루트다. 상대 경로(`data/...`, `scripts/...`)를 쓴다.
- 먼저 `CLAUDE.md`를 끝까지 읽고 "데이터 신뢰성 원칙"(1~2등급 출처만, 패턴 대입 금지, 불확실하면 null)을 지킨다.
- 쓸 수 있는 도구: WebSearch, WebFetch, Read, Edit/Write(`data/` 아래만), Bash는 `python3 scripts/check_data.py`, `python3 -m json.tool data/<file>`, `git status`, `git diff`만.
- **git commit / push는 하지 않는다.** 작업이 끝나면 워크플로가 `scripts/check_data.py`로 검증한 뒤 담당 파일만 커밋·push한다. 검증에서 ERROR가 나면 배포되지 않으므로, 끝내기 전에 직접 check_data.py를 돌려 ERROR 0을 확인한다.
- 오늘 날짜는 환경 변수 `TODAY`(YYYY-MM-DD)를 기준으로 한다.
- 확인이 안 되는 항목은 건너뛰고 마지막 보고에 남긴다.

## 할 일
1. `python3 scripts/check_data.py` 실행 → fleet 관련 OVERDUE 항목(계약 종료일이 지났는데 'On Contract'인 리그 등)을 우선 처리 목록으로 삼는다.
2. `data/fleet.json`을 읽는다. CLAUDE.md §1의 prev_week 규칙대로 **수정 전 집계값을 prev_week에 먼저 기록**한다.
3. 컨트랙터별 최신 Fleet Status Report / 보도자료 / trade press(Offshore Energy, Rigzone, World Oil)에서 확인:
   - Transocean, Valaris, Noble, Seadrill, Borr Drilling, Odfjell, Stena, Dolphin, Vantage, Hanwha Drilling
   - 우선순위: (a) contract_end가 지난 리그의 후속 계약 여부, (b) 최근 4주 신규 계약/연장, (c) 스택·매각·조선소 입거
4. 리그별 갱신 규칙(CLAUDE.md §1): 신규 계약은 status/operator/contract_start/contract_end/day_rate_kusd, 계약 종료 후 후속 미확인은 status "Idle"과 계약 필드 null. day rate가 공시되지 않으면 null. 각 수정 리그의 `source`/`source_url`에 출처를 적는다.
5. `updated`를 오늘 날짜로 바꾼다.
6. `python3 scripts/check_data.py` 재실행해 ERROR 0을 확인한다. ERROR가 있으면 고친다. 고칠 수 없으면 해당 변경을 되돌리고 보고한다. (커밋·push는 워크플로가 한다)

## 보고 (한국어, 짧게)
- 변경한 리그(이름 · 전/후 상태 · 출처)
- 확인 못 한 리그와 이유
- check_data.py 결과 요약