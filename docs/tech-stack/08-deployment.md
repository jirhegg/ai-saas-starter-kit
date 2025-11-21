# Vercel 배포

## 왜 Vercel인가?

### 1. Next.js 최적화
- Next.js 개발사 (Vercel)
- 완벽한 통합
- 자동 최적화

### 2. 개발자 경험
- Git 연동 자동 배포
- Preview 배포
- 즉시 롤백

### 3. 성능
- 글로벌 CDN
- Edge Functions
- 이미지 최적화

### 4. 무료 티어
- Hobby 플랜 무료
- 충분한 리소스
- 프로덕션 사용 가능

## 배포 프로세스

### 1. GitHub 연동

```bash
# 1. GitHub 저장소 생성
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

### 2. Vercel 프로젝트 생성

**방법 1: 대시보드**
1. https://vercel.com/new 접속
2. GitHub 저장소 import
3. 프로젝트 설정
4. 환경 변수 추가
5. Deploy 클릭

**방법 2: CLI**
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 환경 변수 설정

Vercel 대시보드 > Settings > Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
DATABASE_URL=postgresql://xxx
OPENAI_API_KEY=sk-xxx (선택)
GOOGLE_API_KEY=AIzaxxx (선택)
CLAUDE_API_KEY=sk-ant-xxx (선택)
```

**환경별 설정:**
- Production: 프로덕션 환경
- Preview: PR 및 브랜치
- Development: 로컬 개발

## 자동 배포

### 1. Git 워크플로우

```
main 브랜치 푸시 → Production 배포
다른 브랜치 푸시 → Preview 배포
Pull Request 생성 → Preview 배포 (코멘트에 URL)
```

### 2. 배포 설정

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["icn1"]
}
```

## 성능 최적화

### 1. Edge Functions

```typescript
// app/api/edge-example/route.ts
export const runtime = 'edge';

export async function GET() {
  return new Response('Hello from Edge!');
}
```

**장점:**
- 전 세계 엣지 로케이션에서 실행
- 낮은 지연 시간
- 자동 스케일링

### 2. 이미지 최적화

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
  priority // LCP 최적화
/>
```

**자동 최적화:**
- WebP/AVIF 변환
- 반응형 이미지
- Lazy loading

### 3. 캐싱

```typescript
// Static Generation
export default async function Page() {
  return <div>Static Content</div>;
}

// ISR (Incremental Static Regeneration)
export const revalidate = 3600; // 1시간

// Dynamic
export const dynamic = 'force-dynamic';
```

## 모니터링

### 1. Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**제공 정보:**
- 페이지 뷰
- 성능 메트릭
- Web Vitals
- 사용자 경로

### 2. 로그 확인

```bash
# 실시간 로그
vercel logs

# 특정 배포 로그
vercel logs [deployment-url]
```

## 도메인 설정

### 1. 커스텀 도메인 추가

Vercel 대시보드 > Settings > Domains:

1. 도메인 입력 (예: example.com)
2. DNS 레코드 추가
3. SSL 자동 설정

### 2. DNS 설정

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## CI/CD

### 1. GitHub Actions 통합

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

### 2. 배포 후크

```typescript
// Vercel Deploy Hook
const deployHook = 'https://api.vercel.com/v1/integrations/deploy/xxx';

// 배포 트리거
await fetch(deployHook, { method: 'POST' });
```

## 보안

### 1. 환경 변수 보호

```typescript
// ✅ 서버에서만 접근
const apiKey = process.env.OPENAI_API_KEY;

// ✅ 클라이언트에서 접근 (NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
```

### 2. 헤더 설정

```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 문제 해결

### 1. 빌드 실패

```bash
# 로컬에서 프로덕션 빌드 테스트
npm run build

# 타입 체크
npm run lint
```

### 2. 환경 변수 누락

Vercel 대시보드에서 환경 변수 확인:
- Settings > Environment Variables
- 모든 환경 (Production, Preview, Development) 설정

### 3. 데이터베이스 연결 실패

- DATABASE_URL 확인
- Supabase에서 Vercel IP 허용
- 연결 풀 설정 확인

## 비용 최적화

### 1. Hobby 플랜 (무료)
- 100GB 대역폭/월
- 무제한 배포
- 자동 SSL

### 2. Pro 플랜 ($20/월)
- 1TB 대역폭/월
- 팀 협업
- 고급 분석

### 3. 최적화 팁
- 이미지 최적화 사용
- Static Generation 활용
- Edge Functions 사용
- 불필요한 API 호출 제거

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel CLI](https://vercel.com/docs/cli)
