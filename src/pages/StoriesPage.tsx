import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { StoryCard } from '../components/StoryCard';
import { StoryGenre } from '../types';
import { Search, ChevronDown, Sparkles, Filter, ChevronLeft, ChevronRight, Heart, Theater, Smile, HeartCrack, FileText, CassetteTape, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface StoriesPageProps {
  navigate: (route: string) => void;
  initialGenre?: string;
}

export const StoriesPage: React.FC<StoriesPageProps> = ({ navigate, initialGenre }) => {
  const { stories, searchQuery, setSearchQuery, currentUser, isFollowingUser } = useApp();

  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre || 'All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-read' | 'most-liked' | 'a-z'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sync initial genre if changed from props
  useEffect(() => {
    if (initialGenre) {
      setSelectedGenre(initialGenre);
    }
  }, [initialGenre]);

  const genresList: { name: string; icon?: React.ReactNode }[] = [
    { name: 'All' },
    { name: 'Romance', icon: <Heart className="w-3.5 h-3.5" /> },
    { name: 'Drama', icon: <Theater className="w-3.5 h-3.5" /> },
    { name: 'Emotional', icon: <Smile className="w-3.5 h-3.5" /> },
    { name: 'Tragedy', icon: <HeartCrack className="w-3.5 h-3.5" /> },
    { name: 'Short Story', icon: <FileText className="w-3.5 h-3.5" /> },
    { name: "90's Vibes", icon: <CassetteTape className="w-3.5 h-3.5" /> },
    { name: 'Friendship', icon: <Users className="w-3.5 h-3.5" /> },
    { name: 'Mystery' },
    { name: 'Inspirational' },
  ];

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    let result = stories.filter((s) => {
      if (s.status !== 'published') return false;

      // Visibility check
      const vis = s.visibility || 'public';
      if (vis === 'unlisted') {
        // Unlisted stories are accessible only via direct link or to their author
        return currentUser && (currentUser.id === s.authorId || currentUser.name === s.author);
      }
      if (vis === 'private') {
        // Private stories: author or approved followers
        const isAuthor = currentUser && (currentUser.id === s.authorId || currentUser.name === s.author);
        const isFollower = s.authorId ? isFollowingUser(s.authorId) : false;
        return isAuthor || isFollower;
      }
      return true;
    });

    // Genre filter
    if (selectedGenre !== 'All') {
      result = result.filter(
        (s) => s.genre === selectedGenre || s.secondaryGenre === selectedGenre
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.author.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'most-read') {
        return b.views - a.views;
      }
      if (sortBy === 'most-liked') {
        return b.likes - a.likes;
      }
      if (sortBy === 'a-z') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [stories, selectedGenre, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredStories.length / itemsPerPage));
  const paginatedStories = filteredStories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <h1 className="font-serif-heading text-2xl sm:text-4xl font-bold text-slate-100">
              All Stories
            </h1>
            <div className="flex items-center gap-1 text-amber-400">
              <span className="text-slate-600">—</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Dive into a world of emotions, experiences and imagination. Find your next favorite story.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-72 lg:w-80">
            <input
              type="text"
              placeholder="Search by title, author, keyword..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0b111e]/90 backdrop-blur-md text-xs text-slate-200 placeholder-slate-500 pl-3.5 pr-9 py-2.5 sm:py-2.5 rounded-xl border border-slate-700/80 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-all min-h-[42px]"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-400 text-xs p-1"
                aria-label="Clear search"
              >
                ✕
              </button>
            ) : (
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto appearance-none bg-[#0b111e]/90 backdrop-blur-md text-xs text-slate-200 pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-700/80 focus:border-amber-500 focus:outline-none cursor-pointer min-h-[42px]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-read">Most Read</option>
              <option value="most-liked">Most Liked</option>
              <option value="a-z">Title (A - Z)</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
        {genresList.map((g) => {
          const isActive = selectedGenre === g.name;
          return (
            <button
              key={g.name}
              onClick={() => {
                setSelectedGenre(g.name);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 shrink-0 min-h-[38px] active:scale-[0.97] ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'bg-[#0b111e]/80 hover:bg-[#131c31] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {g.icon}
              <span>{g.name}</span>
            </button>
          );
        })}
      </div>

      {/* Stories Grid */}
      {paginatedStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {paginatedStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onSelectStory={(id) => navigate(`read:${id}`)}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 sm:py-20 text-center bg-[#0b111e]/60 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 sm:p-8 my-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500 mb-4">
            <Search className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h3 className="font-serif-heading text-lg font-bold text-slate-200">No Stories Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            We couldn't find any stories matching your current filter or search query.
          </p>
          <button
            onClick={() => {
              setSelectedGenre('All');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
          >
            Clear Filters & Search
          </button>
        </div>
      )}

      {/* Functional Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12 pt-6 border-t border-slate-800/80">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-10 h-10 rounded-xl bg-[#0b111e]/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[240px] sm:max-w-none px-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                    : 'bg-[#0b111e]/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="w-10 h-10 rounded-xl bg-[#0b111e]/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
