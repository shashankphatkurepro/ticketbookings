import { NextResponse } from 'next/server';
import { createAdminClient } from '@/app/lib/supabase/admin';

// GET - Dashboard analytics
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Get booking stats
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, total_amount, payment_status, tickets_generated');

    if (bookingsError) {
      console.error('Error fetching bookings stats:', bookingsError);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Get ticket stats
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, is_used');

    if (ticketsError) {
      console.error('Error fetching tickets stats:', ticketsError);
    }

    // Calculate stats
    const totalBookings = bookings?.length || 0;
    const confirmedBookings = bookings?.filter(b => b.payment_status === 'confirmed').length || 0;
    const pendingBookings = bookings?.filter(b => b.payment_status === 'pending').length || 0;
    const refundedBookings = bookings?.filter(b => b.payment_status === 'refunded').length || 0;
    const totalRevenue = bookings
      ?.filter(b => b.payment_status === 'confirmed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;

    const ticketsGenerated = tickets?.length || 0;
    const ticketsUsed = tickets?.filter(t => t.is_used).length || 0;

    // Get recent bookings for dashboard
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('id, booking_id, customer_name, total_amount, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      stats: {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        refundedBookings,
        totalRevenue,
        ticketsGenerated,
        ticketsUsed,
      },
      recentBookings: recentBookings || [],
    });
  } catch (error) {
    console.error('Error in GET /api/analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
