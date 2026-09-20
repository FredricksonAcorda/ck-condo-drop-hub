"use client";

import { useState } from "react";

export interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

export default function FAQAccordion({ items, className = "" }: FAQAccordionProps) {
  // First FAQ open by default for immediate visual feedback
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`border-2 rounded-2xl transition-all duration-200 overflow-hidden bg-white ${
              isOpen
                ? "border-brand-red/80 shadow-md"
                : "border-brand-border hover:border-gray-300 hover:shadow-xs"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between text-left gap-4 transition-colors cursor-pointer select-none"
              aria-expanded={isOpen}
            >
              <span
                className={`text-base sm:text-lg lg:text-xl font-bold transition-colors ${
                  isOpen ? "text-brand-red" : "text-brand-text"
                }`}
              >
                {item.question}
              </span>
              <span
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                  isOpen
                    ? "bg-brand-red text-white rotate-180 shadow-xs"
                    : "bg-brand-surface text-brand-text hover:bg-gray-200"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>

            {isOpen && (
              <div className="px-6 sm:px-8 pb-6 sm:pb-7 pt-2 text-base sm:text-[17px] text-brand-text-secondary leading-relaxed border-t border-gray-100 animate-in fade-in duration-150">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
