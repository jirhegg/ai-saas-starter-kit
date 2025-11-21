# React 19

## 왜 선택했는가?

### 1. 최신 기능
- **React Compiler**: 자동 메모이제이션
- **Server Components**: 서버 사이드 렌더링 개선
- **Actions**: 폼 처리 간소화
- **use() Hook**: 비동기 데이터 처리

### 2. 성능 개선
- 자동 최적화
- 번들 크기 감소
- 렌더링 성능 향상

### 3. 개발자 경험
- 더 간단한 API
- 타입 안전성 향상
- 에러 처리 개선

## 어떻게 적용되었는가?

### 1. Server Components

```typescript
// app/(dashboard)/dashboard/page.tsx
// 'use client' 없음 = Server Component
export default async function DashboardPage() {
  // 서버에서 직접 데이터 페칭
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const [documentsCount] = await db
    .select({ count: count() })
    .from(documents)
    .where(eq(documents.user_id, user.id));
  
  return (
    <div>
      <h1>대시보드</h1>
      <p>총 문서: {documentsCount.count}</p>
    </div>
  );
}
```

**장점:**
- 데이터베이스 직접 접근
- API 호출 불필요
- SEO 최적화
- 초기 로딩 속도 향상

### 2. Client Components

```typescript
// app/(dashboard)/dashboard/chat/page.tsx
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.data.message
      }]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    chatMutation.mutate(input);
    setInput('');
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">전송</button>
      </form>
    </div>
  );
}
```

**사용 이유:**
- 상태 관리 필요 (useState)
- 이벤트 핸들러 필요
- 실시간 인터랙션

### 3. Hooks 활용

#### useState
```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);
```

#### useEffect
```typescript
useEffect(() => {
  // 설정 로드
  if (settings) {
    setProvider(settings.llm_provider);
    setModel(settings.llm_model);
  }
}, [settings]);
```

#### Custom Hooks (TanStack Query)
```typescript
const { data: documents, isLoading } = useQuery({
  queryKey: ['documents'],
  queryFn: async () => {
    const res = await fetch('/api/documents');
    return res.json();
  },
});
```

### 4. 컴포넌트 구조

#### 프레젠테이션 컴포넌트
```typescript
// 순수 UI 컴포넌트
type StatCardProps = {
  icon: React.ComponentType;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
};

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className={`w-10 h-10 rounded-lg ${bgColor}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
```

#### 컨테이너 컴포넌트
```typescript
// 로직 + UI
export default function DocumentsPage() {
  const [isCreating, setIsCreating] = useState(false);
  
  const { data: documents } = useQuery({...});
  const createMutation = useMutation({...});
  const deleteMutation = useMutation({...});
  
  return (
    <div>
      {/* UI 렌더링 */}
    </div>
  );
}
```

### 5. 에러 처리

#### Error Boundary
```typescript
// app/(dashboard)/dashboard/error.tsx
'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[ERROR]', error);
  }, [error]);

  return (
    <div>
      <h2>문제가 발생했습니다</h2>
      <p>{error.message}</p>
      <button onClick={reset}>다시 시도</button>
    </div>
  );
}
```

### 6. 로딩 상태

#### Suspense Boundary
```typescript
// app/(dashboard)/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-9 bg-muted rounded w-48 mb-2"></div>
      <div className="h-6 bg-muted rounded w-96"></div>
    </div>
  );
}
```

## React 19 새 기능 활용

### 1. 자동 메모이제이션
```typescript
// React 19에서는 자동으로 최적화됨
// useMemo, useCallback 불필요한 경우 많음
function Component({ data }) {
  // 자동으로 메모이제이션됨
  const processedData = expensiveOperation(data);
  
  return <div>{processedData}</div>;
}
```

### 2. 개선된 타입 추론
```typescript
// ref 타입 자동 추론
const inputRef = useRef<HTMLInputElement>(null);

// 이벤트 타입 자동 추론
const handleChange = (e) => {
  // e의 타입이 자동으로 추론됨
  console.log(e.target.value);
};
```

## 성능 최적화

### 1. 컴포넌트 분리
```typescript
// ❌ 나쁜 예: 모든 것을 하나의 컴포넌트에
function Dashboard() {
  // 너무 많은 로직과 UI
}

// ✅ 좋은 예: 관심사 분리
function Dashboard() {
  return (
    <>
      <DashboardHeader />
      <DashboardStats />
      <DashboardQuickActions />
    </>
  );
}
```

### 2. 조건부 렌더링
```typescript
// ✅ 효율적인 조건부 렌더링
{isLoading ? (
  <LoadingSkeleton />
) : documents?.length === 0 ? (
  <EmptyState />
) : (
  <DocumentList documents={documents} />
)}
```

### 3. 리스트 렌더링
```typescript
// ✅ key 사용
{messages.map((message, index) => (
  <div key={message.id || index}>
    {message.content}
  </div>
))}
```

## 모범 사례

### 1. Props 타입 정의
```typescript
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

function Button({ children, onClick, disabled, variant = 'primary' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  );
}
```

### 2. 이벤트 핸들러
```typescript
// ✅ 타입 안전한 이벤트 핸들러
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // 로직
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

### 3. 조건부 렌더링
```typescript
// ✅ Early return
if (!user) return null;
if (isLoading) return <Loading />;
if (error) return <Error error={error} />;

return <Content data={data} />;
```

## 주의사항

### 1. Server/Client 구분
```typescript
// ❌ Server Component에서 useState 사용 불가
export default function Page() {
  const [state, setState] = useState(); // 에러!
}

// ✅ Client Component로 변경
'use client';
export default function Page() {
  const [state, setState] = useState(); // OK
}
```

### 2. 비동기 처리
```typescript
// ❌ useEffect에서 async 직접 사용 불가
useEffect(async () => {
  await fetchData(); // 에러!
}, []);

// ✅ 내부 함수로 감싸기
useEffect(() => {
  const loadData = async () => {
    await fetchData();
  };
  loadData();
}, []);
```

### 3. 메모리 누수 방지
```typescript
useEffect(() => {
  const subscription = subscribe();
  
  // 클린업 함수
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## 참고 자료

- [React 19 공식 문서](https://react.dev/)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [React Hooks](https://react.dev/reference/react)
