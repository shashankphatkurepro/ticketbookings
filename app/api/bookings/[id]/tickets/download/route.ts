import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { generateTicketPdf } from '@/app/lib/services/ticketPdfGenerator';
import JSZip from 'jszip';

// GET - Download all tickets for a booking as ZIP
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get booking with tickets
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Get all tickets for this booking
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .eq('booking_id', id)
      .order('attendee_number', { ascending: true });

    if (ticketsError || !tickets || tickets.length === 0) {
      return NextResponse.json(
        { error: 'No tickets found for this booking' },
        { status: 404 }
      );
    }

    // Create ZIP file
    const zip = new JSZip();

    // Generate PDF for each ticket and add to ZIP
    for (const ticket of tickets) {
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

      // Add PDF to ZIP with filename
      zip.file(
        `ticket-${ticket.attendee_number}-${ticket.ticket_id}.pdf`,
        pdfBuffer
      );
    }

    // Generate ZIP buffer
    const zipBuffer = await zip.generateAsync({ type: 'arraybuffer' });

    // Return ZIP as download
    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${booking.booking_id}-tickets.zip"`,
        'Content-Length': zipBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating tickets ZIP:', error);
    return NextResponse.json(
      { error: 'Failed to generate tickets ZIP' },
      { status: 500 }
    );
  }
}
