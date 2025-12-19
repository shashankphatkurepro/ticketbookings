import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { nanoid } from 'nanoid';
import { Booking, BookingItem } from '@/app/lib/supabase/types';

// Pricing functions (same as in BookingContext)
const getNonAlcoholPrice = (count: number) => {
  if (count >= 20) return 1199;
  if (count >= 10) return 1299;
  if (count >= 5) return 1399;
  return 1499;
};

const getMalePrice = (count: number) => {
  if (count >= 10) return 2999;
  if (count >= 5) return 3199;
  return 3499;
};

const getFemalePrice = (count: number) => {
  if (count >= 10) return 2199;
  if (count >= 5) return 2399;
  return 2499;
};

function generateTicketId(): string {
  const random = nanoid(8).toUpperCase();
  return `TKT-${random}`;
}

// POST - Generate tickets for a booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if tickets already generated
    if (booking.tickets_generated) {
      return NextResponse.json(
        { error: 'Tickets already generated for this booking' },
        { status: 400 }
      );
    }

    // Check if payment is confirmed
    if (booking.payment_status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Payment must be confirmed before generating tickets' },
        { status: 400 }
      );
    }

    const ticketsToCreate: {
      ticket_id: string;
      booking_id: string;
      ticket_type: string;
      ticket_price: number;
      attendee_number: number;
      qr_code_data: string;
    }[] = [];

    let attendeeNumber = 1;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Generate tickets for regular items
    const items = (booking as Booking).items as BookingItem[];
    if (items && items.length > 0) {
      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketId = generateTicketId();
          ticketsToCreate.push({
            ticket_id: ticketId,
            booking_id: bookingId,
            ticket_type: item.ticketName,
            ticket_price: item.price,
            attendee_number: attendeeNumber++,
            qr_code_data: `${baseUrl}/api/tickets/${ticketId}`,
          });
        }
      }
    }

    // Generate tickets for group bookings
    const groupBooking = (booking as Booking).group_booking;
    if (groupBooking) {
      // Non-alcohol group
      if (groupBooking.nonAlcoholCount > 0) {
        const price = getNonAlcoholPrice(groupBooking.nonAlcoholCount);
        for (let i = 0; i < groupBooking.nonAlcoholCount; i++) {
          const ticketId = generateTicketId();
          ticketsToCreate.push({
            ticket_id: ticketId,
            booking_id: bookingId,
            ticket_type: 'Group - Without Alcohol',
            ticket_price: price,
            attendee_number: attendeeNumber++,
            qr_code_data: `${baseUrl}/api/tickets/${ticketId}`,
          });
        }
      }

      // Male group
      if (groupBooking.maleCount > 0) {
        const price = getMalePrice(groupBooking.maleCount);
        for (let i = 0; i < groupBooking.maleCount; i++) {
          const ticketId = generateTicketId();
          ticketsToCreate.push({
            ticket_id: ticketId,
            booking_id: bookingId,
            ticket_type: 'Group - Male (with drinks)',
            ticket_price: price,
            attendee_number: attendeeNumber++,
            qr_code_data: `${baseUrl}/api/tickets/${ticketId}`,
          });
        }
      }

      // Female group
      if (groupBooking.femaleCount > 0) {
        const price = getFemalePrice(groupBooking.femaleCount);
        for (let i = 0; i < groupBooking.femaleCount; i++) {
          const ticketId = generateTicketId();
          ticketsToCreate.push({
            ticket_id: ticketId,
            booking_id: bookingId,
            ticket_type: 'Group - Female (with drinks)',
            ticket_price: price,
            attendee_number: attendeeNumber++,
            qr_code_data: `${baseUrl}/api/tickets/${ticketId}`,
          });
        }
      }
    }

    if (ticketsToCreate.length === 0) {
      return NextResponse.json(
        { error: 'No tickets to generate' },
        { status: 400 }
      );
    }

    // Insert all tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsToCreate)
      .select();

    if (ticketsError) {
      console.error('Error creating tickets:', ticketsError);
      return NextResponse.json(
        { error: 'Failed to generate tickets' },
        { status: 500 }
      );
    }

    // Update booking to mark tickets as generated
    await supabase
      .from('bookings')
      .update({ tickets_generated: true, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    return NextResponse.json({
      message: 'Tickets generated successfully',
      tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error('Error in POST /api/tickets/generate:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
