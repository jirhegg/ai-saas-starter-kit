---
include: always
---

# 코딩 컨벤션

## TypeScript
- Strict 모드 활성화
- `any` 타입 사용 금지 (불가피한 경우 `unknown` 사용)
- 타입 정의는 `types/` 폴더에 중앙 관리
- Interface보다 Type 선호 (일관성)

## 네이밍
- 변수/함수: camelCase
- 컴포넌트/클래스: PascalCase
- 상수: UPPER_SNAKE_CASE
- 파일명: kebab-case (컴포넌트는 PascalCase)

## 코드 스타일
- ESLint + Prettier 자동 포맷팅
- 들여쓰기: 2 spaces
- 세미콜론 사용
- 싱글 쿼트 사용
- 최대 줄 길이: 100자

## React 규칙
- React Server Components 우선 사용
- Client Component는 최소화
- Props drilling 3단계 이상 금지
- Custom hooks는 `use` prefix

## 에러 핸들링
- 모든 비동기 함수는 try/catch
- 사용자 친화적인 에러 메시지
- Toast로 에러 알림
- Sentry로 에러 로깅 (프로덕션)

## Validation
- Zod로 모든 입력 검증
- API route 입력 검증 필수
- Form 검증은 React Hook Form + Zod

## 파일 구조
- 모든 페이지에 `loading.tsx`, `error.tsx` 구현
- 관련 파일은 같은 폴더에 그룹화
- 100줄 이상 파일은 분리 고려