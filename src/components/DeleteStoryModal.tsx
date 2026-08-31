import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, BookOpen, Loader2 } from 'lucide-react';
import { Story } from '../types';

interface DeleteStoryModalProps {
  isOpen: boolean;
  story: Story | null;
  onClose: () => void;
  onConfirm: (storyId: string) => Promise<void> | void;
  isDeleting?: boolean;
}

export const DeleteStoryModal: React.FC<DeleteStoryModalProps> = ({
  isOpen,
  story,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !story) return null;

  const handleConfirm = async () => {
    await onConfirm(story.id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isDeleting ? undefined : onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-md bg-[#0b111e] border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden"
        >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800/80 transition-colors disabled:opacity-40"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Badge & Title */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 shrink-0 shadow-lg shadow-rose-500/10">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-slate-100">
                Delete Story?
              </h3>
              <p className="text-xs text-rose-400/90 font-medium mt-0.5">
                Permanent Removal Confirmation
              </p>
            </div>
          </div>

          {/* Story Snippet Card */}
          <div className="my-4 p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center gap-3.5">
            {story.coverImage ? (
              <img
                src={story.coverImage}
                alt={story.title}
                referrerPolicy="no-referrer"
                className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-xl border border-slate-700 shrink-0"
              />
            ) : (
              <div className="w-14 h-18 sm:w-16 sm:h-20 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-1">
                {story.genre}
              </span>
              <h4 className="font-serif-heading text-sm font-bold text-slate-100 truncate">
                {story.title}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">
                By {story.author} • {story.chapters?.length || 1} chapter(s)
              </p>
            </div>
          </div>

          {/* Warning Message */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-slate-300 text-xs leading-relaxed mb-6">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p>
              Are you sure you want to delete <strong className="text-slate-100 font-semibold">"{story.title}"</strong>? This will permanently delete this story, its chapters, and reading stats. This action cannot be reversed.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/25 flex items-center gap-2 disabled:opacity-50 min-w-[130px] justify-center active:scale-[0.98]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Story</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
