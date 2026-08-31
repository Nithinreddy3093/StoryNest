import React from 'react';
import { X, BookOpen, Compass, Upload, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExplore: () => void;
  onUpload: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onExplore,
  onUpload,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      title: 'Discover & Browse',
      description: 'Explore curated emotional, romance, mystery, drama, and nostalgic 90s stories crafted by talented global writers.',
      icon: <Compass className="w-6 h-6 text-amber-400" />,
    },
    {
      step: '02',
      title: 'Immersive Reading',
      description: 'Read seamlessly in our cinematic dark, sepia, or light themes with customizable fonts, auto-scroll, and chapter navigation.',
      icon: <BookOpen className="w-6 h-6 text-amber-400" />,
    },
    {
      step: '03',
      title: 'Share & Support',
      description: 'Like stories, save them to your personal bookmark library, and download beautifully formatted offline PDFs.',
      icon: <Heart className="w-6 h-6 text-amber-400" />,
    },
    {
      step: '04',
      title: 'Publish Your Story',
      description: 'Authors can easily upload PDF stories or chapters, customize aesthetic covers, and share their voice with the world.',
      icon: <Upload className="w-6 h-6 text-amber-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-[#0b111e] border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> StoryNest Guide
          </div>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-slate-100">
            How StoryNest Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            A digital storytelling haven designed for those who believe words have the power to touch hearts.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {steps.map((s) => (
            <div
              key={s.step}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  {s.icon}
                </div>
                <span className="font-serif-heading text-lg font-bold text-amber-500/40">{s.step}</span>
              </div>
              <div>
                <h4 className="font-serif-heading text-base font-semibold text-slate-100 mb-1">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onExplore();
            }}
            className="flex-1 py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs text-center transition-all shadow-md shadow-amber-500/20"
          >
            Explore Stories Now
          </button>
          <button
            onClick={() => {
              onClose();
              onUpload();
            }}
            className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs text-center transition-all"
          >
            Publish Your Story
          </button>
        </div>
      </motion.div>
    </div>
  );
};
