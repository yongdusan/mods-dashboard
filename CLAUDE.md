# MODU Intelligence Dashboard — 데이터 업데이트 지침

## 절대 원칙
- `index.html`은 절대 수정하지 않는다
- `data/` 디렉토리의 JSON 파일만 수정한다
- 수정 후 반드시 `updated` 필드를 오늘 날짜(YYYY-MM-DD)로 업데이트한다

---

## 주간 업데이트 — Fleet & Rates (`data/fleet.json`, `data/rates.json`)

### 1. fleet.json 업데이트 절차
1. 각 컨트랙터 Fleet 페이지 확인:
   - Transocean: https://www.deepwater.com/our-fleet/
   - Valaris: https://www.valaris.com/fleet/
   - Noble: https://www.noblecorp.com/fleet
   - Seadrill: https://www.seadrill.com/fleet/
   - Borr Drilling: https://www.borrdrilling.com/fleet/

2. Rigzone Contract Reports 확인:
   - https://www.rigzone.com/data/contracts/

3. 업데이트 항목:
   - 신규 계약 체결: `rigs` 배열에 항목 추가 또는 `status`, `operator`, `contract_start`, `contract_end`, `day_rate_kusd` 수정
   - 계약 해지/만료: `status`를 `"Idle"` 또는 `"Cold Stacked"`로 변경, `operator`, `contract_start`, `contract_end`, `day_rate_kusd`를 `null`로 설정
   - 조선소 입거: `status`를 `"Shipyard"`로 변경

4. `prev_week` 업데이트:
   - 수정 **전** 현재 fleet.json의 `rigs` 배열에서 집계한 값을 `prev_week`에 먼저 기록
   - `total`: rigs 배열 전체 길이
   - `on_contract`: status === "On Contract" 개수
   - `idle_stacked`: status === "Idle" 또는 "Cold Stacked" 개수

5. 누락/알 수 없는 값은 `null`로 설정한다 (빈 문자열 `""` 사용 금지)

### 2. rates.json 업데이트 절차
1. Rigzone 최신 계약 단가 공시 확인
2. `day_rates` 배열에 해당 분기의 항목이 없으면 추가:
   ```json
   { "date": "YYYY-MM", "rig_type": "Drillship", "tier": "Ultra-deepwater", "rate_kusd": 000, "source": "Rigzone" }
   ```
   - Rig type 값: `"Drillship"`, `"Semisubmersible"`, `"Jack-up"` (정확히 이 표기 사용)
   - Tier 값: Drillship → `"Ultra-deepwater"`, Semi → `"Deepwater"`, Jack-up → `"Premium"`
   - 업데이트 주기: 분기별 (1월, 4월, 7월, 10월 기준)
3. 신조/수리 가격 공시가 있으면 `newbuild_prices`에 추가

---

## 월간 업데이트 — CAPEX (`data/capex.json`)

### 수집 소스
| 회사 | IR 페이지 |
|------|-----------|
| ExxonMobil | https://investor.exxonmobil.com |
| Shell | https://www.shell.com/investors |
| bp | https://www.bp.com/investors |
| Chevron | https://www.chevron.com/investors |
| TotalEnergies | https://totalenergies.com/investors |
| Saudi Aramco | https://www.saudiaramco.com/en/investors |
| ADNOC | https://adnoc.ae/investors |
| Petrobras | https://investors.petrobras.com.br |
| PETRONAS | https://www.petronas.com/investors |

### 업데이트 항목
- 분기 실적 발표 또는 연간 예산 발표 시 `capex_guidance` 배열에 해당 연도 항목 추가 또는 수정
- `source` 필드에 출처 명시 (예: `"Q1 2026 Earnings"`)
- `notes` 필드에 주요 전략 변화 반영

---

## 배포
GitHub push 시 Cloudflare Pages가 자동 배포한다. 별도 명령 불필요.

```bash
git add data/
git commit -m "data: update fleet/rates YYYY-MM-DD"
git push
```

---

## 로컬 확인
```bash
cd /Users/ahn-yongsung/Project/modu-dashboard
python3 -m http.server 8080
# 브라우저: http://localhost:8080
```
