import React from 'react';
import { Sparkles, Heart, Shield, Users, Globe, BookOpen, Feather, ArrowRight, Instagram, Mail, Phone, MapPin, Quote } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import { NITHIN_REDDY_AVATAR_URL, ABOUT_HERO_WALLPAPER_IMAGE } from '../data/authorAssets';

interface AboutPageProps {
  navigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ navigate }) => {
  const { currentUser } = useApp();
  const authorAvatar = NITHIN_REDDY_AVATAR_URL;
  const pillars = [
    {
      title: 'Born from Real Life',
      description: 'Not artificial fairy tales, but honest confessions of longing, love, heartbreak, and unspoken feelings.',
      icon: <Heart className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Embracing Human Regrets',
      description: 'Turning painful memories and lost moments into healing narratives that let readers know they are never alone.',
      icon: <Feather className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Safe & Intimate Reading',
      description: 'A quiet haven free from noisy feeds and algorithms, honoring authentic human vulnerability.',
      icon: <Shield className="w-5 h-5 text-amber-400" />,
    },
    {
      title: 'Pure Connection',
      description: 'Direct author-to-reader bonds, personal reflections, bookmarks, and genuine stories that stay with you.',
      icon: <Users className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      {/* Hero Banner with Black & White Shore Wallpaper */}
      <section className="relative min-h-[420px] sm:min-h-[480px] flex items-center justify-center text-center overflow-hidden border-b border-slate-800">
        <div
          className="absolute inset-0 bg-cover bg-center filter grayscale contrast-125"
          style={{
            backgroundImage: `url('${ABOUT_HERO_WALLPAPER_IMAGE}')`,
          }}
        >
          {/* Shattered Particle & Crack Atmospheric Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070b14] via-[#070b14]/80 to-black/75" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#070b14_85%)]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" /> About StoryNest
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-50 leading-tight drop-shadow-md">
            Stories born from <br className="hidden sm:inline" />
            <span className="text-amber-400 font-normal italic">real life & heartfelt regrets.</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 mt-4 max-w-xl mx-auto leading-relaxed drop-shadow">
            StoryNest is a sanctuary for authentic, vulnerable narratives — written not to impress algorithms, but to give voice to the memories, mistakes, and unspoken apologies we carry in our souls.
          </p>
        </div>
      </section>

      {/* Author Nithin's Honest Confession & Life Story Spotlight */}
      <section className="border-b border-slate-800/80 bg-[#0b111e]/90 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-slate-900/80 to-[#070b14] p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
            {/* Ambient Background Glow */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Author Photo & Profile Card */}
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 bg-gradient-to-tr from-amber-500 via-amber-300 to-rose-400 shadow-2xl mb-4">
                  <img
                    src={authorAvatar}
                    alt="Author Nithin Reddy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-full shadow-inner bg-slate-900"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  <div className="absolute bottom-1 right-2 p-2 bg-amber-500 rounded-full text-slate-950 shadow-md z-10 pointer-events-none">
                    <Feather className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-serif-heading text-xl font-bold text-slate-100">
                  Nithin Reddy
                </h3>
                <p className="text-xs text-amber-400 font-medium mt-0.5">Author & Creator</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Andhra Pradesh, India</span>
                </div>

                {/* Social links */}
                <div className="flex items-center gap-2 mt-4">
                  <a
                    href="https://www.instagram.com/nithinreddy3093/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 text-pink-300 text-xs font-semibold transition-all"
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-400" />
                    <span>@nithinreddy3093</span>
                  </a>
                  <a
                    href="mailto:nithinofficial3093@gmail.com"
                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                    title="Email Nithin"
                  >
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="tel:7093569420"
                    className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
                    title="Contact Nithin"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Confession & Regrets Manifesto */}
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                  <Quote className="w-3.5 h-3.5 text-amber-400" />
                  <span>From The Author's Heart</span>
                </div>

                <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100 leading-snug">
                  "Every story I have written here comes straight from my own life and the regrets I carry."
                </h2>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-300 font-sans-ui leading-relaxed">
                  <p>
                    I did not build StoryNest to showcase fictional clichés or vanity metrics. The stories published under my name are deeply personal reflections of my real journey in <strong className="text-amber-300 font-semibold">Andhra Pradesh, India</strong> — capturing moments when I should have spoken but stayed quiet, times when love was near but slipped away, and choices that left lasting scars of regret.
                  </p>
                  <p>
                    Writing these tales has been my way of confronting those unspoken feelings and finding peace. When you read through these pages, you are reading my authentic soul, my nostalgic memories, and the lessons learned through painful silences.
                  </p>
                  <p className="text-amber-200/90 italic font-serif text-sm pt-1 border-t border-amber-500/20">
                    "If a single chapter helps you heal from a regret of your own, or encourages you to tell someone how you truly feel before it's too late, then every word written here was worth it."
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => navigate('stories')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
                  >
                    Read Nithin's Stories
                  </button>
                  <a
                    href="https://www.instagram.com/nithinreddy3093/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span>Connect on Instagram</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Purpose */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0b111e] border border-slate-800/80 rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 block mb-2">
              Our Core Mission
            </span>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100 mb-6">
              Connecting humanity through honest, heartfelt storytelling.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans-ui">
              <p>
                In a fast-paced world dominated by endless short-form feeds, we built StoryNest to bring back the intimacy of deep reading. Here, stories aren't algorithms; they are personal journeys written by real people who experienced love, heartache, courage, and longing.
              </p>
              <p>
                Whether you're looking for solace in words before sleep or sharing your own life's memories with empathetic readers, StoryNest was created as a home for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 block mb-1">
            Why StoryNest
          </span>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100">
            What Makes Us Different
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0b111e] border border-slate-800 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4">
                {pillar.icon}
              </div>
              <div>
                <h3 className="font-serif-heading text-base font-bold text-slate-100 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-cover bg-center min-h-[300px] flex items-center justify-center p-8 sm:p-12 text-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop')`,
          }}
        >
          <div className="absolute inset-0 bg-[#070b14]/85 backdrop-blur-[2px]" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100">
              Every story begins with someone.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              Share yours with the world and make it unforgettable. It takes less than 2 minutes to publish your first chapter.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('upload')}
                className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all duration-200 shadow-lg shadow-amber-500/30 hover:scale-105"
              >
                Upload Your Story
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

