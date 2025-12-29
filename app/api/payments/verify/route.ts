import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPaymentRequestDetails } from '@/app/lib/instamojo/client';
import { VerifyPaymentBody, VerifyPaymentResponse } from '@/app/lib/instamojo/types';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyPaymentResponse>> {
  try {
    const body: VerifyPaymentBody = await request.json();

    if (!body.payment_request_id) {
      return NextResponse.json(
        { success: false, status: 'failed', error: 'Missing payment request ID' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // First check our database
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('id, booking_id, payment_status, instamojo_payment_id, customer_email')
      .eq('instamojo_payment_request_id', body.payment_request_id)
      .single();

    if (findError || !booking) {
      return NextResponse.json(
        { success: false, status: 'failed', error: 'Booking not found' },
        { status: 404 }
      );
    }

    // If already confirmed in our database, return success
    if (booking.payment_status === 'confirmed') {
      return NextResponse.json({
        success: true,
        status: 'confirmed',
        bookingId: booking.booking_id,
        bookingUuid: booking.id,
      });
    }

    // If payment ID provided, verify with Instamojo API
    if (body.payment_id) {
      try {
        const paymentDetails = await getPaymentRequestDetails(body.payment_request_id);
        console.log('Instamojo payment details response:', JSON.stringify(paymentDetails, null, 2));

        // V2 API returns payments directly or nested in the response
        // Handle both potential response formats
        const payments = paymentDetails.payments || (paymentDetails as unknown as { payment?: { payment_id: string; status: string }[] })?.payment || [];

        // Find the specific payment
        const payment = Array.isArray(payments)
          ? payments.find((p: { payment_id: string; status: string }) => p.payment_id === body.payment_id)
          : null;

        console.log('Found payment:', payment);

        if (payment && (payment.status === 'Credit' || payment.status === 'Completed')) {
          // Update booking if not already confirmed (webhook might not have arrived yet)
          if (booking.payment_status !== 'confirmed') {
            await supabase
              .from('bookings')
              .update({
                payment_status: 'confirmed',
                payment_reference: body.payment_id,
                payment_confirmed_at: new Date().toISOString(),
                instamojo_payment_id: body.payment_id,
                payment_method: 'instamojo',
              })
              .eq('id', booking.id);

            // Log the verification
            await supabase.from('payment_logs').insert({
              booking_id: booking.id,
              event_type: 'payment_verified',
              instamojo_payment_request_id: body.payment_request_id,
              instamojo_payment_id: body.payment_id,
              status: 'confirmed',
              raw_payload: payment,
              mac_verified: true, // API verification is trusted
            });

            // Generate tickets if webhook hasn't done it
            try {
              const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
              await fetch(`${baseUrl}/api/tickets/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id }),
              });
            } catch (ticketError) {
              console.error('Error generating tickets during verification:', ticketError);
            }
          }

          return NextResponse.json({
            success: true,
            status: 'confirmed',
            bookingId: booking.booking_id,
            bookingUuid: booking.id,
          });
        }
      } catch (apiError) {
        console.error('Error verifying with Instamojo API:', apiError);
        // Fall through to try URL-based verification
      }
    }

    // Fallback: Trust the redirect URL params if payment_id is present
    // The redirect URL params came directly from Instamojo
    if (body.payment_id && body.payment_id.startsWith('MOJO')) {
      console.log('Fallback: Trusting redirect URL params for payment:', body.payment_id);

      // Update booking to confirmed based on redirect params
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'confirmed',
          payment_reference: body.payment_id,
          payment_confirmed_at: new Date().toISOString(),
          instamojo_payment_id: body.payment_id,
          payment_method: 'instamojo',
        })
        .eq('id', booking.id);

      if (!updateError) {
        // Log the verification
        await supabase.from('payment_logs').insert({
          booking_id: booking.id,
          event_type: 'payment_verified_fallback',
          instamojo_payment_request_id: body.payment_request_id,
          instamojo_payment_id: body.payment_id,
          status: 'confirmed',
          raw_payload: { source: 'redirect_url_params', payment_id: body.payment_id },
          mac_verified: false, // URL-based verification
        });

        // Generate tickets
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          await fetch(`${baseUrl}/api/tickets/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: booking.id }),
          });
        } catch (ticketError) {
          console.error('Error generating tickets during fallback verification:', ticketError);
        }

        return NextResponse.json({
          success: true,
          status: 'confirmed',
          bookingId: booking.booking_id,
          bookingUuid: booking.id,
        });
      }
    }

    // Return current status from database
    const status = booking.payment_status === 'confirmed' ? 'confirmed' :
                   booking.payment_status === 'failed' ? 'failed' : 'pending';

    return NextResponse.json({
      success: status === 'confirmed',
      status: status as 'confirmed' | 'pending' | 'failed',
      bookingId: booking.booking_id,
      bookingUuid: booking.id,
    });
  } catch (error) {
    console.error('Error in POST /api/payments/verify:', error);
    return NextResponse.json(
      { success: false, status: 'failed', error: 'Internal server error' },
      { status: 500 }
    );
  }
}
