import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

// GET - Get single booking with tickets
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to fetch booking' },
        { status: 500 }
      );
    }

    // Get associated tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .eq('booking_id', id)
      .order('attendee_number', { ascending: true });

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
    }

    return NextResponse.json({
      booking,
      tickets: tickets || [],
    });
  } catch (error) {
    console.error('Error in GET /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (confirm payment, refund, add notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Handle payment confirmation
    if (body.action === 'confirm_payment') {
      updateData.payment_status = 'confirmed';
      updateData.payment_confirmed_at = new Date().toISOString();
      if (body.payment_reference) {
        updateData.payment_reference = body.payment_reference;
      }
    }

    // Handle refund
    if (body.action === 'refund') {
      updateData.payment_status = 'refunded';
      updateData.refund_status = body.refund_type || 'full';
      updateData.refund_amount = body.refund_amount || 0;
      updateData.refund_reason = body.refund_reason || null;
    }

    // Handle notes update
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // Handle tickets generated flag
    if (body.tickets_generated !== undefined) {
      updateData.tickets_generated = body.tickets_generated;
    }

    // Handle tickets sent flag
    if (body.tickets_sent !== undefined) {
      updateData.tickets_sent = body.tickets_sent;
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating booking:', error);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error('Error in PATCH /api/bookings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
