---
include: always
---

# Git 워크플로우

## 브랜치 전략
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치
- `fix/*`: 버그 수정 브랜치
- `hotfix/*`: 긴급 수정 브랜치

## 커밋 메시지 규칙
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

### 예시
```
feat(auth): 소셜 로그인 기능 추가

Google, GitHub OAuth 연동 구현
- Supabase Auth 설정
- 로그인 UI 컴포넌트 추가

Closes #123
```

## PR (Pull Request) 규칙
- 제목은 커밋 메시지 규칙 따름
- 변경 사항 상세히 설명
- 스크린샷 첨부 (UI 변경 시)
- 리뷰어 최소 1명 지정
- CI 통과 후 머지

## 코드 리뷰
- 24시간 내 리뷰 완료 목표
- 건설적인 피드백
- 코드 스타일보다 로직에 집중
- Approve 후 머지
