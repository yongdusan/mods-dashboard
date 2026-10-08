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
3. **FSR 전수 대조 (컨트랙터 단위)**: 이번 실행 대상 컨트랙터의 최신 Fleet Status Report(PDF)를 받아 `data/fleet.json`의 해당 컨트랙터 리그를 **리그 단위로 전수 대조**한다.
   - 대상 선정(순환): 오늘 날짜의 ISO 주차(week number)를 3으로 나눈 나머지로 고른다 — 0: Transocean·Valaris, 1: Noble·Seadrill, 2: Borr·Odfjell·Stena·Dolphin·Vantage·Hanwha. 단, 어느 컨트랙터든 최근 4주 내 새 FSR이 나왔으면 그 컨트랙터를 우선 포함한다.
   - FSR 확보: 회사 IR 페이지 → PDF. WebFetch가 텍스트를 못 읽으면 저장된 PDF 파일을 Read 도구로 페이지 지정해 읽는다(표가 이미지로 보임).
   - 대조 항목: 리그 존재 여부(FSR에 없는 리그 = 매각/이탈 → 제거 후 `data_quality`에 기록, FSR에만 있는 부유식 리그 = 추가), 리그 유형(드릴십/반잠수식/잭업), 현재 계약의 운영사·지역·시작/종료월·dayrate, 계류/대기 상태.
   - 리그 이름과 계약을 다른 리그에 대입하지 않는다(과거 오류: Noble Developer의 $375k 계약이 Valiant에 기재). 언론 보도에 리그명이 없으면 FSR로 확인될 때까지 반영하지 않는다.
   - 현재 진행 중인 계약이 없고 다음 계약이 확정된 리그는 status "Idle", contract_start/end에 다음 계약을 적고 data_note에 "계약 개시 전"을 명시한다.
   - 수심 1,500ft 미만 반잠수식(P&A 전용 등)은 심해 범위 밖이므로 추가하지 않는다.
4. 그 외 컨트랙터는 보도자료·trade press(Offshore Energy, Rigzone, World Oil)로 최근 4주 신규 계약/연장, 계약 만료 리그(check_data.py가 지적한 항목)만 확인한다.
5. 리그별 갱신 규칙(CLAUDE.md §1): 신규 계약은 status/operator/contract_start/contract_end/day_rate_kusd, 계약 종료 후 후속 미확인은 status "Idle"과 계약 필드 null. day rate가 공시되지 않으면 null. 각 수정 리그의 `source`/`source_url`에 출처를 적는다.
6. `updated`를 오늘 날짜로 바꾼다.
7. `python3 scripts/check_data.py` 재실행해 ERROR 0을 확인한다. ERROR가 있으면 고친다. 고칠 수 없으면 해당 변경을 되돌리고 보고한다. (커밋·push는 워크플로가 한다)

## 보고 (한국어, 짧게)
- 변경한 리그(이름 · 전/후 상태 · 출처)
- 확인 못 한 리그와 이유
- check_data.py 결과 요약