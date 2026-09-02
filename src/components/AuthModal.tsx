import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryNestLogo } from './StoryNestLogo';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  PenTool,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthModal: React.FC = () => {
  const {
    currentUser,
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    authErrorCode,
    setAuthErrorCode,
    login,
    signInWithGoogle,
    signup,
    resetPassword,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'reader' | 'author'>('reader');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-dismiss modal immediately once user authentication state is established
  useEffect(() => {
    if (currentUser && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [currentUser, showAuthModal, setShowAuthModal]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAuthModal) {
        setShowAuthModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthModal, setShowAuthModal]);

  // Reset local state when modal opens or mode changes
  useEffect(() => {
    setFormError(null);
    if (!showAuthModal) {
      setForgotSent(false);
      setPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
      setAuthErrorCode(null);
    }
  }, [showAuthModal, authModalMode, setAuthErrorCode]);

  if (!showAuthModal) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'my-story-nest.vercel.app';

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setDomainError(null);
    setFormError(null);
    setAuthErrorCode(null);
    try {
      const ok = await signInWithGoogle();
      if (ok) {
        setShowAuthModal(false);
      } else {
        if (
          window.location.hostname &&
          !window.location.hostname.includes('firebaseapp.com') &&
          !window.location.hostname.includes('localhost')
        ) {
          setDomainError(window.location.hostname);
        }
      }
    } catch (err: any) {
      if (err?.code === 'auth/unauthorized-domain') {
        setDomainError(window.location.hostname || 'my-story-nest.vercel.app');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const copyDomainToClipboard = () => {
    if (domainError || currentHost) {
      navigator.clipboard.writeText(domainError || currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setFormError('Please enter your email address.');
      return;
    }

    if (authModalMode === 'login') {
      if (!password) {
        setFormError('Please enter your password.');
        return;
      }
      setIsSubmitting(true);
      try {
        const ok = await login(cleanEmail, password);
        if (ok) {
          setShowAuthModal(false);
        } else if (authErrorCode === 'auth/operation-not-allowed') {
          setFormError('Email/Password provider is disabled in Firebase Console. Please continue with Google or enable the provider in Firebase Console.');
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (authModalMode === 'signup') {
      if (!name.trim()) {
        setFormError('Please enter your name.');
        return;
      }
      if (!password) {
        setFormError('Please create a password.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match. Please verify and try again.');
        return;
      }
      setIsSubmitting(true);
      try {
        const ok = await signup(name.trim(), cleanEmail, password, role);
        if (ok) {
          setShowAuthModal(false);
        } else {
          if (authErrorCode === 'auth/email-already-in-use') {
            setAuthModalMode('login');
            setFormError('An account with this email already exists. Please enter your password or sign in with Google.');
          } else if (authErrorCode === 'auth/operation-not-allowed') {
            setFormError('Email/Password provider is disabled in Firebase Console. Please continue with Google or enable the provider in Firebase Console.');
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (authModalMode === 'forgot') {
      setIsSubmitting(true);
      try {
        const ok = await resetPassword(cleanEmail);
        if (ok) {
          setForgotSent(true);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowAuthModal(false);
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-[#0b111e] border border-slate-700/80 rounded-2xl shadow-2xl p-5 sm:p-8 text-slate-100 my-auto scrollbar-thin scrollbar-thumb-slate-700"
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <StoryNestLogo size="md" />
          </div>
          <h3 className="font-serif-heading text-xl font-bold text-slate-100">
            {authModalMode === 'login' && 'Welcome Back'}
            {authModalMode === 'signup' && 'Create Your StoryNest Account'}
            {authModalMode === 'forgot' && 'Reset Your Password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login' && 'Sign in to access your digital library, bookmarks, and stories'}
            {authModalMode === 'signup' && 'Join authors and readers to discover and share inspiring stories'}
            {authModalMode === 'forgot' && 'Enter your email to receive password reset instructions'}
          </p>
        </div>

        {/* Google Authentication */}
        {authModalMode !== 'forgot' && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                  />
                </svg>
              )}
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {domainError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-300 text-[11px] leading-relaxed">
                <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Domain Authorization Required in Firebase</span>
                </div>
                <p className="text-slate-400 mb-2">
                  Firebase requires your deployed domain to be added to the whitelist.
                </p>
                <div className="flex items-center justify-between gap-2 p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-200">
                  <span className="truncate">{domainError}</span>
                  <button
                    type="button"
                    onClick={copyDomainToClipboard}
                    className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-sans font-medium transition-colors shrink-0"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-[10px] text-slate-500">
                  Go to <strong className="text-slate-400">Firebase Console &gt; Authentication &gt; Settings &gt; Authorized domains</strong> and add this domain.
                </p>
              </div>
            )}

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0b111e] px-2.5 text-[11px] text-slate-400 uppercase tracking-wider font-medium">
                  or with email &amp; password
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        {authModalMode !== 'forgot' && (
          <div className="flex rounded-lg bg-slate-900/90 p-1 mb-5 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setAuthModalMode('login');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                authModalMode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setAuthModalMode('signup');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                authModalMode === 'signup'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Form Error Banner */}
        {formError && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{formError}</span>
          </div>
        )}

        {/* Account Already Exists Banner (e.g. from Google Sign-In) */}
        {authErrorCode === 'auth/email-already-in-use' && (
          <div className="mb-4 p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-slate-300 text-xs leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-sky-400 mb-1.5">
              <Sparkles className="w-4 h-4" />
              <span>Account Already Registered</span>
            </div>
            <p className="text-slate-300 mb-2.5">
              An account with <strong className="text-amber-400">{email || 'this email'}</strong> is already registered. If you registered via Google, click below to sign in instantly with one tap.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" />
                  </svg>
                  <span>Sign In with Google ({email || '1-Click'})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Firebase Operation Not Allowed Helper Banner */}
        {authErrorCode === 'auth/operation-not-allowed' && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-300 text-xs leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Email/Password Sign-In Disabled</span>
            </div>
            <p className="text-slate-300 mb-2">
              The Email &amp; Password provider is not enabled in Firebase Console. Please use Google Sign-in to access your account instantly.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z" />
                    <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" />
                  </svg>
                  <span>Sign In with Google Instead</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Forgot Password Confirmation */}
        {authModalMode === 'forgot' && forgotSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-100 mb-1">Check Your Email</h4>
              <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                If an account exists for <span className="text-amber-400 font-semibold">{email}</span>, a secure password reset link has been dispatched.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setForgotSent(false);
                setAuthModalMode('login');
              }}
              className="px-5 py-2.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
            >
              <span>Back to Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup Full Name */}
            {authModalMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            {authModalMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setAuthModalMode('forgot');
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password & Role for Signup */}
            {authModalMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Purpose</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRole('reader')}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        role === 'reader'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Reader</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('author')}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        role === 'author'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Writer / Author</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || isGoogleLoading}
              className="w-full mt-3 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>
                    {authModalMode === 'login' && 'Signing In...'}
                    {authModalMode === 'signup' && 'Creating Account...'}
                    {authModalMode === 'forgot' && 'Sending Reset Link...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {authModalMode === 'login' && 'Sign In to StoryNest'}
                    {authModalMode === 'signup' && 'Create Free Account'}
                    {authModalMode === 'forgot' && 'Send Password Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to sign in link when in forgot mode */}
            {authModalMode === 'forgot' && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormError(null);
                    setAuthModalMode('login');
                  }}
                  className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                >
                  <span>Remembered your password? Back to Sign In</span>
                </button>
              </div>
            )}
          </form>
        )}
      </motion.div>
    </div>
  );
};
