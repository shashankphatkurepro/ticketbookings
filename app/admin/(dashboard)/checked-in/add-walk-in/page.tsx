'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, Loader2, Pencil, Check, X } from 'lucide-react';
import { eventData } from '@/app/data/eventData';

interface TicketSelection {
  ticketId: string;
  ticketName: string;
  basePrice: number;
  customPrice: number;
  quantity: number;
}

export default function AddWalkInPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Customer info
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

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

  // Phone validation
  const isValidPhone = (phone: string) => /^\d{10}$/.test(phone);
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
  };

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = tickets.reduce((sum, t) => sum + t.customPrice * t.quantity, 0);
    const totalTickets = tickets.reduce((sum, t) => sum + t.quantity, 0);
    return { subtotal, totalTickets };
  }, [tickets]);

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
    setSuccess(false);

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!phone.trim() || !isValidPhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    const selectedTickets = tickets.filter((t) => t.quantity > 0);
    if (selectedTickets.length === 0) {
      setError('Please select at least one ticket');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/walk-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          notes: notes.trim() || null,
          items: selectedTickets.map((t) => ({
            ticketId: t.ticketId,
            ticketName: t.ticketName,
            price: t.customPrice,
            quantity: t.quantity,
          })),
          total_amount: calculations.subtotal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add walk-in entry');
      }

      setSuccess(true);

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setNotes('');
      setTickets(
        eventData.tickets.map((t) => ({
          ticketId: t.id,
          ticketName: t.name,
          basePrice: t.price,
          customPrice: t.price,
          quantity: 0,
        }))
      );

      // Redirect after short delay
      setTimeout(() => {
        router.push('/admin/checked-in');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add walk-in entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href="/admin/checked-in"
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Add Walk-in Entry</h1>
          <p className="text-gray-400 mt-1 text-sm hidden sm:block">Register a person entering without a booking</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
          <p className="text-green-400 font-medium">Walk-in entry added successfully! Redirecting...</p>
        </div>
      )}

      {error && (
        <div className="p-3 md:p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
        {/* Customer Information */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Phone <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  maxLength={10}
                  className={`w-full px-4 py-2.5 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    phone && !isValidPhone(phone)
                      ? 'border-yellow-500'
                      : phone && isValidPhone(phone)
                      ? 'border-green-500'
                      : 'border-gray-700'
                  }`}
                  placeholder="10 digit number"
                />
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                  phone.length === 10 ? 'text-green-400' : 'text-gray-500'
                }`}>
                  {phone.length}/10
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Any notes..."
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

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-white mb-4">Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-400">
              <span>Total Tickets</span>
              <span>{calculations.totalTickets}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-semibold text-white">
              <span>Total Amount</span>
              <span>₹{calculations.subtotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <Link
            href="/admin/checked-in"
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || calculations.totalTickets === 0}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Add Walk-in Entry
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
        <p className="text-purple-300 text-sm">
          <strong>Note:</strong> Walk-in entries are immediately marked as checked-in and will appear in the checked-in users list.
        </p>
      </div>
    </div>
  );
}
