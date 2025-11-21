---
include: always
---

# 성능 최적화 기준

## Core Web Vitals 목표
- LCP (Largest Contentful Paint): < 2.5초
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

## Next.js 최적화
- 이미지는 `next/image` 사용 (자동 최적화)
- 폰트는 `next/font` 사용 (자동 최적화)
- 동적 import로 코드 스플리팅
- Server Components 우선 사용

## 데이터 페칭
- TanStack Query로 캐싱 및 재검증
- Suspense 경계로 로딩 상태 관리
- Prefetch로 사용자 경험 개선
- Debounce/Throttle로 불필요한 요청 방지

## 데이터베이스
- 인덱스 적절히 설정
- N+1 쿼리 방지
- 페이지네이션 필수
- 무거운 쿼리는 백그라운드 작업으로 처리

## 번들 크기
- 번들 분석기로 정기 점검 (`@next/bundle-analyzer`)
- 사용하지 않는 의존성 제거
- Tree-shaking 활용
- 목표: First Load JS < 200KB

## 캐싱 전략
- Static Generation 우선 사용
- ISR (Incremental Static Regeneration) 활용
- CDN 캐싱 (Vercel Edge Network)
- Redis/Upstash로 API 응답 캐싱 (필요시)
