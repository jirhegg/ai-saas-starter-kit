# AI/LLM 통합 (OpenAI, Google Gemini, Claude, Ollama, LM Studio)

## 왜 다중 LLM을 지원하는가?

### 1. 유연성
- 사용자가 선호하는 LLM 선택
- 비용 최적화
- 벤더 종속성 회피

### 2. 로컬 LLM 지원
- API 키 불필요 (Ollama, LM Studio)
- 데이터 프라이버시
- 오프라인 사용 가능

### 3. 성능 최적화
- 작업별 최적 모델 선택
- 폴백 메커니즘
- 로드 밸런싱

## 어떻게 적용되었는가?

### 1. 통합 인터페이스

```typescript
// lib/llm.ts
export type LLMProvider = 'openai' | 'google' | 'claude' | 'ollama' | 'lmstudio';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateChatCompletion(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  switch (config.provider) {
    case 'openai':
      return await generateOpenAI(messages, config);
    case 'google':
      return await generateGoogle(messages, config);
    case 'claude':
      return await generateClaude(messages, config);
    case 'ollama':
      return await generateOllama(messages, config);
    case 'lmstudio':
      return await generateLMStudio(messages, config);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
```

### 2. OpenAI 통합

```typescript
import OpenAI from 'openai';

async function generateOpenAI(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  const openai = new OpenAI({
    apiKey: config.apiKey || process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: config.model || 'gpt-4-turbo-preview',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
  });

  return {
    content: completion.choices[0].message.content || '',
    tokens: completion.usage?.total_tokens || 0,
  };
}
```

**지원 모델:**
- GPT-4 Turbo
- GPT-4
- GPT-3.5 Turbo

**특징:**
- 높은 품질
- 빠른 응답
- 함수 호출 지원

### 3. Google Gemini 통합

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

async function generateGoogle(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  const genAI = new GoogleGenerativeAI(
    config.apiKey || process.env.GOOGLE_API_KEY || ''
  );
  const model = genAI.getGenerativeModel({
    model: config.model || 'gemini-pro'
  });

  // System 메시지 처리
  const systemMessage = messages.find((m) => m.role === 'system');
  const userMessages = messages.filter((m) => m.role !== 'system');

  const chat = model.startChat({
    history: userMessages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  });

  const lastMessage = userMessages[userMessages.length - 1];
  const prompt = systemMessage
    ? `${systemMessage.content}\n\n${lastMessage.content}`
    : lastMessage.content;

  const result = await chat.sendMessage(prompt);
  const response = result.response;

  return {
    content: response.text(),
    tokens: 0, // Gemini doesn't provide token count
  };
}
```

**지원 모델:**
- Gemini Pro
- Gemini Pro Vision

**특징:**
- 무료 티어 제공
- 멀티모달 지원
- 긴 컨텍스트 (32K 토큰)

### 4. Claude 통합

```typescript
import Anthropic from '@anthropic-ai/sdk';

async function generateClaude(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  const anthropic = new Anthropic({
    apiKey: config.apiKey || process.env.CLAUDE_API_KEY,
  });

  // System 메시지 분리
  const systemMessage = messages.find((m) => m.role === 'system');
  const otherMessages = messages.filter((m) => m.role !== 'system');

  const response = await anthropic.messages.create({
    model: config.model || 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    system: systemMessage?.content,
    messages: otherMessages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  });

  const content = response.content[0];
  return {
    content: content.type === 'text' ? content.text : '',
    tokens: response.usage.input_tokens + response.usage.output_tokens,
  };
}
```

**지원 모델:**
- Claude 3.5 Sonnet
- Claude 3 Opus
- Claude 3 Sonnet

**특징:**
- 긴 컨텍스트 (200K 토큰)
- 높은 정확도
- 안전성 중시

### 5. Ollama 통합 (로컬)

```typescript
async function generateOllama(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  const baseUrl = config.baseUrl || 'http://localhost:11434';

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model || 'llama2',
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.message.content,
    tokens: data.eval_count || 0,
  };
}
```

**지원 모델:**
- Llama 2
- Mistral
- Code Llama
- 기타 Ollama 모델

**설치:**
```bash
# macOS
brew install ollama

# 모델 다운로드
ollama pull llama2

# 서버 시작
ollama serve
```

**특징:**
- 완전 무료
- 로컬 실행
- API 키 불필요
- 데이터 프라이버시

### 6. LM Studio 통합 (로컬)

```typescript
async function generateLMStudio(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  const baseUrl = config.baseUrl || 'http://localhost:1234';

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model || 'kimi-k2-thinking',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`LM Studio API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    tokens: data.usage?.total_tokens || 0,
  };
}
```

**지원 모델:**
- Kimi K2 Thinking
- 기타 LM Studio 호환 모델

**설치:**
1. [LM Studio](https://lmstudio.ai/) 다운로드
2. 모델 다운로드
3. 로컬 서버 시작 (포트: 1234)

**특징:**
- GUI 제공
- 모델 관리 쉬움
- OpenAI API 호환
- 무료

## 사용자 설정 관리

### 1. 데이터베이스 스키마

```typescript
// drizzle/schema.ts
export const user_settings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull().unique(),
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
```

### 2. 설정 API

```typescript
// app/api/settings/route.ts
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let [settings] = await db
    .select()
    .from(user_settings)
    .where(eq(user_settings.user_id, user.id));

  if (!settings) {
    // 기본 설정 생성
    [settings] = await db
      .insert(user_settings)
      .values({
        user_id: user.id,
        llm_provider: 'lmstudio',
        llm_model: 'kimi-k2-thinking',
      })
      .returning();
  }

  return NextResponse.json({ success: true, data: settings });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  
  const [updatedSettings] = await db
    .update(user_settings)
    .set({
      ...body,
      updated_at: new Date(),
    })
    .where(eq(user_settings.user_id, user.id))
    .returning();

  return NextResponse.json({ success: true, data: updatedSettings });
}
```

### 3. 설정 UI

```typescript
// app/(dashboard)/dashboard/settings/page.tsx
'use client';

export default function SettingsPage() {
  const [provider, setProvider] = useState('lmstudio');
  const [model, setModel] = useState('kimi-k2-thinking');
  
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/settings');
      return res.json();
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.json();
    },
  });

  return (
    <div>
      <select value={provider} onChange={(e) => setProvider(e.target.value)}>
        <option value="lmstudio">LM Studio (로컬)</option>
        <option value="ollama">Ollama (로컬)</option>
        <option value="openai">OpenAI</option>
        <option value="google">Google Gemini</option>
        <option value="claude">Claude</option>
      </select>
      
      {/* API 키 입력 (클라우드 LLM) */}
      {provider === 'openai' && (
        <input
          type="password"
          placeholder="OpenAI API Key"
          value={openaiKey}
          onChange={(e) => setOpenaiKey(e.target.value)}
        />
      )}
      
      {/* Base URL 입력 (로컬 LLM) */}
      {provider === 'lmstudio' && (
        <input
          type="text"
          placeholder="http://localhost:1234"
          value={lmstudioUrl}
          onChange={(e) => setLmstudioUrl(e.target.value)}
        />
      )}
      
      <button onClick={() => saveMutation.mutate({...})}>
        저장
      </button>
    </div>
  );
}
```

## AI 채팅 구현

### 1. 채팅 API

```typescript
// app/api/ai/chat/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const validatedData = chatMessageSchema.parse(body);
  
  // 사용자 설정 로드
  const [settings] = await db
    .select()
    .from(user_settings)
    .where(eq(user_settings.user_id, user.id));
  
  // 사용자 메시지 저장
  await db.insert(chat_history).values({
    user_id: user.id,
    role: 'user',
    content: validatedData.message,
  });
  
  // LLM 호출
  const result = await generateChatCompletion(
    [
      {
        role: 'system',
        content: '당신은 문서 내용을 분석하고 질문에 답변하는 AI 어시스턴트입니다.',
      },
      {
        role: 'user',
        content: validatedData.message,
      },
    ],
    {
      provider: settings.llm_provider as LLMProvider,
      model: settings.llm_model,
      apiKey: settings[`${settings.llm_provider}_api_key`] ?? undefined,
      baseUrl: settings[`${settings.llm_provider}_base_url`] ?? undefined,
    }
  );
  
  // AI 응답 저장
  await db.insert(chat_history).values({
    user_id: user.id,
    role: 'assistant',
    content: result.content,
    tokens_used: result.tokens,
  });
  
  // API 사용량 기록
  await db.insert(api_usage).values({
    user_id: user.id,
    endpoint: '/api/ai/chat',
    tokens_used: result.tokens,
    cost: Math.ceil(result.tokens * 0.002),
    status: 'success',
  });
  
  return NextResponse.json({
    success: true,
    data: {
      message: result.content,
      tokens_used: result.tokens,
    },
  });
}
```

### 2. 채팅 UI

```typescript
// app/(dashboard)/dashboard/chat/page.tsx
'use client';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.data.message },
      ]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    chatMutation.mutate(input);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            disabled={chatMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
```

## 비용 최적화

### 1. 토큰 사용량 추적

```typescript
// 토큰 사용량 기록
await db.insert(api_usage).values({
  user_id: user.id,
  endpoint: '/api/ai/chat',
  tokens_used: result.tokens,
  cost: calculateCost(settings.llm_provider, result.tokens),
  status: 'success',
});

function calculateCost(provider: LLMProvider, tokens: number): number {
  const rates = {
    openai: 0.002, // $0.002 per 1K tokens
    google: 0.0005,
    claude: 0.003,
    ollama: 0, // 무료
    lmstudio: 0, // 무료
  };
  
  return Math.ceil(tokens * rates[provider]);
}
```

### 2. 캐싱

```typescript
// 동일한 질문에 대한 캐싱
const cachedResponse = await redis.get(`chat:${hash(message)}`);
if (cachedResponse) {
  return JSON.parse(cachedResponse);
}

const result = await generateChatCompletion(...);
await redis.set(`chat:${hash(message)}`, JSON.stringify(result), 'EX', 3600);
```

## 참고 자료

- [OpenAI API 문서](https://platform.openai.com/docs)
- [Google Gemini 문서](https://ai.google.dev/docs)
- [Claude API 문서](https://docs.anthropic.com/)
- [Ollama 문서](https://ollama.ai/docs)
- [LM Studio](https://lmstudio.ai/)
