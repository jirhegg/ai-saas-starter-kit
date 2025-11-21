# 기능 상세 설명

## 🤖 다중 LLM 지원

이 프로젝트는 다양한 LLM 제공자를 지원하여 사용자가 원하는 AI 모델을 선택할 수 있습니다.

### 지원되는 LLM 제공자

#### 1. OpenAI
- **모델**: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **설정**: API 키 필요
- **특징**: 가장 강력한 성능, 안정적인 서비스

#### 2. Google Gemini
- **모델**: Gemini Pro, Gemini Pro Vision
- **설정**: Google API 키 필요
- **특징**: 무료 티어 제공, 빠른 응답 속도

#### 3. Claude (Anthropic)
- **모델**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Sonnet
- **설정**: Anthropic API 키 필요
- **특징**: 긴 컨텍스트 지원, 안전한 응답

#### 4. Ollama (로컬)
- **모델**: Llama 2, Mistral, Code Llama 등
- **설정**: 로컬에 Ollama 설치 및 실행 필요
- **특징**: 완전 무료, 프라이버시 보장, 오프라인 사용 가능

**설치 방법:**
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# 모델 다운로드
ollama pull llama2

# 서버 실행
ollama serve
```

#### 5. LM Studio (로컬)
- **모델**: Kimi K2 Thinking, 기타 로컬 모델
- **설정**: LM Studio 설치 및 서버 실행 필요
- **특징**: GUI 제공, 쉬운 모델 관리, 무료

**설치 방법:**
1. [LM Studio](https://lmstudio.ai/) 다운로드
2. 원하는 모델 다운로드
3. 서버 탭에서 서버 시작 (기본 포트: 1234)

### 사용 방법

1. **설정 페이지 접속**: `/dashboard/settings`
2. **LLM 제공자 선택**: 드롭다운에서 원하는 제공자 선택
3. **모델 선택**: 선택한 제공자의 사용 가능한 모델 선택
4. **API 키 입력** (클라우드 제공자의 경우):
   - OpenAI: `sk-...`
   - Google: `AIza...`
   - Claude: `sk-ant-...`
5. **Base URL 설정** (로컬 제공자의 경우):
   - Ollama: `http://localhost:11434` (기본값)
   - LM Studio: `http://localhost:1234` (기본값)
6. **설정 저장**: 즉시 적용됨

### 비용 비교

| 제공자 | 비용 | 장점 | 단점 |
|--------|------|------|------|
| OpenAI | 유료 (토큰당) | 최고 성능 | 비용 발생 |
| Google | 무료/유료 | 무료 티어 | 제한적 |
| Claude | 유료 (토큰당) | 긴 컨텍스트 | 비용 발생 |
| Ollama | 무료 | 완전 무료 | 로컬 리소스 필요 |
| LM Studio | 무료 | GUI 제공 | 로컬 리소스 필요 |

## 🌍 다국어 지원

### 지원 언어
- 🇰🇷 한국어 (ko)
- 🇺🇸 영어 (en)
- 🇯🇵 일본어 (ja)
- 🇨🇳 중국어 (zh)

### 언어 전환
- 페이지 우측 상단의 언어 선택기에서 원하는 언어 선택
- 선택한 언어는 자동으로 저장되어 다음 방문 시에도 유지됨
- URL에 언어 코드가 포함됨 (예: `/ko/dashboard`, `/en/dashboard`)

### 번역 추가 방법

새로운 언어를 추가하려면:

1. `messages/` 폴더에 새 JSON 파일 생성 (예: `messages/fr.json`)
2. `i18n.ts`의 `locales` 배열에 언어 코드 추가
3. `components/LanguageSwitcher.tsx`의 `languageNames`에 언어 이름 추가

## 🔒 보안 기능

- **API 키 암호화**: 사용자의 API 키는 데이터베이스에 안전하게 저장
- **Row Level Security**: Supabase RLS로 데이터 접근 제어
- **인증 미들웨어**: 모든 보호된 경로에 자동 인증 체크
- **환경 변수**: 민감한 정보는 환경 변수로 관리

## 📊 사용 통계

- **API 사용량 추적**: 모든 AI API 호출 기록
- **토큰 사용량**: 사용된 토큰 수 자동 계산
- **비용 추정**: 대략적인 비용 계산 (OpenAI 기준)
- **대시보드**: 시각화된 통계 제공

## 🚀 성능 최적화

- **Server Components**: 기본적으로 서버 컴포넌트 사용
- **TanStack Query**: 자동 캐싱 및 재검증
- **벡터 검색**: HNSW 인덱스로 빠른 검색
- **코드 스플리팅**: 동적 import로 번들 크기 최적화
