'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '../context/BookingContext';
import { eventData } from '../data/eventData';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Minus,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  CheckCircle2,
  Ticket,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Download,
  QrCode,
  PartyPopper,
  Star,
  Share2,
  Copy,
  Check,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { booking, removeFromCart, addToCart, updateQuantity, getTotalAmount, getTotalItems, setCustomerInfo, clearCart } = useBooking();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [bookingId] = useState(() => `MNG${Date.now().toString(36).toUpperCase()}`);
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: booking.customerInfo.name,
    email: booking.customerInfo.email,
    phone: booking.customerInfo.phone,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalItems = getTotalItems();
  const subtotal = getTotalAmount();
  const gst = Math.round(subtotal * 0.18);
  const convenienceFee = Math.round(subtotal * 0.02);
  const totalAmount = subtotal + gst + convenienceFee;

  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateTicketPDF = async () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [230, 100] // Wider to fit all elements
    });

    // Create Mangozzz logo using canvas
    let logoData: string | null = null;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Orange gradient background
        const gradient = ctx.createLinearGradient(0, 0, 100, 100);
        gradient.addColorStop(0, '#f97316');
        gradient.addColorStop(1, '#ea580c');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2);
        ctx.fill();

        // Yellow mango
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(50, 55, 25, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Green leaf
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(58, 22, 18, 10, Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();

        logoData = canvas.toDataURL('image/png');
      }
    } catch (e) {
      console.log('Could not create logo');
    }

    let ticketIndex = 0;
    const pageWidth = 230;
    const pageHeight = 100;
    const margin = 5;
    const stubWidth = 50;
    const mainWidth = pageWidth - stubWidth - margin * 2 - 5;

    for (const item of booking.items) {
      for (let i = 0; i < item.quantity; i++) {
        if (ticketIndex > 0) {
          doc.addPage([230, 100], 'landscape');
        }

        const ticketCode = `${bookingId}-${item.ticketId.toUpperCase()}-${i + 1}`;

        // Generate QR code
        let qrDataUrl = '';
        try {
          qrDataUrl = await QRCode.toDataURL(ticketCode, {
            width: 300,
            margin: 0,
            color: { dark: '#1e1b4b', light: '#ffffff' }
          });
        } catch (e) {
          console.log('QR generation failed');
        }

        // ==================== MAIN TICKET SECTION ====================
        const mainX = margin;
        const mainY = margin;

        // Main ticket background
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(mainX, mainY, mainWidth, pageHeight - margin * 2, 4, 4, 'F');

        // Top accent bar - solid indigo
        doc.setFillColor(67, 56, 202); // indigo-700
        doc.roundedRect(mainX, mainY, mainWidth, 24, 4, 4, 'F');
        doc.rect(mainX, mainY + 12, mainWidth, 12, 'F');

        // Logo in header
        if (logoData) {
          try {
            doc.addImage(logoData, 'PNG', mainX + 6, mainY + 3, 18, 18);
          } catch (e) {
            // Fallback text if image fails
            doc.setFillColor(255, 255, 255);
            doc.circle(mainX + 15, mainY + 12, 8, 'F');
            doc.setTextColor(67, 56, 202);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('M', mainX + 11, mainY + 16);
          }
        } else {
          // Fallback text
          doc.setFillColor(255, 255, 255);
          doc.circle(mainX + 15, mainY + 12, 8, 'F');
          doc.setTextColor(67, 56, 202);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text('M', mainX + 11, mainY + 16);
        }

        // Event title in header
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.text("NEW YEAR'S EVE 2026", mainX + 28, mainY + 11);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(199, 210, 254);
        doc.text('The Ultimate Celebration | Mangozzz Resort', mainX + 28, mainY + 18);

        // Ticket type badge in header
        doc.setFillColor(236, 72, 153);
        doc.roundedRect(mainX + mainWidth - 42, mainY + 6, 38, 12, 3, 3, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        const ticketTypeName = item.ticketName.length > 14 ? item.ticketName.substring(0, 14) : item.ticketName;
        doc.text(ticketTypeName.toUpperCase(), mainX + mainWidth - 23, mainY + 14, { align: 'center' });

        // Content area
        const contentY = mainY + 30;

        // Guest name - prominent
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('GUEST NAME', mainX + 8, contentY);

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(formData.name || 'Guest', mainX + 8, contentY + 8);

        // Venue
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('VENUE', mainX + 8, contentY + 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('Mangozzz Magical World Resort', mainX + 8, contentY + 25);

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('Chowk, Karjat, Maharashtra', mainX + 8, contentY + 32);

        // Vertical divider
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(mainX + 95, contentY - 4, mainX + 95, contentY + 38);

        // Date & Time boxes
        const infoBoxX = mainX + 102;

        // Date box
        doc.setFillColor(238, 242, 255);
        doc.roundedRect(infoBoxX, contentY - 2, 30, 22, 3, 3, 'F');
        doc.setFontSize(6);
        doc.setTextColor(67, 56, 202);
        doc.setFont('helvetica', 'bold');
        doc.text('DATE', infoBoxX + 15, contentY + 4, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text('31', infoBoxX + 15, contentY + 12, { align: 'center' });
        doc.setFontSize(7);
        doc.text('DEC 2025', infoBoxX + 15, contentY + 17, { align: 'center' });

        // Time box
        doc.setFillColor(253, 242, 248);
        doc.roundedRect(infoBoxX + 34, contentY - 2, 30, 22, 3, 3, 'F');
        doc.setFontSize(6);
        doc.setTextColor(219, 39, 119);
        doc.setFont('helvetica', 'bold');
        doc.text('TIME', infoBoxX + 49, contentY + 4, { align: 'center' });
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.text('7:00', infoBoxX + 49, contentY + 12, { align: 'center' });
        doc.setFontSize(7);
        doc.text('PM', infoBoxX + 49, contentY + 17, { align: 'center' });

        // Gate & Seat info
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('GATE', infoBoxX + 4, contentY + 28);
        doc.text('SEAT', infoBoxX + 38, contentY + 28);

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text('A', infoBoxX + 4, contentY + 36);
        doc.text('OPEN', infoBoxX + 38, contentY + 36);

        // Bottom bar with booking info
        const bottomY = pageHeight - margin - 12;
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(mainX, bottomY, mainWidth, 12, 0, 0, 'F');
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.3);
        doc.line(mainX, bottomY, mainX + mainWidth, bottomY);

        // Booking ID
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('BOOKING ID', mainX + 8, bottomY + 4);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(67, 56, 202);
        doc.text(bookingId, mainX + 8, bottomY + 9);

        // Ticket number
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('TICKET', mainX + 60, bottomY + 4);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(`${i + 1} of ${item.quantity}`, mainX + 60, bottomY + 9);

        // Amount paid
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text('AMOUNT', mainX + 100, bottomY + 4);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(`Rs. ${item.price.toLocaleString('en-IN')}`, mainX + 100, bottomY + 9);

        // Entry note
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(156, 163, 175);
        doc.text('Valid for single entry only. Non-transferable.', mainX + mainWidth - 4, bottomY + 7, { align: 'right' });

        // ==================== PERFORATION LINE ====================
        const perfX = mainX + mainWidth + 2.5;
        doc.setDrawColor(180, 180, 180);
        doc.setLineDashPattern([2, 2], 0);
        doc.setLineWidth(0.4);
        doc.line(perfX, margin + 6, perfX, pageHeight - margin - 6);
        doc.setLineDashPattern([], 0);

        // Perforation circles (cut indicators)
        doc.setFillColor(245, 245, 245);
        doc.circle(perfX, margin + 2, 4, 'F');
        doc.circle(perfX, pageHeight - margin - 2, 4, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.3);
        doc.circle(perfX, margin + 2, 4, 'S');
        doc.circle(perfX, pageHeight - margin - 2, 4, 'S');

        // ==================== STUB SECTION (Right side) ====================
        const stubX = mainX + mainWidth + 5;

        // Stub background - dark indigo
        doc.setFillColor(30, 27, 75); // indigo-950
        doc.roundedRect(stubX, mainY, stubWidth, pageHeight - margin * 2, 4, 4, 'F');

        // Stub header
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text('ENTRY PASS', stubX + stubWidth / 2, mainY + 10, { align: 'center' });

        // QR Code background - white rounded rect
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(stubX + 5, mainY + 16, stubWidth - 10, stubWidth - 10, 3, 3, 'F');

        // QR Code
        if (qrDataUrl) {
          doc.addImage(qrDataUrl, 'PNG', stubX + 7, mainY + 18, stubWidth - 14, stubWidth - 14);
        }

        // Ticket code under QR
        doc.setFontSize(5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 200, 210);
        doc.text(ticketCode, stubX + stubWidth / 2, mainY + stubWidth + 12, { align: 'center' });

        // Scan instruction
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(165, 180, 252); // indigo-300
        doc.text('SCAN AT ENTRY', stubX + stubWidth / 2, mainY + stubWidth + 19, { align: 'center' });

        // Stub footer with event info
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('NYE 2026', stubX + stubWidth / 2, pageHeight - margin - 12, { align: 'center' });

        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 200, 210);
        doc.text('31 DEC | 7 PM', stubX + stubWidth / 2, pageHeight - margin - 6, { align: 'center' });

        // Outer border for main ticket
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.roundedRect(mainX, mainY, mainWidth, pageHeight - margin * 2, 4, 4, 'S');

        ticketIndex++;
      }
    }

    // Save the PDF
    doc.save(`mangozzz-nye2026-${bookingId}.pdf`);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (step === 1 && totalItems > 0) {
      setStep(2);
    } else if (step === 2) {
      if (validateForm()) {
        setCustomerInfo(formData);
        setStep(3);
      }
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate QR codes for each ticket
    const generatedQrCodes: { [key: string]: string } = {};
    for (const item of booking.items) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = `${bookingId}-${item.ticketId.toUpperCase()}-${i + 1}`;
        try {
          const qrDataUrl = await QRCode.toDataURL(ticketCode, {
            width: 200,
            margin: 1,
            color: { dark: '#1f2937', light: '#ffffff' }
          });
          generatedQrCodes[ticketCode] = qrDataUrl;
        } catch (e) {
          console.log('QR generation failed for', ticketCode);
        }
      }
    }
    setQrCodes(generatedQrCodes);

    setIsProcessing(false);
    setIsComplete(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Success State
  if (isComplete) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/30 mx-auto">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg animate-bounce">
                <PartyPopper className="w-5 h-5 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-500">Your adventure awaits. Get ready to celebrate!</p>
          </div>

          {/* Booking ID Card */}
          <div className="glass-strong rounded-3xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Ticket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Booking ID</p>
                  <p className="text-xl font-bold text-gray-800 font-mono">{bookingId}</p>
                </div>
              </div>
              <button
                onClick={copyBookingId}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 text-sm font-medium transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card rounded-xl p-3 text-center">
                <Calendar className="w-5 h-5 text-pink-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-semibold text-gray-800">31 Dec 2025</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-semibold text-gray-800">7:00 PM</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <Ticket className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Tickets</p>
                <p className="text-sm font-semibold text-gray-800">{totalItems} Pass{totalItems > 1 ? 'es' : ''}</p>
              </div>
              <div className="glass-card rounded-xl p-3 text-center">
                <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-sm font-semibold text-gray-800">{formatPrice(totalAmount)}</p>
              </div>
            </div>
          </div>

          {/* Ticket Preview */}
          <div className="glass-strong rounded-3xl overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 py-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Your Tickets
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {booking.items.map((item) => (
                <div key={item.ticketId} className="space-y-3">
                  {[...Array(item.quantity)].map((_, idx) => {
                    const ticketCode = `${bookingId}-${item.ticketId.toUpperCase()}-${idx + 1}`;
                    const qrDataUrl = qrCodes[ticketCode];
                    return (
                      <div
                        key={ticketCode}
                        className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-2xl border-l-4 border-indigo-500"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-800">{item.ticketName}</p>
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full">
                              #{idx + 1}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                          <p className="text-xs text-gray-400 font-mono mt-1">{ticketCode}</p>
                        </div>
                        <div className="w-20 h-20 bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                          {qrDataUrl ? (
                            <img src={qrDataUrl} alt={`QR Code for ${ticketCode}`} className="w-full h-full object-contain" />
                          ) : (
                            <QrCode className="w-10 h-10 text-gray-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Guest Info */}
          <div className="glass-strong rounded-3xl p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Guest Information
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Name</p>
                <p className="font-medium text-gray-800">{formData.name}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                <p className="font-medium text-gray-800 truncate">{formData.email}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                <p className="font-medium text-gray-800">{formData.phone}</p>
              </div>
            </div>
          </div>

          {/* Venue Info */}
          <div className="glass-strong rounded-3xl p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-500" />
              Venue
            </h3>
            <div className="flex items-start gap-4">
              <img
                src="https://mangozzz.com/images/logo.png"
                alt="Mangozzz Resort"
                className="w-16 h-16 rounded-2xl object-contain shadow-lg flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-gray-800 mb-1">{eventData.venue.name}</p>
                <p className="text-sm text-gray-500 mb-2">{eventData.venue.address}, {eventData.venue.city}</p>
                <a
                  href={eventData.venue.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={generateTicketPDF}
              className="flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 transition-all hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Download Tickets
            </button>
            <button
              onClick={() => {
                clearCart();
                router.push('/');
              }}
              className="flex items-center justify-center gap-3 py-4 glass-card hover:bg-gray-50 rounded-2xl text-gray-700 font-semibold text-lg transition-all"
            >
              Back to Home
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 mb-1">Important Information</p>
                <p className="text-sm text-amber-700">
                  Please download your tickets and present them at the venue entrance.
                  A confirmation email has been sent to <span className="font-medium">{formData.email}</span>.
                  For any queries, contact us at {eventData.venue.name}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (totalItems === 0 && step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
        <div className="max-w-md w-full glass-strong rounded-3xl p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Ticket className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-6">
            You haven&apos;t selected any tickets yet. Browse our ticket options and add them to your cart.
          </p>
          <Link
            href="/#tickets"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Tickets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 glass-card rounded-xl text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <img
              src="https://mangozzz.com/images/logo.png"
              alt="Mangozzz Resort"
              className="w-10 h-10 rounded-xl object-contain"
            />
            <div className="hidden sm:block">
              <span className="text-lg font-bold text-gray-800">Mangozzz</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Resort</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { num: 1, label: 'Review' },
            { num: 2, label: 'Details' },
            { num: 3, label: 'Payment' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                disabled={s.num > step}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  step === s.num
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                    : step > s.num
                    ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s.num ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    step === s.num ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {s.num}
                  </span>
                )}
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </button>
              {i < 2 && <div className="w-8 sm:w-12 h-0.5 bg-gray-200 rounded" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Review Tickets */}
            {step === 1 && (
              <div className="glass-strong rounded-3xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Review Your Tickets</h2>
                    <p className="text-sm text-gray-500">Make sure everything looks good</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {booking.items.map((item) => {
                    const ticket = eventData.tickets.find((t) => t.id === item.ticketId);
                    return (
                      <div
                        key={item.ticketId}
                        className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 glass-card rounded-2xl"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-800">{item.ticketName}</h3>
                            {ticket?.popular && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full flex items-center gap-1">
                                <TrendingUp className="w-2.5 h-2.5" />
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{ticket?.description}</p>
                          <p className="text-lg font-bold text-gray-800 mt-2">
                            {formatPrice(item.price)} <span className="text-sm font-normal text-gray-500">/ person</span>
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                            <button
                              onClick={() => removeFromCart(item.ticketId)}
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-bold text-gray-800">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item.ticketId, item.ticketName, item.price)}
                              disabled={item.quantity >= (ticket?.maxPerOrder || 10)}
                              className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-40"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            onClick={() => updateQuantity(item.ticketId, 0)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/#tickets"
                  className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add More Tickets
                </Link>
              </div>
            )}

            {/* Step 2: Customer Details */}
            {step === 2 && (
              <div className="glass-strong rounded-3xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/25">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Your Details</h2>
                    <p className="text-sm text-gray-500">We&apos;ll send your tickets here</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`w-full pl-16 pr-4 py-4 glass-card rounded-2xl border-2 ${
                          errors.name ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-300'
                        } focus:outline-none transition-colors text-gray-800`}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className={`w-full pl-16 pr-4 py-4 glass-card rounded-2xl border-2 ${
                          errors.email ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-300'
                        } focus:outline-none transition-colors text-gray-800`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Tickets will be sent to this email
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit phone number"
                        className={`w-full pl-16 pr-4 py-4 glass-card rounded-2xl border-2 ${
                          errors.phone ? 'border-red-300 focus:border-red-500' : 'border-transparent focus:border-indigo-300'
                        } focus:outline-none transition-colors text-gray-800`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="glass-strong rounded-3xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Payment</h2>
                    <p className="text-sm text-gray-500">Complete your booking</p>
                  </div>
                </div>

                {/* Customer Summary */}
                <div className="glass-card rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{formData.name}</p>
                      <p className="text-sm text-gray-500">{formData.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-700">{formData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Placeholder */}
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-2">Payment Gateway Integration</p>
                  <p className="text-sm text-gray-400">Razorpay / Stripe / PayU integration would go here</p>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-800">Secure Payment</p>
                    <p className="text-sm text-green-600">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-3xl overflow-hidden sticky top-8">
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Order Summary
                </h3>
              </div>

              <div className="p-5 space-y-5">
                {/* Event Info */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="glass-card rounded-xl p-3 text-center">
                    <Calendar className="w-4 h-4 text-pink-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 font-medium">31 Dec</p>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 font-medium">7:00 PM</p>
                  </div>
                  <div className="glass-card rounded-xl p-3 text-center">
                    <MapPin className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 font-medium">Chowk, Karjat</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  {booking.items.map((item) => (
                    <div key={item.ticketId} className="flex justify-between items-center p-3 glass-card rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.ticketName}</p>
                        <p className="text-xs text-gray-500">x {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800 font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span className="text-gray-800 font-medium">{formatPrice(gst)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Convenience Fee (2%)</span>
                    <span className="text-gray-800 font-medium">{formatPrice(convenienceFee)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                {step < 3 ? (
                  <button
                    onClick={handleContinue}
                    disabled={step === 1 && totalItems === 0}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-pink-500/25 hover:shadow-pink-500/35 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {step === 1 ? 'Continue' : 'Continue to Payment'}
                  </button>
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl text-lg font-semibold shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-5 h-5" />
                        Pay {formatPrice(totalAmount)}
                      </>
                    )}
                  </button>
                )}

                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  Secure checkout · Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
