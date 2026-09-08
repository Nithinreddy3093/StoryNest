import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { StoryNestLogo } from './StoryNestLogo';
import { ReadingRoomLamp } from './ReadingRoomLamp';
import {
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  BookOpen,
  PenTool,
  Sparkles,
  Lightbulb,
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
    authErrorMessage,
    setAuthErrorMessage,
    login,
    signInWithGoogle,
    signup,
    resetPassword,
  } = useApp();

  // Form Fields & States
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
  const [formError, setFormError] = useState<string | null>(null);

  // Lamp Interaction & Illumination Sequence State
  const [isLampOn, setIsLampOn] = useState(false);
  const [lightPhase, setLightPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [showAuthCard, setShowAuthCard] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

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

  // Reset local state when modal opens or closes
  useEffect(() => {
    setFormError(null);
    if (!showAuthModal) {
      setForgotSent(false);
      setPassword('');
      setConfirmPassword('');
      setIsSubmitting(false);
      setAuthErrorCode(null);
      // Reset lamp to dark for next time modal is opened
      setIsLampOn(false);
      setLightPhase(0);
      setShowAuthCard(false);
    }
  }, [showAuthModal, authModalMode, setAuthErrorCode]);

  // Smooth sequence to turn on the lamp and reveal the authentication interface
  const handleTurnOnLamp = useCallback(() => {
    if (isLampOn) return;
    setIsLampOn(true);

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      setLightPhase(4);
      setShowAuthCard(true);
      setTimeout(() => emailInputRef.current?.focus(), 150);
      return;
    }

    // 0% -> 25% -> 50% -> 75% -> 100% illumination staging
    setLightPhase(1); // 25% faint filament glow
    setTimeout(() => setLightPhase(2), 120); // 50% warm illumination
    setTimeout(() => setLightPhase(3), 260); // 75% stronger light
    setTimeout(() => {
      setLightPhase(4); // 100% full warm light
      setTimeout(() => {
        setShowAuthCard(true);
        // Gently focus the email input once revealed
        setTimeout(() => emailInputRef.current?.focus(), 300);
      }, 150);
    }, 420);
  }, [isLampOn]);

  if (!showAuthModal) return null;

  // Google Sign In handler
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setFormError(null);
    setAuthErrorCode(null);
    setAuthErrorMessage(null);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        setShowAuthModal(false);
      } else {
        if (
          res.errorCode === 'auth/popup-closed-by-user' ||
          res.errorCode === 'auth/cancelled-popup-request'
        ) {
          // Normal cancellation by user: keep UI clean
          setFormError(null);
        } else {
          setFormError(
            res.errorMessage ||
              'Unable to sign in with Google. Please try again or sign in with your email and password.'
          );
        }
      }
    } catch {
      setFormError('Unable to sign in with Google. Please try again or use your email.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Form submission handler
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
        const res = await login(cleanEmail, password);
        if (res.success) {
          setShowAuthModal(false);
        } else {
          if (res.errorCode === 'auth/operation-not-allowed') {
            setFormError(
              'Email/Password provider is disabled in Firebase Console. Please continue with Google or enable the provider in Firebase Console.'
            );
          } else {
            setFormError(
              res.errorMessage ||
                'Incorrect email or password. If you are new to StoryNest, please switch to Create Account, or continue with Google.'
            );
          }
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
        const res = await signup(name.trim(), cleanEmail, password, role);
        if (res.success) {
          setShowAuthModal(false);
        } else {
          if (res.errorCode === 'auth/email-already-in-use') {
            setAuthModalMode('login');
            setFormError(
              'An account with this email already exists. Please enter your password or sign in with Google.'
            );
          } else if (res.errorCode === 'auth/operation-not-allowed') {
            setFormError(
              'Email/Password provider is disabled in Firebase Console. Please continue with Google or enable the provider in Firebase Console.'
            );
          } else {
            setFormError(res.errorMessage || 'Could not create account. Please try again.');
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    } else if (authModalMode === 'forgot') {
      setIsSubmitting(true);
      try {
        const res = await resetPassword(cleanEmail);
        if (res.success) {
          setForgotSent(true);
        } else {
          setFormError(res.errorMessage || 'Could not send password reset email.');
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/92 backdrop-blur-xl overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Immersive Midnight Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative w-full max-w-5xl bg-[#060a13] border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden my-auto max-h-[96vh] flex flex-col scrollbar-thin scrollbar-thumb-slate-800"
      >
        {/* Dynamic Warm Ambient Glow when lamp is illuminated */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-out"
          style={{
            opacity: isLampOn ? 1 : 0,
            background:
              'radial-gradient(ellipse at 25% 45%, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.05) 55%, transparent 80%)',
          }}
        />

        {/* Top Bar: Brand & Close Button */}
        <div className="relative z-30 flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 border-b border-slate-800/60 bg-[#060a13]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <StoryNestLogo size="sm" showTagline={false} />
            <div className="hidden sm:block text-xs font-serif-heading text-slate-400 italic">
              "Where every story finds a reader."
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick accessible switch button if lamp is off */}
            {!isLampOn && (
              <button
                type="button"
                onClick={handleTurnOnLamp}
                className="text-[11px] font-semibold text-amber-400/90 hover:text-amber-300 hover:underline transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Enter StoryNest</span>
              </button>
            )}

            <button
              onClick={() => setShowAuthModal(false)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
              aria-label="Close authentication modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content: Split Composition on Desktop / Vertical Stack on Mobile */}
        <div className="relative z-20 grid grid-cols-1 md:grid-cols-12 flex-1 overflow-y-auto">
          {/* ==================================================== */}
          {/* LEFT COLUMN: THE NOCTURNAL READING LAMP & DESK SCENE */}
          {/* ==================================================== */}
          <div className="md:col-span-5 lg:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800/60 relative overflow-hidden bg-gradient-to-b from-[#060a13] via-[#080e1a] to-[#050811]">
            <ReadingRoomLamp
              isLampOn={isLampOn}
              lightPhase={lightPhase}
              onTurnOn={handleTurnOnLamp}
              className="w-full my-auto"
            />

            {/* Atmosphere quote below desk on larger screens */}
            <p className="mt-3 text-center text-[11px] font-serif-heading italic text-slate-400 max-w-xs transition-opacity duration-700">
              {isLampOn ? (
                <span className="text-amber-300/80">
                  "Where every story finds a reader."
                </span>
              ) : (
                <span className="text-slate-400">
                  Pull the string to enter StoryNest.
                </span>
              )}
            </p>
          </div>

          {/* ==================================================== */}
          {/* RIGHT COLUMN: REVEALED STORYNEST AUTHENTICATION CARD */}
          {/* ==================================================== */}
          <div className="md:col-span-7 lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-center relative min-h-[460px] bg-gradient-to-br from-[#060a13] to-[#0a101d]">
            <AnimatePresence mode="wait">
              {!showAuthCard ? (
                /* ================================================ */
                /* INITIAL OFF STATE: DARK QUIET ROOM INTRO         */
                /* ================================================ */
                <motion.div
                  key="unlit-intro"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35 }}
                  className="text-center py-8 sm:py-12 space-y-5 my-auto max-w-md mx-auto"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
                    <BookOpen className="w-7 h-7" />
                  </div>

                  <div>
                    <h2
                      id="auth-modal-title"
                      className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100 mb-2"
                    >
                      Welcome to StoryNest
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                      "Where every story finds a reader."
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Pull the string to enter StoryNest, or click below to proceed.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleTurnOnLamp}
                      className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/25 inline-flex items-center gap-2 group cursor-pointer active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                      <span>Enter StoryNest</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ================================================ */
                /* REVEALED STATE: STORYNEST AUTHENTICATION CARD     */
                /* ================================================ */
                <motion.div
                  key="auth-card-revealed"
                  initial={{ opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md mx-auto my-auto p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#080d17]/85 backdrop-blur-2xl border border-white/[0.08] border-l-amber-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_1px_0_0_rgba(245,158,11,0.12),0_25px_60px_rgba(0,0,0,0.65)] space-y-4 relative"
                >
                  {/* Subtle warm reflection glow on the left edge from the lamp */}
                  <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-r from-amber-500/20 to-transparent rounded-l-2xl sm:rounded-l-3xl pointer-events-none" />

                  {/* Card Header */}
                  <div className="text-left mb-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-serif-heading font-bold text-sm tracking-wide text-amber-400/90">
                        StoryNest
                      </span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[11px] font-sans text-slate-400">Library Sanctuary</span>
                    </div>

                    <h2
                      id="auth-modal-title"
                      className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight"
                    >
                      {authModalMode === 'login' && 'Welcome back'}
                      {authModalMode === 'signup' && 'Create Your Account'}
                      {authModalMode === 'forgot' && 'Reset Your Password'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-serif-heading italic">
                      {authModalMode === 'login' && '"Where every story finds a reader."'}
                      {authModalMode === 'signup' && 'Join authors and readers to share your stories.'}
                      {authModalMode === 'forgot' && 'Enter your email to receive password reset instructions.'}
                    </p>
                  </div>

                  {/* Google 1-Click Sign-In */}
                  {authModalMode !== 'forgot' && (
                    <div>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading || isSubmitting}
                        className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-800/95 border border-white/[0.08] hover:border-amber-500/40 text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-60 cursor-pointer group"
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
                        <span>
                          {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                        </span>
                      </button>

                      {/* Divider */}
                      <div className="relative my-3.5">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-800/80" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-[#080d17] px-3 text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                            OR WITH EMAIL &amp; PASSWORD
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode Switcher Tabs */}
                  {authModalMode !== 'forgot' && (
                    <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setFormError(null);
                          setAuthModalMode('login');
                        }}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
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
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          authModalMode === 'signup'
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        Create Account
                      </button>
                    </div>
                  )}

                  {/* Error Banners */}
                  {formError && (
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Invalid Credentials Helpful Assistance */}
                  {(authErrorCode === 'auth/invalid-credential' ||
                    authErrorCode === 'auth/wrong-password' ||
                    authErrorCode === 'auth/user-not-found') &&
                    authModalMode === 'login' && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-300 text-xs leading-relaxed space-y-2">
                        <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Incorrect Email or Password</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-normal">
                          If you haven't created a password account yet, or registered previously with Google, you can easily create an account or sign in with Google:
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setFormError(null);
                              setAuthErrorCode(null);
                              setAuthModalMode('signup');
                            }}
                            className="flex-1 py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg transition-all text-center cursor-pointer shadow-sm"
                          >
                            Create Account
                          </button>
                          <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading}
                            className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] rounded-lg border border-slate-700 transition-all text-center cursor-pointer"
                          >
                            Sign In with Google
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Account Already Registered Notification */}
                  {authErrorCode === 'auth/email-already-in-use' && (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-slate-300 text-xs leading-relaxed">
                      <div className="flex items-center gap-1.5 font-semibold text-sky-400 mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Account Already Registered</span>
                      </div>
                      <p className="text-slate-300 mb-2">
                        An account with <strong className="text-amber-400">{email || 'this email'}</strong> already exists. Sign in with Google with 1-click:
                      </p>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Sign In with Google ({email || '1-Click'})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Continue with Google Notification */}
                  {authErrorCode === 'auth/operation-not-allowed' && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-slate-300 text-xs leading-relaxed">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>Continue with Google</span>
                      </div>
                      <p className="text-slate-300 mb-2">
                        Please continue with Google to access your StoryNest account:
                      </p>
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isGoogleLoading}
                        className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Continue with Google</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Forgot Password Confirmation View */}
                  {authModalMode === 'forgot' && forgotSent ? (
                    <div className="text-center py-6 space-y-4">
                      <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-100 mb-1">
                          Check Your Email
                        </h4>
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
                        className="px-5 py-2.5 text-xs font-semibold bg-amber-500 text-slate-950 rounded-xl hover:bg-amber-400 transition-colors inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Back to Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Main Form */
                    <form onSubmit={handleSubmit} className="space-y-3.5">
                      {/* Signup Full Name */}
                      {authModalMode === 'signup' && (
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              required
                              placeholder="Jane Doe"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-[#0b111e] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                            />
                          </div>
                        </div>
                      )}

                      {/* Email Address */}
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            ref={emailInputRef}
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#0b111e] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                          />
                        </div>
                      </div>

                      {/* Password */}
                      {authModalMode !== 'forgot' && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-slate-300">Password</label>
                            {authModalMode === 'login' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setFormError(null);
                                  setAuthModalMode('forgot');
                                }}
                                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition-colors cursor-pointer"
                              >
                                Forgot password?
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
                              className="w-full bg-[#0b111e] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition-colors cursor-pointer"
                              aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                              {showPassword ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Signup Confirm Password & Role Selection */}
                      {authModalMode === 'signup' && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Confirm Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-[#0b111e] border border-slate-700/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 transition-colors cursor-pointer"
                                aria-label={
                                  showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                                }
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="w-3.5 h-3.5" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Account Purpose
                            </label>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <button
                                type="button"
                                onClick={() => setRole('reader')}
                                className={`p-2.5 rounded-xl border text-center font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
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
                                className={`p-2.5 rounded-xl border text-center font-medium transition-all flex items-center justify-center gap-2 cursor-pointer ${
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

                      {/* Submit Action Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting || isGoogleLoading}
                        className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                            <span>
                              {authModalMode === 'login' && 'Signing in...'}
                              {authModalMode === 'signup' && 'Creating account...'}
                              {authModalMode === 'forgot' && 'Sending reset link...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              {authModalMode === 'login' && 'Sign In to StoryNest'}
                              {authModalMode === 'signup' && 'Create StoryNest Account'}
                              {authModalMode === 'forgot' && 'Send Password Reset Link'}
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Back to sign in link for forgot mode */}
                      {authModalMode === 'forgot' && (
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormError(null);
                              setAuthModalMode('login');
                            }}
                            className="text-xs text-slate-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Remembered your password? Back to Sign In</span>
                          </button>
                        </div>
                      )}
                    </form>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
