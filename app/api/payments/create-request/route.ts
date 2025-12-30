import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { nanoid } from 'nanoid';
import { createPaymentRequest } from '@/app/lib/instamojo/client';
import { CreatePaymentRequestBody, CreatePaymentResponse } from '@/app/lib/instamojo/types';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

function generateBookingId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = nanoid(6).toUpperCase();
  return `MNG-${timestamp}-${random}`;
}

export async function POST(request: NextRequest): Promise<NextResponse<CreatePaymentResponse>> {
  try {
    const body: CreatePaymentRequestBody = await request.json();

    // Validate required fields
    if (!body.customer_name || !body.customer_email || !body.customer_phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required customer information' },
        { status: 400 }
      );
    }

    if ((!body.items || body.items.length === 0) && !body.group_booking) {
      return NextResponse.json(
        { success: false, error: 'No items in booking' },
        { status: 400 }
      );
    }

    if (!body.total_amount || body.total_amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid total amount' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const bookingId = generateBookingId();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Step 1: Create booking in Supabase with pending status
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_id: bookingId,
        customer_name: body.customer_name,
        customer_email: body.customer_email,
        customer_phone: body.customer_phone,
        items: body.items || [],
        group_booking: body.group_booking,
        subtotal: body.subtotal || 0,
        group_total: body.group_total || 0,
        total_amount: body.total_amount,
        discount_amount: body.discount_amount || 0,
        discount_note: body.coupon_code ? `Coupon: ${body.coupon_code}` : null,
        payment_status: 'pending',
        source: 'website',
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { success: false, error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Step 2: Create Instamojo payment request
    try {
      // Check if running on localhost - Instamojo doesn't accept localhost webhooks
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

      const paymentRequest = await createPaymentRequest({
        amount: body.total_amount,
        purpose: `Mangozzz Resort Booking - ${bookingId}`,
        buyerName: body.customer_name,
        email: body.customer_email,
        phone: body.customer_phone,
        redirectUrl: `${baseUrl}/checkout?payment_status=success&booking_id=${booking.id}`,
        // Only set webhook URL for production (Instamojo rejects localhost)
        webhookUrl: isLocalhost ? undefined : `${baseUrl}/api/payments/webhook`,
        sendEmail: false,
        sendSms: false,
        allowRepeatedPayments: false,
      });

      // Step 3: Update booking with Instamojo payment request ID
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          instamojo_payment_request_id: paymentRequest.id,
          instamojo_payment_url: paymentRequest.longurl,
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('Error updating booking with payment request:', updateError);
        // Continue anyway - we can still proceed with payment
      }

      // Step 4: Log the payment request creation
      await supabase.from('payment_logs').insert({
        booking_id: booking.id,
        event_type: 'request_created',
        instamojo_payment_request_id: paymentRequest.id,
        status: 'pending',
        raw_payload: paymentRequest,
        mac_verified: false,
      });

      return NextResponse.json({
        success: true,
        bookingId: bookingId,
        paymentUrl: paymentRequest.longurl,
        paymentRequestId: paymentRequest.id,
      });
    } catch (paymentError) {
      console.error('Error creating Instamojo payment request:', paymentError);

      // Update booking to failed status
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking.id);

      return NextResponse.json(
        { success: false, error: 'Failed to create payment request' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in POST /api/payments/create-request:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
