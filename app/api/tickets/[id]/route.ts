import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

// GET - Verify ticket (public endpoint for QR code scanning)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get ticket with booking info
    const { data: ticket, error } = await supabase
      .from('tickets')
      .select(`
        *,
        bookings:booking_id (
          booking_id,
          customer_name,
          payment_status
        )
      `)
      .eq('ticket_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            valid: false,
            error: 'Ticket not found',
            message: 'This ticket does not exist in our system.'
          },
          { status: 404 }
        );
      }
      console.error('Error fetching ticket:', error);
      return NextResponse.json(
        { valid: false, error: 'Failed to verify ticket' },
        { status: 500 }
      );
    }

    // Check if ticket is valid
    const booking = ticket.bookings as { booking_id: string; customer_name: string; payment_status: string } | null;

    if (!booking || booking.payment_status !== 'confirmed') {
      return NextResponse.json({
        valid: false,
        ticket_id: ticket.ticket_id,
        message: 'Payment not confirmed for this booking.',
      });
    }

    if (ticket.is_used) {
      return NextResponse.json({
        valid: false,
        ticket_id: ticket.ticket_id,
        ticket_type: ticket.ticket_type,
        used_at: ticket.used_at,
        message: 'This ticket has already been used.',
      });
    }

    return NextResponse.json({
      valid: true,
      ticket_id: ticket.ticket_id,
      ticket_type: ticket.ticket_type,
      attendee_number: ticket.attendee_number,
      booking_id: booking.booking_id,
      guest_name: booking.customer_name,
      message: 'Ticket is valid and can be used for entry.',
    });
  } catch (error) {
    console.error('Error in GET /api/tickets/[id]:', error);
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
