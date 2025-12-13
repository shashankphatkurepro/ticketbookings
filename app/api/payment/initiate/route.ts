import { NextRequest, NextResponse } from 'next/server';
import { StandardCheckoutPayRequest, MetaInfo } from 'pg-sdk-node';
import { getPhonePeClient } from '@/app/lib/phonepe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantOrderId, amount, customerInfo, items } = body;

    // Validate required fields
    if (!merchantOrderId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: merchantOrderId, amount' },
        { status: 400 }
      );
    }

    // Amount should be in paisa (1 INR = 100 paisa)
    const amountInPaisa = Math.round(amount * 100);

    if (amountInPaisa < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum amount is 1 INR (100 paisa)' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/checkout/payment-status?orderId=${merchantOrderId}`;

    // Build metadata with customer info and items summary
    const metaInfoBuilder = MetaInfo.builder();

    if (customerInfo?.name) {
      metaInfoBuilder.udf1(customerInfo.name);
    }
    if (customerInfo?.email) {
      metaInfoBuilder.udf2(customerInfo.email);
    }
    if (customerInfo?.phone) {
      metaInfoBuilder.udf3(customerInfo.phone);
    }
    if (items) {
      metaInfoBuilder.udf4(JSON.stringify(items).substring(0, 256));
    }

    const metaInfo = metaInfoBuilder.build();

    // Build payment request
    const paymentRequest = StandardCheckoutPayRequest.builder()
      .merchantOrderId(merchantOrderId)
      .amount(amountInPaisa)
      .redirectUrl(redirectUrl)
      .metaInfo(metaInfo)
      .build();

    // Initialize PhonePe client and make payment request
    const client = getPhonePeClient();
    const response = await client.pay(paymentRequest);

    return NextResponse.json({
      success: true,
      data: {
        redirectUrl: response.redirectUrl,
        orderId: response.orderId,
        state: response.state,
        expireAt: response.expireAt,
        merchantOrderId,
      },
    });
  } catch (error: unknown) {
    console.error('PhonePe payment initiation error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Payment initiation failed';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
