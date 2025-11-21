import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { chat_history, api_usage, user_settings, chat_sessions } from '@/drizzle/schema';
import { chatMessageSchema } from '@/lib/validators';
import { generateChatCompletion } from '@/lib/llm';
import { ensureUserExists } from '@/lib/auth-helpers';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    console.log('[DEBUG] AI Chat - Request received');
    
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log('[DEBUG] AI Chat - No user authenticated');
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    console.log('[DEBUG] AI Chat - User ID:', user.id);
    console.log('[DEBUG] AI Chat - User email:', user.email);

    // users 테이블에 사용자가 없으면 생성
    await ensureUserExists(user);

    const body = await request.json();
    console.log('[DEBUG] AI Chat - Request body:', body);
    
    const validatedData = chatMessageSchema.parse(body);
    const sessionId = body.session_id;

    let [settings] = await db
      .select()
      .from(user_settings)
      .where(eq(user_settings.user_id, user.id));

    if (!settings) {
      console.log('[DEBUG] AI Chat - Creating user settings');
      [settings] = await db
        .insert(user_settings)
        .values({
          user_id: user.id,
          llm_provider: 'lmstudio',
          llm_model: 'kimi-k2-thinking',
        })
        .returning();
      console.log('[DEBUG] AI Chat - Settings created:', settings);
    }

    console.log('[DEBUG] AI Chat - Inserting user message to chat_history');
    await db.insert(chat_history).values({
      session_id: sessionId,
      user_id: user.id,
      document_id: validatedData.document_id,
      role: 'user',
      content: validatedData.message,
    });

    console.log('[DEBUG] AI Chat - Generating completion with provider:', settings.llm_provider);
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
        provider: settings.llm_provider as any,
        model: settings.llm_model,
        apiKey:
          settings.llm_provider === 'openai'
            ? settings.openai_api_key ?? undefined
            : settings.llm_provider === 'google'
            ? settings.google_api_key ?? undefined
            : settings.llm_provider === 'claude'
            ? settings.claude_api_key ?? undefined
            : undefined,
        baseUrl:
          settings.llm_provider === 'ollama'
            ? settings.ollama_base_url ?? undefined
            : settings.llm_provider === 'lmstudio'
            ? settings.lmstudio_base_url ?? undefined
            : undefined,
      }
    );

    console.log('[DEBUG] AI Chat - Completion result:', { contentLength: result.content.length, tokens: result.tokens });
    
    await db.insert(chat_history).values({
      session_id: sessionId,
      user_id: user.id,
      document_id: validatedData.document_id,
      role: 'assistant',
      content: result.content,
      tokens_used: result.tokens,
    });

    // 세션 updated_at 갱신 및 첫 메시지면 제목 자동 생성
    const [session] = await db
      .select()
      .from(chat_sessions)
      .where(eq(chat_sessions.id, sessionId));

    if (session && session.title === '새 대화') {
      // 첫 메시지를 제목으로 사용 (최대 50자)
      const autoTitle = validatedData.message.length > 50 
        ? validatedData.message.substring(0, 50) + '...'
        : validatedData.message;
      
      await db
        .update(chat_sessions)
        .set({ 
          title: autoTitle,
          updated_at: new Date() 
        })
        .where(eq(chat_sessions.id, sessionId));
    } else {
      await db
        .update(chat_sessions)
        .set({ updated_at: new Date() })
        .where(eq(chat_sessions.id, sessionId));
    }

    await db.insert(api_usage).values({
      user_id: user.id,
      endpoint: '/api/ai/chat',
      tokens_used: result.tokens,
      cost: Math.ceil(result.tokens * 0.002),
      status: 'success',
    });

    console.log('[DEBUG] AI Chat - Success');
    return NextResponse.json({
      success: true,
      data: {
        message: result.content,
        tokens_used: result.tokens,
      },
    });
  } catch (error) {
    console.error('[ERROR] AI Chat - Failed:', error);
    console.error('[ERROR] AI Chat - Stack:', error instanceof Error ? error.stack : 'No stack');

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        await db.insert(api_usage).values({
          user_id: user.id,
          endpoint: '/api/ai/chat',
          status: 'error',
          error_message: error instanceof Error ? error.message : '알 수 없는 에러',
        });
      } catch (usageError) {
        console.error('[ERROR] AI Chat - Failed to log api_usage:', usageError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CHAT_ERROR',
          message: error instanceof Error ? error.message : '채팅에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
