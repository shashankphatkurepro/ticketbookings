'use client';

import { useMemo } from 'react';
import { useBooking } from '../context/BookingContext';
import { eventData } from '../data/eventData';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Minus, Plus, Ticket, ShoppingBag, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function BookingSidebar() {
  const { booking, addToCart, removeFromCart, getTotalAmount, getTotalItems, updateGroupCount, getGroupBookingTotal } = useBooking();

  // Get group booking from context
  const { nonAlcoholCount, maleCount: maleGroupCount, femaleCount: femaleGroupCount } = booking.groupBooking;

  // Local setters that call context
  const setNonAlcoholCount = (count: number) => updateGroupCount('nonAlcohol', count);
  const setMaleGroupCount = (count: number) => updateGroupCount('male', count);
  const setFemaleGroupCount = (count: number) => updateGroupCount('female', count);

  // Group pricing logic - Without Alcohol
  const getNonAlcoholPrice = (count: number) => {
    if (count >= 20) return 999;
    if (count >= 10) return 1099;
    if (count >= 5) return 1199;
    return 1299; // 1-4 people
  };

  // Group pricing logic - With Alcohol
  const getMalePrice = (count: number) => {
    if (count >= 10) return 2799;
    if (count >= 5) return 2999;
    return 3299; // 1-4 people
  };

  const getFemalePrice = (count: number) => {
    if (count >= 10) return 2099;
    if (count >= 5) return 2199;
    return 2299; // 1-4 people
  };

  const nonAlcoholTotal = nonAlcoholCount * getNonAlcoholPrice(nonAlcoholCount);
  const maleGroupTotal = maleGroupCount * getMalePrice(maleGroupCount);
  const femaleGroupTotal = femaleGroupCount * getFemalePrice(femaleGroupCount);
  const groupBookingTotal = getGroupBookingTotal();

  // Fixed availability numbers to avoid hydration mismatch
  const fakeAvailability = useMemo(() => {
    return eventData.tickets.reduce((acc, ticket, index) => {
      acc[ticket.id] = 25 + ((index * 7) % 30); // 45-74 range, deterministic
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

        {/* Separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-dashed border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Group Deals</span>
          </div>
        </div>

        {/* Group Booking Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[2px]">
          <div className="relative bg-white rounded-2xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Group Booking</h4>
                  <p className="text-xs text-gray-500">Food & drinks included</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Save More</span>
            </div>

            {/* Without Alcohol Group */}
            <div className={`p-4 rounded-xl mb-3 transition-all duration-300 ${
              nonAlcoholCount > 0
                ? 'bg-gradient-to-r from-amber-50 to-orange-50 ring-2 ring-amber-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                    nonAlcoholCount > 0 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    🍽️
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 text-xs">Without Alcohol</h5>
                    <p className="text-xs text-gray-400">Food only</p>
                  </div>
                </div>
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200">
                  <button
                    onClick={() => setNonAlcoholCount(Math.max(0, nonAlcoholCount - 1))}
                    disabled={nonAlcoholCount === 0}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-xl transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800 text-lg">{nonAlcoholCount}</span>
                  <button
                    onClick={() => setNonAlcoholCount(Math.min(30, nonAlcoholCount + 1))}
                    disabled={nonAlcoholCount >= 30}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-xl transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-800">{formatPrice(getNonAlcoholPrice(nonAlcoholCount))}</span>
                  <span className="text-sm text-gray-500">/head</span>
                  {nonAlcoholCount >= 20 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">BEST RATE</span>
                  )}
                </div>
                {nonAlcoholCount > 0 && (
                  <div className="text-right">
                    <span className="text-lg font-bold text-amber-600">{formatPrice(nonAlcoholTotal)}</span>
                  </div>
                )}
              </div>
              {/* Non-Alcohol Pricing Tiers */}
              <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-4 gap-1">
                <div className={`rounded p-1.5 text-center ${nonAlcoholCount >= 1 && nonAlcoholCount <= 4 ? 'bg-amber-100' : 'bg-gray-50'}`}>
                  <p className="text-[9px] text-gray-400">1-4</p>
                  <p className="text-[10px] text-gray-700 font-bold">₹1,499</p>
                </div>
                <div className={`rounded p-1.5 text-center ${nonAlcoholCount >= 5 && nonAlcoholCount <= 9 ? 'bg-amber-100' : 'bg-gray-50'}`}>
                  <p className="text-[9px] text-gray-400">5-9</p>
                  <p className="text-[10px] text-gray-700 font-bold">₹1,399</p>
                </div>
                <div className={`rounded p-1.5 text-center ${nonAlcoholCount >= 10 && nonAlcoholCount <= 19 ? 'bg-amber-100' : 'bg-gray-50'}`}>
                  <p className="text-[9px] text-gray-400">10-19</p>
                  <p className="text-[10px] text-gray-700 font-bold">₹1,299</p>
                </div>
                <div className={`rounded p-1.5 text-center ${nonAlcoholCount >= 20 ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-200' : 'bg-gray-50'}`}>
                  <p className="text-[9px] text-emerald-600">20-30</p>
                  <p className="text-[10px] text-emerald-700 font-bold">₹1,199</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] text-gray-400 font-semibold uppercase">With Alcohol</span>
              </div>
            </div>

            {/* Male Group */}
            <div className={`p-4 rounded-xl mb-3 transition-all duration-300 ${
              maleGroupCount > 0
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    maleGroupCount > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    M
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800">Male</h5>
                    <p className="text-[10px] text-gray-400">With food & drinks</p>
                  </div>
                </div>
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200">
                  <button
                    onClick={() => setMaleGroupCount(Math.max(0, maleGroupCount - 1))}
                    disabled={maleGroupCount === 0}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-xl transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800 text-lg">{maleGroupCount}</span>
                  <button
                    onClick={() => setMaleGroupCount(Math.min(20, maleGroupCount + 1))}
                    disabled={maleGroupCount >= 20}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-xl transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-800">{formatPrice(getMalePrice(maleGroupCount))}</span>
                  <span className="text-sm text-gray-500">/head</span>
                  {maleGroupCount >= 10 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">BEST RATE</span>
                  )}
                </div>
                {maleGroupCount > 0 && (
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">{formatPrice(maleGroupTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Female Group */}
            <div className={`p-4 rounded-xl transition-all duration-300 ${
              femaleGroupCount > 0
                ? 'bg-gradient-to-r from-pink-50 to-rose-50 ring-2 ring-pink-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    femaleGroupCount > 0 ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    F
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-800">Female</h5>
                    <p className="text-[10px] text-gray-400">With food & drinks</p>
                  </div>
                </div>
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200">
                  <button
                    onClick={() => setFemaleGroupCount(Math.max(0, femaleGroupCount - 1))}
                    disabled={femaleGroupCount === 0}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-l-xl transition-colors disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-gray-800 text-lg">{femaleGroupCount}</span>
                  <button
                    onClick={() => setFemaleGroupCount(Math.min(20, femaleGroupCount + 1))}
                    disabled={femaleGroupCount >= 20}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-r-xl transition-colors disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-800">{formatPrice(getFemalePrice(femaleGroupCount))}</span>
                  <span className="text-sm text-gray-500">/head</span>
                  {femaleGroupCount >= 10 && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">BEST RATE</span>
                  )}
                </div>
                {femaleGroupCount > 0 && (
                  <div className="text-right">
                    <span className="text-lg font-bold text-pink-600">{formatPrice(femaleGroupTotal)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Tiers */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-[9px] text-gray-400">1-4</p>
                <p className="text-[10px] text-gray-700">M: <span className="font-bold">₹3,499</span></p>
                <p className="text-[10px] text-gray-700">F: <span className="font-bold">₹2,499</span></p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-[9px] text-gray-400">5-9</p>
                <p className="text-[10px] text-gray-700">M: <span className="font-bold">₹3,199</span></p>
                <p className="text-[10px] text-gray-700">F: <span className="font-bold">₹2,399</span></p>
              </div>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-2 text-center border border-emerald-200">
                <p className="text-[9px] text-emerald-600">10-20</p>
                <p className="text-[10px] text-emerald-700">M: <span className="font-bold">₹2,999</span></p>
                <p className="text-[10px] text-emerald-700">F: <span className="font-bold">₹2,199</span></p>
              </div>
            </div>

            {/* Group Total */}
            {groupBookingTotal > 0 && (
              <div className="mt-4 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-emerald-100">Group Total</p>
                    <p className="text-xs text-white/80">
                      {nonAlcoholCount > 0 && `${nonAlcoholCount} Non-Alc`}
                      {nonAlcoholCount > 0 && (maleGroupCount > 0 || femaleGroupCount > 0) && ' · '}
                      {maleGroupCount > 0 && `${maleGroupCount}M`}
                      {maleGroupCount > 0 && femaleGroupCount > 0 && ' + '}
                      {femaleGroupCount > 0 && `${femaleGroupCount}F`}
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-white">{formatPrice(groupBookingTotal)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      {(totalItems > 0 || groupBookingTotal > 0) ? (
        <div className="border-t border-gray-200 p-5 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              {totalItems > 0 && (
                <span className="text-sm text-gray-600">{totalItems} Ticket{totalItems > 1 ? 's' : ''} Selected</span>
              )}
              {totalItems > 0 && groupBookingTotal > 0 && (
                <span className="text-sm text-gray-600"> + Group</span>
              )}
              {totalItems === 0 && groupBookingTotal > 0 && (
                <span className="text-sm text-gray-600">
                  Group: {nonAlcoholCount > 0 ? `${nonAlcoholCount} Non-Alc` : ''}{nonAlcoholCount > 0 && (maleGroupCount > 0 || femaleGroupCount > 0) ? ', ' : ''}{maleGroupCount > 0 ? `${maleGroupCount}M` : ''}{maleGroupCount > 0 && femaleGroupCount > 0 ? '+' : ''}{femaleGroupCount > 0 ? `${femaleGroupCount}F` : ''}
                </span>
              )}
              <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatPrice(totalAmount + groupBookingTotal)}
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
