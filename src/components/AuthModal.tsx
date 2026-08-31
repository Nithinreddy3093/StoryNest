import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StoryNestLogo } from './StoryNestLogo';
import { X, Lock, Mail, User, Sparkles, ArrowRight, CheckCircle2, ShieldCheck, AlertTriangle, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthModal: React.FC = () => {
  const {
    showAuthModal,
    setShowAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    signInWithGoogle,
    signup,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'reader' | 'author'>('reader');
  const [forgotSent, setForgotSent] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [domainError, setDomainError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!showAuthModal) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'my-story-nest.vercel.app';

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setDomainError(null);
    try {
      const ok = await signInWithGoogle();
      if (!ok) {
        // If signInWithGoogle returned false, check if current domain is likely the reason
        if (window.location.hostname && !window.location.hostname.includes('firebaseapp.com') && !window.location.hostname.includes('localhost')) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalMode === 'login') {
      if (!email.trim()) return;
      login(email);
    } else if (authModalMode === 'signup') {
      if (!email.trim()) return;
      if (password && confirmPassword && password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      signup(name, email, role);
    } else if (authModalMode === 'forgot') {
      if (!email.trim()) return;
      setForgotSent(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-[#0b111e] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
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
            {authModalMode === 'signup' && 'Create Your Account'}
            {authModalMode === 'forgot' && 'Reset Your Password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login' && 'Enter your credentials to access your library and stories'}
            {authModalMode === 'signup' && 'Join thousands of readers and writers on StoryNest'}
            {authModalMode === 'forgot' && 'We’ll send you password recovery instructions'}
          </p>
        </div>

        {/* Google Authentication via Firebase */}
        {authModalMode !== 'forgot' && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2.5 shadow-sm disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google (Firebase)'}</span>
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
                <span className="bg-[#0b111e] px-2 text-[11px] text-slate-500 uppercase tracking-wider">
                  or email
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        {authModalMode !== 'forgot' && (
          <div className="flex rounded-lg bg-slate-900/80 p-1 mb-5 border border-slate-800">
            <button
              onClick={() => setAuthModalMode('login')}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                authModalMode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthModalMode('signup')}
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

        {/* Forgot Password Confirmation */}
        {authModalMode === 'forgot' && forgotSent ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-950/60 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-300">
              If an account exists for <span className="text-amber-400 font-semibold">{email}</span>, you will receive a reset link shortly.
            </p>
            <button
              onClick={() => {
                setForgotSent(false);
                setAuthModalMode('login');
              }}
              className="px-5 py-2 text-xs font-semibold bg-amber-500 text-slate-950 rounded-lg hover:bg-amber-400"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalMode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            </div>

            {authModalMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('forgot')}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
            )}

            {authModalMode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-700/90 rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Account Purpose</label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRole('reader')}
                      className={`p-2 rounded-lg border text-center font-medium transition-all ${
                        role === 'reader'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Reader
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('author')}
                      className={`p-2 rounded-lg border text-center font-medium transition-all ${
                        role === 'author'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      Writer / Author
                    </button>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <span>
                {authModalMode === 'login' && 'Sign In to StoryNest'}
                {authModalMode === 'signup' && 'Create Free Account'}
                {authModalMode === 'forgot' && 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
