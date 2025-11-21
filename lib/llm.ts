import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

async function generateGoogle(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  const genAI = new GoogleGenerativeAI(
    config.apiKey || process.env.GOOGLE_API_KEY || ''
  );
  const model = genAI.getGenerativeModel({ model: config.model || 'gemini-pro' });

  // Google Gemini는 system 메시지를 별도로 처리
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
  const response = await result.response;

  return {
    content: response.text(),
    tokens: 0, // Google doesn't provide token count in the same way
  };
}

async function generateClaude(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<{ content: string; tokens: number }> {
  const anthropic = new Anthropic({
    apiKey: config.apiKey || process.env.CLAUDE_API_KEY,
  });

  // Claude는 system 메시지를 별도 파라미터로 받음
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

export const LLM_MODELS = {
  openai: [
    { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  google: [
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  ],
  claude: [
    { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
  ],
  ollama: [
    { value: 'llama2', label: 'Llama 2' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'codellama', label: 'Code Llama' },
  ],
  lmstudio: [
    { value: 'kimi-k2-thinking', label: 'Kimi K2 Thinking' },
    { value: 'local-model', label: 'Local Model' },
  ],
};
