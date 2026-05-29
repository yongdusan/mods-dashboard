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
| `pipeline.json` | **매월 10일** | 그 시점까지 발표된 분기 실적·IR 자료 반영 (→ §6 참조) |
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

## 6. pipeline.json 업데이트 절차

> **업데이트 주기:** 매월 10일. 그 시점까지 발표된 분기 실적·IR 자료를 확인하여 변동 사항이 있으면 반영한다.
> 예) bp Q2 실적이 6/12 발표 → 6/10 업데이트에는 미반영, 7/10 업데이트에 반영.

### 6-1. 수록 기준 (Scope)

다음 기준을 **모두** 충족하는 프로젝트만 수록한다:

| 기준 | 조건 |
|------|------|
| CAPEX | **≥ $2B** (indicative 포함) |
| 자산 유형 | 오프쇼어 — Deepwater FPSO·Fixed Platform·Shallow Offshore Platform 모두 포함 (LNG 트레인은 해저 생산설비 동반 시 포함) |
| 단계 | Pre-FEED 이상 |
| 지역 | 전 세계 |

**제외 기준:**
- 순수 육상 개발 (Tengiz, EACOP 등)
- 파이프라인·터미널 단독 프로젝트 (상류 생산설비 없는 경우)
- Production 단계 진입 후 3년 초과 → 배열에서 제거 가능

**수록 트리거 — FID만 기다리지 않는다:**

| 트리거 | 단계 | 비고 |
|--------|------|------|
| FID 발표 | Execution | 가장 명확한 진입 시점 |
| BOT/EPCI 입찰 공고 | FEED | P-91, P-88 같은 Petrobras 방식 |
| FEED 착수 발표 | FEED | FID 전이지만 CAPEX 규모 확인 가능 |
| 연간 Business Plan 수록 | Pre-FEED | CAPEX 불명확, confidence: low |
| First Oil 달성 | Production | 단계 변경 |

### 6-2. 커버리지 유니버스 및 권위 소스

#### IOC (분기 실적 발표 + 연간 보고서)
| 회사 | 권위 소스 | 주요 확인 항목 |
|------|---------|--------------|
| ExxonMobil | https://investor.exxonmobil.com — Earnings Supplement | Stabroek FPSO 시퀀스, GoM |
| Shell | https://www.shell.com/investors — Quarterly Results | Namibia, Brazil, Nigeria |
| bp | https://www.bp.com/investors — Results | GoM, ACG, Tangguh |
| Chevron | https://www.chevron.com/investors — Earnings | Stabroek(ex-Hess), Mediterranean |
| TotalEnergies | https://totalenergies.com/investors — Results & Outlook | Namibia, Suriname, Papua, Mozambique |
| Equinor | https://www.equinor.com/investors — Capital Markets Update | NCS, Barents Sea |
| Eni | https://www.eni.com/en-IT/investors | Angola, Congo, Indonesia |
| Woodside | https://www.woodside.com/investors | Australia, Senegal |

#### NOC (연간 보고서 + Business Plan — 영어/현지어)
| 회사 | 권위 소스 | 주의사항 |
|------|---------|---------|
| Petrobras | https://agencia.petrobras.com.br — Plano de Negócios (연간 11월) | 포르투갈어; FPSO 입찰 공고도 별도 모니터링 |
| Saudi Aramco | https://www.saudiaramco.com/en/investors — Annual Report | FID 발표 안 함; 계약 공시로 진척 파악 |
| QatarEnergy | https://www.qatarenergy.qa/en/MediaCentre | NFE/NFS 진행률 반기 업데이트 |
| ADNOC | https://adnoc.ae/investors — Capital Markets Day | 연간 Capital Markets Day(12월)가 핵심 |
| PETRONAS | https://www.petronas.com/investors — Annual Report | 연간 보고서(3월) |

#### 보조 소스 (신규 프로젝트 발견용)
- Offshore Energy: https://www.offshore-energy.biz (FPSO 계약 뉴스)
- Rigzone: https://www.rigzone.com/news/ (FID·계약 속보)
- Brazil Energy Insight: https://brazilenergyinsight.com (Petrobras 전문)
- CPG Click Petróleo e Gás: https://en.clickpetroleoegas.com.br (포르투갈어 Petrobras)
- MEED: https://www.meed.com (중동 NOC 계약)

### 6-3. 단계별 확인 주기

| 단계 | 확인 주기 | 체크 포인트 |
|------|---------|-----------|
| Pre-FEED | 반기 | FEED 진입 여부, 프로젝트 취소 여부 |
| FEED | 분기 | FID 임박 발표, CAPEX 업데이트, 계약 체결 |
| Execution | 분기 | CAPEX 개정, 일정 변경, First Oil 달성 |
| Production | 연간 | 3년 초과 시 제거 검토 |

### 6-4. pipeline.json 스키마

```json
{
  "id": "company-project-name",
  "company": "회사명",
  "project": "프로젝트명",
  "region": "Gulf of Mexico | Brazil | Guyana/Suriname | Africa | North Sea/Norway | Middle East | Asia Pacific",
  "asset_type": "Deepwater Oil | Deepwater Gas | Deepwater Oil (HE) | Shallow Offshore Oil | Shallow Offshore Gas | Offshore Gas / LNG | Deepwater Gas / LNG | Deepwater Gas / FLNG | Deepwater Gas / CCUS",
  "phase": "Pre-FEED | FEED | FID | Execution | Production",
  "capex_busd": 0.0,
  "fid_date": "YYYY-MM",
  "first_production": "YYYY",
  "verified": "YYYY-MM-DD",
  "source": "출처명 (날짜)",
  "source_url": "https://... 또는 null",
  "confidence": "high | medium | low",
  "notes": "파트너십, 수심, 주요 계약자, 특이사항"
}
```

**`verified` 필드 규칙:**
- 해당 프로젝트의 phase·capex·fid_date를 마지막으로 확인한 날짜
- 프로젝트 추가 시: 오늘 날짜
- 180일 이상 경과 시: 대시보드에서 경고 표시됨 → 우선 재확인 대상

**`confidence` 기준:**

| 값 | 기준 |
|----|------|
| `high` | FID 보도자료, 계약 award 확인, 공식 first oil 발표 |
| `medium` | 분기 실적 언급, IR 발표, Business Plan 명시 |
| `low` | 내부 계획 추정치, 시장 추정 CAPEX, indicative timeline |

### 6-5. 분기 업데이트 절차 (체크리스트)

매 분기 pipeline.json 업데이트 시 이 순서를 따른다:

**Step A — 기존 프로젝트 상태 확인**
1. Execution 프로젝트: 분기 실적에서 CAPEX 개정·일정 변경 확인
2. FEED 프로젝트: FID 발표 여부 확인 → Execution으로 단계 변경
3. Production 프로젝트: first_production으로부터 3년 초과 시 제거 검토
4. `verified`가 180일 이상 지난 프로젝트 우선 재확인

**Step B — 신규 프로젝트 탐색 (회사별 권위 소스 순서)**
1. Petrobras: Plano de Negócios + FPSO 입찰 공고 확인
2. Saudi Aramco / QatarEnergy / ADNOC: 연간 보고서 + 계약 공시
3. IOC 전체: 분기 실적 Earnings Supplement의 "Project Updates" 섹션
4. Equinor / Eni / Woodside: 반기 업데이트

**Step C — 수록 기준 대조**
- CAPEX ≥ $2B 확인
- 트리거 유형 확인 (FID / BOT 입찰 / FEED 착수 중 해당 항목)
- `verified` = 오늘 날짜, `confidence` 적절히 설정

**Step D — 파일 업데이트**
- `updated` 필드 = 오늘 날짜
- `data_quality.notes`에 변경 내용 한 줄 기록
- commit message: `data: update pipeline.json YYYY-MM-DD`

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
