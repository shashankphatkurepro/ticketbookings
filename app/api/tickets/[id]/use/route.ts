import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

// POST - Mark ticket as used (at entry gate)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const usedBy = body.usedBy || 'admin';

    const supabase = createAdminClient();

    // First verify the ticket exists and is valid
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select(`
        *,
        bookings:booking_id (
          payment_status
        )
      `)
      .eq('ticket_id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Ticket not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to verify ticket' },
        { status: 500 }
      );
    }

    // Check if payment is confirmed
    const booking = ticket.bookings as { payment_status: string } | null;
    if (!booking || booking.payment_status !== 'confirmed') {
      return NextResponse.json({
        success: false,
        error: 'Payment not confirmed',
        message: 'Cannot use ticket - payment has not been confirmed.',
      });
    }

    // Check if already used
    if (ticket.is_used) {
      return NextResponse.json({
        success: false,
        error: 'Already used',
        message: 'This ticket has already been used.',
        used_at: ticket.used_at,
        used_by: ticket.used_by,
      });
    }

    // Mark as used
    const { data, error: updateError } = await supabase
      .from('tickets')
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
        used_by: usedBy,
      })
      .eq('ticket_id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error marking ticket as used:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to mark ticket as used' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ticket marked as used successfully',
      ticket: {
        ticket_id: data.ticket_id,
        ticket_type: data.ticket_type,
        attendee_number: data.attendee_number,
        used_at: data.used_at,
      },
    });
  } catch (error) {
    console.error('Error in POST /api/tickets/[id]/use:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
