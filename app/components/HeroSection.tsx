'use client';

import { useState, useEffect, useMemo } from 'react';
import { eventData } from '../data/eventData';
import { Calendar, Clock, MapPin, Sparkles, ChevronDown, Users, Star, Ticket } from 'lucide-react';

export default function HeroSection() {
  const [currentImage, setCurrentImage] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const particles = useMemo(
    () =>
      [...Array(20)].map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${4 + Math.random() * 4}s`,
        size: Math.random() > 0.6 ? 'w-1 h-1' : 'w-1.5 h-1.5',
        opacity: Math.random() > 0.5 ? 'opacity-40' : 'opacity-20',
      })),
    []
  );

  useEffect(() => {
    const targetDate = new Date('2025-12-31T19:00:00');
    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % eventData.images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const countdownItems = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Images with Ken Burns effect */}
      <div className="absolute inset-0">
        {eventData.images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
              currentImage === index ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url(${image})`,
              animation: currentImage === index ? 'slowZoom 5s ease-out forwards' : 'none',
            }}
          />
        ))}
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 via-transparent to-purple-900/30" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute ${p.size} bg-white rounded-full animate-float ${p.opacity}`}
            style={{ left: p.left, top: p.top, animationDelay: p.delay, animationDuration: p.duration }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 pt-24 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <span className="text-white text-sm font-medium">Tickets Selling Fast</span>
            <div className="w-px h-4 bg-white/30" />
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-white/80 text-sm">4.9 Rating</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="mb-6">
            <span className="block text-lg sm:text-xl md:text-2xl font-medium text-white/80 mb-3 tracking-wide">
              Get Ready For
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
              <span className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text">New Year&apos;s </span>
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Eve 2026
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/70 font-light">
              The Ultimate Celebration at <span className="text-white font-medium">{eventData.venue.name}</span>
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="flex justify-center gap-3 sm:gap-4 mb-10">
            {countdownItems.map((item, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2 group-hover:bg-white/15 transition-colors">
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tabular-nums">
                    {item.value.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-white/60 uppercase tracking-widest font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Event Info Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Calendar className="w-4 h-4 text-pink-400" />
              <span className="text-white text-sm font-medium">{eventData.date}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-white text-sm font-medium">{eventData.time}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="text-white text-sm font-medium">{eventData.venue.city.split(',')[0]}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <a
              href="#tickets"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl text-white font-semibold text-lg shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5"
            >
              <Ticket className="w-5 h-5" />
              Book Your Tickets
              <ChevronDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
            </a>
            <a
              href="#about"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-2xl text-white font-semibold text-lg transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Explore Event
            </a>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex -space-x-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-black/20"
                  style={{ zIndex: 5 - i }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-white">
                <Users className="w-5 h-5 text-pink-400" />
                <span className="text-2xl font-bold">{eventData.interestedCount.toLocaleString()}+</span>
              </div>
              <span className="text-white/60 text-sm">people interested</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 right-8 flex gap-2">
        {eventData.images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentImage === index ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`View image ${index + 1}`}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-3xl" />
    </section>
  );
}
