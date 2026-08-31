import React from 'react';
import { Story } from '../types';
import { useApp } from '../context/AppContext';
import { Bookmark, Eye, Heart, FileText, Share2, Lock, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface StoryCardProps {
  story: Story;
  onSelectStory: (storyId: string) => void;
  layout?: 'grid' | 'compact';
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onSelectStory }) => {
  const { isBookmarked, toggleBookmark, isLiked, toggleLike, openShareModal } = useApp();

  const bookmarked = isBookmarked(story.id);
  const liked = isLiked(story.id);

  const formatCount = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = story.authorId ? `#user:${story.authorId}` : `#author:${encodeURIComponent(story.author)}`;
    window.location.hash = target;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col bg-[#0b111e]/90 border border-slate-800/80 hover:border-amber-500/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
      onClick={() => onSelectStory(story.id)}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
        <img
          src={story.coverImage}
          alt={story.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Ambient Dark Gradient on Cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b111e] via-transparent to-black/30 pointer-events-none" />

        {/* Story Title Overlay */}
        <div className="absolute inset-x-2 top-3 sm:top-4 text-center pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <h4 className="font-serif-heading italic text-base sm:text-xl font-medium text-amber-100/95 tracking-wide line-clamp-2 px-1 sm:px-2">
            {story.title}
          </h4>
        </div>

        {/* Floating Actions: Share & Bookmark */}
        <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openShareModal({ story });
            }}
            className="p-2 sm:p-2 rounded-xl backdrop-blur-md bg-black/60 text-slate-300 hover:text-amber-400 hover:bg-black/80 transition-all duration-200 min-w-[34px] min-h-[34px] flex items-center justify-center"
            aria-label="Share story link"
            title="Share Story Link"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(story.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-md transition-all duration-200 min-w-[34px] min-h-[34px] flex items-center justify-center ${
              bookmarked
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                : 'bg-black/60 text-slate-300 hover:text-amber-400 hover:bg-black/80'
            }`}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark story'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Status Badge if not published or visibility tag */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex items-center gap-1.5 z-10">
          {story.status !== 'published' ? (
            <div className="px-2 sm:px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md bg-amber-500/90 text-slate-950">
              {story.status === 'pending' ? 'Under Review' : story.status}
            </div>
          ) : story.visibility === 'private' ? (
            <div className="px-2 py-0.5 rounded-md text-[10px] font-semibold backdrop-blur-md bg-slate-900/90 text-slate-300 border border-slate-700 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-amber-400" />
              <span>Private</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Story Metadata Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3">
        <div>
          <h3 className="font-serif-heading text-sm sm:text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {story.title}
          </h3>

          {/* Author attribution */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="text-[11px]">By</span>
            <button
              type="button"
              onClick={handleAuthorClick}
              className="text-amber-400 hover:text-amber-300 hover:underline font-medium truncate max-w-[140px] sm:max-w-[180px] text-left text-xs"
              title={`View ${story.author}'s Profile`}
            >
              {story.author}
            </button>
          </div>

          {/* Genre Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60">
              {story.genre}
            </span>
            {story.secondaryGenre && (
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-slate-800/50 text-slate-400 border border-slate-700/40">
                {story.secondaryGenre}
              </span>
            )}
          </div>
        </div>

        {/* Stats and Action strip */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title={`${story.views.toLocaleString()} views`}>
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] sm:text-xs">{formatCount(story.views)}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(story.id);
              }}
              className={`flex items-center gap-1 transition-colors hover:text-rose-400 p-0.5 ${
                liked ? 'text-rose-400 font-medium' : 'text-slate-400'
              }`}
              title={`${story.likes.toLocaleString()} likes`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-rose-400' : ''}`} />
              <span className="text-[11px] sm:text-xs">{formatCount(story.likes)}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 text-slate-400" title="PDF format available">
            <FileText className="w-3.5 h-3.5 text-amber-400/80" />
            <span className="font-medium text-[10px] sm:text-[11px] tracking-wide text-amber-200/80">PDF</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
