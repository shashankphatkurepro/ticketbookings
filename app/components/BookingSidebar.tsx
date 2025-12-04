'use client';

import { useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { eventData } from '../data/eventData';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Minus, Plus, Ticket, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';

export default function BookingSidebar() {
  const { booking, addToCart, removeFromCart, getTotalAmount, getTotalItems } = useBooking();

  // Generate random availability numbers around 60 for each ticket
  const fakeAvailability = useMemo(() => {
    return eventData.tickets.reduce((acc, ticket) => {
      acc[ticket.id] = Math.floor(Math.random() * 30) + 45; // 45-74 range
      return acc;
    }, {} as Record<string, number>);
  }, []);

  const getTicketQuantity = (ticketId: string) => {
    const item = booking.items.find((i) => i.ticketId === ticketId);
    return item?.quantity || 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalItems = getTotalItems();
  const totalAmount = getTotalAmount();

  return (
    <div id="tickets" className="glass-strong rounded-3xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Get Tickets
          </h3>
          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Limited Seats
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Calendar className="w-4 h-4 text-white/80 mx-auto mb-1" />
            <p className="text-white text-xs font-medium">31 Dec</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <Clock className="w-4 h-4 text-white/80 mx-auto mb-1" />
            <p className="text-white text-xs font-medium">7:00 PM</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <MapPin className="w-4 h-4 text-white/80 mx-auto mb-1" />
            <p className="text-white text-xs font-medium">Chowk, Karjat</p>
          </div>
        </div>
      </div>

      {/* Ticket Selection */}
      <div className="p-5">
        {/* Price Increase Warning */}
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-amber-600 text-sm font-semibold">⚡ Price Increase Alert</span>
          </div>
          <p className="text-xs text-amber-800 mt-1">25% additional after 15th December</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Select Tickets</h4>
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Max 10 per order</span>
        </div>

        <div className="space-y-3">
          {eventData.tickets.map((ticket) => {
            const qty = getTicketQuantity(ticket.id);
            const isSelected = qty > 0;
            const discount = Math.round(((ticket.originalPrice - ticket.price) / ticket.originalPrice) * 100);

            return (
              <div
                key={ticket.id}
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  isSelected
                    ? 'bg-indigo-50 ring-2 ring-indigo-200 shadow-md'
                    : 'glass-card hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-semibold text-gray-800">{ticket.name}</h5>
                      {ticket.popular && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5" />
                          Popular
                        </span>
                      )}
                      {discount > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-green-100 text-green-700 rounded-full">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{ticket.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-800">{formatPrice(ticket.price)}</span>
                      {ticket.originalPrice > ticket.price && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(ticket.originalPrice)}</span>
                      )}
                    </div>
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      {fakeAvailability[ticket.id]} left
                    </span>
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(ticket.id, ticket.name, ticket.price)}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center bg-indigo-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => removeFromCart(ticket.id)}
                        className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-indigo-700">{qty}</span>
                      <button
                        onClick={() => addToCart(ticket.id, ticket.name, ticket.price)}
                        disabled={qty >= ticket.maxPerOrder}
                        className="w-10 h-10 flex items-center justify-center text-indigo-600 hover:bg-indigo-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      {totalItems > 0 ? (
        <div className="border-t border-gray-200 p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-sm text-gray-600">{totalItems} Ticket{totalItems > 1 ? 's' : ''} Selected</span>
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(totalAmount)}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-medium">Ready to book</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl text-white text-lg font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 transition-all hover:-translate-y-0.5"
          >
            <ShoppingBag className="w-5 h-5" />
            Proceed to Book
          </Link>
          <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
            Secure checkout · Instant confirmation
          </p>
        </div>
      ) : (
        <div className="border-t border-gray-200 p-6 bg-white text-center">
          <p className="text-sm text-gray-500 mb-1">Prices starting from</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            {formatPrice(Math.min(...eventData.tickets.map((t) => t.price)))}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4" />
            Selling Fast · Book Now
          </div>
        </div>
      )}
    </div>
  );
}
