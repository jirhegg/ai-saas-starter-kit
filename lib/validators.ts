import { z } from 'zod';

// Auth
export const signUpSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다'),
});

export const signInSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
});

// Documents
export const createDocumentSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요'),
  content: z.string().min(1, '내용을 입력해주세요'),
  file_type: z.enum(['pdf', 'markdown', 'txt']).optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요').optional(),
  content: z.string().min(1, '내용을 입력해주세요').optional(),
});

// Chat
export const chatMessageSchema = z.object({
  message: z.string().min(1, '메시지를 입력해주세요'),
  document_id: z.string().uuid().optional(),
});

// Search
export const searchSchema = z.object({
  query: z.string().min(1, '검색어를 입력해주세요'),
  limit: z.number().min(1).max(50).default(10),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
