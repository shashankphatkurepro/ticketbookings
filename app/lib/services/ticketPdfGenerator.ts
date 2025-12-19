import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Ticket, Booking } from '../supabase/types';

export interface TicketPdfData {
  ticket: Ticket;
  booking: Booking;
}

// Event details
const EVENT = {
  name: "NEW YEAR'S EVE 2026",
  tagline: 'The Ultimate Celebration',
  date: '31st December 2025',
  time: '7:00 PM Onwards',
  venue: 'Mangozzz Magical World Resort',
  address: 'At. Asare Wadi, Post. Chowk',
  city: 'Karjat, Maharashtra',
};

const TERMS = [
  'Entry is subject to valid ticket and ID proof',
  'Management reserves the right to deny entry',
  'Outside food and beverages not permitted',
  'Children must be accompanied by adults',
  'Tickets are non-transferable and non-refundable',
];

export async function generateTicketPdf(data: TicketPdfData): Promise<Buffer> {
  const { ticket, booking } = data;

  // Create A5 size PDF (148 x 210 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = 148;
  const pageHeight = 210;
  const margin = 8;

  // Background - dark gradient effect
  doc.setFillColor(15, 15, 35);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative top accent bar
  doc.setFillColor(168, 85, 247); // Purple
  doc.rect(0, 0, pageWidth, 4, 'F');

  // Gold accent line
  doc.setFillColor(251, 191, 36); // Amber/Gold
  doc.rect(0, 4, pageWidth, 1, 'F');

  // Header section with gradient-like effect
  doc.setFillColor(88, 28, 135);
  doc.rect(0, 5, pageWidth, 55, 'F');

  // Subtle pattern overlay effect (decorative lines)
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.1);
  for (let i = 0; i < pageWidth; i += 8) {
    doc.line(i, 5, i + 20, 60);
  }

  // Event branding
  doc.setTextColor(251, 191, 36); // Gold
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('MANGOZZZ PRESENTS', pageWidth / 2, 16, { align: 'center' });

  // Event name - large and bold
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(EVENT.name, pageWidth / 2, 28, { align: 'center' });

  // Tagline
  doc.setTextColor(216, 180, 254); // Light purple
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(EVENT.tagline, pageWidth / 2, 36, { align: 'center' });

  // Date & Time in a styled box
  doc.setFillColor(251, 191, 36); // Gold
  doc.roundedRect(pageWidth / 2 - 40, 42, 80, 12, 2, 2, 'F');
  doc.setTextColor(15, 15, 35);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`${EVENT.date} | ${EVENT.time}`, pageWidth / 2, 50, { align: 'center' });

  // Main content area with subtle background
  doc.setFillColor(25, 25, 50);
  doc.roundedRect(margin, 65, pageWidth - margin * 2, 100, 4, 4, 'F');

  // QR Code section
  const qrCodeDataUrl = await QRCode.toDataURL(ticket.qr_code_data, {
    width: 300,
    margin: 1,
    color: {
      dark: '#1f1f3a',
      light: '#FFFFFF',
    },
  });

  const qrSize = 45;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 72;

  // QR code white background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 3, qrY - 3, qrSize + 6, qrSize + 6, 3, 3, 'F');

  // QR code border
  doc.setDrawColor(168, 85, 247);
  doc.setLineWidth(1);
  doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 4, 4);

  // Add QR code image
  doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // Ticket ID below QR - styled
  doc.setFillColor(168, 85, 247);
  doc.roundedRect(pageWidth / 2 - 25, qrY + qrSize + 4, 50, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.ticket_id, pageWidth / 2, qrY + qrSize + 10, { align: 'center' });

  // Ticket details section
  let yPos = qrY + qrSize + 20;

  // Ticket Type - prominent display
  doc.setTextColor(251, 191, 36); // Gold
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('TICKET TYPE', margin + 6, yPos);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.ticket_type, margin + 6, yPos + 6);

  // Attendee badge
  doc.setFillColor(168, 85, 247);
  doc.roundedRect(pageWidth - margin - 30, yPos - 4, 24, 14, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${ticket.attendee_number}`, pageWidth - margin - 18, yPos + 4, { align: 'center' });

  yPos += 16;

  // Divider
  doc.setDrawColor(100, 100, 150);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(margin + 6, yPos, pageWidth - margin - 6, yPos);
  doc.setLineDashPattern([], 0);

  yPos += 8;

  // Guest info row
  doc.setTextColor(156, 163, 175); // Gray
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('GUEST', margin + 6, yPos);
  doc.text('BOOKING ID', pageWidth / 2 + 5, yPos);

  yPos += 5;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.customer_name, margin + 6, yPos);
  doc.setFontSize(8);
  doc.text(booking.booking_id, pageWidth / 2 + 5, yPos);

  yPos += 10;

  // Price display
  doc.setFillColor(34, 197, 94); // Green
  doc.roundedRect(margin + 6, yPos - 2, 35, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹${ticket.ticket_price.toLocaleString()}`, margin + 23, yPos + 5, { align: 'center' });

  // Venue info on the right
  doc.setTextColor(156, 163, 175);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text(EVENT.venue, pageWidth - margin - 6, yPos, { align: 'right' });
  doc.text(EVENT.city, pageWidth - margin - 6, yPos + 4, { align: 'right' });

  // Terms section - bottom area
  yPos = 172;
  doc.setFillColor(20, 20, 40);
  doc.roundedRect(margin, yPos - 2, pageWidth - margin * 2, 24, 3, 3, 'F');

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & CONDITIONS', margin + 4, yPos + 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.5);
  let termY = yPos + 7;
  TERMS.forEach((term, index) => {
    doc.text(`${index + 1}. ${term}`, margin + 4, termY);
    termY += 3.2;
  });

  // Footer
  doc.setFillColor(15, 15, 35);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

  // Gold accent at bottom
  doc.setFillColor(251, 191, 36);
  doc.rect(0, pageHeight - 2, pageWidth, 2, 'F');

  doc.setTextColor(156, 163, 175);
  doc.setFontSize(6);
  doc.text('Scan QR code at entry for verification', pageWidth / 2, pageHeight - 7, { align: 'center' });
  doc.setTextColor(251, 191, 36);
  doc.setFontSize(5);
  doc.text('+91 7977127312 | www.mangozzz.com', pageWidth / 2, pageHeight - 4, { align: 'center' });

  // Return as buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}

export async function generateAllTicketsPdf(tickets: TicketPdfData[]): Promise<Buffer> {
  if (tickets.length === 0) {
    throw new Error('No tickets to generate');
  }

  if (tickets.length === 1) {
    return generateTicketPdf(tickets[0]);
  }

  // For multiple tickets, generate each one separately
  // jsPDF doesn't support merging, so we return the first one
  // In production, consider using pdf-lib for merging
  return generateTicketPdf(tickets[0]);
}
