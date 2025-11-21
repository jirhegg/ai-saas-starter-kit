import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { chat_sessions } from '@/drizzle/schema';
import { NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// 세션 수정 (제목 변경)
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const body = await request.json();

    const [session] = await db
      .update(chat_sessions)
      .set({
        title: body.title,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(chat_sessions.id, id),
          eq(chat_sessions.user_id, user.id)
        )
      )
      .returning();

    if (!session) {
      return NextResponse.json({ error: '세션을 찾을 수 없습니다' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('[ERROR] Update Session - Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_SESSION_ERROR',
          message: '세션 수정에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}

// 세션 삭제 (soft delete)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    await db
      .update(chat_sessions)
      .set({
        deleted_at: new Date(),
      })
      .where(
        and(
          eq(chat_sessions.id, id),
          eq(chat_sessions.user_id, user.id)
        )
      );

    return NextResponse.json({
      success: true,
      message: '세션이 삭제되었습니다',
    });
  } catch (error) {
    console.error('[ERROR] Delete Session - Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_SESSION_ERROR',
          message: '세션 삭제에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
