# MODU 대시보드 — 클라우드 실행 점검 (smoke test)

## 실행 환경 (GitHub Actions 클라우드 — 무인 실행)
- 작업 폴더는 저장소 루트다. 상대 경로(`data/...`, `scripts/...`)를 쓴다.
- 먼저 `CLAUDE.md`를 끝까지 읽고 "데이터 신뢰성 원칙"(1~2등급 출처만, 패턴 대입 금지, 불확실하면 null)을 지킨다.
- 쓸 수 있는 도구: WebSearch, WebFetch, Read, Edit/Write(`data/` 아래만), Bash는 `python3 scripts/check_data.py`, `python3 -m json.tool data/<file>`, `git status`, `git diff`만.
- **git commit / push는 하지 않는다.** 작업이 끝나면 워크플로가 `scripts/check_data.py`로 검증한 뒤 담당 파일만 커밋·push한다. 검증에서 ERROR가 나면 배포되지 않으므로, 끝내기 전에 직접 check_data.py를 돌려 ERROR 0을 확인한다.
- 오늘 날짜는 환경 변수 `TODAY`(YYYY-MM-DD)를 기준으로 한다.
- 확인이 안 되는 항목은 건너뛰고 마지막 보고에 남긴다.

## 할 일
1. `CLAUDE.md`의 첫 30줄을 읽는다.
2. `python3 scripts/check_data.py`를 실행한다.
3. WebSearch로 "Transocean fleet status report" 를 1회 검색해 웹 검색이 동작하는지 확인한다.
4. **파일은 수정하지 않는다.** 결과를 3줄로 보고한다.
