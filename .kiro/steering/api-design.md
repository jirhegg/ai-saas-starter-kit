---
include: always
---

# API 설계 원칙

## RESTful 규칙
- GET: 조회
- POST: 생성
- PUT/PATCH: 수정
- DELETE: 삭제

## 응답 형식
```typescript
// 성공
{ success: true, data: T }

// 에러
{ success: false, error: { code: string, message: string } }
```

## 상태 코드
- 200: 성공
- 201: 생성 성공
- 400: 잘못된 요청
- 401: 인증 필요
- 403: 권한 없음
- 404: 리소스 없음
- 500: 서버 에러

## 네이밍 컨벤션
- URL은 kebab-case: `/api/user-profile`
- 복수형 사용: `/api/products`
- 버전 관리: `/api/v1/...` (필요시)

## 페이지네이션
```typescript
{
  data: T[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    hasNext: boolean
  }
}
```

## 에러 핸들링
- 모든 에러는 try/catch로 처리
- 사용자 친화적인 에러 메시지
- 개발 환경에서만 상세 스택 트레이스 노출
