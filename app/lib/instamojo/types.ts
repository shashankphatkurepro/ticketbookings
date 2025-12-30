// Instamojo API Types

export interface InstamojoConfig {
  clientId: string;
  clientSecret: string;
  salt: string;
  environment: 'PRODUCTION' | 'TEST';
}

export interface InstamojoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface PaymentRequestParams {
  amount: number;
  purpose: string;
  buyerName: string;
  email: string;
  phone: string;
  redirectUrl: string;
  webhookUrl?: string; // Optional - not supported on localhost
  sendEmail?: boolean;
  sendSms?: boolean;
  allowRepeatedPayments?: boolean;
}

export interface InstamojoPaymentRequest {
  id: string;
  phone: string;
  email: string;
  buyer_name: string;
  amount: string;
  purpose: string;
  status: string;
  send_sms: boolean;
  send_email: boolean;
  sms_status: string | null;
  email_status: string | null;
  shorturl: string | null;
  longurl: string;
  redirect_url: string;
  webhook: string;
  allow_repeated_payments: boolean;
  customer_id: string | null;
  created_at: string;
  modified_at: string;
}

export interface InstamojoPaymentRequestResponse {
  success: boolean;
  payment_request: InstamojoPaymentRequest;
}

export interface InstamojoWebhookPayload {
  amount: string;
  buyer: string;
  buyer_name: string;
  buyer_phone: string;
  currency: string;
  fees: string;
  longurl: string;
  mac: string;
  payment_id: string;
  payment_request_id: string;
  purpose: string;
  shorturl: string;
  status: 'Credit' | 'Failed';
}

export interface InstamojoPaymentDetails {
  payment_id: string;
  quantity: number;
  status: string;
  link_slug: string | null;
  link_title: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email: string;
  currency: string;
  unit_price: string;
  amount: string;
  fees: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  discount_code: string | null;
  discount_amount_off: string | null;
  variants: unknown[];
  custom_fields: Record<string, string>;
  affiliate_id: string | null;
  affiliate_commission: string | null;
  created_at: string;
  instrument_type: 'CARD' | 'EMI' | 'NETBANKING' | 'UPI' | 'WALLET' | null;
  billing_instrument: string | null;
  failure: {
    reason: string;
    message: string;
  } | null;
  payout: string | null;
}

export interface InstamojoPaymentDetailsResponse {
  success: boolean;
  payment_request: InstamojoPaymentRequest;
  payments: InstamojoPaymentDetails[];
}

// Frontend callback response types
export interface InstamojoCheckoutResponse {
  paymentId: string;
  paymentRequestId: string;
  paymentStatus: string;
}

// API response types for our endpoints
export interface CreatePaymentRequestBody {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: BookingItem[];
  group_booking: GroupBooking | null;
  subtotal: number;
  group_total: number;
  total_amount: number;
  coupon_id?: string;
  coupon_code?: string;
  discount_amount?: number;
}

export interface BookingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface GroupBooking {
  withAlcohol: boolean;
  maleCount: number;
  femaleCount: number;
  malePrice: number;
  femalePrice: number;
  nonAlcoholCount: number;
  nonAlcoholPrice: number;
}

export interface CreatePaymentResponse {
  success: boolean;
  bookingId?: string;
  paymentUrl?: string;
  paymentRequestId?: string;
  error?: string;
}

export interface VerifyPaymentBody {
  payment_id: string;
  payment_request_id: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  status: 'confirmed' | 'pending' | 'failed';
  bookingId?: string;
  bookingUuid?: string;
  error?: string;
}
