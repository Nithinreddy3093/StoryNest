import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Series, SeriesStatus } from '../types';
import { Layers, X, Sparkles, Image as ImageIcon, Loader2, Check } from 'lucide-react';

interface CreateSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSeries?: Series | null;
  onCreated?: (newSeries: Series) => void;
}

const PRESET_COVERS = [
  {
    label: 'Golden Hour Realm',
    url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Mystic Forest',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Cyber City Rain',
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Ancient Library',
    url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop',
  },
  {
    label: 'Starry Constellations',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
  },
];

export const CreateSeriesModal: React.FC<CreateSeriesModalProps> = ({
  isOpen,
  onClose,
  editSeries,
  onCreated,
}) => {
  const { createSeries, updateSeries, addToast } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [status, setStatus] = useState<SeriesStatus>('ongoing');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editSeries) {
      setTitle(editSeries.title || '');
      setDescription(editSeries.description || '');
      setCoverUrl(editSeries.coverUrl || PRESET_COVERS[0].url);
      setCustomCoverUrl('');
      setStatus(editSeries.status || 'ongoing');
      setVisibility(editSeries.visibility || 'public');
    } else {
      setTitle('');
      setDescription('');
      setCoverUrl(PRESET_COVERS[0].url);
      setCustomCoverUrl('');
      setStatus('ongoing');
      setVisibility('public');
    }
  }, [editSeries, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please provide a title for the series.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalCover = customCoverUrl.trim() || coverUrl;
      if (editSeries) {
        await updateSeries(editSeries.id, {
          title: title.trim(),
          description: description.trim(),
          coverUrl: finalCover,
          status,
          visibility,
        });
        onClose();
      } else {
        const created = await createSeries({
          title: title.trim(),
          description: description.trim(),
          coverUrl: finalCover,
          status,
          visibility,
        });
        if (onCreated) {
          onCreated(created);
        }
        onClose();
      }
    } catch (err: any) {
      console.error('Series submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCover = customCoverUrl.trim() || coverUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0b111e] border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif-heading text-slate-100">
              {editSeries ? 'Edit Story Series' : 'Create New Story Series'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Organize multi-part sagas, novel volumes, and sequential book collections.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Series Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. The Chronicles of Astraea, Blood & Starlight Trilogy"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              Series Synopsis / Overview
            </label>
            <textarea
              rows={3}
              placeholder="What overarching story or saga does this series tell across its volumes?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#070b14] border border-slate-700 rounded-xl p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
            />
          </div>

          {/* Status & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-200 mb-1.5">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SeriesStatus)}
                className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="ongoing">Ongoing (Actively adding parts)</option>
                <option value="completed">Completed (Full saga finished)</option>
                <option value="hiatus">On Hiatus (Temporary pause)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1.5">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private' | 'unlisted')}
                className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="public">Public (Discoverable by all readers)</option>
                <option value="unlisted">Unlisted (Accessible via link)</option>
                <option value="private">Private (Only visible to you)</option>
              </select>
            </div>
          </div>

          {/* Cover Art Selection */}
          <div className="space-y-2 pt-1">
            <label className="block font-semibold text-slate-200">
              Series Cover Art
            </label>

            {/* Presets */}
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCoverUrl(preset.url);
                    setCustomCoverUrl('');
                  }}
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all group ${
                    selectedCover === preset.url
                      ? 'border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {selectedCover === preset.url && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Image URL */}
            <div className="mt-2">
              <input
                type="url"
                placeholder="Or paste custom cover image URL (https://...)"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{editSeries ? 'Update Series' : 'Create Series'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
