import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { chat_sessions } from '@/drizzle/schema';
import { NextResponse } from 'next/server';
import { eq, desc, isNull } from 'drizzle-orm';

// 세션 목록 조회
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const sessions = await db
      .select()
      .from(chat_sessions)
      .where(eq(chat_sessions.user_id, user.id))
      .where(isNull(chat_sessions.deleted_at))
      .orderBy(desc(chat_sessions.updated_at));

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error('[ERROR] Get Sessions - Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_SESSIONS_ERROR',
          message: '세션 목록을 불러오는데 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// 새 세션 생성
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();
    const title = body.title || '새 대화';

    const [session] = await db
      .insert(chat_sessions)
      .values({
        user_id: user.id,
        title,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('[ERROR] Create Session - Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_SESSION_ERROR',
          message: '세션 생성에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
