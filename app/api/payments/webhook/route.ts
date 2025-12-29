import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  verifyWebhookSignature,
  formDataToObject,
  parseWebhookPayload,
} from '@/app/lib/instamojo/client';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // Parse form data from webhook
    const formData = await request.formData();
    const payload = parseWebhookPayload(formData);
    const rawData = formDataToObject(formData);

    console.log('Received Instamojo webhook:', {
      payment_id: payload.payment_id,
      payment_request_id: payload.payment_request_id,
      status: payload.status,
    });

    // Verify MAC signature
    const isValid = verifyWebhookSignature(rawData, payload.mac);

    // Log the webhook event
    await supabase.from('payment_logs').insert({
      instamojo_payment_request_id: payload.payment_request_id,
      instamojo_payment_id: payload.payment_id,
      event_type: 'webhook_received',
      status: payload.status,
      raw_payload: rawData,
      mac_verified: isValid,
    });

    if (!isValid) {
      console.error('Invalid MAC signature for webhook');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Find the booking by payment request ID
    const { data: booking, error: findError } = await supabase
      .from('bookings')
      .select('*')
      .eq('instamojo_payment_request_id', payload.payment_request_id)
      .single();

    if (findError || !booking) {
      console.error('Booking not found for payment request:', payload.payment_request_id);
      // Still return 200 to prevent Instamojo from retrying
      return NextResponse.json({ status: 'booking_not_found' });
    }

    // Update booking based on payment status
    if (payload.status === 'Credit') {
      // Payment successful
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'confirmed',
          payment_reference: payload.payment_id,
          payment_confirmed_at: new Date().toISOString(),
          instamojo_payment_id: payload.payment_id,
          payment_method: 'instamojo',
          payment_fees: parseFloat(payload.fees) || 0,
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('Error updating booking:', updateError);
        return NextResponse.json(
          { error: 'Failed to update booking' },
          { status: 500 }
        );
      }

      // Update payment log with booking_id
      await supabase
        .from('payment_logs')
        .update({ booking_id: booking.id })
        .eq('instamojo_payment_request_id', payload.payment_request_id)
        .eq('instamojo_payment_id', payload.payment_id);

      // Auto-generate tickets
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const ticketResponse = await fetch(`${baseUrl}/api/tickets/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: booking.id }),
        });

        if (!ticketResponse.ok) {
          console.error('Failed to generate tickets:', await ticketResponse.text());
        } else {
          console.log('Tickets generated successfully for booking:', booking.booking_id);
        }
      } catch (ticketError) {
        console.error('Error generating tickets:', ticketError);
        // Don't fail the webhook - tickets can be generated manually
      }

      console.log('Payment confirmed for booking:', booking.booking_id);
    } else {
      // Payment failed
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          payment_status: 'failed',
          payment_reference: payload.payment_id,
          instamojo_payment_id: payload.payment_id,
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('Error updating booking:', updateError);
      }

      console.log('Payment failed for booking:', booking.booking_id);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    // Return 200 anyway to prevent Instamojo from retrying on our errors
    return NextResponse.json({ status: 'error', message: 'Internal error' });
  }
}

// Handle GET requests (Instamojo sometimes sends GET for verification)
export async function GET() {
  return NextResponse.json({ status: 'Webhook endpoint active' });
}
