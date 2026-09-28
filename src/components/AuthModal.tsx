import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onGoogleAuth: (preferredCity?: string, customDisplayName?: string) => Promise<void>;
  onDirectProfileSession: (
    name: string,
    email: string,
    preferredCity: string,
    mode: 'login' | 'register'
  ) => void;
  authError: string | null;
  isAuthenticating: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onGoogleAuth,
  onDirectProfileSession,
  authError,
  isAuthenticating,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('Clara Vance');
  const [email, setEmail] = useState('clara.vance@atelier.studio');
  const [password, setPassword] = useState('••••••••••••');
  const [preferredCity, setPreferredCity] = useState('New York, NY');

  if (!isOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDirectProfileSession(
      fullName.trim() || 'Client Member',
      email.trim() || 'client@atelier.studio',
      preferredCity.trim() || 'New York, NY',
      mode
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#F4F4F0] text-[#141413] border border-[#D8D5CC] rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#E5E3DC] hover:bg-[#D8D5CC] flex items-center justify-center text-[#141413] transition-colors"
          aria-label="Close sign in dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <p className="text-xs text-[#C84B31] font-medium">
            Client Portal & Cloud Booking Sync
          </p>
          <h2 id="auth-modal-title" className="font-editorial text-3xl font-semibold mt-1">
            {mode === 'login' ? 'Sign In to Atelier Lumière' : 'Create Your Client Account'}
          </h2>
          <p className="text-xs text-[#57554F] mt-1">
            Manage upcoming photo shoots, download call sheets, and sync bookings across devices.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-[#E5E3DC] rounded-lg">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-medium rounded-md transition-colors ${
              mode === 'login'
                ? 'bg-white text-[#141413] shadow-xs'
                : 'text-[#57554F] hover:text-[#141413]'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-medium rounded-md transition-colors ${
              mode === 'register'
                ? 'bg-white text-[#141413] shadow-xs'
                : 'text-[#57554F] hover:text-[#141413]'
            }`}
          >
            Register
          </button>
        </div>

        {authError && (
          <div className="p-3 rounded-lg bg-[#FDF2F0] border border-[#E6B8AF] text-xs text-[#9E2A1B]">
            {authError}
          </div>
        )}

        <button
          type="button"
          disabled={isAuthenticating}
          onClick={() => onGoogleAuth(preferredCity, fullName)}
          className="w-full py-2.5 px-4 bg-[#141413] hover:bg-[#2B2A27] disabled:opacity-60 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <ShieldCheck className="w-4 h-4 text-[#C84B31]" />
          <span>
            {isAuthenticating
              ? 'Connecting Google Account...'
              : mode === 'login'
              ? 'Continue with Google (Verified Cloud Sync)'
              : 'Register with Google (Verified Cloud Sync)'}
          </span>
        </button>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-[#DCD9D0]" />
          <span className="shrink mx-3 text-xs text-[#6E6B64]">
            or {mode === 'login' ? 'sign in' : 'register'} with client credentials
          </span>
          <div className="grow border-t border-[#DCD9D0]" />
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-fullname"
                className="block text-xs font-medium text-[#3D3B37] mb-1"
              >
                Full Name
              </label>
              <input
                id="auth-fullname"
                type="text"
                required
                maxLength={80}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="block text-xs font-medium text-[#3D3B37] mb-1"
            >
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="block text-xs font-medium text-[#3D3B37] mb-1"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          {mode === 'register' && (
            <div>
              <label
                htmlFor="auth-city"
                className="block text-xs font-medium text-[#3D3B37] mb-1"
              >
                Preferred Shoot City
              </label>
              <input
                id="auth-city"
                type="text"
                required
                maxLength={80}
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#D4D1C7] rounded-lg text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#C84B31] hover:bg-[#B03E26] text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <span>
              {mode === 'login' ? 'Sign In to Account' : 'Complete Registration'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
