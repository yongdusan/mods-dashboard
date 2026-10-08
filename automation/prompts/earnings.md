# MODU 대시보드 — 실적·데이레이트·CAPEX 갱신 (새 발표분만)

## 실행 환경 (GitHub Actions 클라우드 — 무인 실행)
- 작업 폴더는 저장소 루트다. 상대 경로(`data/...`, `scripts/...`)를 쓴다.
- 먼저 `CLAUDE.md`를 끝까지 읽고 "데이터 신뢰성 원칙"(1~2등급 출처만, 패턴 대입 금지, 불확실하면 null)을 지킨다.
- 쓸 수 있는 도구: WebSearch, WebFetch, Read, Edit/Write(`data/` 아래만), Bash는 `python3 scripts/check_data.py`, `python3 -m json.tool data/<file>`, `git status`, `git diff`만.
- **git commit / push는 하지 않는다.** 작업이 끝나면 워크플로가 `scripts/check_data.py`로 검증한 뒤 담당 파일만 커밋·push한다. 검증에서 ERROR가 나면 배포되지 않으므로, 끝내기 전에 직접 check_data.py를 돌려 ERROR 0을 확인한다.
- 오늘 날짜는 환경 변수 `TODAY`(YYYY-MM-DD)를 기준으로 한다.
- 확인이 안 되는 항목은 건너뛰고 마지막 보고에 남긴다.

## 할 일
1. `python3 scripts/check_data.py` 실행 → earnings / fpso_earnings / rates / capex 관련 OVERDUE 항목을 확인한다.
2. **earnings.json** (Transocean, Valaris, Noble, Seadrill, Borr Drilling)과 **fpso_earnings.json** (SBM Offshore, MODEC, BW Offshore, Yinson Holdings, Golar LNG):
   - 회사별로 배열의 마지막 분기 이후 **이미 발표된** 분기를 회사 IR 보도자료(1등급)에서 찾는다. 발표 안 된 분기는 추가하지 않는다.
   - 기존 항목과 같은 필드 구조로 추가: revenue_musd, adj_ebitda_musd, ebitda_margin_pct(= ebitda/revenue×100, 소수 1자리), utilization_pct, avg_day_rate_kusd, backlog_busd 등 그 파일에 이미 있는 필드만. 공시되지 않은 값은 null.
   - highlights 3~6개(한국어: 가이던스, 주요 계약, 전략 변화). source는 "Q2 2026 Earnings (Aug 2026)" 형식.
   - 회계연도가 다른 회사(MODEC, Yinson)는 기존 period 표기 방식을 그대로 따른다.
   - Transocean–Valaris 합병 진행 상황이 바뀌었으면 해당 회사 note를 갱신한다.
3. **rates.json** (2026년부터 통일된 방식 — `data_quality.day_rates.notes` 참조): date는 활동 분기 시작월(1·4·7·10월). (a) 실적이 새로 발표된 분기는 Drillship/Ultra-deepwater = Transocean UDW floaters·Valaris drillships·Noble floaters 공시 평균 dayrate의 평균, Jack-up/Premium = Valaris·Borr 공시 평균, Semisubmersible/Deepwater = 공시 평균이 있으면 사용. 같은 date에 'Indicative' 항목이 있으면 실제값으로 **교체**한다. (b) 진행 중인 최신 분기에 항목이 없으면, 실적 보도자료의 leading-edge/신규 계약 단가를 근거로 source에 'Indicative (분기 진행 중)'와 출처를 적어 추가한다. 근거가 없으면 추가하지 않는다. (c) 이미 실제값인 과거 항목은 바꾸지 않는다. 산정 방식이 다른 값을 섞지 않는다.
4. **capex.json**: 분기 실적에서 2026(또는 다음 연도) CAPEX 가이던스가 바뀐 회사만 수정한다.
5. 수정한 각 파일의 `updated`를 오늘 날짜로 바꾼다.
6. `python3 scripts/check_data.py` 재실행해 ERROR 0을 확인한다. ERROR가 있으면 고친다. 고칠 수 없으면 해당 변경을 되돌리고 보고한다. (커밋·push는 워크플로가 한다)

## 보고 (한국어, 짧게)
- 추가한 분기(회사 · 분기 · 매출/EBITDA · 출처)
- 아직 미발표라 건너뛴 회사, 확인 실패 항목
- rates/capex 변경 내역, check_data.py 결과