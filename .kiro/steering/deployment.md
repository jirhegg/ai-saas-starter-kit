---
include: always
---

# 배포 프로세스

## 환경 구성
- **Development**: 로컬 개발 환경
- **Staging**: Vercel Preview 브랜치
- **Production**: Vercel 메인 배포

## 환경 변수
- `.env.local` - 로컬 개발용 (git 제외)
- `.env.example` - 필수 환경 변수 템플릿 (git 포함)
- Vercel 대시보드에서 프로덕션 환경 변수 관리

## 배포 체크리스트
1. 모든 테스트 통과 확인
2. 타입 체크 (`tsc --noEmit`)
3. 린트 검사 (`npm run lint`)
4. 빌드 성공 확인 (`npm run build`)
5. 환경 변수 검증
6. DB 마이그레이션 실행 (필요시)

## CI/CD
- GitHub Actions로 자동 테스트 및 배포
- PR 생성 시 자동 Preview 배포
- main 브랜치 머지 시 프로덕션 자동 배포
