import React from 'react';
import { Series } from '../types';
import { useApp } from '../context/AppContext';
import { Layers, BookOpen, User, Clock, ArrowRight } from 'lucide-react';

interface SeriesCardProps {
  series: Series;
  navigate: (route: string) => void;
  showAuthor?: boolean;
}

export const SeriesCard: React.FC<SeriesCardProps> = ({
  series,
  navigate,
  showAuthor = true,
}) => {
  const { getStoriesForSeries } = useApp();
  const seriesStories = getStoriesForSeries(series.id);
  const actualCount = seriesStories.length || series.storyCount || 0;

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    ongoing: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    completed: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    hiatus: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
    },
  };

  const statusStyle = statusColors[series.status] || statusColors.ongoing;

  return (
    <div
      onClick={() => navigate(`series:${series.id}`)}
      className="group relative flex flex-col bg-[#0b111e] border border-slate-800/90 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer text-left"
    >
      {/* Cover and Stack Effect */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={
            series.coverUrl ||
            'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop'
          }
          alt={series.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b111e] via-transparent to-black/30" />

        {/* Series Badge & Status */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
            <Layers className="w-3 h-3" />
            Series
          </span>
          <span
            className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-md ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
          >
            {series.status}
          </span>
        </div>

        {/* Count Pill */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-medium text-slate-200 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {actualCount} {actualCount === 1 ? 'Part' : 'Parts'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-base font-bold font-serif-heading text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-1">
            {series.title}
          </h3>

          {showAuthor && series.authorName && (
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
              <User className="w-3.5 h-3.5 text-amber-500/80" />
              <span>{series.authorName}</span>
            </p>
          )}

          {series.description && (
            <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
              {series.description}
            </p>
          )}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">
            Updated {new Date(series.updatedAt || series.createdAt).toLocaleDateString()}
          </span>
          <span className="font-semibold text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 text-xs">
            Explore Saga <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
