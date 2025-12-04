'use client';

import { eventData } from '../data/eventData';
import { UtensilsCrossed, Salad, Drumstick, Soup, ChefHat, Croissant, IceCream } from 'lucide-react';

export default function FoodMenuSection() {
  const { foodMenu } = eventData;

  return (
    <section id="food-menu" className="glass-strong rounded-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
          <UtensilsCrossed className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">New Year&apos;s Eve Menu</h2>
          <p className="text-sm text-gray-500">Delicious food to fuel your celebration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Starters */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Salad className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-800">Starters</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Veg</p>
              <div className="flex flex-wrap gap-2">
                {foodMenu.starters.veg.map((item, index) => (
                  <span key={index} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">Non-Veg</p>
              <div className="flex flex-wrap gap-2">
                {foodMenu.starters.nonVeg.map((item, index) => (
                  <span key={index} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Course */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-bold text-gray-800">Main Course</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-2">Veg</p>
              <div className="flex flex-wrap gap-2">
                {foodMenu.mainCourse.veg.map((item, index) => (
                  <span key={index} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">Non-Veg</p>
              <div className="flex flex-wrap gap-2">
                {foodMenu.mainCourse.nonVeg.map((item, index) => (
                  <span key={index} className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Soup */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Soup className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-bold text-gray-800">Soup</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {foodMenu.soup.map((item, index) => (
              <span key={index} className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Bread */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
              <Croissant className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="font-bold text-gray-800">Bread</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {foodMenu.bread.map((item, index) => (
              <span key={index} className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Dessert - Full Width */}
        <div className="glass-card rounded-2xl p-5 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
              <IceCream className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-bold text-gray-800">Dessert</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {foodMenu.dessert.map((item, index) => (
              <span key={index} className="px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Badge */}
      <div className="mt-6 pt-5 border-t border-gray-200/50 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-full text-sm text-red-700 font-medium">
          <UtensilsCrossed className="w-4 h-4" />
          Unlimited buffet included with all tickets
        </div>
      </div>
    </section>
  );
}
