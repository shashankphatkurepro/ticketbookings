'use client';

import { eventData } from '../data/eventData';
import {
  Sparkles, UtensilsCrossed, CupSoda, Music, Flame,
  Waves, Mountain, Gamepad2, Baby, Camera
} from 'lucide-react';

const highlightConfig = [
  { icon: UtensilsCrossed, bg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { icon: CupSoda, bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  { icon: Music, bg: 'bg-pink-50', iconColor: 'text-pink-600' },
  { icon: Flame, bg: 'bg-red-50', iconColor: 'text-red-600' },
  { icon: Waves, bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  { icon: Mountain, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { icon: Gamepad2, bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { icon: Baby, bg: 'bg-rose-50', iconColor: 'text-rose-600' },
  { icon: Camera, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { icon: Sparkles, bg: 'bg-violet-50', iconColor: 'text-violet-600' },
];

export default function HighlightsSection() {
  return (
    <section id="highlights" className="glass-strong rounded-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Event Highlights</h2>
          <p className="text-sm text-gray-500">What awaits you at the celebration</p>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {eventData.highlights.map((highlight, index) => {
          const config = highlightConfig[index % highlightConfig.length];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className="group glass-card rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${config.iconColor}`} />
              </div>
              <p className="text-sm font-medium text-gray-700 leading-tight group-hover:text-gray-900 transition-colors">
                {highlight}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Badge */}
      <div className="mt-6 pt-5 border-t border-gray-200/50 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full text-sm text-amber-700 font-medium">
          <Sparkles className="w-4 h-4" />
          All highlights included in every ticket
        </div>
      </div>
    </section>
  );
}
