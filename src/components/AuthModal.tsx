import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldCheck, CheckCircle2, UserCheck, ArrowRight, AlertCircle, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  canDismiss?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  canDismiss = true,
}) => {
  const { signInWithEmail, signUpWithEmail, continueAsGuest } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter your email.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      if (authMode === 'signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Incorrect password. Please try again.');
      } else if (code === 'auth/user-not-found') {
        setErrorMsg('No account found with this email. Switch to "Create Account" above to register.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Switch to "Sign In" above.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else {
        setErrorMsg(err?.message || 'Authentication error. You can also click "Open as Guest" below to start immediately.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    if (onSuccess) onSuccess();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2 mb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            FolioCraft Workspace
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Save & sync your resumes across all your devices, or open as guest to start immediately.
          </p>
        </div>

        {/* Intro Benefits Checklist */}
        <div className="mb-4 space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Multi-resume management & auto-save</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Real-time ATS keyword matching & resume scoring</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>High-resolution print-ready PDF export (Zero watermarks)</span>
          </div>
        </div>

        {/* Tab switch between Sign In and Create Account */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'signin'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2 text-xs text-amber-200 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              Password (6+ characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            {isSubmitting
              ? 'Processing...'
              : authMode === 'signup'
              ? 'Create Account & Sync'
              : 'Sign In to Your Resumes'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            OR
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Open as Guest */}
        <button
          onClick={handleGuest}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 hover:text-white font-semibold rounded-xl text-xs sm:text-sm border border-slate-700/80 transition-all cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span>Open as Guest (Instant Access)</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {canDismiss && onClose && (
          <div className="mt-3 text-center">
            <button
              onClick={onClose}
              className="text-[11px] text-slate-500 hover:text-slate-300 underline underline-offset-4 cursor-pointer"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
