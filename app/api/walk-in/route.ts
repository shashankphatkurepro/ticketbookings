import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';
import { nanoid } from 'nanoid';

interface TicketItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

interface WalkInRequest {
  name: string;
  email?: string;
  phone: string;
  notes?: string;
  items: TicketItem[];
  total_amount: number;
}

// POST - Create walk-in entry
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as WalkInRequest;

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }
    if (!body.phone?.trim()) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one ticket is required' },
        { status: 400 }
      );
    }

    // Validate items
    for (const item of body.items) {
      if (!item.ticketId || !item.ticketName || item.quantity < 1) {
        return NextResponse.json(
          { error: 'Invalid ticket item' },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    // Create a virtual booking for walk-in people
    const bookingId = `WI-${nanoid(8)}`;

    // Calculate totals
    const subtotal = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalQuantity = body.items.reduce((sum, item) => sum + item.quantity, 0);

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        booking_id: bookingId,
        customer_name: body.name,
        customer_email: body.email || `${body.phone}@walk-in.local`,
        customer_phone: body.phone,
        items: body.items,
        subtotal: subtotal,
        group_total: 0,
        total_amount: body.total_amount || subtotal,
        discount_amount: 0,
        discount_percentage: 0,
        payment_status: 'confirmed',
        tickets_generated: true,
        tickets_sent: false,
        source: 'walk-in',
        notes: body.notes || null,
      })
      .select('id')
      .single();

    if (bookingError || !booking) {
      console.error('Error creating walk-in booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create walk-in booking' },
        { status: 500 }
      );
    }

    // Create tickets for walk-in entry (immediately marked as used)
    const tickets = [];
    let attendeeNumber = 1;

    for (const item of body.items) {
      for (let i = 0; i < item.quantity; i++) {
        tickets.push({
          ticket_id: `WI-${nanoid(10)}`,
          booking_id: booking.id,
          ticket_type: item.ticketName,
          ticket_price: item.price,
          attendee_number: attendeeNumber++,
          qr_code_data: `WI-${nanoid(10)}`,
          is_used: true,
          used_at: new Date().toISOString(),
          used_by: 'Walk-in',
        });
      }
    }

    const { error: ticketsError } = await supabase
      .from('tickets')
      .insert(tickets);

    if (ticketsError) {
      console.error('Error creating walk-in tickets:', ticketsError);
      // Clean up the booking if tickets fail
      await supabase.from('bookings').delete().eq('id', booking.id);
      return NextResponse.json(
        { error: 'Failed to create walk-in tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Walk-in entry added for ${body.name} with ${totalQuantity} ticket(s)`,
        booking_id: bookingId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing walk-in:', error);
    return NextResponse.json(
      { error: 'Failed to process walk-in entry' },
      { status: 500 }
    );
  }
}

// GET - Get all walk-in entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '15');

    const supabase = createAdminClient();
    const offset = (page - 1) * limit;

    // Get walk-in bookings
    const { data: walkIns, error: walkInError, count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact' })
      .eq('source', 'walk-in')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (walkInError) throw walkInError;

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      walk_ins: walkIns || [],
      total: count || 0,
      page,
      totalPages,
      limit,
    });
  } catch (error) {
    console.error('Error fetching walk-ins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch walk-in entries' },
      { status: 500 }
    );
  }
}
