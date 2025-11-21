# Vercel 배포 가이드

## 방법 1: Vercel 대시보드 (추천)

### 1. Vercel 대시보드 접속
https://vercel.com/new

### 2. GitHub 저장소 Import
1. "Import Git Repository" 클릭
2. `ez2sarang/ai-saas-starter-kit` 검색 및 선택
3. "Import" 클릭

### 3. 프로젝트 설정
- **Project Name**: ai-saas-starter-kit
- **Framework Preset**: Next.js (자동 감지됨)
- **Root Directory**: ./
- **Build Command**: `npm run build` (자동 설정됨)
- **Output Directory**: `.next` (자동 설정됨)
- **Install Command**: `npm install` (자동 설정됨)

### 4. 환경 변수 설정
"Environment Variables" 섹션에서 다음 변수 추가:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

선택 사항 (LLM API 키):
```
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_key
CLAUDE_API_KEY=your_claude_key
```

### 5. 배포
"Deploy" 버튼 클릭!

배포가 완료되면 다음과 같은 URL을 받게 됩니다:
- Production: `https://ai-saas-starter-kit.vercel.app`
- Preview: `https://ai-saas-starter-kit-git-main-ez2sarang.vercel.app`

---

## 방법 2: Vercel CLI

### 1. Vercel 로그인
```bash
vercel login
```

브라우저에서 인증 완료

### 2. 프로젝트 배포
```bash
# 프로젝트 초기 설정 및 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 환경 변수 설정
```bash
# 환경 변수 추가
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add DATABASE_URL

# 환경 변수 확인
vercel env ls
```

### 4. 재배포
```bash
vercel --prod
```

---

## 배포 후 확인 사항

### 1. 도메인 설정
Vercel 대시보드 > Settings > Domains에서 커스텀 도메인 추가 가능

### 2. 환경 변수 확인
- [ ] NEXT_PUBLIC_SUPABASE_URL 설정됨
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY 설정됨
- [ ] DATABASE_URL 설정됨

### 3. 기능 테스트
- [ ] 홈페이지 로딩
- [ ] 회원가입/로그인
- [ ] 대시보드 접근
- [ ] 문서 업로드
- [ ] AI 채팅

### 4. Supabase 설정
Supabase 대시보드에서 Vercel URL을 허용 목록에 추가:

1. Supabase Dashboard > Authentication > URL Configuration
2. Site URL: `https://your-app.vercel.app`
3. Redirect URLs 추가:
   - `https://your-app.vercel.app/api/auth/callback`
   - `https://your-app.vercel.app/**`

---

## 자동 배포 설정

GitHub에 푸시할 때마다 자동으로 배포됩니다:

- `main` 브랜치 → Production 배포
- 다른 브랜치 → Preview 배포
- Pull Request → Preview 배포 (코멘트에 URL 표시)

---

## 문제 해결

### 빌드 실패
1. Vercel 대시보드 > Deployments > 실패한 배포 클릭
2. Build Logs 확인
3. 환경 변수 누락 확인

### 데이터베이스 연결 실패
- DATABASE_URL이 올바른지 확인
- Supabase에서 Vercel IP 허용 확인

### 인증 실패
- Supabase Redirect URLs 설정 확인
- NEXT_PUBLIC_SUPABASE_URL과 ANON_KEY 확인

---

## 성능 최적화

### Edge Functions
Vercel Edge Functions를 사용하여 전 세계적으로 빠른 응답:

```typescript
// app/api/edge-example/route.ts
export const runtime = 'edge';
```

### 이미지 최적화
Next.js Image Optimization이 자동으로 활성화됩니다.

### 캐싱
- Static 페이지: 자동 캐싱
- API Routes: Cache-Control 헤더 설정

---

## 모니터링

### Vercel Analytics
Vercel 대시보드 > Analytics에서 확인:
- 페이지 뷰
- 성능 메트릭
- Web Vitals

### Vercel Logs
실시간 로그 확인:
```bash
vercel logs
```

---

## 문의

- 기술 문의: sales@com.dooray.com
- 영업 문의: sales@com.dooray.com
- Vercel 문서: https://vercel.com/docs
