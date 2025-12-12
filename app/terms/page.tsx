'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Users, AlertTriangle, Phone, MapPin } from 'lucide-react';

export default function TermsPage() {
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Terms and Conditions</h1>
              <p className="text-gray-500">Mangozzz Magical World Resort NYE 2026</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Last Updated: December 2024</p>
        </div>

        {/* Introduction */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to the Mangozzz Magical World Resort NYE 2026 booking platform. By purchasing a ticket,
            you agree to be bound by the following terms and conditions. Please read them carefully.
          </p>
        </div>

        {/* Section 1: Booking and Entry */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">1. Booking and Entry</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">E-Ticket Mandatory</h3>
              <p>Entry will be permitted only upon presentation of a valid E-Ticket with a readable QR code.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Identity Verification</h3>
              <p>A valid physical Government-issued Photo ID (Aadhaar Card, Driving License, Passport, or Voter ID) is mandatory for every guest at the time of entry for age and identity verification. Soft copies may not be accepted.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Age Restrictions</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Primary booking guest must be 18 years or older.</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Non-Transferable</h3>
              <p>Tickets are non-transferable and cannot be resold.</p>
            </div>
          </div>
        </div>

        {/* Section 2: Event Policies & Conduct */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">2. Event Policies & Conduct</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Rights of Admission</h3>
              <p>Mangozzz Magical World Resort reserves the right of admission. Management may deny entry or expel a guest for unruly behavior, violation of rules, or if they pose a threat to the safety of others, without a refund.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Security Check</h3>
              <p>All guests are subject to a security search upon entry.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Prohibited Items</h3>
              <p className="mb-2">The following are strictly prohibited:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Illegal substances, drugs, or narcotics.</li>
                <li>Weapons, sharp objects, or flammable materials.</li>
                <li>Outside food and beverages.</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-4 border-l-4 border-red-500">
              <h3 className="font-semibold text-red-700 mb-2">Zero Tolerance Policy</h3>
              <p>We have a zero-tolerance policy for sexual harassment, violence, or possession of illegal substances. Violators will be handed over to the appropriate authorities.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Liability & Safety */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">3. Liability & Safety</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Personal Belongings</h3>
              <p>Guests are responsible for their own valuables. The management is not liable for any theft, loss, or damage to personal property.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Safety Instructions</h3>
              <p>Guests must comply with all fire safety and emergency instructions given by the resort staff.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Force Majeure</h3>
              <p>The organizers are not liable for any delay or cancellation of the event due to causes beyond their control, including weather conditions, government restrictions, or acts of God.</p>
            </div>
          </div>
        </div>

        {/* Grievance Redressal */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Grievance Redressal</h2>
          </div>

          <p className="text-gray-700 mb-4">
            If you have any complaints, queries regarding your booking, or concerns about privacy, please contact our support team.
          </p>

          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Grievance Officer Contact:</h3>
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
