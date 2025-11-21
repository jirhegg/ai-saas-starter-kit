# TypeScript 5.3

## 왜 선택했는가?

### 1. 타입 안전성
- 컴파일 타임 에러 감지
- 런타임 에러 감소
- 리팩토링 안전성

### 2. 개발자 경험
- 자동 완성 (IntelliSense)
- 타입 추론
- 리팩토링 도구

### 3. 코드 품질
- 명확한 인터페이스
- 문서화 효과
- 유지보수성 향상

## 어떻게 적용되었는가?

### 1. tsconfig.json 설정

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**주요 설정:**
- `strict: true`: 엄격한 타입 체크
- `noEmit: true`: 타입 체크만 수행
- `paths`: 절대 경로 import

### 2. 타입 정의

#### 데이터베이스 타입
```typescript
// types/index.ts
import { users, documents, chat_history } from '@/drizzle/schema';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type ChatMessage = typeof chat_history.$inferSelect;
export type NewChatMessage = typeof chat_history.$inferInsert;
```

**Drizzle ORM 타입 추론:**
- `$inferSelect`: SELECT 쿼리 결과 타입
- `$inferInsert`: INSERT 데이터 타입

#### API 응답 타입
```typescript
// lib/validators.ts
import { z } from 'zod';

export const chatMessageSchema = z.object({
  message: z.string().min(1, '메시지를 입력하세요'),
  document_id: z.string().uuid().optional(),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

// API 응답 타입
export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: {
    code: string;
    message: string;
  };
};
```

### 3. 컴포넌트 Props 타입

```typescript
// 기본 Props
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
    >
      {children}
    </button>
  );
}
```

#### 제네릭 Props
```typescript
type ListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
};

export function List<T>({
  items,
  renderItem,
  keyExtractor,
  emptyMessage = '항목이 없습니다',
}: ListProps<T>) {
  if (items.length === 0) {
    return <p>{emptyMessage}</p>;
  }

  return (
    <div>
      {items.map((item) => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
```

### 4. API Route 타입

```typescript
// app/api/ai/chat/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatMessageSchema.parse(body);
    
    // 타입 안전한 데이터 사용
    const result = await generateChatCompletion(validatedData.message);
    
    return NextResponse.json({
      success: true,
      data: result,
    } satisfies ApiResponse<typeof result>);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'CHAT_ERROR',
        message: error instanceof Error ? error.message : '알 수 없는 에러',
      },
    } satisfies ApiResponse<never>, { status: 500 });
  }
}
```

### 5. 유틸리티 타입

```typescript
// 부분 타입
type PartialUser = Partial<User>;

// 필수 타입
type RequiredSettings = Required<UserSettings>;

// 선택 타입
type UserEmail = Pick<User, 'email'>;

// 제외 타입
type UserWithoutPassword = Omit<User, 'password'>;

// 레코드 타입
type LLMModels = Record<LLMProvider, string[]>;

// 조건부 타입
type IsString<T> = T extends string ? true : false;
```

### 6. 타입 가드

```typescript
// 타입 가드 함수
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// 사용
try {
  // ...
} catch (error) {
  if (isError(error)) {
    console.error(error.message); // 타입 안전
  }
}

// Zod 타입 가드
function isChatMessage(data: unknown): data is ChatMessageInput {
  return chatMessageSchema.safeParse(data).success;
}
```

### 7. 비동기 타입

```typescript
// Promise 타입
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// Async 함수 타입
type AsyncFunction<T> = () => Promise<T>;

const loadData: AsyncFunction<User[]> = async () => {
  const response = await fetch('/api/users');
  return response.json();
};
```

### 8. 이벤트 핸들러 타입

```typescript
// Form 이벤트
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};

// Input 이벤트
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Click 이벤트
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(e.currentTarget);
};

// 제네릭 이벤트 핸들러
type EventHandler<T = HTMLElement> = (e: React.MouseEvent<T>) => void;
```

## 고급 패턴

### 1. 타입 추론 활용

```typescript
// 함수 반환 타입 추론
function createUser(email: string, name: string) {
  return {
    id: crypto.randomUUID(),
    email,
    name,
    createdAt: new Date(),
  };
}

// 타입 추출
type CreatedUser = ReturnType<typeof createUser>;
```

### 2. 조건부 타입

```typescript
type ApiResult<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 사용
async function fetchData(): Promise<ApiResult<User[]>> {
  try {
    const data = await fetch('/api/users').then(r => r.json());
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
```

### 3. 템플릿 리터럴 타입

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/api/${string}`;
type ApiRoute = `${HttpMethod} ${ApiEndpoint}`;

// 사용
const route: ApiRoute = 'POST /api/users'; // OK
const invalid: ApiRoute = 'INVALID /api/users'; // 에러
```

### 4. 매핑 타입

```typescript
type LLMConfig = {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
};

// 모든 필드를 readonly로
type ReadonlyLLMConfig = Readonly<LLMConfig>;

// 모든 필드를 optional로
type PartialLLMConfig = Partial<LLMConfig>;

// 커스텀 매핑
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};
```

## 모범 사례

### 1. any 사용 금지

```typescript
// ❌ 나쁜 예
function process(data: any) {
  return data.value; // 타입 체크 없음
}

// ✅ 좋은 예
function process<T extends { value: string }>(data: T) {
  return data.value; // 타입 안전
}

// ✅ unknown 사용
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: string }).value;
  }
  throw new Error('Invalid data');
}
```

### 2. 타입 단언 최소화

```typescript
// ❌ 나쁜 예
const user = data as User; // 위험

// ✅ 좋은 예
const user = userSchema.parse(data); // Zod 검증
```

### 3. 명확한 타입 정의

```typescript
// ❌ 불명확
type Config = {
  settings: any;
};

// ✅ 명확
type Config = {
  settings: {
    theme: 'light' | 'dark';
    language: 'ko' | 'en';
    notifications: boolean;
  };
};
```

## 디버깅 팁

### 1. 타입 체크

```bash
# 타입 체크만 실행
npm run lint

# 또는
tsc --noEmit
```

### 2. 타입 확인

```typescript
// 타입 확인용 유틸리티
type Expect<T extends true> = T;
type Equal<X, Y> = X extends Y ? (Y extends X ? true : false) : false;

// 테스트
type Test = Expect<Equal<User['email'], string>>;
```

### 3. 에러 메시지 개선

```typescript
// 커스텀 에러 메시지
type ValidEmail<T extends string> = T extends `${string}@${string}.${string}`
  ? T
  : never;

const email: ValidEmail<'test@example.com'> = 'test@example.com'; // OK
const invalid: ValidEmail<'invalid'> = 'invalid'; // 명확한 에러
```

## 참고 자료

- [TypeScript 공식 문서](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)
