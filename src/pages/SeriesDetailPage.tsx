import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Series, Story } from '../types';
import { CreateSeriesModal } from '../components/CreateSeriesModal';
import {
  Layers,
  BookOpen,
  ArrowLeft,
  User,
  Calendar,
  Sparkles,
  Share2,
  Edit,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  Heart,
  ChevronRight,
  FileText,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface SeriesDetailPageProps {
  seriesId: string;
  navigate: (route: string) => void;
}

export const SeriesDetailPage: React.FC<SeriesDetailPageProps> = ({
  seriesId,
  navigate,
}) => {
  const {
    currentUser,
    getSeriesById,
    getStoriesForSeries,
    stories,
    deleteSeries,
    addStoryToSeries,
    removeStoryFromSeries,
    reorderSeriesStories,
    addToast,
    openShareModal,
  } = useApp();

  const series = getSeriesById(seriesId);
  const seriesStories = getStoriesForSeries(seriesId);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);
  const [selectedStoryToAdd, setSelectedStoryToAdd] = useState('');
  const [partNumberInput, setPartNumberInput] = useState<number>(seriesStories.length + 1);
  const [isReordering, setIsReordering] = useState(false);
  const [orderedStories, setOrderedStories] = useState<Story[]>(seriesStories);

  // Synchronize ordered stories whenever seriesStories changes
  React.useEffect(() => {
    setOrderedStories(seriesStories);
    setPartNumberInput(seriesStories.length + 1);
  }, [seriesStories.length]);

  if (!series) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-serif-heading text-slate-100">
          Series Not Found
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The story series you are looking for might have been moved or removed by its author.
        </p>
        <button
          onClick={() => navigate('stories')}
          className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:bg-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Library
        </button>
      </div>
    );
  }

  const isAuthor =
    currentUser &&
    (currentUser.id === series.authorId ||
      currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === 'mudiyamnamitha7@gmail.com');

  // Candidate stories that can be added to this series (belong to current user, not already in this series)
  const candidateStories = stories.filter(
    (s) =>
      s.authorId === (currentUser?.id || series.authorId) &&
      s.seriesId !== seriesId
  );

  const handleDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete the series "${series.title}"? Stories in this series will not be deleted and will remain in your library.`
      )
    ) {
      await deleteSeries(series.id);
      navigate('profile:my-stories');
    }
  };

  const handleAddStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoryToAdd) {
      addToast('Please select a story to add.', 'warning');
      return;
    }
    await addStoryToSeries(selectedStoryToAdd, series.id, partNumberInput);
    setIsAddStoryModalOpen(false);
    setSelectedStoryToAdd('');
  };

  const moveStory = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedStories.length) return;

    const newArr = [...orderedStories];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setOrderedStories(newArr);
  };

  const saveReordering = async () => {
    const ids = orderedStories.map((s) => s.id);
    await reorderSeriesStories(series.id, ids);
    setIsReordering(false);
  };

  const firstStory = seriesStories.length > 0 ? seriesStories[0] : null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-10 animate-fade-in">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {isAuthor && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Details</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Series Hero Section */}
      <div className="relative rounded-3xl bg-[#0b111e] border border-slate-800/90 overflow-hidden shadow-2xl p-6 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cover Art */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 group">
              <img
                src={
                  series.coverUrl ||
                  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop'
                }
                alt={series.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-8 space-y-5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20">
                <Layers className="w-3.5 h-3.5" />
                Story Series / Saga
              </span>
              <span
                className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize border ${
                  series.status === 'completed'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : series.status === 'hiatus'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {series.status}
              </span>
              {series.visibility && series.visibility !== 'public' && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-xs font-medium capitalize border border-slate-700">
                  {series.visibility}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-serif-heading text-slate-100 tracking-tight leading-tight">
              {series.title}
            </h1>

            {series.authorName && (
              <p className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <span>By</span>
                <span className="text-amber-400 font-bold">{series.authorName}</span>
              </p>
            )}

            {series.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {series.description}
              </p>
            )}

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-200">
                  {seriesStories.length} {seriesStories.length === 1 ? 'Volume' : 'Volumes / Books'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>
                  Updated {new Date(series.updatedAt || series.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4">
              {firstStory ? (
                <button
                  onClick={() => navigate(`read:${firstStory.id}`)}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Start Reading Series (Part 1)</span>
                </button>
              ) : (
                <div className="px-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-400">
                  No stories added to this series yet.
                </div>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#series:${series.id}`);
                  addToast('Series link copied to clipboard!', 'success');
                }}
                className="px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs flex items-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Share Series</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stories in Series List */}
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-xl font-bold font-serif-heading text-slate-100 flex items-center gap-2">
              <span>Series Reading Order</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-sans">
                {seriesStories.length} parts
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Read these stories in sequential order to experience the full narrative arc.
            </p>
          </div>

          {isAuthor && (
            <div className="flex items-center gap-2">
              {isReordering ? (
                <>
                  <button
                    onClick={saveReordering}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Save Order</span>
                  </button>
                  <button
                    onClick={() => {
                      setOrderedStories(seriesStories);
                      setIsReordering(false);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {seriesStories.length > 1 && (
                    <button
                      onClick={() => setIsReordering(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <span>Reorder Parts</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddStoryModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-amber-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Story to Series</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {seriesStories.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0b111e]/50 border border-dashed border-slate-800 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-200">No Stories in this Series Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {isAuthor
                  ? 'Add your published stories or upload a new story to build this series.'
                  : 'The author has not yet added story parts to this series collection.'}
              </p>
            </div>
            {isAuthor && (
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsAddStoryModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Existing Story</span>
                </button>
                <button
                  onClick={() => navigate('upload')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                >
                  Upload New Manuscript
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(isReordering ? orderedStories : seriesStories).map((story, index) => {
              const partNum = isReordering ? index + 1 : story.seriesPart || index + 1;
              return (
                <div
                  key={story.id}
                  className="group relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0b111e] border border-slate-800/90 hover:border-amber-500/40 transition-all duration-200 shadow-md"
                >
                  {/* Left: Part Number & Cover & Info */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    {/* Part Number Badge */}
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] uppercase font-black tracking-widest text-amber-400">
                        Part
                      </span>
                      <span className="text-base font-black text-amber-300 leading-none">
                        {partNum}
                      </span>
                    </div>

                    {/* Story Cover Thumbnail */}
                    <div className="w-16 h-22 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shrink-0 aspect-[3/4]">
                      <img
                        src={
                          story.coverImage ||
                          'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop'
                        }
                        alt={story.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Story Metadata */}
                    <div className="space-y-1 text-left flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300 text-[10px] font-semibold border border-slate-700">
                          {story.genre}
                        </span>
                        {story.pdfUrl && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-semibold border border-blue-500/20 flex items-center gap-1">
                            <FileText className="w-2.5 h-2.5" /> PDF
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => navigate(`read:${story.id}`)}
                        className="text-base font-bold font-serif-heading text-slate-100 hover:text-amber-400 cursor-pointer transition-colors line-clamp-1"
                      >
                        {story.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {story.description}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>{story.chapters?.length || 1} Chapters</span>
                        <span>{story.views || 0} views</span>
                        <span>{story.likes || 0} likes</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    {isReordering ? (
                      <div className="flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => moveStory(index, 'up')}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={index === orderedStories.length - 1}
                          onClick={() => moveStory(index, 'down')}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => navigate(`read:${story.id}`)}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Book</span>
                        </button>

                        {isAuthor && (
                          <button
                            onClick={() => removeStoryFromSeries(story.id)}
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove from series (keeps story in library)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Series Modal */}
      <CreateSeriesModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editSeries={series}
      />

      {/* Add Story to Series Modal */}
      {isAddStoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0b111e] border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-serif-heading text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Add Story to Series
              </h3>
              <button
                onClick={() => setIsAddStoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {candidateStories.length === 0 ? (
              <div className="py-6 text-center space-y-3 text-xs text-slate-400">
                <p>
                  You do not have any standalone stories available to add to this series.
                </p>
                <button
                  onClick={() => {
                    setIsAddStoryModalOpen(false);
                    navigate('upload');
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl"
                >
                  Upload New Story
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddStory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-200 mb-1.5">
                    Select Story *
                  </label>
                  <select
                    required
                    value={selectedStoryToAdd}
                    onChange={(e) => setSelectedStoryToAdd(e.target.value)}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Choose one of your stories --</option>
                    {candidateStories.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.title} ({st.genre})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-200 mb-1.5">
                    Assign Part Number in Series
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={partNumberInput}
                    onChange={(e) => setPartNumberInput(parseInt(e.target.value) || 1)}
                    className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Stories in the series will be displayed in sequential order according to this number.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddStoryModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Add to Series
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
