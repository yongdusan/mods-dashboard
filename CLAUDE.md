# MODU Intelligence Dashboard — 데이터 업데이트 지침

## 절대 원칙
- `index.html`은 절대 수정하지 않는다
- `data/` 디렉토리의 JSON 파일만 수정한다
- 수정 후 반드시 `updated` 필드를 오늘 날짜(YYYY-MM-DD)로 업데이트한다
- 누락/알 수 없는 값은 `null`로 설정한다 (빈 문자열 `""` 사용 금지)

---

## 업데이트 주기 및 트리거

| 파일 | 주기 | 트리거 |
|------|------|--------|
| `fleet.json` | **주간** | 신규 계약 공시, 계약 해지/만료, 리그 이동 |
| `rates.json` → `day_rates` | **분기** | 1월·4월·7월·10월 — 분기 시작 직후 |
| `rates.json` → `newbuild_prices` | **비정기** | 신조/수리 계약 공시 시 |
| `capex.json` | **분기** | 각 사 분기 실적 발표 후 (1~2월·4~5월·7~8월·10~11월) |
| `earnings.json` | **분기** | 각 사 분기 실적 발표 후 즉시 |
| `news.json` | **주간** | 주요 계약·M&A·실적·시장 뉴스 발생 시 |

---

## 1. fleet.json 업데이트 절차

### 소스
| 컨트랙터 | URL |
|---------|-----|
| Transocean | https://www.deepwater.com/our-fleet/ |
| Valaris | https://www.valaris.com/fleet/ |
| Noble | https://www.noblecorp.com/fleet |
| Seadrill | https://www.seadrill.com/fleet/ |
| Borr Drilling | https://www.borrdrilling.com/fleet/ |
| Rigzone Contracts | https://www.rigzone.com/data/contracts/ |

### 업데이트 항목
- **신규 계약**: `status`→`"On Contract"`, `operator`, `contract_start`, `contract_end`, `day_rate_kusd` 입력
- **계약 해지/만료**: `status`→`"Idle"` 또는 `"Cold Stacked"`, `operator`·`contract_start`·`contract_end`·`day_rate_kusd`→`null`
- **조선소 입거**: `status`→`"Shipyard"`

### prev_week 업데이트 순서 (반드시 이 순서 준수)
1. **수정 전** 현재 rigs 배열에서 집계 → `prev_week`에 기록
   - `total`: rigs 배열 전체 길이
   - `on_contract`: `status === "On Contract"` 개수
   - `idle_stacked`: `status === "Idle"` 또는 `"Cold Stacked"` 개수
2. rigs 배열 수정 실행

---

## 2. rates.json 업데이트 절차

### 업데이트 주기: 분기별 (1·4·7·10월 기준)

현재 기준일자 및 다음 업데이트 예정:

| 분기 | date 값 | 다음 업데이트 |
|------|---------|------------|
| Q1 2026 | `"2026-01"` | ✅ 완료 |
| Q2 2026 | `"2026-04"` | ✅ 완료 (기준일 2026-05-03) |
| Q3 2026 | `"2026-07"` | 2026년 7월 초 |

### 소스
- Rigzone Day Rate Tracker: https://www.rigzone.com/data/dayrates/
- Westwood Global Offshore Rig Market Report
- 각 컨트랙터 Fleet Status Report (분기 실적 발표 시 포함)

### day_rates 항목 추가 시 규칙
```json
{ "date": "YYYY-MM", "rig_type": "Drillship", "tier": "Ultra-deepwater", "rate_kusd": 000, "source": "Rigzone" }
```
- `rig_type` 허용값: `"Drillship"` · `"Semisubmersible"` · `"Jack-up"` (정확히 이 표기)
- `tier` 허용값: `"Ultra-deepwater"` · `"Deepwater"` · `"Premium"`
- 이미 해당 date+rig_type 항목이 있으면 추가 금지, 수정만 허용

### newbuild_prices 추가 시
- 신조/수리 계약 공시 확인 후 추가
- `date`: 계약 공시월 (`"YYYY-MM"`)

---

## 3. capex.json 업데이트 절차

### 업데이트 트리거: 분기 실적 발표 후

| 회사 | IR 페이지 | 실적 발표 시기 |
|------|-----------|--------------|
| ExxonMobil | https://investor.exxonmobil.com | 1·4·7·10월 말 |
| Shell | https://www.shell.com/investors | 2·5·7·10월 |
| bp | https://www.bp.com/investors | 2·5·7·10월 |
| Chevron | https://www.chevron.com/investors | 1·4·7·10월 말 |
| TotalEnergies | https://totalenergies.com/investors | 2·5·7·10월 |
| Saudi Aramco | https://www.saudiaramco.com/en/investors | 3·5·8·11월 |
| ADNOC | https://adnoc.ae/investors | 연간 예산 발표 (12월) |
| Petrobras | https://investors.petrobras.com.br | 2·5·8·11월 |
| PETRONAS | https://www.petronas.com/investors | 연간 보고서 (3월) |

### 업데이트 항목
- `capex_guidance` 항목 필드:
  - `total_capex_busd`: 회사 전체 CAPEX
  - `upstream_capex_busd`: E&P/Upstream 전용 CAPEX (upstream % = upstream / total × 100)
  - `source`: 출처 (예: `"Q1 2026 Earnings (Apr 2026)"`, `"2026 Annual Budget"`)
- 신규 연도 항목이면 배열에 추가, 기존 연도 수정이면 해당 항목 값 업데이트
- `notes` 필드에 upstream 비중(%) 및 주요 전략 변화 반영

### 현재 기준일자 (2026-05-03)
| 회사 | 2026 가이던스 | 소스 |
|------|-------------|------|
| ExxonMobil | $28B (범위 $28–33B) | Q1 2026 Earnings |
| Shell | $21B | 2026 Guidance |
| bp | $13B ($13–13.5B) | Q1 2026 Earnings |
| Chevron | $18.5B ($18–19B) | Dec 2025 Budget |
| TotalEnergies | $16B | 2025 Results & 2026 Objectives |
| Saudi Aramco | $50B | 2026 Medium-Term |
| ADNOC | $17B | 2026 Guidance |
| Petrobras | $21B | 2025–2029 Business Plan |
| PETRONAS | $13B | 2026 Guidance |

---

## 4. earnings.json 업데이트 절차

### 업데이트 트리거: 각 사 분기 실적 발표 직후

| 회사 | 티커 | Q1 2026 발표일 |
|------|------|--------------|
| Transocean | RIG | 2026-05-04 ✅ 발표 |
| Valaris | VAL | 2026-05-04 ✅ 발표 |
| Noble | NE | 2026-04-28 ✅ 완료 |
| Seadrill | SDRL | 미정 |
| Borr Drilling | BORR | 2026-05-20 (예정) |

### 추가 항목
```json
{
  "period": "Q1 2026",
  "revenue_musd": 000,
  "adj_ebitda_musd": 000,
  "ebitda_margin_pct": 00.0,
  "utilization_pct": 00,
  "avg_day_rate_kusd": 000,
  "backlog_busd": 0.0,
  "source": "Q1 2026 Earnings (May 2026)",
  "highlights": [
    "주요 내용 1",
    "주요 내용 2"
  ]
}
```
- `ebitda_margin_pct` = `adj_ebitda_musd / revenue_musd * 100` (소수점 1자리)
- `highlights`: 가이던스·주요 계약·전략 변화 3~6개, 한국어

---

## 5. news.json 업데이트 절차

### 업데이트 주기: 주간 (또는 주요 뉴스 발생 시)

### 소스
- Offshore Energy: https://www.offshore-energy.biz
- Rigzone News: https://www.rigzone.com/news/
- Upstream Online: https://www.upstreamonline.com
- OE Digital: https://www.oedigital.com

### 항목 구조
```json
{
  "id": 16,
  "date": "YYYY-MM-DD",
  "category": "Contract",
  "title": "제목",
  "summary": "2~3문장 요약",
  "companies": ["Transocean"],
  "source": "Offshore Energy",
  "url": "https://..."
}
```
- `category` 허용값: `"Contract"` · `"Earnings"` · `"Fleet"` · `"M&A"` · `"Outlook"`
- `id`: 기존 최대 id + 1
- 최신 뉴스를 배열 앞쪽에 추가 (내림차순 유지)
- 오래된 항목(6개월 초과)은 제거 가능

---

## 배포

GitHub push 시 Cloudflare Pages가 자동 배포한다. 별도 명령 불필요.

```bash
git add data/
git commit -m "data: update [파일명] YYYY-MM-DD"
git push
```

---

## 로컬 확인
```bash
cd /Users/ahn-yongsung/Project/modu-dashboard
python3 -m http.server 8080
# 브라우저: http://localhost:8080
```
