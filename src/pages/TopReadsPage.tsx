import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Story } from '../types';
import { Eye, Heart, Bookmark, Sparkles, ArrowRight, Trophy, Crown, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface TopReadsPageProps {
  navigate: (route: string) => void;
}

export const TopReadsPage: React.FC<TopReadsPageProps> = ({ navigate }) => {
  const { stories, isBookmarked, toggleBookmark, isLiked, toggleLike } = useApp();
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week' | 'today'>('all');

  const formatCount = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  // Rank stories based on views and likes
  const rankedStories = useMemo(() => {
    const published = stories.filter((s) => s.status === 'published');
    return [...published]
      .sort((a, b) => {
        const scoreA = a.views + a.likes * 3;
        const scoreB = b.views + b.likes * 3;
        return scoreB - scoreA;
      })
      .slice(0, 10);
  }, [stories, timeFilter]);

  const leftColumnStories = rankedStories.slice(0, 5);
  const rightColumnStories = rankedStories.slice(5, 10);

  const renderRankItem = (story: Story, index: number) => {
    const rank = index + 1;
    const bookmarked = isBookmarked(story.id);
    const liked = isLiked(story.id);

    const isTopThree = rank <= 3;

    return (
      <motion.div
        key={story.id}
        whileHover={{ x: 4 }}
        transition={{ duration: 0.15 }}
        onClick={() => navigate(`read:${story.id}`)}
        className="group relative flex gap-4 p-4 rounded-xl bg-[#0b111e] hover:bg-[#0f172a] border border-slate-800/80 hover:border-amber-500/40 shadow-lg cursor-pointer transition-all duration-200"
      >
        {/* Rank Number */}
        <div className="flex flex-col items-center justify-center w-8 shrink-0">
          {rank === 1 && <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20 mb-1" />}
          {rank === 2 && <Trophy className="w-4 h-4 text-slate-300 mb-1" />}
          {rank === 3 && <Trophy className="w-4 h-4 text-amber-600 mb-1" />}
          <span
            className={`font-serif-heading text-xl sm:text-2xl font-bold leading-none ${
              isTopThree ? 'text-amber-400' : 'text-slate-500'
            }`}
          >
            {rank}
          </span>
        </div>

        {/* Thumbnail */}
        <div className="relative w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800">
          <img
            src={story.coverImage}
            alt={story.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* Story details */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif-heading text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                {story.title}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(story.id);
                }}
                className={`p-1 rounded hover:bg-slate-800 text-slate-400 transition-colors shrink-0 ${
                  bookmarked ? 'text-amber-400' : ''
                }`}
                title={bookmarked ? 'Remove Bookmark' : 'Bookmark Story'}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-400' : ''}`} />
              </button>
            </div>

            <p className="text-xs text-amber-400/90 font-medium mt-0.5">By {story.author}</p>

            <div className="flex flex-wrap gap-1 mt-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                {story.genre}
              </span>
              {story.secondaryGenre && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/60 text-slate-400">
                  {story.secondaryGenre}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              {story.description}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 mt-1 border-t border-slate-800/60">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatCount(story.views)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className={`w-3.5 h-3.5 ${liked ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
              <span className={liked ? 'text-rose-400' : ''}>{formatCount(story.likes)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header Section (Recreated from Screenshot #4) */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 mb-3">
          <span className="text-amber-400 font-bold text-xs">◆</span>
          <span className="text-xs font-bold tracking-[0.2em] text-amber-400 uppercase">
            Leaderboard
          </span>
          <span className="text-amber-400 font-bold text-xs">◆</span>
        </div>

        <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-100">
          Top <span className="text-amber-400 font-normal italic">Reads</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
          Most loved stories by our readers. Dive into the stories everyone can't stop reading.
        </p>

        {/* Time Filters (Recreated from Screenshot #4) */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[
            { id: 'all', label: 'All Time' },
            { id: 'month', label: 'This Month' },
            { id: 'week', label: 'This Week' },
            { id: 'today', label: 'Today' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-[#0b111e] hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Ranked Grid (Screenshot #4 layout: Left #1-#5, Right #6-#10) */}
      {rankedStories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {/* Left Column (#1 to #5) */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Top 1 - 5
            </div>
            {leftColumnStories.map((story, i) => renderRankItem(story, i))}
          </div>

          {/* Right Column (#6 to #10) */}
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              Top 6 - 10
            </div>
            {rightColumnStories.map((story, i) => renderRankItem(story, i + 5))}
          </div>
        </div>
      ) : (
        <div className="py-16 px-6 rounded-2xl bg-[#0b111e]/80 border border-slate-800 text-center flex flex-col items-center justify-center max-w-xl mx-auto mb-16">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="font-serif-heading text-lg font-semibold text-slate-200 mb-1">
            No ranked stories yet
          </h3>
          <p className="text-xs text-slate-400 mb-5 max-w-sm">
            Top reads will populate as stories are published and receive reader engagement.
          </p>
          <button
            onClick={() => navigate('upload')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            <span>Publish First Story</span>
          </button>
        </div>
      )}

      {/* Bottom CTA Banner (Recreated from Screenshot #4) */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#0b111e] p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="relative z-10 text-center sm:text-left max-w-lg">
          <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2 justify-center sm:justify-start">
            <Flame className="w-5 h-5 text-amber-400" />
            These stories are winning hearts!
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
            Start reading now and see why thousands of readers fall in love with these timeless tales.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate('stories')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all duration-200 shadow-lg shadow-amber-500/20 hover:scale-105"
          >
            <span>Explore All Stories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
