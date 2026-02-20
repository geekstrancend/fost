'use client';

import { PRICING_PLANS, PRICING_PAGE_META } from '../pricing-config';

/**
 * Pricing Page
 * Displays all available pricing tiers with features and FAQ
 */
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold font-mono">{PRICING_PAGE_META.title}</h1>
          <p className="text-lg text-gray-600 font-mono">
            {PRICING_PAGE_META.subtitle}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 space-y-8 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold font-mono text-center mb-12">{PRICING_PAGE_META.faq.title}</h2>

          {PRICING_PAGE_META.faq.items.map((item, idx) => (
            <FAQItem key={idx} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual pricing plan card
 */
interface PricingCardProps {
  plan: typeof PRICING_PLANS[0];
}

function PricingCard({ plan }: PricingCardProps) {
  return (
    <div
      className={`rounded-lg border-2 transition-transform hover:scale-105 ${
        plan.highlighted
          ? 'border-accent-green bg-accent-green/5 ring-2 ring-accent-green md:scale-105'
          : 'border-gray-200 bg-white'
      }`}
    >
      {plan.highlighted && (
        <div className="bg-accent-green px-4 py-2 text-center font-mono text-xs font-bold text-white">
          MOST POPULAR
        </div>
      )}

      <div className="p-8">
        {/* Plan Name */}
        <h2 className="mb-2 text-2xl font-bold font-mono">{plan.name}</h2>
        <p className="mb-6 text-sm text-gray-600 font-mono">{plan.description}</p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-4xl font-bold">{plan.price}</span>
            {plan.period && <span className="text-gray-600">{plan.period}</span>}
          </div>
          <div className="mt-2 text-sm text-gray-600 font-mono">
            {plan.credits} credits/month
          </div>
        </div>

        {/* CTA Button */}
        <button
          className={`w-full rounded py-3 font-mono font-bold transition mb-8 ${
            plan.highlighted
              ? 'bg-accent-green text-white hover:bg-accent-green-dark'
              : 'border-2 border-gray-300 text-gray-700 hover:border-accent-green hover:text-accent-green'
          }`}
          aria-label={`${plan.cta} button for ${plan.name} plan`}
        >
          {plan.cta}
        </button>

        {/* Features */}
        <div className="space-y-3">
          {plan.features.map((feature) => (
            <FeatureItem key={feature} feature={feature} />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Individual feature list item
 */
interface FeatureItemProps {
  feature: string;
}

function FeatureItem({ feature }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3 text-sm font-mono">
      <span className="text-accent-green" aria-hidden="true">✓</span>
      <span className="text-gray-700">{feature}</span>
    </div>
  );
}

/**
 * FAQ Question and Answer
 */
interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 font-mono">
      <h3 className="mb-3 font-bold text-lg">{question}</h3>
      <p className="text-gray-700">{answer}</p>
    </div>
  );
}
