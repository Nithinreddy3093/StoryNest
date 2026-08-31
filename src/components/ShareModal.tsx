import React, { useState } from 'react';
import { Story, User } from '../types';
import {
  X,
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Globe,
  Sparkles,
  BookOpen,
  User as UserIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: Story | null;
  user?: User | null;
  onToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  story,
  user,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || (!story && !user)) return null;

  // Determine share URL and metadata
  const baseUrl = window.location.origin + window.location.pathname;
  let shareUrl = '';
  let title = '';
  let subtitle = '';
  let description = '';
  let coverImg = '';
  let badgeLabel = '';

  if (story) {
    shareUrl = `${baseUrl}#read:${story.id}`;
    title = story.title;
    subtitle = `By ${story.author}`;
    description = story.description || `Read "${story.title}" on StoryNest.`;
    coverImg = story.coverImage;
    badgeLabel = `${story.genre} • Story`;
  } else if (user) {
    const handle = user.username || user.id;
    shareUrl = `${baseUrl}#profile:${handle}`;
    title = user.name;
    subtitle = user.penName ? `Pen Name: ${user.penName}` : `@${handle} • StoryNest`;
    description = user.bio || `Explore stories and manuscripts by ${user.name} on StoryNest.`;
    coverImg = user.avatar;
    badgeLabel = (user.isPrivate || user.accountPrivacy === 'private') ? 'Private Profile' : 'Public Profile';
  }

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if (onToast) onToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      if (onToast) onToast('Please copy the URL manually.', 'warning');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - ${subtitle}\n${description}\n`,
          url: shareUrl,
        });
        if (onToast) onToast('Shared successfully!', 'success');
      } catch (err: any) {
        // User cancelled or not supported
      }
    } else {
      handleCopy();
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(
    story
      ? `📖 Read "${story.title}" by ${story.author} on StoryNest: ${shareUrl}`
      : `✍️ Check out ${user?.name}'s literary profile and stories on StoryNest: ${shareUrl}`
  );

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-4 h-4 text-emerald-400" />,
      href: `https://wa.me/?text=${encodedText}`,
      bg: 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-700/50 text-emerald-300',
    },
    {
      name: 'X (Twitter)',
      icon: <Twitter className="w-4 h-4 text-sky-400" />,
      href: `https://twitter.com/intent/tweet?text=${encodedText}`,
      bg: 'bg-sky-950/40 hover:bg-sky-900/60 border-sky-700/50 text-sky-300',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4 text-blue-400" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-blue-950/40 hover:bg-blue-900/60 border-blue-700/50 text-blue-300',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4 text-indigo-400" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-700/50 text-indigo-300',
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-[#0b111e] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-heading text-base font-bold text-slate-100">
                  {story ? 'Share Story Link' : 'Share Profile Link'}
                </h3>
                <span className="text-[10px] text-amber-400 font-medium">{badgeLabel}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Item Preview Card */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex gap-3 items-center">
            {coverImg ? (
              <div className="relative w-14 aspect-[3/4] rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0">
                <img
                  src={coverImg}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-30 pointer-events-none"
                />
                <img
                  src={coverImg}
                  alt={title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop';
                  }}
                  className="relative z-[1] w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 aspect-[3/4] rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                {story ? <BookOpen className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-serif-heading text-sm font-bold text-slate-100 truncate">{title}</h4>
              <p className="text-xs text-amber-400 truncate">{subtitle}</p>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{description}</p>
            </div>
          </div>

          {/* Direct Copy URL Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Direct Shareable Link</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500 truncate select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Social Platforms Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400">Share Via</label>
            <div className="grid grid-cols-2 gap-2">
              {socialLinks.map((soc) => (
                <a
                  key={soc.name}
                  href={soc.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${soc.bg}`}
                >
                  {soc.icon}
                  <span>{soc.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Native Share button if available */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Share to Other Apps (Device Share)</span>
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
