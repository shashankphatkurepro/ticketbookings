'use client';

import { useState } from 'react';
import { eventData, resortInfo } from '../data/eventData';
import { HelpCircle, ChevronDown, Phone, MessageCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="glass-strong rounded-3xl p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <HelpCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Frequently Asked Questions</h2>
          <p className="text-sm text-gray-500">Got questions? We&apos;ve got answers</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {eventData.faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={index}
              className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen ? 'shadow-lg ring-2 ring-indigo-100' : 'hover:shadow-md'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
                aria-expanded={isOpen}
              >
                <span className={`font-medium pr-4 transition-colors ${isOpen ? 'text-indigo-600' : 'text-gray-800'}`}>
                  {faq.question}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                    isOpen ? 'bg-indigo-100 rotate-180' : 'bg-gray-100'
                  }`}
                >
                  <ChevronDown className={`w-5 h-5 transition-colors ${isOpen ? 'text-indigo-600' : 'text-gray-500'}`} />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contact CTA */}
      <div className="mt-6 pt-6 border-t border-gray-200/50">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Still have questions?</p>
                <p className="text-sm text-gray-500">We&apos;re here to help you</p>
              </div>
            </div>
            <a
              href={`tel:${resortInfo.phone}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-xl transition-colors"
            >
              <Phone className="w-4 h-4" />
              {resortInfo.phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
