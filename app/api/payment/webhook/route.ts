import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeClient, getWebhookCredentials } from '@/app/lib/phonepe';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header from PhonePe
    const authorization = request.headers.get('authorization') || '';

    // Get the raw body as string
    const responseBody = await request.text();

    if (!responseBody) {
      return NextResponse.json(
        { success: false, error: 'Empty request body' },
        { status: 400 }
      );
    }

    const { username, password } = getWebhookCredentials();

    if (!username || !password) {
      console.error('Webhook credentials not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook credentials not configured' },
        { status: 500 }
      );
    }

    // Validate the callback from PhonePe
    const client = getPhonePeClient();
    const callbackResponse = client.validateCallback(
      username,
      password,
      authorization,
      responseBody
    );

    // Process the callback based on type
    const { type, payload } = callbackResponse;
    const typeString = String(type);

    console.log('PhonePe Webhook received:', {
      type: typeString,
      orderId: payload?.orderId,
      state: payload?.state,
      amount: payload?.amount,
    });

    // Handle different callback types
    if (typeString.includes('ORDER_COMPLETED') || typeString.includes('COMPLETED')) {
      // Payment successful
      console.log('Payment completed for order:', payload?.originalMerchantOrderId);
      // TODO: Update your database, send confirmation emails, etc.
    } else if (typeString.includes('ORDER_FAILED') || typeString.includes('FAILED')) {
      // Payment/Refund failed
      console.log('Payment/Refund failed for order:', payload?.originalMerchantOrderId || payload?.refundId);
      // TODO: Handle failed payment/refund
    } else if (typeString.includes('REFUND_COMPLETED')) {
      // Refund successful
      console.log('Refund completed:', payload?.refundId);
      // TODO: Handle refund completion
    } else if (typeString.includes('REFUND_ACCEPTED')) {
      // Refund accepted but not yet processed
      console.log('Refund accepted:', payload?.refundId);
    } else {
      console.log('Unknown callback type:', typeString);
    }

    // Return success to PhonePe
    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error: unknown) {
    console.error('PhonePe webhook error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Webhook processing failed';

    // Return 200 to prevent PhonePe from retrying (log the error for investigation)
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 200 }
    );
  }
}
