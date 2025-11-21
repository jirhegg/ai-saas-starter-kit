---
inclusion: always
---

# Next.js 버전 고정

## 버전 정책
- **Next.js 16.x 고정**: 프로젝트는 Next.js 16 버전을 사용합니다
- **React 19.x 고정**: Next.js 16과 함께 React 19를 사용합니다
- 버전 변경 시 사용자 명시적 승인 필요

## 주요 변경사항 (Next.js 16)
- **Turbopack**: 기본 번들러로 Turbopack 사용
- **Proxy**: middleware.ts → proxy.ts로 변경
- **ESLint 9**: Flat Config 사용
- **React 19**: 새로운 React 기능 지원

## 문제 해결 원칙
1. **로그 우선**: 문제 발생 시 먼저 로그 확인
2. **추가 로깅**: 예상 지점에 console.log 추가하여 분석
3. **단계적 접근**: 한 번에 하나씩 문제 해결
4. **버전 고정**: 임의로 버전 변경 금지

## 디버깅 가이드
```typescript
// API route 디버깅 예시
export async function POST(request: Request) {
  console.log('[DEBUG] Request received:', request.url);
  
  try {
    const body = await request.json();
    console.log('[DEBUG] Request body:', body);
    
    // 로직 실행
    const result = await someFunction(body);
    console.log('[DEBUG] Result:', result);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[ERROR] Failed:', error);
    console.error('[ERROR] Stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

## 빌드 및 테스트
```bash
# 타입 체크
npm run lint

# 프로덕션 빌드
npm run build

# 개발 서버
npm run dev
```
