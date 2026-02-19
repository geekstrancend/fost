/**
 * Paycrest Payment Integration
 * Handles payment processing and webhook notifications
 */

export interface PaycrestConfig {
  apiKey: string;
  businessId: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  email: string;
  userId: string;
  plan: 'pro' | 'enterprise';
  description: string;
  paymentMethod?: 'card';
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  redirectUrl: string;
  expiresAt: string;
}

export interface WebhookPayload {
  event: 'payment.completed' | 'payment.failed' | 'payment.pending';
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  email: string;
  metadata?: Record<string, any>;
  timestamp: string;
  signature: string;
}

const PAYCREST_API_BASE = 
  process.env.PAYCREST_ENV === 'production'
    ? 'https://api.paycrest.io/v1'
    : 'https://sandbox-api.paycrest.io/v1';

const API_KEY = process.env.PAYCREST_API_KEY || '';
const BUSINESS_ID = process.env.PAYCREST_BUSINESS_ID || '';
const WEBHOOK_SECRET = process.env.PAYCREST_WEBHOOK_SECRET || '';

/**
 * Create a payment checkout session
 */
export async function createPaymentSession(
  request: PaymentRequest
): Promise<PaymentResponse> {
  if (!API_KEY || !BUSINESS_ID) {
    throw new Error('Paycrest credentials not configured. Please set PAYCREST_API_KEY and PAYCREST_BUSINESS_ID environment variables.');
  }

  const payload = {
    business_id: BUSINESS_ID,
    amount: request.amount,
    currency: request.currency,
    customer_email: request.email,
    description: request.description,
    reference: `${request.userId}-${Date.now()}`,
    callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/webhook`,
    redirect_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/platform/dashboard?payment=success`,
    payment_method: request.paymentMethod || 'card',
    metadata: {
      userId: request.userId,
      plan: request.plan,
      paymentMethod: request.paymentMethod || 'card',
      ...request.metadata,
    },
  };

  const response = await fetch(`${PAYCREST_API_BASE}/charges/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Paycrest API error: ${error.message || 'Unknown error'}`);
  }

  const data = await response.json();

  return {
    transactionId: data.charge_id,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    redirectUrl: data.checkout_url,
    expiresAt: data.expires_at,
  };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('Webhook secret not configured');
    return false;
  }

  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
}

/**
 * Handle webhook payload
 */
export async function handleWebhookPayload(
  payload: WebhookPayload
): Promise<void> {
  switch (payload.event) {
    case 'payment.completed':
      await handlePaymentCompleted(payload);
      break;
    case 'payment.failed':
      await handlePaymentFailed(payload);
      break;
    case 'payment.pending':
      await handlePaymentPending(payload);
      break;
  }
}

/**
 * Handle completed payment
 */
async function handlePaymentCompleted(payload: WebhookPayload): Promise<void> {
  const { transactionId, amount, metadata } = payload;

  if (!metadata?.userId || !metadata?.plan) {
    throw new Error('Invalid payment metadata');
  }

  // Calculate credits based on plan
  const creditsMap: Record<string, number> = {
    pro: 1000,
    enterprise: 5000,
  };

  const credits = creditsMap[metadata.plan] || 0;

  // Store payment record and update user credits
  const { updateUserData } = await import('./user-storage');
  
  // Get user and update credits
  const { getUserById } = await import('./auth');
  const user = getUserById(metadata.userId);
  
  if (user) {
    updateUserData(metadata.userId, {
      credits: (user.credits || 0) + credits,
    });

    // Store payment record
    storePaymentRecord({
      transactionId,
      userId: metadata.userId,
      plan: metadata.plan,
      amount,
      credits,
      status: 'completed',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: WebhookPayload): Promise<void> {
  const { transactionId, metadata } = payload;

  storePaymentRecord({
    transactionId,
    userId: metadata?.userId || 'unknown',
    plan: metadata?.plan || 'unknown',
    amount: payload.amount,
    credits: 0,
    status: 'failed',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle pending payment
 */
async function handlePaymentPending(payload: WebhookPayload): Promise<void> {
  const { transactionId, metadata } = payload;

  storePaymentRecord({
    transactionId,
    userId: metadata?.userId || 'unknown',
    plan: metadata?.plan || 'unknown',
    amount: payload.amount,
    credits: 0,
    status: 'pending',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Store payment record
 */
interface PaymentRecord {
  transactionId: string;
  userId: string;
  plan: string;
  amount: number;
  credits: number;
  status: 'completed' | 'failed' | 'pending';
  timestamp: string;
}

function storePaymentRecord(record: PaymentRecord): void {
  try {
    const fs = require('fs');
    const path = require('path');

    const STORAGE_DIR = path.join(process.cwd(), '.fost-data');
    const PAYMENTS_FILE = path.join(STORAGE_DIR, 'payments.json');

    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }

    let payments: PaymentRecord[] = [];
    if (fs.existsSync(PAYMENTS_FILE)) {
      const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
      if (data && data.trim()) {
        payments = JSON.parse(data);
      }
    }

    payments.push(record);
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
  } catch (error) {
    console.error('Failed to store payment record:', error);
  }
}

/**
 * Get payment history
 */
export function getPaymentHistory(userId: string): PaymentRecord[] {
  try {
    const fs = require('fs');
    const path = require('path');

    const STORAGE_DIR = path.join(process.cwd(), '.fost-data');
    const PAYMENTS_FILE = path.join(STORAGE_DIR, 'payments.json');

    if (!fs.existsSync(PAYMENTS_FILE)) {
      return [];
    }

    const data = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
    if (!data || !data.trim()) {
      return [];
    }

    const payments: PaymentRecord[] = JSON.parse(data);
    return payments.filter(p => p.userId === userId);
  } catch (error) {
    console.error('Failed to get payment history:', error);
    return [];
  }
}
