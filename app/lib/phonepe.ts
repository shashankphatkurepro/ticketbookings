import { StandardCheckoutClient, Env } from 'pg-sdk-node';

let phonepeClient: StandardCheckoutClient | null = null;

export function getPhonePeClient(): StandardCheckoutClient {
  if (phonepeClient) {
    return phonepeClient;
  }

  const clientId = process.env.PHONEPE_CLIENT_ID;
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
  const clientVersion = parseInt(process.env.PHONEPE_CLIENT_VERSION || '1', 10);
  const envString = process.env.PHONEPE_ENV || 'SANDBOX';

  if (!clientId || !clientSecret) {
    throw new Error('PhonePe credentials not configured. Please set PHONEPE_CLIENT_ID and PHONEPE_CLIENT_SECRET in .env.local');
  }

  const env = envString === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX;

  phonepeClient = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

  return phonepeClient;
}

export function getWebhookCredentials() {
  return {
    username: process.env.PHONEPE_WEBHOOK_USERNAME || '',
    password: process.env.PHONEPE_WEBHOOK_PASSWORD || '',
  };
}
