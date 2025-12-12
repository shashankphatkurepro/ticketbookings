'use client';

import Header from './components/Header';
import HeroSection from './components/HeroSection';
import BookingSidebar from './components/BookingSidebar';
import AboutSection from './components/AboutSection';
import HighlightsSection from './components/HighlightsSection';
import ActivitiesSection from './components/ActivitiesSection';
import FoodMenuSection from './components/FoodMenuSection';
import CoolDrinksSection from './components/CoolDrinksSection';
import VenueSection from './components/VenueSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import ExitIntentPopup from './components/ExitIntentPopup';
import SalesPopup from './components/SalesPopup';

export default function EventPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />

      {/* Main Content with Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content - Left Side */}
          <div className="flex-1 min-w-0 space-y-8">
            <AboutSection />
            <HighlightsSection />
            <ActivitiesSection />
            <FoodMenuSection />
            <CoolDrinksSection />
            <VenueSection />
            <FAQSection />
          </div>

          {/* Booking Sidebar - Right Side (Sticky) */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="booking-sidebar">
              <BookingSidebar />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Popups */}
      <ExitIntentPopup />
      <SalesPopup />
    </div>
  );
}
