---
include: always
---

# 프로젝트 구조

## 폴더 구조
```
project-root/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지 그룹
│   ├── (dashboard)/       # 대시보드 페이지 그룹
│   ├── api/               # API Routes
│   ├── layout.tsx         # 루트 레이아웃
│   └── page.tsx           # 홈 페이지
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── features/         # 기능별 컴포넌트
│   └── shared/           # 공통 컴포넌트
├── lib/                  # 유틸리티 함수
│   ├── supabase.ts       # Supabase 클라이언트
│   ├── utils.ts          # 공통 유틸
│   └── validators.ts     # Zod 스키마
├── hooks/                # Custom React Hooks
├── types/                # TypeScript 타입 정의
├── drizzle/              # 데이터베이스
│   ├── schema.ts         # DB 스키마
│   └── migrations/       # 마이그레이션 파일
├── public/               # 정적 파일
├── spec/                 # 기능 스펙 문서
├── __tests__/            # 테스트 파일
├── e2e/                  # E2E 테스트
└── .kiro/                # Kiro 설정
    └── steering/         # 스티어링 규칙
```

## 파일 네이밍
- 페이지: `page.tsx`
- 레이아웃: `layout.tsx`
- 로딩: `loading.tsx`
- 에러: `error.tsx`
- API: `route.ts`
- 컴포넌트: `ComponentName.tsx`
- 유틸: `util-name.ts`

## Route Groups
- `(auth)`: 인증 관련 페이지 (로그인, 회원가입)
- `(dashboard)`: 인증 필요한 대시보드 페이지
- `(marketing)`: 마케팅 페이지 (랜딩, 가격)

## API Routes
- RESTful 구조: `/api/v1/[resource]/route.ts`
- 인증 필요: 미들웨어로 체크
- 응답 형식 통일