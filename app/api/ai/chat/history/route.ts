import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { chat_history } from '@/drizzle/schema';
import { NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    const history = await db
      .select()
      .from(chat_history)
      .where(eq(chat_history.user_id, user.id))
      .orderBy(desc(chat_history.created_at))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: history.reverse(), // 오래된 것부터 표시
    });
  } catch (error) {
    console.error('[ERROR] Chat History - Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'HISTORY_ERROR',
          message: '히스토리를 불러오는데 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 });
    }

    await db
      .delete(chat_history)
      .where(eq(chat_history.user_id, user.id));

    return NextResponse.json({
      success: true,
      message: '대화 기록이 삭제되었습니다',
    });
  } catch (error) {
    console.error('[ERROR] Delete Chat History - Failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: '대화 기록 삭제에 실패했습니다',
        },
      },
      { status: 500 }
    );
  }
}
