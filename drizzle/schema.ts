import { pgTable, uuid, text, timestamp, integer, boolean, vector, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users 테이블
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar_url: text('avatar_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
});

// User Settings 테이블 (LLM 설정)
export const user_settings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  llm_provider: text('llm_provider').notNull().default('openai'), // openai, google, claude, ollama, lmstudio
  llm_model: text('llm_model').notNull().default('gpt-4-turbo-preview'),
  openai_api_key: text('openai_api_key'),
  google_api_key: text('google_api_key'),
  claude_api_key: text('claude_api_key'),
  ollama_base_url: text('ollama_base_url').default('http://localhost:11434'),
  lmstudio_base_url: text('lmstudio_base_url').default('http://localhost:1234'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Subscriptions 테이블
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stripe_customer_id: text('stripe_customer_id').unique(),
  stripe_subscription_id: text('stripe_subscription_id').unique(),
  plan: text('plan').notNull().default('free'), // free, pro, enterprise
  status: text('status').notNull().default('active'), // active, canceled, past_due
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),
  cancel_at_period_end: boolean('cancel_at_period_end').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Documents 테이블
export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  file_url: text('file_url'),
  file_type: text('file_type'), // pdf, markdown, txt
  file_size: integer('file_size'),
  status: text('status').notNull().default('processing'), // processing, completed, failed
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('documents_user_id_idx').on(table.user_id),
  statusIdx: index('documents_status_idx').on(table.status),
}));

// Embeddings 테이블 (벡터 검색용)
export const embeddings = pgTable('embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  document_id: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding', { dimensions: 1536 }),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  documentIdIdx: index('embeddings_document_id_idx').on(table.document_id),
  embeddingIdx: index('embeddings_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
}));

// Chat Sessions 테이블
export const chat_sessions = pgTable('chat_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull().default('새 대화'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  deleted_at: timestamp('deleted_at'),
}, (table) => ({
  userIdIdx: index('chat_sessions_user_id_idx').on(table.user_id),
  updatedAtIdx: index('chat_sessions_updated_at_idx').on(table.updated_at),
}));

// Chat History 테이블
export const chat_history = pgTable('chat_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  session_id: uuid('session_id').references(() => chat_sessions.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  document_id: uuid('document_id').references(() => documents.id, { onDelete: 'set null' }),
  role: text('role').notNull(), // user, assistant, system
  content: text('content').notNull(),
  tokens_used: integer('tokens_used'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('chat_history_session_id_idx').on(table.session_id),
  userIdIdx: index('chat_history_user_id_idx').on(table.user_id),
  createdAtIdx: index('chat_history_created_at_idx').on(table.created_at),
}));

// API Usage 테이블
export const api_usage = pgTable('api_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  endpoint: text('endpoint').notNull(),
  tokens_used: integer('tokens_used').default(0),
  cost: integer('cost').default(0), // cents
  status: text('status').notNull(), // success, error
  error_message: text('error_message'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('api_usage_user_id_idx').on(table.user_id),
  createdAtIdx: index('api_usage_created_at_idx').on(table.created_at),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.user_id],
  }),
  settings: one(user_settings, {
    fields: [users.id],
    references: [user_settings.user_id],
  }),
  documents: many(documents),
  chatSessions: many(chat_sessions),
  chatHistory: many(chat_history),
  apiUsage: many(api_usage),
}));

export const userSettingsRelations = relations(user_settings, ({ one }) => ({
  user: one(users, {
    fields: [user_settings.user_id],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.user_id],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.user_id],
    references: [users.id],
  }),
  embeddings: many(embeddings),
  chatHistory: many(chat_history),
}));

export const embeddingsRelations = relations(embeddings, ({ one }) => ({
  document: one(documents, {
    fields: [embeddings.document_id],
    references: [documents.id],
  }),
}));

export const chatSessionsRelations = relations(chat_sessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chat_sessions.user_id],
    references: [users.id],
  }),
  messages: many(chat_history),
}));

export const chatHistoryRelations = relations(chat_history, ({ one }) => ({
  session: one(chat_sessions, {
    fields: [chat_history.session_id],
    references: [chat_sessions.id],
  }),
  user: one(users, {
    fields: [chat_history.user_id],
    references: [users.id],
  }),
  document: one(documents, {
    fields: [chat_history.document_id],
    references: [documents.id],
  }),
}));

export const apiUsageRelations = relations(api_usage, ({ one }) => ({
  user: one(users, {
    fields: [api_usage.user_id],
    references: [users.id],
  }),
}));
