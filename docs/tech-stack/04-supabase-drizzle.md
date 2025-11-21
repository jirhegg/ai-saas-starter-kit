# Supabase + Drizzle ORM

## 왜 선택했는가?

### Supabase
1. **올인원 백엔드**
   - PostgreSQL 데이터베이스
   - 인증 시스템
   - 실시간 구독
   - 스토리지
   - Edge Functions

2. **개발자 친화적**
   - 무료 티어 제공
   - 로컬 개발 환경 (Docker)
   - 자동 API 생성
   - 대시보드 UI

3. **확장성**
   - pgvector 지원 (AI/RAG)
   - Row Level Security (RLS)
   - 자동 백업
   - 글로벌 CDN

### Drizzle ORM
1. **타입 안전성**
   - TypeScript 우선 설계
   - 자동 타입 추론
   - SQL과 유사한 API

2. **성능**
   - 제로 런타임 오버헤드
   - 최적화된 쿼리
   - 트리 쉐이킹 지원

3. **개발자 경험**
   - 직관적인 API
   - 마이그레이션 자동 생성
   - Drizzle Studio (GUI)

## 어떻게 적용되었는가?

### 1. 데이터베이스 스키마

```typescript
// drizzle/schema.ts
import { pgTable, uuid, text, timestamp, integer, vector } from 'drizzle-orm/pg-core';

// Users 테이블
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

// User Settings 테이블
export const user_settings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  llm_provider: text('llm_provider').notNull().default('lmstudio'),
  llm_model: text('llm_model').notNull().default('kimi-k2-thinking'),
  openai_api_key: text('openai_api_key'),
  google_api_key: text('google_api_key'),
  claude_api_key: text('claude_api_key'),
  ollama_base_url: text('ollama_base_url').default('http://localhost:11434'),
  lmstudio_base_url: text('lmstudio_base_url').default('http://localhost:1234'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Documents 테이블
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: text('status').notNull().default('processing'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('documents_user_id_idx').on(table.user_id),
  statusIdx: index('documents_status_idx').on(table.status),
}));

// Embeddings 테이블 (벡터 검색)
export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  document_id: uuid('document_id')
    .references(() => documents.id, { onDelete: 'cascade' })
    .notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }), // OpenAI ada-002
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  documentIdIdx: index('embeddings_document_id_idx').on(table.document_id),
  embeddingIdx: index('embeddings_embedding_idx')
    .using('hnsw', table.embedding.op('vector_cosine_ops')),
}));
```

**주요 특징:**
- UUID 기본 키
- 외래 키 제약 조건 (cascade)
- 타임스탬프 자동 생성
- Soft delete (deleted_at)
- 인덱스 최적화
- pgvector 지원

### 2. 데이터베이스 클라이언트

```typescript
// lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/drizzle/schema';

const connectionString = process.env.DATABASE_URL!;

// PostgreSQL 클라이언트
const client = postgres(connectionString);

// Drizzle 인스턴스
export const db = drizzle(client, { schema });
```

### 3. CRUD 작업

#### Create
```typescript
// app/api/documents/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  
  const [document] = await db
    .insert(documents)
    .values({
      user_id: user.id,
      title: body.title,
      content: body.content,
      status: 'completed',
    })
    .returning();
  
  return NextResponse.json({ success: true, data: document });
}
```

#### Read
```typescript
// 단일 조회
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId));

// 다중 조회
const userDocuments = await db
  .select()
  .from(documents)
  .where(
    and(
      eq(documents.user_id, userId),
      isNull(documents.deleted_at)
    )
  )
  .orderBy(desc(documents.created_at));

// 조인
const documentsWithEmbeddings = await db
  .select({
    document: documents,
    embedding: embeddings,
  })
  .from(documents)
  .leftJoin(embeddings, eq(documents.id, embeddings.document_id))
  .where(eq(documents.user_id, userId));
```

#### Update
```typescript
const [updatedSettings] = await db
  .update(user_settings)
  .set({
    llm_provider: 'openai',
    llm_model: 'gpt-4',
    updated_at: new Date(),
  })
  .where(eq(user_settings.user_id, userId))
  .returning();
```

#### Delete (Soft Delete)
```typescript
const [deletedDocument] = await db
  .update(documents)
  .set({ deleted_at: new Date() })
  .where(
    and(
      eq(documents.id, documentId),
      eq(documents.user_id, userId)
    )
  )
  .returning();
```

### 4. 복잡한 쿼리

#### 집계 함수
```typescript
import { count, sum, sql } from 'drizzle-orm';

// 문서 개수
const [{ count: docCount }] = await db
  .select({ count: count() })
  .from(documents)
  .where(eq(documents.user_id, userId));

// 토큰 합계
const [{ total }] = await db
  .select({ total: sum(chat_history.tokens_used) })
  .from(chat_history)
  .where(eq(chat_history.user_id, userId));

// 날짜 필터링
const startOfMonth = new Date();
startOfMonth.setDate(1);
startOfMonth.setHours(0, 0, 0, 0);

const [{ count: monthlyCount }] = await db
  .select({ count: count() })
  .from(api_usage)
  .where(
    sql`${api_usage.user_id} = ${userId} AND ${api_usage.created_at} >= ${startOfMonth.toISOString()}`
  );
```

#### 벡터 검색 (RAG)
```typescript
// 유사도 검색
const similarDocuments = await db
  .select({
    document: documents,
    embedding: embeddings,
    similarity: sql<number>`1 - (${embeddings.embedding} <=> ${queryEmbedding})`,
  })
  .from(embeddings)
  .innerJoin(documents, eq(embeddings.document_id, documents.id))
  .where(eq(documents.user_id, userId))
  .orderBy(sql`${embeddings.embedding} <=> ${queryEmbedding}`)
  .limit(5);
```

### 5. 트랜잭션

```typescript
await db.transaction(async (tx) => {
  // 1. 문서 생성
  const [document] = await tx
    .insert(documents)
    .values({
      user_id: userId,
      title: 'New Document',
      content: 'Content...',
    })
    .returning();
  
  // 2. 임베딩 생성
  const embedding = await generateEmbedding(document.content);
  
  await tx.insert(embeddings).values({
    document_id: document.id,
    content: document.content,
    embedding: embedding,
  });
  
  // 3. API 사용량 기록
  await tx.insert(api_usage).values({
    user_id: userId,
    endpoint: '/api/documents',
    status: 'success',
  });
});
```

### 6. 마이그레이션

```bash
# 마이그레이션 생성
npm run db:generate

# 마이그레이션 적용
npm run db:migrate

# 스키마 푸시 (개발용)
npm run db:push

# Drizzle Studio 실행
npm run db:studio
```

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Supabase 인증 통합

### 1. 사용자 동기화

```typescript
// lib/auth-helpers.ts
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@supabase/supabase-js';

export async function ensureUserExists(authUser: User): Promise<void> {
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id));

  if (!existingUser) {
    await db.insert(users).values({
      id: authUser.id,
      email: authUser.email!,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
      avatar_url: authUser.user_metadata?.avatar_url,
    });
  }
}
```

### 2. API에서 사용

```typescript
// app/api/documents/route.ts
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: '인증 필요' }, { status: 401 });
  }
  
  // Supabase Auth와 DB 동기화
  await ensureUserExists(user);
  
  // 데이터 조회
  const documents = await db
    .select()
    .from(documents)
    .where(eq(documents.user_id, user.id));
  
  return NextResponse.json({ success: true, data: documents });
}
```

## 성능 최적화

### 1. 인덱스 전략

```typescript
// 자주 조회되는 컬럼에 인덱스
export const documents = pgTable('documents', {
  // ...
}, (table) => ({
  userIdIdx: index('documents_user_id_idx').on(table.user_id),
  statusIdx: index('documents_status_idx').on(table.status),
  createdAtIdx: index('documents_created_at_idx').on(table.created_at),
}));
```

### 2. 선택적 필드 조회

```typescript
// ❌ 모든 필드 조회
const users = await db.select().from(users);

// ✅ 필요한 필드만 조회
const users = await db
  .select({
    id: users.id,
    email: users.email,
    name: users.name,
  })
  .from(users);
```

### 3. 페이지네이션

```typescript
const page = 1;
const limit = 20;
const offset = (page - 1) * limit;

const documents = await db
  .select()
  .from(documents)
  .where(eq(documents.user_id, userId))
  .limit(limit)
  .offset(offset);
```

### 4. 연결 풀링

```typescript
// lib/db.ts
const client = postgres(connectionString, {
  max: 10, // 최대 연결 수
  idle_timeout: 20, // 유휴 타임아웃 (초)
  connect_timeout: 10, // 연결 타임아웃 (초)
});
```

## 보안

### 1. Row Level Security (RLS)

```sql
-- Supabase에서 RLS 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 정책 생성
CREATE POLICY "Users can only see their own documents"
ON documents
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own documents"
ON documents
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 2. SQL Injection 방지

```typescript
// ✅ Drizzle ORM 사용 (자동 이스케이프)
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, userInput));

// ❌ Raw SQL (위험)
const user = await db.execute(
  sql`SELECT * FROM users WHERE email = '${userInput}'`
);
```

### 3. 입력 검증

```typescript
import { z } from 'zod';

const documentSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(100000),
});

// 검증 후 사용
const validatedData = documentSchema.parse(body);
```

## 모범 사례

### 1. 타입 추론 활용

```typescript
// 타입 자동 추론
const [user] = await db
  .select()
  .from(users)
  .where(eq(users.id, userId));

// user의 타입이 자동으로 User | undefined
```

### 2. 에러 처리

```typescript
try {
  const [document] = await db
    .insert(documents)
    .values(data)
    .returning();
} catch (error) {
  if (error instanceof Error) {
    console.error('[DB ERROR]', error.message);
  }
  throw error;
}
```

### 3. 트랜잭션 사용

```typescript
// 여러 작업을 원자적으로 실행
await db.transaction(async (tx) => {
  await tx.insert(documents).values(doc);
  await tx.insert(embeddings).values(emb);
});
```

## 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Drizzle ORM 문서](https://orm.drizzle.team/docs/overview)
- [pgvector 문서](https://github.com/pgvector/pgvector)
