import React from 'react';
import { GENRE_DATA } from '../data/genres';
import { GenreCard } from '../components/GenreCard';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

interface GenresPageProps {
  navigate: (route: string) => void;
}

export const GenresPage: React.FC<GenresPageProps> = ({ navigate }) => {
  const handleSelectGenre = (genreName: string) => {
    navigate(`stories:${genreName}`);
  };

  return (
    <div className="min-h-screen text-slate-100 py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
          <span className="text-amber-400 font-bold text-xs">◆</span>
          <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
            Curated Categories
          </span>
          <span className="text-amber-400 font-bold text-xs">◆</span>
        </div>

        <h1 className="font-serif-heading text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-100">
          Explore by <span className="text-amber-400 font-normal italic">Genre</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 mt-2.5 sm:mt-3 max-w-xl mx-auto leading-relaxed">
          From heartwarming romances to thrilling mysteries, find stories that match your mood.
        </p>
      </div>

      {/* 10 Genre Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6 mb-12 sm:mb-16">
        {GENRE_DATA.map((genre) => (
          <GenreCard
            key={genre.id}
            genre={genre}
            onSelectGenre={handleSelectGenre}
          />
        ))}
      </div>

      {/* Bottom CTA Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-[#0b111e]/85 backdrop-blur-xl p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 shadow-2xl">
        {/* Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center sm:text-left max-w-lg">
          <h3 className="font-serif-heading text-lg sm:text-2xl font-bold text-slate-100">
            Can't find what you're looking for?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Browse all stories and discover your next favorite read across multiple categories and themes.
          </p>
        </div>

        <div className="relative z-10 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => navigate('stories')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all duration-200 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            <span>Browse All Stories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
