# AI SaaS Starter Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)

AI 기반 문서 검색 및 챗봇 SaaS 플랫폼 템플릿

> 프로덕션 레벨의 AI SaaS 애플리케이션을 빠르게 구축하세요. Next.js 16, React 19, Supabase, 다중 LLM 지원.

## ✨ 주요 기능

- 🔐 **인증 시스템** - Supabase Auth (이메일/소셜 로그인)
- 📄 **문서 관리** - 업로드, 수정, 삭제, 벡터 임베딩
- 🤖 **AI 채팅** - 다중 LLM 지원 (OpenAI, Google Gemini, Claude, Ollama, LM Studio)
- 🔍 **벡터 검색** - pgvector 기반 RAG 시스템
- 💳 **구독 관리** - Stripe 연동 (Free/Pro/Enterprise)
- 📊 **대시보드** - 실시간 사용 통계 및 분석
- 🎨 **모던 UI** - shadcn/ui + Tailwind CSS
- ⚡ **고성능** - Next.js 16 + Turbopack

## 🚀 빠른 시작

```bash
# 1. 저장소 클론
git clone https://github.com/ez2sarang/ai-saas-starter-kit.git
cd ai-saas-starter-kit

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 값을 입력하세요

# 4. 데이터베이스 설정
npm run db:push

# 5. 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인하세요!

## 🛠 기술 스택

| 카테고리 | 기술 |
|---------|------|
| **프레임워크** | Next.js 16 (App Router + Turbopack) |
| **UI 라이브러리** | React 19 |
| **언어** | TypeScript 5.3 |
| **데이터베이스** | Supabase (PostgreSQL + pgvector) |
| **ORM** | Drizzle ORM |
| **인증** | Supabase Auth |
| **AI/LLM** | OpenAI, Google Gemini, Claude, Ollama, LM Studio |
| **결제** | Stripe |
| **UI 컴포넌트** | shadcn/ui + Tailwind CSS |
| **상태 관리** | TanStack Query |
| **배포** | Vercel |

## 📖 상세 설정 가이드

### 1. 로컬 데이터베이스 설정

#### PostgreSQL 17 + pgvector 설치 (macOS)

\`\`\`bash
# PostgreSQL 17 설치
brew install postgresql@17

# 서비스 시작
brew services start postgresql@17

# pgvector 설치
brew install pgvector

# PostgreSQL에 연결
psql postgres

# 데이터베이스 생성
CREATE DATABASE ai_saas;

# pgvector 확장 활성화
\c ai_saas
CREATE EXTENSION IF NOT EXISTS vector;
\`\`\`

#### Supabase 로컬 환경 설정

\`\`\`bash
# Supabase CLI 설치
brew install supabase/tap/supabase

# Supabase 초기화 및 시작
supabase start

# 출력된 정보를 .env.local에 복사
\`\`\`

### 2. 환경 변수 설정

\`.env.example\`을 \`.env.local\`로 복사하고 값을 입력하세요:

\`\`\`bash
cp .env.example .env.local
\`\`\`

필수 환경 변수:
- \`NEXT_PUBLIC_SUPABASE_URL\`: Supabase URL (로컬: http://127.0.0.1:54321)
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`: Supabase Anon Key
- \`DATABASE_URL\`: PostgreSQL 연결 문자열
- \`OPENAI_API_KEY\`: OpenAI API 키 (선택)
- \`GOOGLE_API_KEY\`: Google Gemini API 키 (선택)
- \`CLAUDE_API_KEY\`: Claude API 키 (선택)

**로컬 LLM 사용 (API 키 불필요)**:
- LM Studio: http://localhost:1234
- Ollama: http://localhost:11434

### 3. 데이터베이스 마이그레이션

\`\`\`bash
npm run db:push
\`\`\`

### 4. 로컬 LLM 설정 (선택)

#### LM Studio 사용

1. [LM Studio](https://lmstudio.ai/) 다운로드 및 설치
2. 원하는 모델 다운로드 (예: Kimi K2 Thinking)
3. 로컬 서버 시작 (포트: 1234)
4. 대시보드 > 설정에서 LM Studio 선택

#### Ollama 사용

\`\`\`bash
# Ollama 설치
brew install ollama

# 모델 다운로드
ollama pull llama2

# 서버 시작 (자동으로 백그라운드 실행)
ollama serve
\`\`\`

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

## 📖 문서

- **[프로젝트 히스토리](docs/PROJECT_HISTORY.md)** - 프로젝트 탄생 배경과 개발 과정
- **[기술 스택 문서](docs/tech-stack/)** - 각 기술 스택 상세 분석
- **[배포 가이드](VERCEL_DEPLOY.md)** - Vercel 배포 방법
- **[변경 로그](CHANGELOG.md)** - 버전별 변경 사항
- **[기여 가이드](CONTRIBUTING.md)** - 기여 방법
- **[보안 정책](SECURITY.md)** - 보안 취약점 보고

## 기여하기

기여는 언제나 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md)를 참고해주세요.

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참고해주세요.

## 문의

- 기술 문의: sales@com.dooray.com
- 영업 문의: sales@com.dooray.com
- GitHub Issues: https://github.com/ez2sarang/ai-saas-starter-kit/issues

## 제작

Made with ❤️ by [ez2sarang](https://github.com/ez2sarang)
