# MODU 대시보드 — E&P 파이프라인 + FPSO 월간 갱신

## 실행 환경 (GitHub Actions 클라우드 — 무인 실행)
- 작업 폴더는 저장소 루트다. 상대 경로(`data/...`, `scripts/...`)를 쓴다.
- 먼저 `CLAUDE.md`를 끝까지 읽고 "데이터 신뢰성 원칙"(1~2등급 출처만, 패턴 대입 금지, 불확실하면 null)을 지킨다.
- 쓸 수 있는 도구: WebSearch, WebFetch, Read, Edit/Write(`data/` 아래만), Bash는 `python3 scripts/check_data.py`, `python3 scripts/audit_queue.py`, `python3 -m json.tool data/<file>`, `git status`, `git diff`만.
- **git commit / push는 하지 않는다.** 작업이 끝나면 워크플로가 `scripts/check_data.py`로 검증한 뒤 담당 파일만 커밋·push한다. 검증에서 ERROR가 나면 배포되지 않으므로, 끝내기 전에 직접 check_data.py를 돌려 ERROR 0을 확인한다.
- 오늘 날짜는 환경 변수 `TODAY`(YYYY-MM-DD)를 기준으로 한다.
- 확인이 안 되는 항목은 건너뛰고 마지막 보고에 남긴다.

## 범위 결정
- 실행 월이 1·4·7·10월이면 **전수 점검**: CLAUDE.md §6-2의 IOC 8개사 + NOC 5개사 최신 분기 실적/IR의 프로젝트 업데이트 + 신규 프로젝트 탐색(§6-5 Step B).
- 그 외 월은 **집중 점검**: check_data.py가 지적한 항목, verified가 90일 넘은 비-Production 프로젝트, FEED 단계(FID 임박), 올해 first_production 예정인 Execution 프로젝트, Petrobras BOT 입찰(P-91 Búzios 12 등), FPSO 계약 뉴스.

## 할 일
1. `python3 scripts/check_data.py` 실행 → pipeline / fpso 관련 ERROR·OVERDUE·NOTE를 우선 처리 목록으로 삼는다.
2. **pipeline.json**: 위 범위대로 확인한다. 실제로 확인한 프로젝트는 변경이 없어도 `verified`를 오늘로 바꾼다. phase 전환 기준: FID나 BOT 계약 서명이 확인되면 Execution, first oil이 확인되면 Production. 낙찰자 선정이나 협상 중인 단계는 phase를 바꾸지 않는다. notes는 기존 내용에 덧붙인다. `data_quality.notes`에 이번 변경을 한 줄 추가한다.
3. **fpso.json**:
   - orderbook: 신규 FPSO/FLNG 계약(LOI 제외)은 추가한다. 인도/first oil이 확인된 선박은 vessels로 이동한다(status "On Production").
   - contractors: 최근 분기 IR 기준으로 backlog_busd를 갱신한다(SBM, MODEC, BW Offshore, Yinson, Golar).
   - market_summary: 새 Rystad/Westwood 수치를 확인했을 때만 수정하고 `as_of`를 그 기준일로 바꾼다. 확인 못 했으면 그대로 둔다(as_of가 대시보드에 그대로 표시됨).
   - **P-번호 교차 확인**: 같은 P-번호가 pipeline과 fpso에서 같은 필드/모듈(예: P-80 = Búzios 9)을 가리키는지 확인한다. 다르면 출처를 확인해 바로잡는다.
**FPSO 운영 선박 순환 대조 (매월)**: `fpso.json` `vessels`를 컨트랙터 단위로 순환 대조한다 — 실행 월 % 4 → 0: SBM Offshore·Golar, 1: MODEC·BW Offshore, 2: Yinson·Saipem·기타, 3: Petrobras·Shell. 해당 회사 IR fleet 페이지/최근 실적 자료로 선박 존재·status(On Production/Idle/매각·해체)·client·field·용선 종료를 확인하고, 운영 시작이 확인된 orderbook 선박은 vessels로 옮긴다. contractors의 fleet_owned와 vessels 수가 일치하는지 확인한다(check_data.py NOTE).
4. 중요 이벤트(FID, first oil, 계약 ≥ $500M, 프로젝트 취소)는 news.json에 최대 5건 추가한다(id = 최대 id + 1, 최신순, sector/category 허용값 준수).
5. 수정한 파일의 `updated`를 오늘 날짜로 바꾼다.
6. `python3 scripts/check_data.py` 재실행해 ERROR 0을 확인한다. ERROR가 있으면 고친다. 고칠 수 없으면 해당 변경을 되돌리고 보고한다. (커밋·push는 워크플로가 한다)

## 출처 감사 (매 실행 — 그럴듯한 숫자 금지)
- 데이터에는 출처 없이 들어간 숫자가 남아 있다. 매 실행마다 아래 대상만큼 감사한다: `python3 scripts/audit_queue.py pipeline --n 6` 과 `python3 scripts/audit_queue.py fpso --n 8`
- 출력된 각 항목의 **모든 숫자·날짜 필드**(capex, FID, first_production, 용량, 계약 기간·금액, 조선소, 인도연도 등)를 1~2등급 출처 원문으로 확인한다.
  - 맞으면 그대로 두고, 틀리면 원문 값으로 고친다.
  - 출처를 찾지 못한 값은 **null로 바꾼다**. 추정·유사 프로젝트 값·"대략" 값으로 채우지 않는다. 공시 없는 추정이 꼭 필요하면 출처(예: Wood Mackenzie 추정)를 notes에 밝히고 confidence를 low로 둔다.
  - 존재가 확인되지 않는 항목(가상 프로젝트·선박)은 삭제하고 보고에 적는다.
- 감사한 항목에는 `source_url`(대표 출처)과 `verified`(오늘 날짜)를 기록하고, 고친 내용을 notes(+notes_en)에 `[YYYY-MM-DD 감사] 이전값→새값: 근거` 형식으로 남긴다.
- 보고에 감사한 항목 수, 고친 값, null 처리한 값, 남은 미확인 수(`python3 scripts/audit_queue.py --summary`)를 적는다.

## 영문 필드 (KO/EN 전환)
- 사이트에 한국어/영어 전환 스위치가 있다. 한국어로 쓰거나 고친 텍스트 필드에는 같은 객체에 `<필드>_en` 영문 번역을 함께 쓴다. 예: `notes` → `notes_en`, `summary` → `summary_en`, 문자열 목록 `highlights` → 같은 길이·같은 순서의 `highlights_en`.
- 한국어 원문을 고치면 `_en`도 함께 고친다. 수치·고유명사·날짜는 원문과 정확히 일치해야 한다(번역 과정에서 사실을 더하거나 빼지 않는다).
- 이미 영어인 필드에는 `_en`을 만들지 않는다.
- `python3 scripts/check_data.py`가 `_en` 누락을 NOTE로 알려 준다. 담당 파일의 `_en` 누락 NOTE는 0이어야 한다.

## 보고 (한국어)
- 변경됨(프로젝트/선박 · 변경 내용 · 출처) / 확인만 함 / 신규 추가 / 확인 못 함(이유)
- 다음 달 주의 항목(임박한 FID, first oil, 입찰 마감)
- check_data.py 결과