# Next.js 16 (App Router + Turbopack)

## 왜 선택했는가?

### 1. 최신 기술 스택
- **Next.js 16**: 2024년 11월 출시된 최신 버전
- **Turbopack**: Webpack보다 700배 빠른 번들러
- **React 19**: 최신 React 기능 지원

### 2. 프로덕션 준비 완료
- Vercel의 공식 지원
- 엔터프라이즈급 성능
- 자동 최적화 기능

### 3. 개발자 경험
- 빠른 Hot Module Replacement (HMR)
- 직관적인 파일 기반 라우팅
- TypeScript 완벽 지원

## 어떻게 적용되었는가?

### 1. App Router 구조

```
app/
├── (auth)/              # Route Group: 인증 페이지
│   ├── login/
│   └── signup/
├── (dashboard)/         # Route Group: 대시보드
│   ├── layout.tsx      # 대시보드 레이아웃
│   └── dashboard/
│       ├── page.tsx    # 메인 대시보드
│       ├── chat/       # AI 채팅
│       ├── documents/  # 문서 관리
│       └── settings/   # 설정
├── api/                # API Routes
│   ├── ai/
│   ├── auth/
│   ├── documents/
│   └── settings/
├── layout.tsx          # 루트 레이아웃
└── page.tsx            # 홈페이지
```

### 2. Server Components vs Client Components

#### Server Components (기본)
```typescript
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 서버에서 직접 데이터 페칭
  const stats = await db.select()...;
  
  return <div>{/* UI */}</div>;
}
```

**장점:**
- 서버에서 직접 데이터베이스 접근
- 번들 크기 감소 (클라이언트로 전송 안 됨)
- SEO 최적화

#### Client Components
```typescript
// app/(dashboard)/dashboard/chat/page.tsx
'use client';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  // 인터랙티브 UI
}
```

**사용 시기:**
- useState, useEffect 등 React Hooks 사용
- 브라우저 API 사용 (localStorage, etc)
- 이벤트 핸들러 필요

### 3. Proxy (Middleware 대체)

Next.js 16에서 middleware.ts → proxy.ts로 변경:

```typescript
// proxy.ts
export async function proxy(request: NextRequest) {
  const supabase = createServerClient(...);
  const { data: { user } } = await supabase.auth.getUser();
  
  // 인증 체크
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
```

**역할:**
- 인증 체크
- 리다이렉트 처리
- 쿠키 관리

### 4. API Routes

```typescript
// app/api/ai/chat/route.ts
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
  
  // 비즈니스 로직
  const result = await generateChatCompletion(...);
  
  return NextResponse.json({ success: true, data: result });
}
```

**특징:**
- RESTful API 구조
- 타입 안전성
- 서버리스 함수로 자동 배포

### 5. 로딩 및 에러 처리

```typescript
// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return <Skeleton />;
}

// app/(dashboard)/dashboard/error.tsx
'use client';
export default function DashboardError({ error, reset }) {
  return <ErrorUI error={error} onReset={reset} />;
}
```

**자동 적용:**
- loading.tsx: 페이지 로딩 중 표시
- error.tsx: 에러 발생 시 표시
- not-found.tsx: 404 페이지

## 성능 최적화

### 1. Turbopack
- 개발 서버 시작: **336ms** (Webpack 대비 10배 빠름)
- HMR: 즉시 반영
- 빌드 시간: 1.5초 (14개 라우트)

### 2. 자동 코드 스플리팅
```typescript
// 동적 import
const DynamicComponent = dynamic(() => import('./Component'), {
  loading: () => <Skeleton />,
});
```

### 3. 이미지 최적화
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

### 4. 폰트 최적화
```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
```

## 배포 최적화

### 1. Static Generation
```typescript
// 정적 생성 (빌드 시)
export default async function Page() {
  return <div>Static Content</div>;
}
```

### 2. Dynamic Rendering
```typescript
// 요청 시 렌더링
export const dynamic = 'force-dynamic';

export default async function Page() {
  const data = await fetchRealtimeData();
  return <div>{data}</div>;
}
```

### 3. Incremental Static Regeneration (ISR)
```typescript
export const revalidate = 3600; // 1시간마다 재생성

export default async function Page() {
  const data = await fetchData();
  return <div>{data}</div>;
}
```

## 모범 사례

### 1. 파일 구조
- Route Groups로 논리적 그룹화
- 공통 레이아웃 재사용
- API Routes 분리

### 2. 데이터 페칭
- Server Components에서 직접 페칭
- Client Components는 TanStack Query 사용
- 병렬 데이터 페칭 활용

### 3. 타입 안전성
```typescript
// 타입 정의
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { id } = await params;
  // ...
}
```

## 주의사항

### 1. Server/Client 경계
- Server Components에서 Client Components import 가능
- Client Components에서 Server Components import 불가
- Props로 전달은 가능

### 2. 환경 변수
- `NEXT_PUBLIC_*`: 클라이언트에서 접근 가능
- 그 외: 서버에서만 접근 가능

### 3. 캐싱
- fetch()는 기본적으로 캐싱됨
- `cache: 'no-store'`로 비활성화 가능

## 참고 자료

- [Next.js 16 공식 문서](https://nextjs.org/docs)
- [App Router 가이드](https://nextjs.org/docs/app)
- [Turbopack 문서](https://turbo.build/pack/docs)
