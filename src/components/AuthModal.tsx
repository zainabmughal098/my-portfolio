import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldCheck, CheckCircle2, AlertCircle, Mail, Lock, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

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
  const {
    user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'quick' | 'email-signin' | 'email-signup'>('quick');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen && user) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await signInWithGoogle();
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const code = err?.code || '';
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

      if (code === 'auth/unauthorized-domain') {
        setErrorMsg(
          `Google Sign-In is restricted for domain "${currentHost}". Please click "Continue as Guest" below or use Email & Password to use the app immediately!`
        );
      } else if (code === 'auth/popup-blocked') {
        setErrorMsg('Pop-up window was blocked by your browser. Please allow pop-ups for this site and try again.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled (the Google window was closed before finishing).');
      } else {
        setErrorMsg(err?.message || 'Failed to sign in. Please try again or continue as Guest.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      if (authMode === 'email-signup') {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists. Try signing in.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else if (code === 'auth/operation-not-allowed') {
        // Fallback to guest mode
        continueAsGuest();
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        setErrorMsg(err?.message || 'Authentication error. You can also Continue as Guest.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {canDismiss && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="text-center space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            FolioCraft Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
            Design stunning portfolio resumes, get real-time ATS scores, and export print-ready PDFs.
          </p>
        </div>

        {/* Benefits list */}
        <div className="my-5 space-y-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Multi-resume management & instant canvas switching</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Real-time ATS keyword matching & resume scoring</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>High-resolution PDF export with zero watermarks</span>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {authMode === 'quick' ? (
          <div className="space-y-3">
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 cursor-pointer text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSubmitting ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Instant Guest Mode */}
            <button
              onClick={handleGuest}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30 text-blue-300 hover:text-white border border-blue-500/30 rounded-xl transition-all font-medium text-xs cursor-pointer group"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
              <span>Continue as Guest (Instant Access)</span>
              <ArrowRight className="w-3 h-3 text-blue-400 ml-1" />
            </button>

            {/* Email Option Toggle */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setAuthMode('email-signin')}
                className="text-xs text-slate-400 hover:text-slate-200 underline decoration-slate-600 underline-offset-4 cursor-pointer"
              >
                Or sign in with Email & Password
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Processing...'
                : authMode === 'email-signup'
                ? 'Create Account'
                : 'Sign In'}
            </button>

            <div className="flex items-center justify-between pt-2 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === 'email-signin' ? 'email-signup' : 'email-signin')
                }
                className="hover:text-blue-400 underline underline-offset-2 cursor-pointer"
              >
                {authMode === 'email-signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>

              <button
                type="button"
                onClick={() => setAuthMode('quick')}
                className="hover:text-slate-200 cursor-pointer"
              >
                Back to options
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 pt-3 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-500">
            Works across all modern browsers on desktop, tablet, and mobile.
          </p>
        </div>
      </div>
    </div>
  );
};
