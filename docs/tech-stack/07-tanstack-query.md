# TanStack Query (React Query)

## 왜 선택했는가?

### 1. 서버 상태 관리
- 데이터 페칭
- 캐싱
- 동기화
- 백그라운드 업데이트

### 2. 개발자 경험
- 간단한 API
- DevTools 제공
- TypeScript 지원
- 자동 리페칭

### 3. 성능 최적화
- 자동 캐싱
- 중복 요청 제거
- 낙관적 업데이트
- 무한 스크롤 지원

## 어떻게 적용되었는가?

### 1. 설정

```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 5 * 60 * 1000, // 5분 (구 cacheTime)
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 2. 데이터 조회 (useQuery)

```typescript
// app/(dashboard)/dashboard/documents/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export default function DocumentsPage() {
  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      return json.data;
    },
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {documents?.map((doc) => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
}
```

**주요 옵션:**
- `queryKey`: 캐시 키 (배열)
- `queryFn`: 데이터 페칭 함수
- `staleTime`: 데이터가 신선한 시간
- `gcTime`: 캐시 유지 시간
- `enabled`: 조건부 실행

### 3. 데이터 변경 (useMutation)

```typescript
// 문서 생성
const createMutation = useMutation({
  mutationFn: async (data: { title: string; content: string }) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  onSuccess: () => {
    // 캐시 무효화 및 리페칭
    queryClient.invalidateQueries({ queryKey: ['documents'] });
    toast.success('문서가 생성되었습니다');
  },
  onError: (error) => {
    toast.error('문서 생성에 실패했습니다');
  },
});

// 사용
const handleCreate = () => {
  createMutation.mutate({
    title: 'New Document',
    content: 'Content...',
  });
};
```

### 4. 낙관적 업데이트

```typescript
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
  onMutate: async (deletedId) => {
    // 진행 중인 리페칭 취소
    await queryClient.cancelQueries({ queryKey: ['documents'] });

    // 이전 데이터 백업
    const previousDocuments = queryClient.getQueryData(['documents']);

    // 낙관적 업데이트
    queryClient.setQueryData(['documents'], (old: any[]) =>
      old.filter((doc) => doc.id !== deletedId)
    );

    return { previousDocuments };
  },
  onError: (err, deletedId, context) => {
    // 에러 시 롤백
    queryClient.setQueryData(['documents'], context?.previousDocuments);
  },
  onSettled: () => {
    // 완료 후 리페칭
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  },
});
```

### 5. 의존적 쿼리

```typescript
// 사용자 설정 조회
const { data: settings } = useQuery({
  queryKey: ['settings'],
  queryFn: fetchSettings,
});

// 설정이 로드된 후 문서 조회
const { data: documents } = useQuery({
  queryKey: ['documents', settings?.llm_provider],
  queryFn: () => fetchDocuments(settings?.llm_provider),
  enabled: !!settings, // settings가 있을 때만 실행
});
```

### 6. 병렬 쿼리

```typescript
export default function DashboardPage() {
  // 병렬로 실행
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });

  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
  });

  const { data: usage } = useQuery({
    queryKey: ['usage'],
    queryFn: fetchUsage,
  });

  // 모든 데이터가 로드될 때까지 대기
  if (!documents || !chats || !usage) {
    return <Loading />;
  }

  return <Dashboard data={{ documents, chats, usage }} />;
}
```

### 7. 무한 스크롤

```typescript
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['documents'],
  queryFn: ({ pageParam = 1 }) => fetchDocuments(pageParam),
  getNextPageParam: (lastPage, pages) => {
    return lastPage.hasMore ? pages.length + 1 : undefined;
  },
  initialPageParam: 1,
});

// 사용
<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  loading={isFetchingNextPage}
>
  {data?.pages.map((page) =>
    page.documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)
  )}
</InfiniteScroll>
```

## 실제 사용 예시

### 1. 문서 관리

```typescript
// app/(dashboard)/dashboard/documents/page.tsx
export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // 문서 목록 조회
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await fetch('/api/documents');
      const data = await res.json();
      return data.data;
    },
  });

  // 문서 생성
  const createMutation = useMutation({
    mutationFn: async (data: { title: string; content: string }) => {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsCreating(false);
    },
  });

  // 문서 삭제
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  return (
    <div>
      <button onClick={() => setIsCreating(true)}>새 문서</button>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        documents?.map((doc) => (
          <div key={doc.id}>
            <h3>{doc.title}</h3>
            <button onClick={() => deleteMutation.mutate(doc.id)}>
              삭제
            </button>
          </div>
        ))
      )}
    </div>
  );
}
```

### 2. 설정 관리

```typescript
// app/(dashboard)/dashboard/settings/page.tsx
export default function SettingsPage() {
  const queryClient = useQueryClient();

  // 설정 조회
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      const data = await res.json();
      return data.data;
    },
  });

  // 설정 업데이트
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('설정이 저장되었습니다');
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      saveMutation.mutate(formData);
    }}>
      {/* 폼 필드 */}
      <button type="submit" disabled={saveMutation.isPending}>
        {saveMutation.isPending ? '저장 중...' : '저장'}
      </button>
    </form>
  );
}
```

## 캐싱 전략

### 1. 캐시 무효화

```typescript
// 특정 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['documents'] });

// 모든 문서 관련 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['documents'], exact: false });

// 즉시 리페칭
queryClient.invalidateQueries({
  queryKey: ['documents'],
  refetchType: 'active',
});
```

### 2. 캐시 업데이트

```typescript
// 캐시 직접 업데이트
queryClient.setQueryData(['documents'], (old: Document[]) => [
  ...old,
  newDocument,
]);

// 특정 문서 업데이트
queryClient.setQueryData(['documents'], (old: Document[]) =>
  old.map((doc) => (doc.id === updatedDoc.id ? updatedDoc : doc))
);
```

### 3. Prefetching

```typescript
// 페이지 진입 전 데이터 미리 로드
const prefetchDocuments = async () => {
  await queryClient.prefetchQuery({
    queryKey: ['documents'],
    queryFn: fetchDocuments,
  });
};

// 링크에 마우스 오버 시
<Link
  href="/dashboard/documents"
  onMouseEnter={prefetchDocuments}
>
  문서
</Link>
```

## DevTools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**기능:**
- 쿼리 상태 확인
- 캐시 내용 확인
- 수동 리페칭
- 쿼리 무효화

## 성능 최적화

### 1. 선택적 구독

```typescript
// 특정 필드만 구독
const { data: userName } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  select: (data) => data.name, // name만 반환
});
```

### 2. 구조적 공유

```typescript
// 자동으로 이전 데이터와 비교하여 변경된 부분만 업데이트
const { data } = useQuery({
  queryKey: ['documents'],
  queryFn: fetchDocuments,
  structuralSharing: true, // 기본값
});
```

### 3. 백그라운드 리페칭 제어

```typescript
const { data } = useQuery({
  queryKey: ['documents'],
  queryFn: fetchDocuments,
  refetchOnWindowFocus: false, // 포커스 시 리페칭 비활성화
  refetchOnMount: false, // 마운트 시 리페칭 비활성화
  refetchOnReconnect: false, // 재연결 시 리페칭 비활성화
});
```

## 에러 처리

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['documents'],
  queryFn: fetchDocuments,
  retry: 3, // 3번 재시도
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

## 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
