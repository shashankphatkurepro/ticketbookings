import { NextRequest, NextResponse } from 'next/server';
import { getPhonePeClient } from '@/app/lib/phonepe';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const merchantOrderId = searchParams.get('merchantOrderId');

    if (!merchantOrderId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: merchantOrderId' },
        { status: 400 }
      );
    }

    const client = getPhonePeClient();
    const response = await client.getOrderStatus(merchantOrderId);

    return NextResponse.json({
      success: true,
      data: {
        orderId: response.orderId,
        state: response.state,
        amount: response.amount,
        expireAt: response.expireAt,
        metaInfo: response.metaInfo,
        paymentDetails: response.paymentDetails,
      },
    });
  } catch (error: unknown) {
    console.error('PhonePe order status error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order status';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
