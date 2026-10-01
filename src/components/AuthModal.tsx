import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  ShieldCheck,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  AlertCircle,
  Mail,
  Lock,
  LogIn,
  UserPlus,
  KeyRound,
  RotateCcw,
  Check,
  ExternalLink,
} from 'lucide-react';

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
    signInWithEmail,
    signUpWithEmail,
    requestPasswordResetCode,
    verifyPasswordResetCode,
    continueAsGuest,
    isPasswordRecovery,
    setIsPasswordRecovery,
  } = useAuth();

  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [forgotStep, setForgotStep] = useState<'send_code' | 'enter_code'>('send_code');

  const [email, setEmail] = useState(() => user?.email || '');
  const [password, setPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [successReset, setSuccessReset] = useState(false);

  // Automatically switch to password recovery if opened from email link or URL hash
  useEffect(() => {
    const hash = window.location.hash || '';
    const search = window.location.search || '';
    if (isPasswordRecovery || hash.includes('type=recovery') || search.includes('type=recovery')) {
      setAuthMode('forgot');
      setForgotStep('enter_code');
      setInfoMsg('Email verified! Please enter your new password below.');
    }
  }, [isPasswordRecovery]);

  if (!isOpen && !isPasswordRecovery) return null;

  // Standard Login / Signup
  const handleStandardAuth = async (e: React.FormEvent) => {
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
      setInfoMsg(null);
      if (authMode === 'signup') {
        await signUpWithEmail(email, password);
        setInfoMsg(`Account created for ${email}! You can now sign in, or click "Open as Guest" to enter immediately.`);
      } else {
        await signInWithEmail(email, password);
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already registered')) {
        setErrorMsg('This email is already registered! Please switch to the "Sign In" tab to log in with your password.');
      } else if (msg.includes('rate limit') || msg.includes('once every')) {
        setErrorMsg('Email rate limit reached. Please wait a moment or click "Open as Guest" to start building immediately!');
      } else {
        setErrorMsg(msg || 'Authentication error. You can also click "Open as Guest" below.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Send Reset Link to Email
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      setInfoMsg(null);
      await requestPasswordResetCode(cleanEmail);
      setForgotStep('enter_code');
      setInfoMsg(`A reset email has been sent to ${cleanEmail}. Click the link inside the email or paste it below.`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to send reset email. Please verify your email address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Set New Password (via email recovery link or code)
  const handleVerifyResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    // If not opened via direct link, code/link is required
    if (!isPasswordRecovery && !resetCode.trim()) {
      setErrorMsg('Please enter the code or paste the link from your email.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await verifyPasswordResetCode(email, resetCode, newPassword);
      setSuccessReset(true);
      setInfoMsg('Password updated successfully! Signing you in...');
      if (setIsPasswordRecovery) setIsPasswordRecovery(false);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1200);
    } catch (err: any) {
      // Direct rescue: Try signing in or creating account with this password directly!
      const targetEmail = (email.trim() || user?.email || '').toLowerCase();
      let rescued = false;
      if (targetEmail) {
        try {
          await signInWithEmail(targetEmail, newPassword);
          rescued = true;
        } catch {
          try {
            await signUpWithEmail(targetEmail, newPassword);
            rescued = true;
          } catch {
            // Both failed
          }
        }
      }

      if (rescued) {
        setSuccessReset(true);
        setInfoMsg('Signed in successfully! Entering your workspace...');
        if (setIsPasswordRecovery) setIsPasswordRecovery(false);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          if (onClose) onClose();
        }, 1000);
        return;
      }

      setErrorMsg(err?.message || 'Invalid or expired reset link. You can enter as Guest below.');
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
        {/* Ambient glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {canDismiss && onClose && (
          <button
            onClick={() => {
              if (setIsPasswordRecovery) setIsPasswordRecovery(false);
              onClose();
            }}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            aria-label="Close"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2 mb-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            {authMode === 'forgot' ? <KeyRound className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {authMode === 'forgot' ? 'Reset Your Password' : 'FolioCraft Workspace'}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {authMode === 'forgot'
              ? 'Secure password recovery sent directly to your verified email address.'
              : 'Save & sync your resumes across all your devices, or open as guest to start immediately.'}
          </p>
        </div>

        {/* Top 3 Navigation Tabs: Sign In | Create Account | Reset Password */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-3.5">
          <button
            type="button"
            onClick={() => {
              setAuthMode('signin');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
              setInfoMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('forgot');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer ${
              authMode === 'forgot'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Reset Password</span>
          </button>
        </div>

        {/* Info/Success banner */}
        {infoMsg && (
          <div className="mb-3 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-2 text-xs text-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{infoMsg}</div>
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div className="mb-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col gap-1.5 text-xs text-amber-200 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
            {errorMsg.toLowerCase().includes('rate limit') && (
              <button
                type="button"
                onClick={() => {
                  setForgotStep('enter_code');
                  setErrorMsg(null);
                  setInfoMsg('Check your Gmail inbox for the email sent earlier. Click the link inside or paste it below!');
                }}
                className="mt-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold text-center cursor-pointer transition-colors shadow-sm"
              >
                Already received the email? Enter new password &rarr;
              </button>
            )}
            {errorMsg.toLowerCase().includes('expired') && (
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    setForgotStep('send_code');
                    setErrorMsg(null);
                    setResetCode('');
                  }}
                  className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold text-center cursor-pointer transition-colors"
                >
                  Send Fresh Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setErrorMsg(null);
                  }}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] text-center cursor-pointer transition-colors"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        )}

        {/* FORGOT PASSWORD WORKFLOW */}
        {authMode === 'forgot' ? (
          <div className="space-y-4">
            {forgotStep === 'send_code' && !isPasswordRecovery ? (
              <form onSubmit={handleSendResetCode} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Your Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    A secure password reset link will be sent to this email inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Fresh Reset Link'}</span>
                </button>

                {/* Helpful fallback if email doesn't arrive */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-[11px] text-slate-300">
                  <div className="font-medium text-slate-200 flex items-center gap-1.5">
                    <span>💡 Not receiving any email?</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    If your account was never registered in this new Supabase project, or if Supabase is temporarily rate-limiting emails, you can create your account directly with your desired password:
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Account with My Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleGuest}
                    className="w-full py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] cursor-pointer transition-all flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    <span>Or Open Workspace as Guest</span>
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    &larr; Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyResetCode} className="space-y-3">
                {/* If opened via direct email link, no code paste is required */}
                {isPasswordRecovery ? (
                  <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center gap-2.5 text-xs text-blue-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Your email link is verified! Enter your new password below.</span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Paste Reset Link or Code from Email
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="Paste link or code from email"
                        required={!isPasswordRecovery}
                        autoFocus
                        className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Tip: You can also just click the <strong>&quot;Reset password&quot;</strong> link in your email!
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    New Password (6+ characters)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || successReset}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Signing In...' : 'Set New Password & Sign In'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuest}
                  className="w-full py-2 bg-slate-800/80 hover:bg-slate-700 active:scale-[0.99] text-slate-200 hover:text-white rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-1.5 border border-slate-700/80 shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Or Enter Workspace Directly (No password needed) &rarr;</span>
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setForgotStep('send_code');
                      setErrorMsg(null);
                      setInfoMsg(null);
                      setResetCode('');
                    }}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Send Fresh Reset Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (setIsPasswordRecovery) setIsPasswordRecovery(false);
                      setAuthMode('signin');
                      setForgotStep('send_code');
                      setErrorMsg(null);
                      setInfoMsg(null);
                    }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* STANDARD SIGN IN / CREATE ACCOUNT */
          <>
            {/* Intro Checklist */}
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

            {/* Form */}
            <form onSubmit={handleStandardAuth} className="space-y-3">
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-slate-400">
                    Password (6+ characters)
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setForgotStep('send_code');
                        setErrorMsg(null);
                        setInfoMsg(null);
                      }}
                      className="text-[11px] text-blue-400 hover:text-blue-300 font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
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
                  ? 'Signing In...'
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
          </>
        )}
      </div>
    </div>
  );
};
