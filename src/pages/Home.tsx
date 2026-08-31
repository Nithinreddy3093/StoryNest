import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';
import { GENRE_DATA } from '../data/genres';
import {
  Sparkles,
  ArrowRight,
  Play,
  Star,
  BookOpen,
  Heart,
  Theater,
  Smile,
  HeartCrack,
  FileText,
  CassetteTape,
  Users,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import { motion } from 'motion/react';

interface HomeProps {
  navigate: (route: string) => void;
  onOpenHowItWorks: () => void;
}

export const Home: React.FC<HomeProps> = ({ navigate, onOpenHowItWorks }) => {
  const { stories, currentUser, isFollowingUser } = useApp();

  const publishedStories = stories.filter((s) => {
    if (s.status !== 'published') return false;
    const vis = s.visibility || 'public';
    if (vis === 'unlisted') {
      return currentUser && (currentUser.id === s.authorId || currentUser.name === s.author);
    }
    if (vis === 'private') {
      const isAuthor = currentUser && (currentUser.id === s.authorId || currentUser.name === s.author);
      const isFollower = s.authorId ? isFollowingUser(s.authorId) : false;
      return isAuthor || isFollower;
    }
    return true;
  });

  const featuredStories = publishedStories.filter((s) => s.featured).length > 0
    ? publishedStories.filter((s) => s.featured)
    : publishedStories.slice(0, 5);

  const getGenreIcon = (name: string) => {
    switch (name) {
      case 'Romance':
        return <Heart className="w-4 h-4 text-amber-400" />;
      case 'Drama':
        return <Theater className="w-4 h-4 text-amber-400" />;
      case 'Emotional':
        return <Smile className="w-4 h-4 text-amber-400" />;
      case 'Tragedy':
        return <HeartCrack className="w-4 h-4 text-amber-400" />;
      case 'Short Story':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case "90's Vibes":
        return <CassetteTape className="w-4 h-4 text-amber-400" />;
      case 'Friendship':
        return <Users className="w-4 h-4 text-amber-400" />;
      default:
        return <MoreHorizontal className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[560px] flex items-center justify-start overflow-hidden border-b border-amber-500/10">
        {/* Soft atmospheric gradient highlights */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b14]/95 via-[#070b14]/75 to-transparent pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
          <div className="max-w-2xl">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-50 leading-[1.2] sm:leading-[1.15]"
            >
              Stories that <br />
              touch <span className="text-amber-400 font-normal italic">hearts</span>
            </motion.h1>

            {/* Supporting Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-sm sm:text-lg text-slate-300 mt-3 sm:mt-4 leading-relaxed font-sans-ui max-w-lg"
            >
              Read beautiful stories, short or long. <br />
              Love, loss, hope and more...
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 max-w-md sm:max-w-none"
            >
              <button
                onClick={() => navigate('stories')}
                className="px-6 py-3.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98] text-center"
              >
                Explore Stories
              </button>

              <button
                onClick={onOpenHowItWorks}
                className="flex items-center justify-center gap-2 px-5 py-3.5 sm:py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-medium text-sm transition-all duration-200 backdrop-blur-md"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>How it works</span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="py-8 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <h2 className="font-serif-heading text-lg sm:text-2xl font-bold text-slate-100">
              Featured Stories
            </h2>
          </div>
          <button
            onClick={() => navigate('stories')}
            className="flex items-center gap-1 text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors group py-1 px-2 rounded-lg hover:bg-amber-500/10"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Featured Stories Grid */}
        {featuredStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
            {featuredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onSelectStory={(id) => navigate(`read:${id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 px-6 rounded-2xl bg-[#0b111e]/60 border border-slate-800/80 text-center flex flex-col items-center justify-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif-heading text-lg font-semibold text-slate-200 mb-1">
              No stories available yet
            </h3>
            <p className="text-xs text-slate-400 mb-5 max-w-sm">
              Be the first storyteller to publish your heartfelt stories, poetry, or memories on StoryNest.
            </p>
            <button
              onClick={() => navigate('upload')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Your Story</span>
            </button>
          </div>
        )}
      </section>

      {/* Browse by Genre Section */}
      <section className="py-8 sm:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-slate-800/80 mb-10 sm:mb-12">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="font-serif-heading text-lg sm:text-2xl font-bold text-slate-100">
              Browse by Genre
            </h2>
          </div>
          <button
            onClick={() => navigate('genres')}
            className="text-xs font-semibold text-amber-400/90 hover:text-amber-300 transition-colors py-1 px-2 rounded-lg hover:bg-amber-500/10"
          >
            All Genres →
          </button>
        </div>

        {/* Genre Buttons Pill Carousel / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
          {[
            'Romance',
            'Drama',
            'Emotional',
            'Tragedy',
            'Short Story',
            "90's Vibes",
            'Friendship',
            'More',
          ].map((genreName) => (
            <button
              key={genreName}
              onClick={() => {
                if (genreName === 'More') {
                  navigate('genres');
                } else {
                  navigate(`stories:${genreName}`);
                }
              }}
              className="flex items-center justify-center gap-2 p-2.5 sm:p-3 rounded-xl bg-[#0b111e]/75 hover:bg-[#131c31]/90 border border-slate-800/80 hover:border-amber-500/50 backdrop-blur-md transition-all duration-200 text-slate-200 hover:text-amber-300 shadow-sm group text-xs font-medium min-h-[44px] active:scale-[0.98]"
            >
              {getGenreIcon(genreName)}
              <span className="truncate">{genreName}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
