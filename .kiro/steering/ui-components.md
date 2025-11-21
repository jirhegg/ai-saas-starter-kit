---
inclusion: fileMatch
fileMatchPattern: "components/**/*"
---

# UI 컴포넌트 가이드라인

## shadcn/ui 규칙
- `components/ui/` 폴더는 shadcn CLI로만 관리
- 커스터마이징은 별도 wrapper 컴포넌트 생성
- Radix UI 기반으로 접근성 자동 보장

## 컴포넌트 구조
```
components/
  ├── ui/           # shadcn/ui 컴포넌트
  ├── layout/       # 레이아웃 컴포넌트
  ├── features/     # 기능별 컴포넌트
  └── shared/       # 공통 컴포넌트
```

## 작성 원칙
- Server Component 우선 사용
- Client Component는 `"use client"` 명시
- Props는 TypeScript interface로 정의
- 재사용 가능하도록 설계

## 스타일링
- Tailwind CSS 유틸리티 클래스 사용
- `cn()` 헬퍼로 조건부 클래스 병합
- CSS 모듈은 특수한 경우만 사용
- 다크 모드 지원 (`dark:` prefix)

## 접근성 (a11y)
- 시맨틱 HTML 사용
- ARIA 속성 적절히 설정
- 키보드 네비게이션 지원
- 스크린 리더 테스트

## 상태 관리
- 로컬 상태: useState
- 서버 상태: TanStack Query
- 전역 상태: Zustand (필요시)
- Form 상태: React Hook Form + Zod

## 성능
- React.memo로 불필요한 리렌더링 방지
- useCallback, useMemo 적절히 사용
- 큰 리스트는 가상화 (react-window)
