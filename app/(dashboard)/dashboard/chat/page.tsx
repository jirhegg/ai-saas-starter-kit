'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Plus, Trash2, Edit2, MessageSquare } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Session = {
  id: string;
  title: string;
  updated_at: string;
};

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const queryClient = useQueryClient();

  // 세션 목록 조회
  const { data: sessionsData } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async () => {
      const res = await fetch('/api/chat/sessions');
      return res.json();
    },
  });

  // 현재 세션의 히스토리 조회
  const { data: historyData } = useQuery({
    queryKey: ['chat-history', currentSessionId],
    queryFn: async () => {
      if (!currentSessionId) return null;
      const res = await fetch(`/api/chat/sessions/${currentSessionId}/messages`);
      return res.json();
    },
    enabled: !!currentSessionId,
  });

  // 히스토리 데이터를 메시지로 변환
  useEffect(() => {
    if (historyData?.success && historyData.data) {
      const loadedMessages = historyData.data.map((item: any) => ({
        role: item.role,
        content: item.content,
      }));
      setMessages(loadedMessages);
    } else if (!currentSessionId) {
      setMessages([]);
    }
  }, [historyData, currentSessionId]);

  // 새 세션 생성
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '새 대화' }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setCurrentSessionId(data.data.id);
      setMessages([]);
    },
  });

  // 세션 삭제
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const res = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      if (currentSessionId === deleteSessionMutation.variables) {
        setCurrentSessionId(null);
        setMessages([]);
      }
    },
  });

  // 세션 제목 수정
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const res = await fetch(`/api/chat/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      setEditingSessionId(null);
    },
  });

  // 채팅 메시지 전송
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, session_id: currentSessionId }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.data.message },
      ]);
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 세션이 없으면 먼저 생성
    if (!currentSessionId) {
      createSessionMutation.mutate(undefined, {
        onSuccess: (data) => {
          setMessages([{ role: 'user', content: input }]);
          chatMutation.mutate(input);
          setInput('');
        },
      });
    } else {
      setMessages((prev) => [...prev, { role: 'user', content: input }]);
      chatMutation.mutate(input);
      setInput('');
    }
  };

  const sessions = sessionsData?.data || [];

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* 좌측 세션 목록 */}
      <div className="w-64 bg-card border border-border rounded-lg p-4 flex flex-col">
        <button
          onClick={() => createSessionMutation.mutate()}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-4"
        >
          <Plus className="w-4 h-4" />
          새 대화
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {sessions.map((session: Session) => (
            <div
              key={session.id}
              className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                currentSessionId === session.id
                  ? 'bg-primary/10 border border-primary'
                  : 'hover:bg-muted border border-transparent'
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              {editingSessionId === session.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => {
                    if (editTitle.trim()) {
                      updateSessionMutation.mutate({ id: session.id, title: editTitle });
                    } else {
                      setEditingSessionId(null);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editTitle.trim()) {
                      updateSessionMutation.mutate({ id: session.id, title: editTitle });
                    } else if (e.key === 'Escape') {
                      setEditingSessionId(null);
                    }
                  }}
                  className="w-full px-2 py-1 text-sm border rounded"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <p className="text-sm font-medium truncate">{session.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.updated_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.id);
                        setEditTitle(session.title);
                      }}
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('이 대화를 삭제하시겠습니까?')) {
                          deleteSessionMutation.mutate(session.id);
                        }
                      }}
                      className="p-1 hover:bg-destructive/10 text-destructive rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 우측 채팅 영역 */}
      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI 채팅</h1>
          <p className="text-muted-foreground mt-2">
            {currentSessionId
              ? '문서에 대해 질문하고 AI의 답변을 받아보세요'
              : '새 대화를 시작하거나 기존 대화를 선택하세요'}
          </p>
        </div>

        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <p>대화를 시작해보세요!</p>
              </div>
            ) : (
              messages.map((message, index) => (
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
              ))
            )}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[70%] px-4 py-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">생각 중...</p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={chatMutation.isPending || !input.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
