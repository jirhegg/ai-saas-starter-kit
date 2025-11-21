# Changelog

## [1.0.0] - 2024-11-21

### 추가됨 (Added)
- 🤖 **다중 LLM 지원**
  - OpenAI (GPT-4, GPT-3.5)
  - Google Gemini
  - Claude 3.5
  - Ollama (로컬)
  - LM Studio (로컬, kimi-k2-thinking)
  
- 🌍 **다국어 지원**
  - 한국어 (ko)
  - 영어 (en)
  - 일본어 (ja)
  - 중국어 (zh)
  - 언어 전환기 컴포넌트
  
- 🔐 **인증 시스템**
  - Supabase Auth 통합
  - 이메일/비밀번호 로그인
  - Google OAuth
  - 세션 관리
  
- 📄 **문서 관리**
  - 문서 CRUD 기능
  - 벡터 임베딩 자동 생성
  - pgvector 기반 검색
  
- 💬 **AI 채팅**
  - 실시간 AI 대화
  - 사용자별 LLM 설정
  - 채팅 히스토리 저장
  
- ⚙️ **설정 관리**
  - 사용자별 LLM 제공자 선택
  - API 키 안전 저장
  - 로컬 LLM URL 설정
  
- 📊 **대시보드**
  - 사용 통계
  - API 호출 추적
  - 토큰 사용량 모니터링
  
- 🎨 **UI/UX**
  - shadcn/ui 컴포넌트
  - Tailwind CSS 스타일링
  - 다크 모드 지원
  - 반응형 디자인

### 기술 스택
- Next.js 15 (App Router)
- React 18
- TypeScript
- Supabase (PostgreSQL + Auth)
- Drizzle ORM
- pgvector
- TanStack Query
- next-intl
- OpenAI SDK
- Anthropic SDK
- Google Generative AI

### 데이터베이스 스키마
- users
- user_settings (LLM 설정)
- subscriptions
- documents
- embeddings (벡터 검색)
- chat_history
- api_usage

### 보안
- Row Level Security (RLS)
- API 키 암호화 저장
- 인증 미들웨어
- 환경 변수 관리

### 성능 최적화
- Server Components 우선 사용
- TanStack Query 캐싱
- HNSW 벡터 인덱스
- 코드 스플리팅

## 향후 계획

### [1.1.0] - 예정
- [ ] 파일 업로드 (PDF, DOCX)
- [ ] 이미지 분석 (Vision 모델)
- [ ] 음성 입력/출력
- [ ] 더 많은 언어 지원

### [1.2.0] - 예정
- [ ] 팀 협업 기능
- [ ] 문서 공유
- [ ] 권한 관리
- [ ] 감사 로그

### [2.0.0] - 예정
- [ ] 플러그인 시스템
- [ ] 커스텀 모델 통합
- [ ] 고급 분석 대시보드
- [ ] API 제공
