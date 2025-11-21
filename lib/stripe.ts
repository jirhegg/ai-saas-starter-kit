import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '월 10개 문서',
      '월 100개 AI 쿼리',
      '기본 검색',
      '커뮤니티 지원',
    ],
    limits: {
      documents: 10,
      queries: 100,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      '무제한 문서',
      '월 1,000개 AI 쿼리',
      '고급 검색',
      '우선 지원',
      'API 액세스',
    ],
    limits: {
      documents: -1, // unlimited
      queries: 1000,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: [
      '무제한 문서',
      '무제한 AI 쿼리',
      '전용 검색 엔진',
      '24/7 지원',
      'API 액세스',
      '커스텀 통합',
    ],
    limits: {
      documents: -1,
      queries: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;
