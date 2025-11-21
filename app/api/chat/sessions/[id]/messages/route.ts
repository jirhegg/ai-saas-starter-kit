import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { chat_history, chat_sessions } from '@/drizzle/schema';
import { NextResponse } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 세션의 메시지 조회
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    // 세션 소유권 확인
    const [session] = await db
      .select()
      .from(chat_sessions)
      .where(
        and(
          eq(chat_sessions.id, id),
          eq(chat_sessions.user_id, user.id)
        )
      );

    if (!session) {
      return NextResponse.json({ error: '세션을 찾을 수 없습니다' }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(chat_history)
      .where(eq(chat_history.session_id, id))
      .orderBy(asc(chat_history.created_at));

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('[ERROR] Get Messages - Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_MESSAGES_ERROR',
          message: '메시지를 불러오는데 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
