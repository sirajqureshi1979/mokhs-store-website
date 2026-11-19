import React, { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { BOTTLE_SPECS, type BottleIndex, type PumpFinish } from '../three/types';

interface OrderSectionProps {
  activeBottle: BottleIndex;
  finish: PumpFinish;
  onSelectBottle: (bottle: BottleIndex) => void;
  onSelectFinish: (finish: PumpFinish) => void;
}

// Orders are sent to this WhatsApp number (country code, no + or spaces)
const WHATSAPP_NUMBER = '923000249960';
const WHATSAPP_DISPLAY = '+92 300 0249960';

export const OrderSection: React.FC<OrderSectionProps> = ({
  activeBottle,
  finish,
  onSelectBottle,
  onSelectFinish,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [qty, setQty] = useState('1');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('Cash on Delivery');
  const [error, setError] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = phone.replace(/[^\d+]/g, '');
    if (name.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (cleanedPhone.length < 10) {
      setError('Please enter a valid 10–13 digit phone number (e.g. 0300 1234567).');
      return;
    }
    if (city.trim().length < 2 || address.trim().length < 6) {
      setError('Please enter your city and complete delivery address.');
      return;
    }

    setError('');
    const bottleLabel = BOTTLE_SPECS[activeBottle].shortLabel;
    const finishLabel = finish === 'white' ? 'Pearl White' : 'Obsidian Black';

    const msg = [
      'Assalam o Alaikum MOKHS! I want to order:',
      `• Product: MOKHS Automatic Water Pump (${finishLabel}) × ${qty}`,
      `• Primary bottle size: ${bottleLabel}`,
      `• Name: ${name.trim()}`,
      `• Phone: ${phone.trim()}`,
      `• City: ${city.trim()}`,
      `• Address: ${address.trim()}`,
      `• Payment: ${payment}`,
    ].join('\n');

    setOrderMessage(msg);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!orderMessage) return;
    try {
      await navigator.clipboard.writeText(orderMessage);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const waHref = orderMessage
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderMessage)}`
    : '#order';

  return (
    <section
      id="order"
      data-scene="order"
      className="relative z-10 flex min-h-screen items-center px-5 pt-20 pb-36 sm:px-10 lg:px-16"
    >
      <div className="mx-auto w-full max-w-[1360px]">
        <div className="w-full max-w-[540px] rounded-2xl border border-sky-200/14 bg-[#051022]/90 p-6 sm:p-8 lg:w-[45vw]">
          <p className="text-xs font-medium tracking-wide text-sky-300">
            Nationwide delivery across Pakistan
          </p>
          <h2 className="mt-2.5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Get yours delivered.
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Cash on Delivery · JazzCash · Easypaisa
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:border-emerald-300/60"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Order on WhatsApp: {WHATSAPP_DISPLAY}
          </a>

          {/* Synced 3D Configurator Options */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <span className="block text-xs font-medium text-slate-400">
                Finish
              </span>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-lg bg-[#081933] p-1">
                <button
                  type="button"
                  onClick={() => onSelectFinish('white')}
                  className={`h-9 rounded-md text-xs font-semibold transition-colors ${
                    finish === 'white'
                      ? 'bg-sky-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Pearl White
                </button>
                <button
                  type="button"
                  onClick={() => onSelectFinish('black')}
                  className={`h-9 rounded-md text-xs font-semibold transition-colors ${
                    finish === 'black'
                      ? 'bg-sky-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Obsidian Black
                </button>
              </div>
            </div>

            <div>
              <span className="block text-xs font-medium text-slate-400">
                Preview bottle size
              </span>
              <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-lg bg-[#081933] p-1">
                {BOTTLE_SPECS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onSelectBottle(b.id)}
                    className={`h-9 rounded-md text-[11px] font-semibold transition-colors ${
                      activeBottle === b.id
                        ? 'bg-sky-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {b.id === 2 ? '1.5 L' : b.shortLabel.replace(' Gallon', ' Gal')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3.5" noValidate>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-300">
                Full name
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="mt-1.5 h-11 w-full rounded-lg border border-sky-200/16 bg-[#030b17] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                Phone number
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03xx xxxxxxx"
                  className="mt-1.5 h-11 w-full rounded-lg border border-sky-200/16 bg-[#030b17] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <label className="block text-xs font-medium text-slate-300">
                City
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Karachi, Lahore, Islamabad"
                  className="mt-1.5 h-11 w-full rounded-lg border border-sky-200/16 bg-[#030b17] px-3.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              </label>

              <label className="block text-xs font-medium text-slate-300">
                Quantity
                <select
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-sky-200/16 bg-[#030b17] px-3.5 text-sm text-white focus:border-sky-400 focus:outline-none"
                >
                  <option value="1">1 Pump</option>
                  <option value="2">2 Pumps</option>
                  <option value="3">3 Pumps</option>
                  <option value="4">4 Pumps</option>
                  <option value="5">5 Pumps</option>
                </select>
              </label>
            </div>

            <label className="block text-xs font-medium text-slate-300">
              Delivery address
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House, street, sector or area"
                className="mt-1.5 w-full rounded-lg border border-sky-200/16 bg-[#030b17] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
            </label>

            <label className="block text-xs font-medium text-slate-300">
              Payment method
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="mt-1.5 h-11 w-full rounded-lg border border-sky-200/16 bg-[#030b17] px-3.5 text-sm text-white focus:border-sky-400 focus:outline-none"
              >
                <option value="Cash on Delivery">Cash on Delivery</option>
                <option value="JazzCash">JazzCash</option>
                <option value="Easypaisa">Easypaisa</option>
              </select>
            </label>

            {error && (
              <p role="alert" className="text-xs font-medium text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-lg bg-sky-400 px-5 text-sm font-semibold text-slate-950 transition-colors duration-150 hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
            >
              Prepare WhatsApp Order
            </button>

            {orderMessage && (
              <div className="mt-4 rounded-xl border border-sky-400/35 bg-sky-400/8 p-4">
                <p className="text-xs font-semibold text-sky-200">
                  Your order is ready — tap “Send on WhatsApp” to send it to MOKHS ({WHATSAPP_DISPLAY}):
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200">
                  {orderMessage}
                </pre>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-sky-400 px-4 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-300"
                  >
                    Send on WhatsApp
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-sky-200/20 bg-[#081933] px-4 text-xs font-semibold text-slate-100 transition-colors hover:border-sky-400/50"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        Copy Message
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};
