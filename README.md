# AI SaaS Starter Kit

AI 기반 문서 검색 및 챗봇 SaaS 플랫폼 템플릿

## 주요 기능

- 🔐 **인증 시스템**: Supabase Auth (이메일/소셜 로그인)
- 📄 **문서 관리**: 업로드, 수정, 삭제
- 🤖 **AI 채팅**: 다중 LLM 지원 (OpenAI, Google, Claude, Ollama, LM Studio)
- 🔍 **벡터 검색**: pgvector 기반 RAG 시스템
- 💳 **구독 관리**: Stripe 연동 (Free/Pro/Enterprise)
- 📊 **대시보드**: 사용 통계 및 분석
- 🎨 **UI**: shadcn/ui + Tailwind CSS
- 🌍 **다국어 지원**: 한국어, 영어, 일본어, 중국어

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **데이터베이스**: Supabase (PostgreSQL + pgvector)
- **ORM**: Drizzle ORM
- **인증**: Supabase Auth
- **AI**: 다중 LLM (OpenAI, Google Gemini, Claude, Ollama, LM Studio)
- **결제**: Stripe
- **UI**: shadcn/ui + Tailwind CSS
- **상태 관리**: TanStack Query
- **다국어**: next-intl

## 시작하기

### 1. 의존성 설치

\`\`\`bash
npm install
\`\`\`

### 2. 환경 변수 설정

\`.env.example\`을 \`.env.local\`로 복사하고 값을 입력하세요:

\`\`\`bash
cp .env.example .env.local
\`\`\`

필수 환경 변수:
- \`NEXT_PUBLIC_SUPABASE_URL\`: Supabase 프로젝트 URL
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Supabase Anon Key
- \`DATABASE_URL\`: PostgreSQL 연결 문자열
- \`OPENAI_API_KEY\`: OpenAI API 키
- \`STRIPE_SECRET_KEY\`: Stripe Secret Key

### 3. 데이터베이스 설정

#### Supabase에서 pgvector 확장 활성화

Supabase 대시보드 > SQL Editor에서 실행:

\`\`\`sql
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

#### 마이그레이션 실행

\`\`\`bash
npm run db:push
\`\`\`

### 4. 개발 서버 실행

\`\`\`bash
npm run dev
\`\`\`

http://localhost:3000 에서 확인하세요.

## 프로젝트 구조

\`\`\`
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지
│   ├── (dashboard)/       # 대시보드 페이지
│   ├── api/               # API Routes
│   └── page.tsx           # 랜딩 페이지
├── components/            # React 컴포넌트
├── lib/                   # 유틸리티 함수
│   ├── supabase/         # Supabase 클라이언트
│   ├── db.ts             # Drizzle 클라이언트
│   ├── openai.ts         # OpenAI 클라이언트
│   ├── stripe.ts         # Stripe 설정
│   └── validators.ts     # Zod 스키마
├── drizzle/              # 데이터베이스
│   └── schema.ts         # DB 스키마
├── types/                # TypeScript 타입
└── .kiro/                # Kiro 설정
    └── steering/         # 프로젝트 가이드라인
\`\`\`

## API 엔드포인트

### 인증
- \`POST /api/auth/callback\`: OAuth 콜백

### 문서
- \`GET /api/documents\`: 문서 목록 조회
- \`POST /api/documents\`: 문서 생성
- \`GET /api/documents/[id]\`: 문서 상세 조회
- \`PATCH /api/documents/[id]\`: 문서 수정
- \`DELETE /api/documents/[id]\`: 문서 삭제

### AI
- \`POST /api/ai/chat\`: AI 채팅
- \`POST /api/ai/search\`: 벡터 검색

## 배포

### Vercel 배포

1. GitHub 저장소에 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. 배포

### 환경 변수 체크리스트

- [ ] Supabase 설정
- [ ] OpenAI API 키
- [ ] Stripe 키
- [ ] 데이터베이스 URL

## 개발 가이드

### 새 API 추가

1. \`app/api/[endpoint]/route.ts\` 생성
2. \`lib/validators.ts\`에 Zod 스키마 추가
3. 인증 미들웨어 적용
4. 에러 핸들링 구현

### 새 페이지 추가

1. \`app/(dashboard)/[page]/page.tsx\` 생성
2. 레이아웃에 네비게이션 추가
3. TanStack Query로 데이터 페칭

### 데이터베이스 스키마 수정

1. \`drizzle/schema.ts\` 수정
2. \`npm run db:generate\` 실행
3. \`npm run db:migrate\` 실행

## 라이선스

MIT

## 문의

이슈나 질문은 GitHub Issues에 남겨주세요.
