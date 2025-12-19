export interface Booking {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: BookingItem[];
  group_booking: GroupBooking | null;
  subtotal: number;
  group_total: number;
  total_amount: number;
  payment_status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  payment_reference: string | null;
  payment_confirmed_at: string | null;
  refund_status: 'none' | 'partial' | 'full';
  refund_amount: number;
  refund_reason: string | null;
  tickets_generated: boolean;
  tickets_sent: boolean;
  notes: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface BookingItem {
  ticketId: string;
  ticketName: string;
  price: number;
  quantity: number;
}

export interface GroupBooking {
  nonAlcoholCount: number;
  maleCount: number;
  femaleCount: number;
}

export interface Ticket {
  id: string;
  ticket_id: string;
  booking_id: string;
  ticket_type: string;
  ticket_price: number;
  attendee_number: number;
  qr_code_data: string;
  is_used: boolean;
  used_at: string | null;
  used_by: string | null;
  created_at: string;
}

export interface CreateBookingInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items: BookingItem[];
  group_booking: GroupBooking | null;
  subtotal: number;
  group_total: number;
  total_amount: number;
  source?: string;
}

export interface BookingWithTickets extends Booking {
  tickets: Ticket[];
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  confirmedBookings: number;
  pendingBookings: number;
  ticketsGenerated: number;
  ticketsUsed: number;
}
