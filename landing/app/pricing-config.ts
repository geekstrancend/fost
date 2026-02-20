/**
 * Pricing Configuration
 * Centralized pricing plans and tiers
 */

/**
 * Individual pricing plan
 */
export interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  credits: number | string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

/**
 * All available pricing plans
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with Web3 SDK generation',
    credits: 100,
    features: [
      'Multi-chain support',
      '5 SDKs/month',
      'Basic features',
      'Community support',
      'TypeScript only',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For serious Web3 developers',
    credits: 5000,
    features: [
      'Unlimited SDKs',
      'All 8 languages',
      'Gas estimation',
      'Event subscriptions',
      'Priority support',
      'API access',
      'Custom tooling',
    ],
    cta: 'Start Building',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and organizations',
    credits: 'Unlimited',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
      'Advanced analytics',
      'Team management',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

/**
 * Pricing page metadata
 */
export const PRICING_PAGE_META = {
  title: 'Simple, Transparent Pricing',
  subtitle: 'Choose the plan that fits your Web3 SDK needs',
  features: {
    title: 'What\'s Included',
    items: [
      { title: 'API Access', description: 'Full access to our SDK generation API' },
      { title: 'Priority Support', description: '24/7 dedicated support channel' },
      { title: 'Custom Integrations', description: 'Tailor Fost to your specific needs' },
      { title: 'SLA Guarantee', description: '99.9% uptime guarantee' },
    ],
  },
  faq: {
    title: 'Frequently Asked Questions',
    items: [
      {
        question: 'Can I upgrade or downgrade my plan?',
        answer: 'Yes, you can change your plan at any time. Changes take effect at the next billing cycle.',
      },
      {
        question: 'What happens to my generated SDKs?',
        answer: 'Your generated SDKs remain yours to use and maintain. We don\'t restrict usage or require attribution.',
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes! Our Free plan gives you everything you need to generate and publish your first SDK.',
      },
      {
        question: 'Do you offer discounts for annual billing?',
        answer: 'Yes, we offer 20% discount for annual billing on Pro and Enterprise plans.',
      },
    ],
  },
} as const;
