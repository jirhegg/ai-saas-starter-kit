---
include: always
---

# 테스팅 가이드라인

## 테스트 전략
- 단위 테스트: Vitest 사용
- E2E 테스트: Playwright 사용
- API 테스트: MSW (Mock Service Worker)로 모킹

## 테스트 커버리지
- 모든 API route는 최소 80% 커버리지 유지
- 비즈니스 로직 함수는 100% 커버리지 목표
- UI 컴포넌트는 주요 인터랙션만 테스트

## 테스트 파일 위치
- `__tests__/` 폴더 또는 `*.test.ts(x)` 형식
- E2E 테스트는 `e2e/` 폴더

## 테스트 작성 원칙
- AAA 패턴 (Arrange, Act, Assert)
- 테스트 이름은 한글로 명확하게 작성
- 각 테스트는 독립적으로 실행 가능해야 함
- Mock 데이터는 `__mocks__/` 폴더에 중앙 관리
