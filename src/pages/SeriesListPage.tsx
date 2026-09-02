import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { SeriesCard } from '../components/SeriesCard';
import { CreateSeriesModal } from '../components/CreateSeriesModal';
import {
  Layers,
  Search,
  Plus,
  Filter,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface SeriesListPageProps {
  navigate: (route: string) => void;
}

export const SeriesListPage: React.FC<SeriesListPageProps> = ({ navigate }) => {
  const { series, seriesLoading, currentUser } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      // Visibility filter
      if (s.visibility === 'private' && s.authorId !== currentUser?.id && currentUser?.role !== 'admin') {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = s.title.toLowerCase().includes(q);
        const matchesAuthor = s.authorName?.toLowerCase().includes(q) || false;
        const matchesDesc = s.description?.toLowerCase().includes(q) || false;
        if (!matchesTitle && !matchesAuthor && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [series, statusFilter, search, currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8 animate-fade-in text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20">
              <Layers className="w-3.5 h-3.5" />
              Sagas & Story Series
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif-heading text-slate-100 tracking-tight">
            Explore Story Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Immerse yourself in epic multi-part novels, ongoing chapter series, and cohesive story sagas written by passionate authors.
          </p>
        </div>

        {currentUser && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Series</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b111e] border border-slate-800/90 rounded-2xl p-4 shadow-lg">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search series by title, author, or synopsis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#070b14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Sagas ({series.length})
          </button>
          <button
            onClick={() => setStatusFilter('ongoing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'ongoing'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === 'completed'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Series Grid */}
      {seriesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="h-80 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800"
            />
          ))}
        </div>
      ) : filteredSeries.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-[#0b111e]/60 border border-dashed border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold font-serif-heading text-slate-200">
              No Story Series Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
              {search
                ? `No series matching "${search}". Try clearing your filters or search terms.`
                : 'Be the first author on StoryNest to create a multi-part saga!'}
            </p>
          </div>
          {currentUser && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-colors shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Series</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.map((ser) => (
            <SeriesCard key={ser.id} series={ser} navigate={navigate} />
          ))}
        </div>
      )}

      {/* Create Series Modal */}
      <CreateSeriesModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newSer) => navigate(`series:${newSer.id}`)}
      />
    </div>
  );
};
