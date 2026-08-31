import React from 'react';
import { StoryNestLogo } from './StoryNestLogo';
import { Heart, Sparkles, Instagram, Twitter, Facebook, Youtube, Mail, MapPin, Phone } from 'lucide-react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="bg-[#05080f]/85 backdrop-blur-xl border-t border-amber-500/10 text-slate-400 text-xs">
      {/* Thank you banner with sparkles */}
      <div className="border-b border-slate-800/60 py-6 text-center px-4 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent">
        <div className="flex items-center justify-center gap-2 text-slate-300 text-xs sm:text-sm">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <Heart className="w-4 h-4 text-rose-400 shrink-0 fill-rose-400" />
          <span className="font-medium text-slate-200">
            Thank you for being a part of StoryNest. Together, let's keep stories alive.
          </span>
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div onClick={() => navigate('home')}>
              <StoryNestLogo size="md" />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              A home for stories that touch hearts, inspire minds, and stay with you forever. Read, feel, and publish stories without boundaries.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://www.instagram.com/nithinreddy3093/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-400 flex items-center justify-center transition-colors text-slate-300"
                aria-label="Instagram @nithinreddy3093"
                title="Follow on Instagram @nithinreddy3093"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="mailto:nithinofficial3093@gmail.com"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-400 flex items-center justify-center transition-colors text-slate-300"
                aria-label="Email Nithin"
                title="Email Nithin"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
              <a
                href="tel:7093569420"
                className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-400 flex items-center justify-center transition-colors text-slate-300"
                aria-label="Phone"
                title="Call 7093569420"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif-heading text-sm font-semibold text-slate-100 mb-4 tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate('home')} className="hover:text-amber-300 transition-colors">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigate('stories')} className="hover:text-amber-300 transition-colors">
                  All Stories
                </button>
              </li>
              <li>
                <button onClick={() => navigate('genres')} className="hover:text-amber-300 transition-colors">
                  Explore Genres
                </button>
              </li>
              <li>
                <button onClick={() => navigate('top-reads')} className="hover:text-amber-300 transition-colors">
                  Top Reads
                </button>
              </li>
              <li>
                <button onClick={() => navigate('upload')} className="hover:text-amber-300 transition-colors">
                  Publish a Story
                </button>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h4 className="font-serif-heading text-sm font-semibold text-slate-100 mb-4 tracking-wide">
              Popular Genres
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button onClick={() => navigate('stories:Romance')} className="hover:text-amber-300 transition-colors">
                  Romance
                </button>
              </li>
              <li>
                <button onClick={() => navigate('stories:Drama')} className="hover:text-amber-300 transition-colors">
                  Drama
                </button>
              </li>
              <li>
                <button onClick={() => navigate('stories:Emotional')} className="hover:text-amber-300 transition-colors">
                  Emotional
                </button>
              </li>
              <li>
                <button onClick={() => navigate("stories:90's Vibes")} className="hover:text-amber-300 transition-colors">
                  90's Vibes
                </button>
              </li>
              <li>
                <button onClick={() => navigate('stories:Tragedy')} className="hover:text-amber-300 transition-colors">
                  Tragedy & Solitude
                </button>
              </li>
            </ul>
          </div>

          {/* Contact and HQ */}
          <div>
            <h4 className="font-serif-heading text-sm font-semibold text-slate-100 mb-4 tracking-wide">
              Connect With Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <a href="mailto:nithinofficial3093@gmail.com" className="hover:text-amber-300 transition-colors">
                  nithinofficial3093@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <a href="tel:7093569420" className="hover:text-amber-300 transition-colors">
                  7093569420
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Andhra Pradesh, India</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Instagram className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <a
                  href="https://www.instagram.com/nithinreddy3093/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-300 transition-colors text-slate-300"
                >
                  @nithinreddy3093
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StoryNest. All rights reserved. Stories that stay with you.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('about')} className="hover:text-slate-400">About</button>
            <button onClick={() => navigate('contact')} className="hover:text-slate-400">Contact & Help</button>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-400">Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
