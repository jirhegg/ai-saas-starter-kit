import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
}

export async function generateChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  stream = false
) {
  return await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    stream,
    temperature: 0.7,
    max_tokens: 1000,
  });
}
