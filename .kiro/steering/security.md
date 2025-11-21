---
include: always
---

# 보안 규칙

## 인증 & 인가
- Supabase Auth 사용 (JWT 기반)
- 모든 API route는 인증 미들웨어 통과 필수
- Row Level Security (RLS) 정책 활성화
- 세션 만료 시간: 7일

## 데이터 보호
- 민감 정보는 절대 클라이언트에 노출 금지
- 환경 변수로 모든 시크릿 관리
- API 키는 서버 사이드에서만 사용
- 사용자 입력은 항상 Zod로 검증 및 sanitize

## API 보안
- CORS 설정 엄격하게 관리
- Rate limiting 적용 (Vercel Edge Config)
- SQL Injection 방지 (Drizzle ORM 사용)
- XSS 방지 (React 기본 escape + DOMPurify)

## 의존성 관리
- 정기적으로 `npm audit` 실행
- 취약점 발견 시 즉시 업데이트
- Dependabot 활성화
