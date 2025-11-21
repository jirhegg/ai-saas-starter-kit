# IDE 설정 가이드

## VS Code (권장)

### 1. 추천 확장 프로그램

```bash
# .vscode/extensions.json.example 파일 참고
```

**필수:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense

**권장:**
- TypeScript and JavaScript Language Features
- Prisma (Drizzle ORM 지원)

### 2. 설정

`.vscode/settings.json.example`을 `.vscode/settings.json`으로 복사:

```bash
cp .vscode/settings.json.example .vscode/settings.json
```

**주요 설정:**
- 저장 시 자동 포맷팅
- ESLint 자동 수정
- Tailwind CSS 자동 완성

### 3. 키보드 단축키

| 기능 | macOS | Windows/Linux |
|------|-------|---------------|
| 파일 검색 | `Cmd+P` | `Ctrl+P` |
| 전체 검색 | `Cmd+Shift+F` | `Ctrl+Shift+F` |
| 명령 팔레트 | `Cmd+Shift+P` | `Ctrl+Shift+P` |
| 터미널 열기 | `Ctrl+\`` | `Ctrl+\`` |
| 포맷팅 | `Shift+Alt+F` | `Shift+Alt+F` |

## WebStorm / IntelliJ IDEA

### 1. 플러그인 설치

- Tailwind CSS
- Prettier
- ESLint

### 2. 설정

Settings > Languages & Frameworks > JavaScript > Prettier:
- ✅ On save
- ✅ On code reformat

Settings > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint:
- ✅ Automatic ESLint configuration

## Cursor / Windsurf

VS Code 기반이므로 VS Code 설정과 동일하게 적용됩니다.

## 공통 설정

### 1. EditorConfig

프로젝트 루트의 `.editorconfig` 파일이 자동으로 적용됩니다:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

### 2. Prettier

`.prettierrc` 파일 설정:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 3. ESLint

`.eslintrc.json` 또는 `eslint.config.mjs` 파일이 자동으로 적용됩니다.

## 문제 해결

### TypeScript 에러

```bash
# TypeScript 서버 재시작
Cmd+Shift+P > TypeScript: Restart TS Server
```

### ESLint 작동 안 함

```bash
# ESLint 서버 재시작
Cmd+Shift+P > ESLint: Restart ESLint Server
```

### Tailwind CSS 자동 완성 안 됨

```bash
# Tailwind CSS 서버 재시작
Cmd+Shift+P > Tailwind CSS: Restart Tailwind CSS Language Server
```

## 참고 자료

- [VS Code 공식 문서](https://code.visualstudio.com/docs)
- [WebStorm 가이드](https://www.jetbrains.com/help/webstorm/)
