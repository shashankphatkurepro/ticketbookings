'use client';

import { eventData } from '../data/eventData';
import {
  Music, Waves, CloudRain, Mountain, Gamepad2,
  Flame, Mic, Camera, Sparkles, PartyPopper
} from 'lucide-react';

const activityConfig = [
  { icon: Music, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { icon: Waves, gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
  { icon: CloudRain, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { icon: Mountain, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { icon: Gamepad2, gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', iconColor: 'text-pink-600' },
  { icon: Flame, gradient: 'from-orange-500 to-red-600', bg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { icon: Mic, gradient: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-50', iconColor: 'text-fuchsia-600' },
  { icon: Camera, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { icon: Sparkles, gradient: 'from-indigo-500 to-violet-600', bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  { icon: PartyPopper, gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', iconColor: 'text-rose-600' },
];

export default function ActivitiesSection() {
  return (
    <section id="activities" className="glass-strong rounded-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <PartyPopper className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Activities & Entertainment</h2>
          <p className="text-sm text-gray-500">Non-stop fun for everyone</p>
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {eventData.activities.map((activity, index) => {
          const config = activityConfig[index % activityConfig.length];
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
                {activity}
              </p>
            </div>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="mt-6 pt-5 border-t border-gray-200/50">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            All activities included in ticket
          </span>
          <span className="hidden sm:block text-gray-300">|</span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full" />
            Suitable for all ages
          </span>
        </div>
      </div>
    </section>
  );
}
