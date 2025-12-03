'use client';

import Link from 'next/link';
import { resortInfo } from '../data/eventData';
import { Phone, Globe, Facebook, Instagram, MessageCircle, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { href: '#about', label: 'About Event' },
    { href: '#highlights', label: 'Highlights' },
    { href: '#activities', label: 'Activities' },
    { href: '#tickets', label: 'Tickets' },
  ];

  const helpLinks = [
    { href: '#venue', label: 'Venue & Directions', isExternal: false },
    { href: '#faq', label: 'FAQs', isExternal: false },
    { href: '/terms', label: 'Terms & Conditions', isExternal: true },
    { href: '/privacy', label: 'Privacy Policy', isExternal: true },
    { href: '/refund', label: 'Refund Policy', isExternal: true },
  ];

  return (
    <footer className="mt-12">
      <div className="glass-strong rounded-t-3xl pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Logo & About */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src="https://mangozzz.com/images/logo.png"
                  alt="Mangozzz Resort"
                  className="w-12 h-12 rounded-2xl object-contain"
                />
                <div>
                  <span className="text-xl font-bold text-gray-800">Mangozzz</span>
                  <p className="text-xs text-gray-500">Magical World Resort</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-5 leading-relaxed">{resortInfo.tagline}</p>
              <div className="flex gap-2">
                <a
                  href={resortInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 glass-card rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-all hover:-translate-y-0.5"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-gray-500 group-hover:text-indigo-600 transition-colors" />
                </a>
                <a
                  href={resortInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 glass-card rounded-xl flex items-center justify-center hover:bg-pink-50 transition-all hover:-translate-y-0.5"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-gray-500 group-hover:text-pink-600 transition-colors" />
                </a>
                <a
                  href={`https://wa.me/${resortInfo.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-11 h-11 glass-card rounded-xl flex items-center justify-center hover:bg-green-50 transition-all hover:-translate-y-0.5"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
                </a>
              </div>
            </div>

            {/* Event Links */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Event
              </h3>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-gray-600 hover:text-indigo-600 transition-colors text-sm flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full group-hover:scale-125 transition-transform" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help Links */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" />
                Help & Info
              </h3>
              <ul className="space-y-2.5">
                {helpLinks.map((link) => (
                  <li key={link.href}>
                    {link.isExternal ? (
                      <Link href={link.href} className="text-gray-600 hover:text-pink-600 transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:scale-125 transition-transform" />
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-gray-600 hover:text-pink-600 transition-colors text-sm flex items-center gap-2 group">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full group-hover:scale-125 transition-transform" />
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Contact Resort</h3>
              <div className="space-y-3">
                <a
                  href={`tel:${resortInfo.phone}`}
                  className="group flex items-center gap-3 p-3 glass-card rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Phone className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Call Us</p>
                    <p className="font-medium text-gray-800 text-sm">{resortInfo.phone}</p>
                  </div>
                </a>

                <a
                  href={resortInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 p-3 glass-card rounded-xl hover:shadow-md transition-all hover:-translate-y-0.5"
                >
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Website</p>
                    <p className="font-medium text-gray-800 text-sm">mangozzz.com</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center md:items-start gap-1">
              <p className="text-sm text-gray-500 flex items-center gap-1">
                © {currentYear} Mangozzz Resort. Made with <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" /> in India
              </p>
              <p className="text-xs text-gray-400">
                Managed by <span className="font-semibold text-gray-600">SHIVAY ENTERPRISES</span>
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link>
              <Link href="/refund" className="hover:text-indigo-600 transition-colors">Refund</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
