'use client';

import { useState } from 'react';
import { eventData } from '../data/eventData';
import { Info, Clock, Users, Languages, Music, ChevronDown, ChevronUp } from 'lucide-react';

export default function AboutSection() {
  const [expanded, setExpanded] = useState(false);

  const descriptionLines = eventData.description.split('\n\n');
  const shortDescription = descriptionLines[0];

  const infoCards = [
    { icon: Clock, label: 'Duration', value: eventData.duration, bg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { icon: Users, label: 'Age Limit', value: eventData.ageRestriction, bg: 'bg-pink-50', iconColor: 'text-pink-600' },
    { icon: Languages, label: 'Languages', value: eventData.languages.slice(0, 2).join(', '), bg: 'bg-cyan-50', iconColor: 'text-cyan-600' },
    { icon: Music, label: 'Genre', value: eventData.genres.join(', '), bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  return (
    <section id="about" className="glass-strong rounded-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Info className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">About The Event</h2>
          <p className="text-sm text-gray-500">Everything you need to know</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
          {expanded ? eventData.description : shortDescription}
        </p>
        {descriptionLines.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-xl transition-colors text-sm"
          >
            {expanded ? (
              <>
                Show Less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Read More <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-6 border-t border-gray-200/50">
        {infoCards.map((card, index) => (
          <div
            key={index}
            className="group glass-card rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{card.label}</p>
            <p className="font-semibold text-gray-800 mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
