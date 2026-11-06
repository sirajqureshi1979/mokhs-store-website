import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const whatsappUrl =
    'https://wa.me/923001234567?text=Hello%20MOKHS.STORE,%20I%20have%20an%20inquiry%20regarding%20an%20electronics%20order.';

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MOKHS.STORE on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full shadow-2xl transition-all duration-200 hover:scale-105 group font-medium text-xs cursor-pointer"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span className="hidden sm:inline font-semibold">WhatsApp Support</span>
    </a>
  );
};
