'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Globe, Ticket, Phone } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '#about', label: 'About' },
    { href: '#highlights', label: 'Highlights' },
    { href: '#activities', label: 'Activities' },
    { href: '#venue', label: 'Venue' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-white py-1' : 'glass py-1.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Mangozzz Resort"
                className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="hidden sm:block">
                <span className="text-lg font-bold text-gray-800">Mangozzz</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Magical Resort</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/50 transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://mangozzz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100/50 transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>Visit Resort</span>
              </a>

              <a
                href="#tickets"
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 btn-pink rounded-xl text-sm"
              >
                <Ticket className="w-4 h-4" />
                <span className="hidden sm:inline">Book Now</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm glass-strong transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
            <span className="text-lg font-semibold text-gray-800">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500" />
                {link.label}
              </a>
            ))}

            <div className="pt-4 mt-4 border-t border-gray-200/50 space-y-2">
              <a
                href="https://mangozzz.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span>Visit Resort Website</span>
              </a>
              <a
                href="tel:+917977127312"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>Call Support</span>
              </a>
            </div>

            <div className="pt-4">
              <a
                href="#tickets"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3.5 btn-pink rounded-xl text-base"
              >
                <Ticket className="w-5 h-5" />
                <span>Book Your Tickets</span>
              </a>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
