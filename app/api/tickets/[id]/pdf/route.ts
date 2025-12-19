import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { generateTicketPdf } from '@/app/lib/services/ticketPdfGenerator';

// GET - Download ticket PDF
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get ticket with booking info
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select(`
        *,
        bookings:booking_id (*)
      `)
      .eq('ticket_id', id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    const booking = ticket.bookings;

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generateTicketPdf({
      ticket: {
        id: ticket.id,
        ticket_id: ticket.ticket_id,
        booking_id: ticket.booking_id,
        ticket_type: ticket.ticket_type,
        ticket_price: ticket.ticket_price,
        attendee_number: ticket.attendee_number,
        qr_code_data: ticket.qr_code_data,
        is_used: ticket.is_used,
        used_at: ticket.used_at,
        used_by: ticket.used_by,
        created_at: ticket.created_at,
      },
      booking: booking,
    });

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ticket-${ticket.ticket_id}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating ticket PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate ticket PDF' },
      { status: 500 }
    );
  }
}
