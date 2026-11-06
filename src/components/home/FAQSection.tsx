import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'How does Cash on Delivery (COD) work across Pakistan?',
    answer:
      'With Cash on Delivery, you place your order online with zero upfront payment. We dispatch the sealed electronic parcel via TCS, Leopards, or Trax. When the courier rider arrives at your doorstep, you inspect the outer parcel and hand over the exact cash amount in Pakistani Rupees.',
  },
  {
    question: 'Are all smartphones officially PTA Approved and tax paid?',
    answer:
      'Yes, 100%. Every smartphone and cellular device sold by MOKHS.STORE is officially PTA Approved with all customs taxes paid. You can verify the IMEI immediately with Pakistan Telecommunication Authority by sending an SMS to 8484 or via the official DIRBS website.',
  },
  {
    question: 'What are the courier delivery timelines for major Pakistani cities?',
    answer:
      'Lahore orders are dispatched locally within 24 hours (often same day). Orders to Karachi, Islamabad, and Rawalpindi typically arrive within 24 to 48 hours. Orders to Faisalabad, Multan, Peshawar, Quetta, and other cities arrive within 2 to 3 working days.',
  },
  {
    question: 'How does the 1-Year Official Warranty work?',
    answer:
      'All products come with genuine manufacturer warranty cards and digital tax invoices. In case of any technical malfunction, you can visit any authorized brand service center across Pakistan or contact our dedicated MOKHS support team for assistance.',
  },
  {
    question: 'Can I pay online with JazzCash or Easypaisa?',
    answer:
      'Yes! MOKHS.STORE supports Pakistani digital payments. Our payment gateway architecture integrates with official JazzCash, Easypaisa, and Debit/Credit cards. You can select your preferred payment mode during checkout.',
  },
  {
    question: 'What is your 7-Day Replacement Guarantee?',
    answer:
      'If your item arrives with transit damage or factory hardware failure, notify us within 7 days of receiving the package. We will arrange a free courier pickup from your address and dispatch a brand new replacement immediately.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
          Got Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Everything you need to know about shopping smart electronics at MOKHS.STORE in Pakistan.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-colors"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs sm:text-sm font-semibold text-slate-900">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
