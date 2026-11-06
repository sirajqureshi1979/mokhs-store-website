import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreDatabase } from '../../services/db';

export const ContactModal: React.FC = () => {
  const { isContactModalOpen, setIsContactModalOpen, showToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+92 3');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isContactModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Validation Error', 'Please complete the required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    StoreDatabase.addEnquiry({
      name,
      email,
      phone,
      subject: subject || 'General Customer Enquiry',
      message,
    });

    setIsSubmitting(false);
    setIsContactModalOpen(false);
    showToast(
      'Message Received',
      'Thank you! A MOKHS.STORE support specialist will contact you shortly.',
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Contact MOKHS.STORE Support</h3>
            <p className="text-xs text-slate-500">
              Assisting customers across Pakistan with product guidance, order tracking & warranty
            </p>
          </div>

          <button
            onClick={() => setIsContactModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left contact info */}
          <div className="md:col-span-2 space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
            <div>
              <span className="font-bold text-slate-900 block mb-1">Corporate Office</span>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Suite 402, Al-Hafeez Heights, Main Boulevard, Gulberg III, Lahore, Pakistan</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1">Direct Helplines</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-mono">+92 300 1234567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>support@mokhs.store</span>
                </div>
              </div>
            </div>

            <div>
              <span className="font-bold text-slate-900 block mb-1">Support Hours</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Monday – Saturday: 10:00 AM – 9:00 PM PKT</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mobile (+92)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question about PTA approval on Zenith 15 Pro"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Message *</label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our technical support team assist you today?"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Customer Enquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
