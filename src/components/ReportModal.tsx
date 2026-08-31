import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Story } from '../types';
import { X, AlertTriangle, Flag, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ story, isOpen, onClose }) => {
  const { submitReport } = useApp();
  const [reason, setReason] = useState<'copyright' | 'inappropriate' | 'spam' | 'other'>('copyright');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !story) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(story.id, story.title, reason, details);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setDetails('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-[#0b111e] border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4 text-rose-400">
          <Flag className="w-5 h-5" />
          <h3 className="font-serif-heading text-lg font-bold text-slate-100">
            Report Story
          </h3>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-serif-heading text-base font-bold text-slate-100">Thank you</h4>
            <p className="text-xs text-slate-400">
              Our moderation team has received your report for <span className="text-amber-400 font-semibold">{story.title}</span> and will review it promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300">
              Reporting: <span className="font-semibold text-slate-100">{story.title}</span> by {story.author}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Reason for Report</label>
              <div className="space-y-2 text-xs">
                {[
                  { id: 'copyright', label: 'Copyright / Intellectual Property Violation' },
                  { id: 'inappropriate', label: 'Inappropriate or Explicit Content' },
                  { id: 'spam', label: 'Spam, Duplicate, or Misleading Information' },
                  { id: 'other', label: 'Other Issue' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      reason === item.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      checked={reason === item.id}
                      onChange={() => setReason(item.id as any)}
                      className="accent-amber-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Additional Details</label>
              <textarea
                rows={3}
                required
                placeholder="Please describe the issue in detail..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-[#070b14] border border-slate-700 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-3 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-md shadow-rose-950/40 transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
