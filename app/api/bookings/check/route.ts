import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Check if there's a booking with this phone number
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, payment_status')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (bookingError && bookingError.code !== 'PGRST116') {
      console.error('Booking check error:', bookingError);
    }

    const isBooked = !!booking;

    // Check if there's a ticket for this booking
    let hasTicket = false;
    if (booking) {
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .select('id')
        .eq('booking_id', booking.id)
        .limit(1)
        .single();

      if (ticketError && ticketError.code !== 'PGRST116') {
        console.error('Ticket check error:', ticketError);
      }

      hasTicket = !!ticket;
    }

    return NextResponse.json({
      isBooked,
      hasTicket,
      paymentStatus: booking?.payment_status || null,
    });
  } catch (error) {
    console.error('Check booking error:', error);
    return NextResponse.json({ error: 'Failed to check booking status' }, { status: 500 });
  }
}
