import crypto from 'crypto';
import {
  InstamojoConfig,
  InstamojoTokenResponse,
  PaymentRequestParams,
  InstamojoPaymentRequest,
  InstamojoPaymentRequestResponse,
  InstamojoPaymentDetailsResponse,
  InstamojoWebhookPayload,
} from './types';

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

function getConfig(): InstamojoConfig {
  const clientId = process.env.INSTAMOJO_CLIENT_ID;
  const clientSecret = process.env.INSTAMOJO_CLIENT_SECRET;
  const salt = process.env.INSTAMOJO_SALT;
  const environment = (process.env.INSTAMOJO_ENV || 'PRODUCTION') as 'PRODUCTION' | 'TEST';

  if (!clientId || !clientSecret || !salt) {
    throw new Error('Missing Instamojo configuration. Check environment variables.');
  }

  return { clientId, clientSecret, salt, environment };
}

function getBaseUrl(): string {
  const config = getConfig();
  return config.environment === 'TEST'
    ? 'https://test.instamojo.com'
    : 'https://api.instamojo.com';
}

/**
 * Get OAuth access token with caching
 */
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return cachedToken;
  }

  const config = getConfig();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/oauth2/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get Instamojo access token: ${response.status} - ${errorText}`);
  }

  const data: InstamojoTokenResponse = await response.json();

  cachedToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return cachedToken;
}

/**
 * Create a payment request
 */
export async function createPaymentRequest(
  params: PaymentRequestParams
): Promise<InstamojoPaymentRequest> {
  const token = await getAccessToken();
  const baseUrl = getBaseUrl();

  // Build request body, conditionally including webhook
  const bodyParams: Record<string, string> = {
    amount: params.amount.toFixed(2),
    purpose: params.purpose,
    buyer_name: params.buyerName,
    email: params.email,
    phone: params.phone,
    redirect_url: params.redirectUrl,
    send_email: String(params.sendEmail ?? false),
    send_sms: String(params.sendSms ?? false),
    allow_repeated_payments: String(params.allowRepeatedPayments ?? false),
  };

  // Only add webhook if provided (Instamojo rejects localhost webhooks)
  if (params.webhookUrl) {
    bodyParams.webhook = params.webhookUrl;
  }

  const response = await fetch(`${baseUrl}/v2/payment_requests/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(bodyParams),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error('Instamojo API error response:', responseText);
    throw new Error(`Failed to create payment request: ${response.status} - ${responseText}`);
  }

  let data: InstamojoPaymentRequest;
  try {
    data = JSON.parse(responseText);
  } catch {
    console.error('Failed to parse Instamojo response:', responseText);
    throw new Error(`Invalid response from Instamojo: ${responseText}`);
  }

  // V2 API returns the payment request directly (not wrapped in {success, payment_request})
  if (!data.id || !data.longurl) {
    console.error('Invalid Instamojo response - missing id or longurl:', data);
    throw new Error(`Invalid payment request response: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Get payment request details with payment information
 */
export async function getPaymentRequestDetails(
  paymentRequestId: string
): Promise<InstamojoPaymentDetailsResponse> {
  const token = await getAccessToken();
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/v2/payment_requests/${paymentRequestId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get payment details: ${response.status} - ${errorText}`);
  }

  const data: InstamojoPaymentDetailsResponse = await response.json();
  return data;
}

/**
 * Verify webhook signature using HMAC-SHA1
 *
 * The MAC is computed as: HMAC-SHA1(salt, sorted_values_joined_by_pipe)
 * Values are sorted case-insensitively by key name
 */
export function verifyWebhookSignature(
  payload: Record<string, string>,
  providedMac: string
): boolean {
  const config = getConfig();

  // Remove 'mac' from payload for signature calculation
  const { mac, ...dataWithoutMac } = payload;

  // Sort keys case-insensitively
  const sortedKeys = Object.keys(dataWithoutMac).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  // Join values with pipe separator
  const message = sortedKeys.map(key => dataWithoutMac[key]).join('|');

  // Calculate HMAC-SHA1
  const calculatedMac = crypto
    .createHmac('sha1', config.salt)
    .update(message)
    .digest('hex');

  return calculatedMac === providedMac;
}

/**
 * Parse webhook payload from form data
 */
export function parseWebhookPayload(formData: FormData): InstamojoWebhookPayload {
  return {
    amount: formData.get('amount') as string,
    buyer: formData.get('buyer') as string,
    buyer_name: formData.get('buyer_name') as string,
    buyer_phone: formData.get('buyer_phone') as string,
    currency: formData.get('currency') as string,
    fees: formData.get('fees') as string,
    longurl: formData.get('longurl') as string,
    mac: formData.get('mac') as string,
    payment_id: formData.get('payment_id') as string,
    payment_request_id: formData.get('payment_request_id') as string,
    purpose: formData.get('purpose') as string,
    shorturl: formData.get('shorturl') as string,
    status: formData.get('status') as 'Credit' | 'Failed',
  };
}

/**
 * Convert FormData to plain object for signature verification
 */
export function formDataToObject(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  formData.forEach((value, key) => {
    obj[key] = value as string;
  });
  return obj;
}
