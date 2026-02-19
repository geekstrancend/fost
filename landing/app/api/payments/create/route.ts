import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { createPaymentSession } from '@/lib/paycrest';

interface CreatePaymentRequest {
  plan: 'pro' | 'enterprise';
  paymentMethod?: 'card';
}

const PLAN_PRICES: Record<string, { amount: number; currency: string; credits: number }> = {
  pro: {
    amount: 2999, // $29.99
    currency: 'USD',
    credits: 1000,
  },
  enterprise: {
    amount: 9999, // $99.99
    currency: 'USD',
    credits: 5000,
  },
};

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Unauthorized - please log in first' },
        { status: 401 }
      );
    }

    let body: CreatePaymentRequest;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { plan, paymentMethod = 'card' } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json(
        { error: `Invalid plan. Supported: ${Object.keys(PLAN_PRICES).join(', ')}` },
        { status: 400 }
      );
    }

    if (paymentMethod !== 'card') {
      return NextResponse.json(
        { error: 'Invalid payment method. Only card is supported.' },
        { status: 400 }
      );
    }

    const planDetails = PLAN_PRICES[plan];

    const paymentSession = await createPaymentSession({
      amount: planDetails.amount,
      currency: planDetails.currency,
      email: auth.user.email,
      userId: auth.user.id,
      plan,
      paymentMethod,
      description: `FOST ${plan.toUpperCase()} Plan - ${planDetails.credits} credits`,
      metadata: {
        planName: plan,
        creditsAmount: planDetails.credits,
        paymentMethod,
      },
    });

    return NextResponse.json(paymentSession);
  } catch (error) {
    console.error('Payment creation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
