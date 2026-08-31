import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Link, Check, X, Sparkles, User as UserIcon, Loader2 } from 'lucide-react';
import { AVATAR_PRESETS } from '../data/authorAssets';

interface EditAvatarModalProps {
  isOpen: boolean;
  currentAvatar: string;
  onClose: () => void;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void> | void;
}

export const EditAvatarModal: React.FC<EditAvatarModalProps> = ({
  isOpen,
  currentAvatar,
  onClose,
  onSaveAvatar,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [isSaving, setIsSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initial avatar when opened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(currentAvatar);
      setCustomUrl(currentAvatar.startsWith('data:') ? '' : currentAvatar);
    }
  }, [isOpen, currentAvatar]);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Compress using HTML5 Canvas to keep file lightweight and fast
        const img = new Image();
        img.src = result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 400; // 400x400 max avatar dimension
          let { width, height } = img;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            setSelectedAvatar(compressedDataUrl);
          } else {
            setSelectedAvatar(result);
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;
    setIsSaving(true);
    try {
      await onSaveAvatar(selectedAvatar);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSaving ? undefined : onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          className="relative w-full max-w-lg bg-[#0b111e] border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl z-10 overflow-hidden"
        >
          {/* Top Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isSaving}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-slate-100">
                Change Profile Picture
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload a photo, choose an author preset, or paste an image URL
              </p>
            </div>
          </div>

          {/* Live Preview Avatar */}
          <div className="flex flex-col items-center justify-center py-3 mb-5 border-b border-slate-800/80">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-rose-400 shadow-xl">
                <img
                  src={selectedAvatar || currentAvatar}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-full bg-slate-900"
                  onError={(e) => {
                    // Fallback to placeholder if image link fails
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider rounded-full shadow-md whitespace-nowrap">
                Live Preview
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'presets'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Author Presets</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* TAB 1: File Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragOver
                    ? 'border-amber-400 bg-amber-500/10'
                    : 'border-slate-700 hover:border-amber-500/60 bg-slate-900/50 hover:bg-slate-900/80'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-400 mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  Click or drag and drop your photo here
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP (auto-scaled for optimal speed)
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Author Presets */}
          {activeTab === 'presets' && (
            <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedAvatar === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedAvatar(preset.url)}
                    className={`relative flex flex-col items-center p-2 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden mb-1.5 border border-slate-700">
                      <img
                        src={preset.url}
                        alt={preset.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-500/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-slate-950 font-bold" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-200 truncate w-full">
                      {preset.name}
                    </span>
                    <span className="text-[9px] text-amber-400 truncate w-full">
                      {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB 3: Custom URL */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Direct Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => {
                      setCustomUrl(e.target.value);
                      setSelectedAvatar(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-[#070b14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setSelectedAvatar(customUrl)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl border border-slate-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Paste any publicly accessible image link (Unsplash, Imgur, Cloudinary, etc.)
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-800">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving || !selectedAvatar}
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Photo...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Profile Picture</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
