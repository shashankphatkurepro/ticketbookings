'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, UserCheck, Send, Share2, Lock, Phone, MapPin } from 'lucide-react';

export default function PrivacyPage() {
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Privacy Policy</h1>
              <p className="text-gray-500">Your privacy matters to us</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">Effective Date: December 2024</p>
        </div>

        {/* Introduction */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Mangozzz Magical World Resort ("we", "us") is committed to protecting your privacy.
            This policy explains how we collect, use, and safeguard your information when you book tickets on our website.
          </p>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">1. Information We Collect</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Personal Details</h3>
              <p>Name, phone number, email address, and age verification details provided during booking.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Payment Information</h3>
              <p>Payment processing is handled by secure third-party payment gateways. We do not store your credit/debit card or net banking login details on our servers.</p>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Send className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">2. How We Use Your Information</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Booking Processing</h3>
              <p>To issue your E-Ticket and confirm your reservation.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Communication</h3>
              <p>To send booking confirmations, event updates, and important advisories via Email or WhatsApp.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Marketing</h3>
              <p>We may use your contact details to inform you about future events or offers at Mangozzz Resort. You may opt out of these communications at any time.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Data Sharing */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">3. Data Sharing</h2>
          </div>

          <div className="space-y-4 text-gray-700">
            <div className="glass-card rounded-xl p-4 border-l-4 border-emerald-500">
              <p className="font-medium text-emerald-700">We do not sell or rent your personal data to third parties.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Service Providers</h3>
              <p>Data may be shared with trusted service providers (e.g., payment gateways, SMS/WhatsApp vendors) strictly for the purpose of facilitating your booking and event experience.</p>
            </div>

            <div className="glass-card rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Legal Requirements</h3>
              <p>We may disclose information if required by law or to protect the safety of our guests and venue.</p>
            </div>
          </div>
        </div>

        {/* Section 4: Security */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">4. Security</h2>
          </div>

          <div className="glass-card rounded-xl p-4 text-gray-700">
            <p>We implement standard industry security measures to protect your personal data from unauthorized access or disclosure.</p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass-strong rounded-3xl p-6 lg:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Contact Us</h2>
          </div>

          <p className="text-gray-700 mb-4">
            If you have any questions or concerns about this privacy policy, please contact us:
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
