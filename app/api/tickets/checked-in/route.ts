import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

// GET - Get all checked-in tickets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');
    const search = searchParams.get('search') || '';

    const supabase = createAdminClient();
    const offset = (page - 1) * limit;

    let query = supabase
      .from('tickets')
      .select(`
        id,
        ticket_id,
        booking_id,
        ticket_type,
        attendee_number,
        used_at,
        used_by,
        bookings:booking_id (
          id,
          customer_name,
          customer_email,
          customer_phone
        )
      `)
      .eq('is_used', true)
      .order('used_at', { ascending: false });

    if (search) {
      query = query.or(`
        ticket_id.ilike.%${search}%,
        bookings.customer_name.ilike.%${search}%,
        bookings.customer_email.ilike.%${search}%,
        bookings.customer_phone.ilike.%${search}%
      `);
    }

    // Get total count
    const { count, error: countError } = await supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('is_used', true);

    if (countError) throw countError;

    // Get paginated results
    const { data: tickets, error: ticketsError } = await query
      .range(offset, offset + limit - 1);

    if (ticketsError) throw ticketsError;

    // Transform the data to flatten booking info
    const transformedTickets = (tickets || []).map((ticket: any) => ({
      id: ticket.id,
      ticket_id: ticket.ticket_id,
      booking_id: ticket.booking_id,
      customer_name: ticket.bookings?.customer_name || 'Unknown',
      customer_email: ticket.bookings?.customer_email || 'N/A',
      customer_phone: ticket.bookings?.customer_phone || 'N/A',
      ticket_type: ticket.ticket_type,
      attendee_number: ticket.attendee_number,
      used_at: ticket.used_at,
      used_by: ticket.used_by,
      source: ticket.bookings?.source || 'booking',
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      tickets: transformedTickets,
      total: count || 0,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error('Error fetching checked-in tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch checked-in tickets' },
      { status: 500 }
    );
  }
}
