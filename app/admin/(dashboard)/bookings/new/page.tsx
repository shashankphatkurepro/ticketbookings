'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, Percent, IndianRupee, Loader2, Pencil, Check, X } from 'lucide-react';
import { eventData } from '@/app/data/eventData';

interface TicketSelection {
  ticketId: string;
  ticketName: string;
  basePrice: number;
  customPrice: number;
  quantity: number;
}

export default function NewBookingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Ticket selections
  const [tickets, setTickets] = useState<TicketSelection[]>(
    eventData.tickets.map((t) => ({
      ticketId: t.id,
      ticketName: t.name,
      basePrice: t.price,
      customPrice: t.price,
      quantity: 0,
    }))
  );

  // Price editing state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Discount
  const [discountType, setDiscountType] = useState<'amount' | 'percentage'>('amount');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountNote, setDiscountNote] = useState('');

  // Payment status
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed'>('confirmed');
  const [notes, setNotes] = useState('');

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = tickets.reduce((sum, t) => sum + t.customPrice * t.quantity, 0);
    let discountAmount = 0;
    let discountPercentage = 0;

    if (discountType === 'amount') {
      discountAmount = Math.min(discountValue, subtotal);
      discountPercentage = subtotal > 0 ? (discountAmount / subtotal) * 100 : 0;
    } else {
      discountPercentage = Math.min(discountValue, 100);
      discountAmount = (subtotal * discountPercentage) / 100;
    }

    const total = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      discountPercentage,
      total: Math.max(0, total),
    };
  }, [tickets, discountType, discountValue]);

  const updateQuantity = (ticketId: string, delta: number) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId
          ? { ...t, quantity: Math.max(0, t.quantity + delta) }
          : t
      )
    );
  };

  const startEditingPrice = (ticketId: string, currentPrice: number) => {
    setEditingPriceId(ticketId);
    setTempPrice(currentPrice);
  };

  const savePrice = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId
          ? { ...t, customPrice: Math.max(0, tempPrice) }
          : t
      )
    );
    setEditingPriceId(null);
  };

  const cancelEditingPrice = () => {
    setEditingPriceId(null);
  };

  const resetPrice = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId
          ? { ...t, customPrice: t.basePrice }
          : t
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!customerName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Customer phone is required');
      return;
    }

    const selectedTickets = tickets.filter((t) => t.quantity > 0);
    if (selectedTickets.length === 0) {
      setError('Please select at least one ticket');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim() || `${customerPhone.trim()}@admin.booking`,
          customer_phone: customerPhone.trim(),
          items: selectedTickets.map((t) => ({
            ticketId: t.ticketId,
            ticketName: t.ticketName,
            price: t.customPrice,
            quantity: t.quantity,
          })),
          group_booking: null,
          subtotal: calculations.subtotal,
          group_total: 0,
          total_amount: calculations.total,
          discount_amount: calculations.discountAmount,
          discount_percentage: calculations.discountPercentage,
          discount_note: discountNote.trim() || null,
          payment_status: paymentStatus,
          notes: notes.trim() || null,
          source: 'admin',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirect to the booking detail page
      router.push(`/admin/bookings/${data.booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href="/admin/bookings"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Create Booking</h1>
          <p className="text-gray-400 mt-1 text-sm md:text-base hidden sm:block">Create a manual booking with custom discount</p>
        </div>
      </div>

      {error && (
        <div className="p-3 md:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="+91 XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* Ticket Selection */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4">Select Tickets</h2>
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div
                key={ticket.ticketId}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 bg-gray-800 rounded-lg gap-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">{ticket.ticketName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {editingPriceId === ticket.ticketId ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={tempPrice}
                          onChange={(e) => setTempPrice(Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              savePrice(ticket.ticketId);
                            } else if (e.key === 'Escape') {
                              cancelEditingPrice();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => savePrice(ticket.ticketId)}
                          className="p-1 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded transition-colors"
                          title="Save price"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingPrice}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${ticket.customPrice !== ticket.basePrice ? 'text-yellow-400' : 'text-gray-400'}`}>
                          ₹{ticket.customPrice.toLocaleString()} per ticket
                        </span>
                        {ticket.customPrice !== ticket.basePrice && (
                          <span className="text-xs text-gray-500 line-through">
                            ₹{ticket.basePrice.toLocaleString()}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => startEditingPrice(ticket.ticketId, ticket.customPrice)}
                          className="p-1 text-gray-500 hover:text-purple-400 hover:bg-gray-700 rounded transition-colors"
                          title="Edit price"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        {ticket.customPrice !== ticket.basePrice && (
                          <button
                            type="button"
                            onClick={() => resetPrice(ticket.ticketId)}
                            className="text-xs text-gray-500 hover:text-gray-300 underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(ticket.ticketId, -1)}
                    disabled={ticket.quantity === 0}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-white">
                    {ticket.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(ticket.ticketId, 1)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {ticket.quantity > 0 && (
                    <span className="ml-2 text-purple-400 font-medium min-w-[80px] text-right">
                      ₹{(ticket.customPrice * ticket.quantity).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discount */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4">Discount</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Discount Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('amount')}
                  className={`flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2.5 rounded-lg border transition-colors text-sm md:text-base ${
                    discountType === 'amount'
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <IndianRupee className="w-4 h-4" />
                  <span className="hidden sm:inline">Fixed</span> Amount
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`flex-1 flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2.5 rounded-lg border transition-colors text-sm md:text-base ${
                    discountType === 'percentage'
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <Percent className="w-4 h-4" />
                  Percentage
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Discount Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {discountType === 'amount' ? '₹' : '%'}
                </span>
                <input
                  type="number"
                  min="0"
                  max={discountType === 'percentage' ? 100 : undefined}
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Discount Note (optional)
              </label>
              <input
                type="text"
                value={discountNote}
                onChange={(e) => setDiscountNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Corporate discount"
              />
            </div>
          </div>
        </div>

        {/* Payment & Notes */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4">Payment & Notes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as 'pending' | 'confirmed')}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="confirmed">Confirmed (Paid)</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Internal Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Any internal notes..."
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal ({totalTickets} tickets)</span>
              <span>₹{calculations.subtotal.toLocaleString()}</span>
            </div>
            {calculations.discountAmount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>
                  Discount
                  {discountType === 'percentage' && ` (${calculations.discountPercentage.toFixed(1)}%)`}
                </span>
                <span>-₹{calculations.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-semibold text-white">
              <span>Total</span>
              <span>₹{calculations.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <Link
            href="/admin/bookings"
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || totalTickets === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Booking
          </button>
        </div>
      </form>
    </div>
  );
}
