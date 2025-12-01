'use client';

import { eventData, resortInfo } from '../data/eventData';
import { MapPin, Phone, Mail, Navigation, Check, ExternalLink, Car, Shield, Clock } from 'lucide-react';

export default function VenueSection() {
  return (
    <section id="venue" className="glass-strong rounded-3xl overflow-hidden">
      <div className="grid lg:grid-cols-5">
        {/* Left - Venue Info */}
        <div className="lg:col-span-3 p-6 lg:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Venue & Location</h2>
              <p className="text-sm text-gray-500">Where the magic happens</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Venue Name & Address */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{eventData.venue.name}</h3>
              <p className="text-gray-600 mb-1">{eventData.venue.address}</p>
              <p className="text-gray-500 text-sm">{eventData.venue.city}</p>

              {/* Tagline */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-emerald-600 italic text-sm">&ldquo;{resortInfo.tagline}&rdquo;</p>
              </div>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`tel:${resortInfo.phone}`}
                className="group flex items-center gap-4 p-4 glass-card rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Call Us</p>
                  <p className="font-semibold text-gray-800">{resortInfo.phone}</p>
                </div>
              </a>

              <a
                href={`mailto:${resortInfo.email}`}
                className="group flex items-center gap-4 p-4 glass-card rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</p>
                  <p className="font-semibold text-gray-800 truncate">{resortInfo.email}</p>
                </div>
              </a>
            </div>

            {/* Direction Button */}
            <a
              href={eventData.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 btn-primary rounded-xl group"
            >
              <Navigation className="w-5 h-5" />
              Get Directions
              <ExternalLink className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Amenities */}
            <div className="pt-6 border-t border-gray-200/50">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500" />
                Resort Amenities
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {eventData.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right - Map Area */}
        <div className="lg:col-span-2 relative min-h-[350px] lg:min-h-0 bg-gradient-to-br from-emerald-500 to-teal-600">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            {/* Map Icon */}
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 shadow-lg">
              <MapPin className="w-10 h-10 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">{eventData.venue.name.split(' ').slice(0, 2).join(' ')}</h3>
            <p className="text-white/80 mb-6">{eventData.venue.city.split(',')[0]}, Maharashtra</p>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-4 mb-6 w-full max-w-xs">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-2">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-white/80">Free Parking</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-white/80">24/7 Security</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 mx-auto rounded-xl bg-white/20 flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-white/80">Easy Access</p>
              </div>
            </div>

            {/* Nearby Attractions */}
            <div className="w-full">
              <p className="text-xs text-white/60 uppercase tracking-wider mb-3">Nearby Attractions</p>
              <div className="flex flex-wrap justify-center gap-2">
                {resortInfo.nearbyAttractions.map((attraction, index) => (
                  <span key={index} className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                    {attraction}
                  </span>
                ))}
              </div>
            </div>

            <a
              href={eventData.venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl text-white font-medium transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
