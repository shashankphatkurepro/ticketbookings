'use client';

import { eventData } from '../data/eventData';
import { Wine, Beer, GlassWater, Martini } from 'lucide-react';

export default function CoolDrinksSection() {
  return (
    <section id="cool-drinks" className="glass-strong rounded-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <Wine className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Unlimited Premium Alcohol</h2>
          <p className="text-sm text-gray-500">Premium beverages included with Alcohol Package</p>
        </div>
      </div>

      {/* Drinks Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {eventData.coolDrinks.map((drink, index) => {
          const getBgColor = () => {
            if (drink.type === 'Scotch') return 'bg-amber-50';
            if (drink.type === 'Whisky') return 'bg-orange-50';
            if (drink.type === 'Wine') return 'bg-rose-50';
            if (drink.type === 'Rum') return 'bg-yellow-50';
            if (drink.type === 'Beer') return 'bg-amber-50';
            if (drink.type === 'Vodka') return 'bg-blue-50';
            return 'bg-purple-50';
          };

          const getIconColor = () => {
            if (drink.type === 'Scotch') return 'text-amber-600';
            if (drink.type === 'Whisky') return 'text-orange-600';
            if (drink.type === 'Wine') return 'text-rose-600';
            if (drink.type === 'Rum') return 'text-yellow-600';
            if (drink.type === 'Beer') return 'text-amber-600';
            if (drink.type === 'Vodka') return 'text-blue-600';
            return 'text-purple-600';
          };

          const getIcon = () => {
            if (drink.type === 'Scotch') return GlassWater;
            if (drink.type === 'Whisky') return GlassWater;
            if (drink.type === 'Wine') return Wine;
            if (drink.type === 'Rum') return Martini;
            if (drink.type === 'Beer') return Beer;
            if (drink.type === 'Vodka') return Martini;
            return Wine;
          };

          const Icon = getIcon();

          return (
            <div
              key={index}
              className="group glass-card rounded-2xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl ${getBgColor()} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${getIconColor()}`} />
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-tight group-hover:text-gray-900 transition-colors">
                {drink.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{drink.type}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom Badge */}
      <div className="mt-6 pt-5 border-t border-gray-200/50 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-full text-sm text-amber-700 font-medium">
          <Wine className="w-4 h-4" />
          Available with Alcohol Package
        </div>
      </div>
    </section>
  );
}
