'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Ticket,
  Download,
  Loader2,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Booking, Ticket as TicketType, BookingItem } from '@/app/lib/supabase/types';

export default function BookingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${id}`);
      const data = await response.json();
      setBooking(data.booking);
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!paymentRef.trim()) {
      alert('Please enter a payment reference');
      return;
    }

    setActionLoading('confirm');
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm_payment',
          payment_reference: paymentRef,
        }),
      });

      if (response.ok) {
        await fetchBooking();
        setPaymentRef('');
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateTickets = async () => {
    setActionLoading('generate');
    try {
      const response = await fetch('/api/tickets/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: id }),
      });

      if (response.ok) {
        await fetchBooking();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to generate tickets');
      }
    } catch (error) {
      console.error('Failed to generate tickets:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefund = async () => {
    setActionLoading('refund');
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refund',
          refund_type: 'full',
          refund_amount: booking?.total_amount,
          refund_reason: refundReason,
        }),
      });

      if (response.ok) {
        await fetchBooking();
        setShowRefundModal(false);
        setRefundReason('');
      }
    } catch (error) {
      console.error('Failed to process refund:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      pending: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-400',
        icon: <RefreshCw className="w-4 h-4" />,
      },
      confirmed: {
        bg: 'bg-green-500/20',
        text: 'text-green-400',
        icon: <CheckCircle className="w-4 h-4" />,
      },
      refunded: {
        bg: 'bg-red-500/20',
        text: 'text-red-400',
        icon: <XCircle className="w-4 h-4" />,
      },
      failed: {
        bg: 'bg-gray-500/20',
        text: 'text-gray-400',
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    return styles[status] || styles.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-white">Booking not found</h2>
        <Link href="/admin/bookings" className="text-purple-400 hover:underline mt-2 inline-block">
          Back to bookings
        </Link>
      </div>
    );
  }

  const statusStyle = getStatusBadge(booking.payment_status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/bookings"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{booking.booking_id}</h1>
          <p className="text-gray-400">Created {formatDate(booking.created_at)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusStyle.bg} ${statusStyle.text} capitalize font-medium`}
        >
          {statusStyle.icon}
          {booking.payment_status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-white font-medium">{booking.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{booking.customer_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white font-medium">{booking.customer_phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Items */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Booking Items</h3>
            <div className="space-y-3">
              {booking.items && (booking.items as BookingItem[]).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{item.ticketName}</p>
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-white font-medium">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}

              {booking.group_booking && (
                <>
                  {booking.group_booking.nonAlcoholCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg">
                      <div>
                        <p className="text-emerald-300 font-medium">Group - Without Alcohol</p>
                        <p className="text-sm text-gray-400">
                          Qty: {booking.group_booking.nonAlcoholCount}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.group_booking.maleCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg">
                      <div>
                        <p className="text-emerald-300 font-medium">Group - Male (with drinks)</p>
                        <p className="text-sm text-gray-400">
                          Qty: {booking.group_booking.maleCount}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.group_booking.femaleCount > 0 && (
                    <div className="flex items-center justify-between p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg">
                      <div>
                        <p className="text-emerald-300 font-medium">Group - Female (with drinks)</p>
                        <p className="text-sm text-gray-400">
                          Qty: {booking.group_booking.femaleCount}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Subtotal */}
              {(booking.discount_amount > 0 || booking.subtotal > booking.total_amount) && (
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <p className="text-gray-300">Subtotal</p>
                  <p className="text-white">
                    ₹{(booking.subtotal || (booking.total_amount + (booking.discount_amount || 0))).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Discount */}
              {booking.discount_amount > 0 && (
                <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-800 rounded-lg">
                  <div>
                    <p className="text-green-300 font-medium">Discount Applied</p>
                    {booking.discount_note && (
                      <p className="text-sm text-gray-400">{booking.discount_note}</p>
                    )}
                    {booking.discount_percentage > 0 && (
                      <p className="text-xs text-gray-500">{booking.discount_percentage.toFixed(1)}% off</p>
                    )}
                  </div>
                  <p className="text-green-400 font-medium">
                    -₹{booking.discount_amount.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between p-3 bg-purple-900/20 border border-purple-800 rounded-lg">
                <p className="text-purple-300 font-semibold">Total Amount</p>
                <p className="text-white font-bold text-lg">
                  ₹{booking.total_amount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tickets */}
          {tickets.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">
                Generated Tickets ({tickets.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 rounded-lg border ${
                      ticket.is_used
                        ? 'bg-gray-800/50 border-gray-700'
                        : 'bg-gray-800 border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-sm text-white">{ticket.ticket_id}</p>
                        <p className="text-sm text-gray-400">{ticket.ticket_type}</p>
                        <p className="text-xs text-gray-500">
                          Attendee #{ticket.attendee_number}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.is_used
                            ? 'bg-gray-600/20 text-gray-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {ticket.is_used ? 'Used' : 'Valid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment
            </h3>

            {booking.payment_status === 'pending' && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="Payment reference / Transaction ID"
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={handleConfirmPayment}
                  disabled={actionLoading === 'confirm'}
                  className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {actionLoading === 'confirm' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Confirm Payment
                </button>
              </div>
            )}

            {booking.payment_status === 'confirmed' && (
              <div className="space-y-3">
                {booking.payment_reference && (
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-400">Reference</p>
                    <p className="text-white font-mono">{booking.payment_reference}</p>
                  </div>
                )}
                {booking.payment_confirmed_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Confirmed: {formatDate(booking.payment_confirmed_at)}
                  </div>
                )}
              </div>
            )}

            {booking.payment_status === 'refunded' && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400 font-medium">Refunded</p>
                {booking.refund_reason && (
                  <p className="text-sm text-gray-400 mt-1">{booking.refund_reason}</p>
                )}
              </div>
            )}
          </div>

          {/* Ticket Actions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              Tickets
            </h3>

            {!booking.tickets_generated && booking.payment_status === 'confirmed' && (
              <button
                onClick={handleGenerateTickets}
                disabled={actionLoading === 'generate'}
                className="w-full py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading === 'generate' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Ticket className="w-5 h-5" />
                )}
                Generate Tickets
              </button>
            )}

            {booking.tickets_generated && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>{tickets.length} tickets generated</span>
                </div>
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-3 bg-gray-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400">Ticket ID</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          ticket.is_used
                            ? 'bg-gray-600/20 text-gray-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {ticket.is_used ? 'Used' : 'Valid'}
                      </span>
                    </div>
                    <p className="font-mono text-white text-sm">{ticket.ticket_id}</p>
                    <p className="text-xs text-gray-500">{ticket.ticket_type} • Attendee #{ticket.attendee_number}</p>
                    <a
                      href={`/api/tickets/${ticket.ticket_id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2 mt-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Ticket
                    </a>
                  </div>
                ))}
              </div>
            )}

            {!booking.tickets_generated && booking.payment_status !== 'confirmed' && (
              <p className="text-sm text-gray-400">
                Payment must be confirmed before generating tickets.
              </p>
            )}
          </div>

          {/* Other Actions */}
          {booking.payment_status === 'confirmed' && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Actions
              </h3>
              <button
                onClick={() => setShowRefundModal(true)}
                className="w-full py-2.5 bg-red-600/20 text-red-400 font-medium rounded-lg hover:bg-red-600/30 flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                Process Refund
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Process Refund</h3>
            <p className="text-gray-400 mb-4">
              Refund amount: ₹{booking.total_amount.toLocaleString()}
            </p>
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Reason for refund..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRefundModal(false)}
                className="flex-1 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={actionLoading === 'refund'}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {actionLoading === 'refund' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Confirm Refund'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
