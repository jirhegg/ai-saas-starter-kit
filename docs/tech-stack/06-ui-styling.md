# shadcn/ui + Tailwind CSS

## 왜 선택했는가?

### shadcn/ui
1. **복사-붙여넣기 방식**
   - npm 패키지가 아님
   - 코드 완전 소유
   - 커스터마이징 자유로움

2. **고품질 컴포넌트**
   - Radix UI 기반
   - 접근성 (a11y) 완벽 지원
   - 키보드 네비게이션

3. **타입 안전성**
   - TypeScript 우선
   - 자동 완성 지원

### Tailwind CSS
1. **유틸리티 우선**
   - 빠른 개발 속도
   - 일관된 디자인
   - 작은 번들 크기

2. **반응형 디자인**
   - 모바일 우선
   - 브레이크포인트 간편
   - 다크 모드 지원

3. **개발자 경험**
   - IntelliSense 지원
   - 자동 완성
   - 클래스 정렬

## 어떻게 적용되었는가?

### 1. Tailwind CSS 설정

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

### 2. CSS 변수 (다크 모드 지원)

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### 3. 유틸리티 함수

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**사용 예:**
```typescript
<div className={cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-primary text-primary-foreground',
  isDisabled && 'opacity-50 cursor-not-allowed'
)} />
```

### 4. 컴포넌트 예시

#### 버튼 컴포넌트
```typescript
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

**사용:**
```typescript
<Button variant="default">기본 버튼</Button>
<Button variant="destructive">삭제</Button>
<Button variant="outline" size="sm">작은 버튼</Button>
<Button variant="ghost" size="icon">
  <Icon />
</Button>
```

#### 카드 컴포넌트
```typescript
// 대시보드 통계 카드
<div className="bg-card border border-border rounded-lg p-6">
  <div className="flex items-center justify-between mb-4">
    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
      <FileText className="w-5 h-5 text-blue-500" />
    </div>
  </div>
  <p className="text-2xl font-bold mb-1">{documentsCount}</p>
  <p className="text-sm text-muted-foreground">총 문서</p>
</div>
```

### 5. 레이아웃 패턴

#### 대시보드 레이아웃
```typescript
// app/(dashboard)/layout.tsx
<div className="min-h-screen flex">
  {/* 사이드바 */}
  <aside className="w-64 border-r border-border bg-card">
    <div className="p-6">
      <h1 className="text-2xl font-bold">AI SaaS</h1>
    </div>
    <nav className="px-4 space-y-2">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors"
      >
        <BarChart3 className="w-5 h-5" />
        대시보드
      </Link>
    </nav>
  </aside>

  {/* 메인 콘텐츠 */}
  <main className="flex-1 overflow-auto">
    <div className="container mx-auto p-8">
      {children}
    </div>
  </main>
</div>
```

#### 반응형 그리드
```typescript
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {documents.map((doc) => (
    <div key={doc.id} className="bg-card border border-border rounded-lg p-6">
      {/* 카드 내용 */}
    </div>
  ))}
</div>
```

### 6. 애니메이션

#### 로딩 스켈레톤
```typescript
<div className="animate-pulse">
  <div className="h-9 bg-muted rounded w-48 mb-2"></div>
  <div className="h-6 bg-muted rounded w-96"></div>
</div>
```

#### 호버 효과
```typescript
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
  버튼
</button>
```

#### 페이드 인
```typescript
<div className="opacity-0 animate-in fade-in duration-500">
  콘텐츠
</div>
```

### 7. 폼 스타일링

```typescript
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium mb-2">
      제목
    </label>
    <input
      type="text"
      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="문서 제목"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium mb-2">
      내용
    </label>
    <textarea
      rows={10}
      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      placeholder="문서 내용을 입력하세요..."
    />
  </div>
  
  <div className="flex gap-2">
    <button
      type="submit"
      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
    >
      생성
    </button>
    <button
      type="button"
      className="px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
    >
      취소
    </button>
  </div>
</form>
```

### 8. 아이콘 (Lucide React)

```typescript
import { FileText, MessageSquare, Settings, LogOut, Plus, Trash2 } from 'lucide-react';

// 사용
<FileText className="w-5 h-5 text-primary" />
<MessageSquare className="w-6 h-6" />
<Settings className="w-4 h-4" />
```

**특징:**
- 1000+ 아이콘
- 트리 쉐이킹 지원
- 커스터마이징 가능
- 일관된 디자인

## 반응형 디자인

### 1. 브레이크포인트

```typescript
// Tailwind 기본 브레이크포인트
sm: '640px'   // 모바일 가로
md: '768px'   // 태블릿
lg: '1024px'  // 데스크톱
xl: '1280px'  // 큰 데스크톱
2xl: '1536px' // 초대형 화면
```

### 2. 반응형 클래스

```typescript
<div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  gap-4
">
  {/* 모바일: 1열, 태블릿: 2열, 데스크톱: 3열, 큰 화면: 4열 */}
</div>
```

### 3. 모바일 우선

```typescript
// ✅ 모바일 우선 (권장)
<div className="text-sm md:text-base lg:text-lg">
  텍스트
</div>

// ❌ 데스크톱 우선
<div className="text-lg lg:text-base md:text-sm">
  텍스트
</div>
```

## 다크 모드

### 1. 토글 구현

```typescript
'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-accent"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
```

### 2. 다크 모드 클래스

```typescript
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  콘텐츠
</div>
```

## 성능 최적화

### 1. PurgeCSS (자동)
- 사용하지 않는 CSS 제거
- 프로덕션 빌드 시 자동 적용
- 번들 크기 최소화

### 2. JIT 모드
- Just-In-Time 컴파일
- 필요한 클래스만 생성
- 빠른 빌드 속도

### 3. 클래스 병합
```typescript
// cn() 함수로 중복 제거
cn('px-4 py-2', 'px-6') // 결과: 'px-6 py-2'
```

## 접근성 (a11y)

### 1. 키보드 네비게이션
```typescript
<button
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  버튼
</button>
```

### 2. ARIA 속성
```typescript
<button
  aria-label="문서 삭제"
  aria-disabled={isDeleting}
>
  <Trash2 className="w-4 h-4" />
</button>
```

### 3. 색상 대비
- WCAG AA 기준 준수
- 텍스트와 배경 대비 4.5:1 이상

## 모범 사례

### 1. 일관된 간격
```typescript
// ✅ Tailwind 간격 사용
<div className="space-y-4">
  <div className="p-6">...</div>
  <div className="p-6">...</div>
</div>

// ❌ 임의의 값
<div style={{ marginBottom: '17px' }}>...</div>
```

### 2. 재사용 가능한 컴포넌트
```typescript
// ✅ 컴포넌트로 추상화
<Card>
  <CardHeader>제목</CardHeader>
  <CardContent>내용</CardContent>
</Card>

// ❌ 반복되는 클래스
<div className="bg-card border border-border rounded-lg p-6">...</div>
```

### 3. 조건부 스타일링
```typescript
// ✅ cn() 함수 사용
<div className={cn(
  'px-4 py-2',
  isActive && 'bg-primary',
  isDisabled && 'opacity-50'
)} />

// ❌ 문자열 연결
<div className={`px-4 py-2 ${isActive ? 'bg-primary' : ''}`} />
```

## 참고 자료

- [shadcn/ui 공식 문서](https://ui.shadcn.com/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Radix UI 문서](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
