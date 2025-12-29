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
  discount_amount: number;
  discount_percentage: number;
  discount_note: string | null;
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
  // Instamojo payment fields
  instamojo_payment_request_id: string | null;
  instamojo_payment_id: string | null;
  instamojo_payment_url: string | null;
  payment_method: string | null;
  payment_fees: number | null;
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
  discount_amount?: number;
  discount_percentage?: number;
  discount_note?: string;
  source?: string;
  payment_status?: 'pending' | 'confirmed' | 'failed' | 'refunded';
  notes?: string;
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

export interface PaymentLog {
  id: string;
  booking_id: string | null;
  event_type: 'request_created' | 'webhook_received' | 'payment_verified';
  instamojo_payment_request_id: string | null;
  instamojo_payment_id: string | null;
  status: string | null;
  raw_payload: Record<string, unknown>;
  mac_verified: boolean;
  created_at: string;
}
