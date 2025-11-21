import { users, subscriptions, documents, embeddings, chat_history, api_usage, user_settings } from '@/drizzle/schema';

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;

export type ChatMessage = typeof chat_history.$inferSelect;
export type NewChatMessage = typeof chat_history.$inferInsert;

export type ApiUsage = typeof api_usage.$inferSelect;
export type NewApiUsage = typeof api_usage.$inferInsert;

export type UserSettings = typeof user_settings.$inferSelect;
export type NewUserSettings = typeof user_settings.$inferInsert;

export type PlanType = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due';
export type DocumentStatus = 'processing' | 'completed' | 'failed';
export type LLMProvider = 'openai' | 'google' | 'claude' | 'ollama' | 'lmstudio';
