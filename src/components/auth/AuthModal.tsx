import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreDatabase } from '../../services/db';
import { MokhsLogo } from '../common/MokhsLogo';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser, registerUser, switchUserRole, showToast } = useStore();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+92 3');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const ok = loginUser(email);
      if (ok) {
        setIsAuthModalOpen(false);
      } else {
        showToast('Login Failed', 'No account found with this email. Try demo accounts below.', 'error');
      }
    } else {
      if (!name || !email || !phone) {
        showToast('Incomplete Fields', 'Please fill in all registration details.', 'error');
        return;
      }
      registerUser(name, email, phone);
      setIsAuthModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MokhsLogo variant="icon" size="md" />
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-none">
                {mode === 'login' ? 'Welcome Back' : 'Create Customer Account'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                MOKHS.STORE · Smart Electronics Pakistan
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                mode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              Customer Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                mode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              New Registration
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Ali"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mobile Number (+92)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 font-mono"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition-colors cursor-pointer mt-2"
            >
              {mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
            </button>
          </form>

          {/* Quick Demo Accounts for Verification */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Instant One-Click Test Login:
            </p>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  switchUserRole('super_admin');
                  setIsAuthModalOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700 hover:text-blue-700"
              >
                <span>Siraj Qureshi (Super Admin / Owner)</span>
                <span className="text-[10px] text-blue-600 font-mono">admin@mokhs.store</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUserRole('store_manager');
                  setIsAuthModalOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700 hover:text-blue-700"
              >
                <span>Tariq Mehmood (Store Manager)</span>
                <span className="text-[10px] text-blue-600 font-mono">manager@mokhs.store</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  switchUserRole('customer');
                  setIsAuthModalOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs flex items-center justify-between text-slate-700 hover:text-blue-700"
              >
                <span>Kamran Siddiqui (Karachi Customer)</span>
                <span className="text-[10px] text-blue-600 font-mono">kamran@gmail.com</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
