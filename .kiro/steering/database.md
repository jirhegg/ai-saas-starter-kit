---
inclusion: fileMatch
fileMatchPattern: "drizzle/**/*"
---

# 데이터베이스 가이드라인

## Drizzle ORM 규칙
- 스키마는 `drizzle/schema.ts`에 정의
- 마이그레이션은 `drizzle/migrations/` 폴더
- 타입 안전성 최우선

## 스키마 설계
- 테이블명은 snake_case
- Primary Key는 `id` (UUID 또는 serial)
- 타임스탬프: `created_at`, `updated_at` 필수
- Soft delete: `deleted_at` 컬럼 사용

## 관계 설정
- Foreign Key 제약 조건 명시
- Cascade 옵션 신중하게 설정
- Many-to-Many는 중간 테이블 생성

## 마이그레이션
```bash
# 마이그레이션 생성
npm run db:generate

# 마이그레이션 적용
npm run db:migrate

# 스키마 푸시 (개발용)
npm run db:push
```

## 벡터 검색 (RAG)
- pgvector 확장 사용
- 임베딩 컬럼: `vector(1536)` (OpenAI ada-002)
- 인덱스: HNSW 또는 IVFFlat
- 유사도 검색: cosine similarity

## 쿼리 최적화
- Select는 필요한 컬럼만 지정
- Join은 최소화
- Where 조건에 인덱스 활용
- Explain Analyze로 쿼리 플랜 확인
