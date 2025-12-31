import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

// DELETE - Delete a checked-in ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get the ticket first to check if it exists and get booking info
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select('id, booking_id, bookings:booking_id(source)')
      .eq('id', id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Delete the ticket
    const { error: deleteError } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting ticket:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete ticket' },
        { status: 500 }
      );
    }

    // If it's a walk-in booking, check if there are any remaining tickets
    const bookingsData = ticket.bookings as { source: string }[] | null;
    const booking = bookingsData?.[0] ?? null;
    if (booking?.source === 'walk-in') {
      const { count } = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('booking_id', ticket.booking_id);

      // If no tickets left, delete the walk-in booking too
      if (count === 0) {
        await supabase
          .from('bookings')
          .delete()
          .eq('id', ticket.booking_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/tickets/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
