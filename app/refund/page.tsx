'use client';

import Link from 'next/link';
import { ArrowLeft, RotateCcw, XCircle, Calendar, AlertOctagon, Phone, MapPin } from 'lucide-react';

export default function RefundPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
              <RotateCcw className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Refund and Cancellation Policy</h1>
              <p className="text-gray-500">NYE 2026 Event Booking</p>
            </div>
          </div>
        </div>

        {/* Section 1: General Policy */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <XCircle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">1. General Policy</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="glass-card rounded-xl p-4 border-l-4 border-red-500">
              <h3 className="font-semibold text-red-700 mb-2">No Refunds</h3>
              <p>All ticket sales are final. Tickets once purchased cannot be cancelled, exchanged, or refunded under any circumstances.</p>
            </div>

            <div className="glass-card rounded-xl p-4 border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-700 mb-2">No Transfers</h3>
              <p>Tickets are valid only for the specific date and time (31st Dec 2025) and cannot be transferred to another date or person.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Non-Attendance */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">2. Non-Attendance (No Show)</h2>
          </div>

          <div className="glass-card rounded-xl p-4 text-gray-700">
            <p>If you fail to attend the event for any reason, no refund will be provided.</p>
          </div>
        </div>

        {/* Section 3: Event Cancellation */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">3. Event Cancellation</h2>
          </div>

          <div className="glass-card rounded-xl p-4 text-gray-700 border-l-4 border-emerald-500">
            <p>In the unlikely event that the New Year's Eve party is cancelled by the organizers (Mangozzz Magical World Resort) due to technical issues or internal reasons, a <strong className="text-emerald-700">full refund</strong> of the ticket amount will be initiated to the original source of payment within <strong className="text-emerald-700">7-10 working days</strong>.</p>
          </div>
        </div>

        {/* Section 4: Expulsion */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">4. Expulsion</h2>
          </div>

          <div className="glass-card rounded-xl p-4 text-gray-700">
            <p>No refund will be issued if a guest is expelled from the venue for violation of the Terms and Conditions (e.g., unruly behavior, possession of drugs, etc.).</p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
              <AlertOctagon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Important Notice</h3>
              <p className="text-gray-700">
                By purchasing a ticket, you acknowledge and agree to this refund and cancellation policy. Please ensure you read and understand all terms before completing your purchase.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Grievance Redressal</h2>
          </div>

          <p className="text-gray-700 mb-4">
            If you have any complaints or queries regarding your booking, please contact our support team:
          </p>

          <div className="glass-card rounded-xl p-4">
            <div className="space-y-2 text-gray-700">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600" />
                <a href="tel:+918421536362" className="text-indigo-600 hover:underline">+91 84215 36362</a>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-600 mt-1" />
                <span>Mangozzz Magical World Resort, At Asare wadi Post near Swaminarayan Gurukul School, Chowk, Khalapur.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
