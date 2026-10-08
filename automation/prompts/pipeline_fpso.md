# MODU 대시보드 — E&P 파이프라인 + FPSO 월간 갱신

## 실행 환경 (GitHub Actions 클라우드 — 무인 실행)
- 작업 폴더는 저장소 루트다. 상대 경로(`data/...`, `scripts/...`)를 쓴다.
- 먼저 `CLAUDE.md`를 끝까지 읽고 "데이터 신뢰성 원칙"(1~2등급 출처만, 패턴 대입 금지, 불확실하면 null)을 지킨다.
- 쓸 수 있는 도구: WebSearch, WebFetch, Read, Edit/Write(`data/` 아래만), Bash는 `python3 scripts/check_data.py`, `python3 -m json.tool data/<file>`, `git status`, `git diff`만.
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
4. 중요 이벤트(FID, first oil, 계약 ≥ $500M, 프로젝트 취소)는 news.json에 최대 5건 추가한다(id = 최대 id + 1, 최신순, sector/category 허용값 준수).
5. 수정한 파일의 `updated`를 오늘 날짜로 바꾼다.
6. `python3 scripts/check_data.py` 재실행해 ERROR 0을 확인한다. ERROR가 있으면 고친다. 고칠 수 없으면 해당 변경을 되돌리고 보고한다. (커밋·push는 워크플로가 한다)

## 보고 (한국어)
- 변경됨(프로젝트/선박 · 변경 내용 · 출처) / 확인만 함 / 신규 추가 / 확인 못 함(이유)
- 다음 달 주의 항목(임박한 FID, first oil, 입찰 마감)
- check_data.py 결과