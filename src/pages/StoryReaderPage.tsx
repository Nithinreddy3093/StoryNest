import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Story, Chapter, ReaderTheme, User } from '../types';
import { downloadStoryPdfFile } from '../utils/pdfStorage';
import { ReportModal } from '../components/ReportModal';
import { PdfViewerModal } from '../components/PdfViewerModal';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  ArrowLeft,
  Bookmark,
  Heart,
  Eye,
  Download,
  Share2,
  FileText,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Flag,
  Copy,
  MessageSquare,
  Send,
  Sliders,
  AlertCircle,
  Loader2,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { motion } from 'motion/react';

interface StoryReaderPageProps {
  storyId: string;
  initialChapterId?: string;
  navigate: (route: string) => void;
}

export const StoryReaderPage: React.FC<StoryReaderPageProps> = ({
  storyId,
  initialChapterId,
  navigate,
}) => {
  const {
    stories,
    isBookmarked,
    toggleBookmark,
    isLiked,
    toggleLike,
    recordView,
    updateReadingProgress,
    addToast,
    currentUser,
    openShareModal,
    canViewUserStories,
    getUserByIdOrPenName,
    toggleFollowUser,
    getFollowStatus,
  } = useApp();

  // Story state
  const [story, setStory] = useState<Story | null>(() => {
    return stories.find((s) => s.id === storyId) || null;
  });
  const [authorUser, setAuthorUser] = useState<User | null>(null);
  const [isFetchingStory, setIsFetchingStory] = useState<boolean>(!story);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active chapter index
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);

  // Reading settings
  const [theme, setTheme] = useState<ReaderTheme>('dark');
  const [fontSize, setFontSize] = useState<number>(18);
  const [autoScrollActive, setAutoScrollActive] = useState<boolean>(false);
  const [autoScrollSpeed, setAutoScrollSpeed] = useState<number>(1);

  // Text-To-Speech Narration
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Modals
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Comments / reflections
  const [commentInput, setCommentInput] = useState<string>('');
  const [comments, setComments] = useState<{ id: string; user: string; text: string; time: string }[]>([
    {
      id: 'c1',
      user: 'Priya Sharma',
      text: 'The prose in this chapter is deeply moving. Felt every single sentence.',
      time: '2 hours ago',
    },
  ]);

  // Scroll ref
  const readerContentRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Fetch story doc if not already present in memory
  useEffect(() => {
    let isMounted = true;
    const loadStory = async () => {
      // Check in-memory context first
      const existing = stories.find((s) => s.id === storyId);
      if (existing) {
        setStory(existing);
        setIsFetchingStory(false);
        recordView(existing.id);
        getUserByIdOrPenName(existing.authorId || existing.author).then((u) => {
          if (isMounted) setAuthorUser(u);
        });
        return;
      }

      // If not in context, fetch from Firestore directly
      try {
        setIsFetchingStory(true);
        setFetchError(null);
        const docRef = doc(db, 'stories', storyId);
        const snap = await getDoc(docRef);

        if (snap.exists() && isMounted) {
          const loaded = { id: snap.id, ...snap.data() } as Story;
          setStory(loaded);
          recordView(loaded.id);
          getUserByIdOrPenName(loaded.authorId || loaded.author).then((u) => {
            if (isMounted) setAuthorUser(u);
          });
        } else if (isMounted) {
          setStory(null);
          setFetchError('Story unavailable. The story with this ID does not exist.');
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching story:', err);
          setFetchError('Failed to load story details.');
        }
      } finally {
        if (isMounted) setIsFetchingStory(false);
      }
    };

    loadStory();
    return () => {
      isMounted = false;
    };
  }, [storyId, stories]);

  // Set initial chapter if requested
  useEffect(() => {
    if (story && initialChapterId) {
      const idx = story.chapters.findIndex((c) => c.id === initialChapterId);
      if (idx !== -1) {
        setCurrentChapterIndex(idx);
      }
    }
  }, [story, initialChapterId]);

  // Track and update reading progress for this specific story
  useEffect(() => {
    if (story && story.chapters && story.chapters.length > 0) {
      const total = story.chapters.length;
      const progressPercent = Math.min(100, Math.round(((currentChapterIndex + 1) / total) * 100));
      updateReadingProgress(story.id, currentChapterIndex + 1, progressPercent);
    }
  }, [currentChapterIndex, story?.id]);

  // Track window scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll loop
  useEffect(() => {
    let scrollInterval: any = null;
    if (autoScrollActive) {
      scrollInterval = setInterval(() => {
        window.scrollBy({ top: autoScrollSpeed * 1.5, behavior: 'auto' });
      }, 50);
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [autoScrollActive, autoScrollSpeed]);

  // Stop speech when unmounting or chapter changes
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentChapterIndex]);

  // Chapter handling
  const chapters = story?.chapters || [];
  const currentChapter: Chapter | undefined = chapters[currentChapterIndex] || chapters[0];

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      addToast('Text-to-speech is not supported on this browser.', 'warning');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!currentChapter || !currentChapter.content || currentChapter.content.length < 5) {
        addToast('No selectable text available to read.', 'warning');
        return;
      }
      const utterance = new SpeechSynthesisUtterance(currentChapter.content);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast('Story link copied to clipboard!', 'success');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: 'c-' + Date.now(),
      user: currentUser?.name || 'Anonymous Reader',
      text: commentInput.trim(),
      time: 'Just now',
    };

    setComments([newComment, ...comments]);
    setCommentInput('');
    addToast('Reflection posted!', 'success');
  };

  const handleDownloadOriginalPdf = async () => {
    if (!story) return;
    try {
      await downloadStoryPdfFile(story);
      addToast('PDF download started', 'success');
    } catch (e) {
      console.error('Download error:', e);
      addToast('Unable to download PDF file.', 'error');
    }
  };

  // Dynamic Reader Themes
  const getThemeClasses = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#f6ecd9] text-[#2f2214] selection:bg-amber-700/20';
      case 'light':
        return 'bg-[#fcfbf9] text-[#1a1b1e] selection:bg-amber-300/40';
      case 'midnight':
        return 'bg-[#000000] text-[#d6d6d6] selection:bg-amber-500/30';
      case 'dark':
      default:
        return 'bg-[#070b14] text-slate-100 selection:bg-amber-500/30';
    }
  };

  const getContainerBg = () => {
    switch (theme) {
      case 'sepia':
        return 'bg-[#eedec5] border-[#d8c3a1] text-[#2f2214]';
      case 'light':
        return 'bg-white border-slate-200 text-slate-900 shadow-sm';
      case 'midnight':
        return 'bg-[#0a0a0a] border-zinc-800 text-zinc-200';
      case 'dark':
      default:
        return 'bg-[#0b111e] border-slate-800 text-slate-100';
    }
  };

  // Loading State
  if (isFetchingStory) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Opening Story in Reading Room...</p>
      </div>
    );
  }

  // Error / Story Unavailable State (STRICT: NO SILENT FALLBACK)
  if (!story || fetchError) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0b111e] border border-slate-800 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold">Story Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {fetchError || `The story with ID "${storyId}" could not be found or has been removed.`}
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('stories')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              Browse Library Stories
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAuthorPrivate =
    authorUser?.accountPrivacy === 'private' ||
    authorUser?.isPrivate === true ||
    story.authorId === 'user-private-1';
  const hasAccess = canViewUserStories(story.authorId, authorUser?.accountPrivacy, isAuthorPrivate);

  if (!hasAccess) {
    const authorFollowStatus = getFollowStatus(story.authorId);
    const authorHandle = authorUser?.username || story.author.toLowerCase().replace(/\s+/g, '_');

    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full p-8 rounded-3xl bg-[#0b111e] border border-slate-800 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Private Story
            </span>
            <h2 className="font-serif-heading text-2xl font-bold text-slate-100 pt-2">
              "{story.title}"
            </h2>
            <p className="text-xs text-amber-400 font-mono">By @{authorHandle}</p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            This manuscript is published under a private account. You must follow @{authorHandle} and have your request approved to read this story and its serialized chapters.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {authorFollowStatus === 'pending' ? (
              <button
                onClick={() => toggleFollowUser(story.authorId)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all"
              >
                Follow Request Pending (Click to Cancel)
              </button>
            ) : (
              <button
                onClick={() => toggleFollowUser(story.authorId)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Request to Follow @{authorHandle}</span>
              </button>
            )}

            <button
              onClick={() => navigate('stories')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Browse Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bookmarked = isBookmarked(story.id);
  const liked = isLiked(story.id);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${getThemeClasses()}`}>
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-amber-500 z-50 transition-all duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Reader Navigation Header */}
      <header className="sticky top-0 z-40 h-14 px-4 sm:px-8 border-b backdrop-blur-md flex items-center justify-between border-slate-800/80 bg-[#070b14]/90">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('stories')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-slate-800" />

          <span className="hidden sm:block text-xs font-serif italic text-slate-400 truncate max-w-xs">
            {story.title}
          </span>
        </div>

        {/* Action Header Tools */}
        <div className="flex items-center gap-2">
          {/* Open in PDF E-Reader */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors shadow-sm"
            title="Open in PDF E-Reader"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open in PDF E-Reader</span>
          </button>

          {/* Full Screen Dedicated PDF Reader route */}
          <button
            onClick={() => navigate(`pdf-reader:${story.id}`)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Open dedicated full-screen PDF viewer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Share Story Button */}
          <button
            onClick={() => openShareModal({ story })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/30 transition-colors shadow-sm"
            title="Share this story link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Bookmark */}
          <button
            onClick={() => toggleBookmark(story.id)}
            className={`p-2 rounded-lg border transition-all ${
              bookmarked
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Bookmark Story'}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Like */}
          <button
            onClick={() => toggleLike(story.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              liked
                ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
            title="Like this story"
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current text-rose-400' : ''}`} />
            <span>{story.likes}</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Reading Workspace */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* ================= LEFT STORY META SIDEBAR (3 cols) ================= */}
          <aside className="order-2 lg:order-1 lg:col-span-3 space-y-5 lg:sticky lg:top-20">
            {/* Story Card & Cover */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl ${getContainerBg()}`}>
              <div className="flex sm:block gap-4 items-center sm:items-start mb-4">
                <div className="relative aspect-[3/4] w-24 sm:w-full shrink-0 rounded-xl overflow-hidden shadow-lg border border-amber-500/20 bg-slate-950">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <span className="px-1.5 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[9px] font-bold uppercase tracking-wider">
                      {story.genre}
                    </span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="font-serif-heading text-base sm:text-lg font-bold leading-snug truncate sm:whitespace-normal">
                    {story.title}
                  </h2>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <span>By</span>
                    <button
                      onClick={() => navigate(`user:${story.authorId || 'author'}`)}
                      className="text-amber-400 font-semibold hover:text-amber-300 hover:underline text-left truncate"
                      title={`View ${story.author}'s Profile`}
                    >
                      {story.author}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed hidden sm:block">
                    {story.description}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed sm:hidden">
                {story.description}
              </p>

              {/* Stats Bar */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>{story.views} reads</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  <span>{story.likes} likes</span>
                </div>
              </div>
            </div>

            {/* Table of Contents */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl ${getContainerBg()}`}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Table of Contents</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {chapters.length} Chapter{chapters.length > 1 ? 's' : ''}
                </span>
              </h4>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {chapters.map((ch, idx) => {
                  const isActive = idx === currentChapterIndex;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setCurrentChapterIndex(idx);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between gap-2 min-h-[40px] active:scale-[0.98] ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`text-[10px] ${isActive ? 'text-slate-950 font-bold' : 'text-amber-400 font-mono'}`}>
                          {ch.chapterNumber.toString().padStart(2, '0')}
                        </span>
                        <span className="truncate">{ch.chapterTitle}</span>
                      </div>
                      <span className="text-[10px] opacity-70 shrink-0">{ch.readTime || '4m'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Tools */}
            <div className="space-y-2">
              <button
                onClick={() => openShareModal({ story })}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 shadow-md transition-all min-h-[44px] active:scale-[0.98]"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>Share Story Link</span>
              </button>

              <button
                onClick={handleDownloadOriginalPdf}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all min-h-[44px] active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Download Story PDF</span>
              </button>

              <button
                onClick={() => setShowPdfModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors min-h-[44px] active:scale-[0.98]"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Open in PDF E-Reader</span>
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-[11px] text-slate-400 hover:text-rose-400 transition-colors min-h-[38px]"
              >
                <Flag className="w-3 h-3" />
                <span>Report Story / Copyright</span>
              </button>
            </div>
          </aside>

          {/* ================= CENTER READING VIEWPORT (6 cols) ================= */}
          <main ref={readerContentRef} className="order-1 lg:order-2 lg:col-span-6 space-y-6 sm:space-y-8">
            <div className={`p-5 sm:p-10 rounded-2xl border shadow-2xl ${getContainerBg()}`}>
              {currentChapter ? (
                <>
                  {/* Chapter Header */}
                  <div className="text-center pb-6 border-b border-amber-500/20">
                    <div className="inline-flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-[0.25em] mb-2">
                      <span>CHAPTER {currentChapter.chapterNumber}</span>
                    </div>
                    <h1 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mt-1">
                      {currentChapter.chapterTitle}
                    </h1>
                    <div className="flex items-center justify-center gap-2 mt-4 text-amber-400/70 text-xs">
                      <span>◆</span>
                      <span className="text-[11px] font-mono">{currentChapter.readTime || '4 min read'}</span>
                      <span>◆</span>
                    </div>
                  </div>

                  {/* Notice for scanned or image-based PDF */}
                  {story.hasSelectableText === false && (
                    <div className="my-6 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                      <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-200">Scanned / Image-Based PDF Document</p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          This document does not contain selectable digital text. Use the PDF E-Reader to view all original pages with zoom and pagination.
                        </p>
                        <button
                          onClick={() => setShowPdfModal(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Launch PDF E-Reader Now</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Story Body Content */}
                  <div
                    style={{ fontSize: `${fontSize}px` }}
                    className="pt-8 leading-[1.85] space-y-6 font-reading text-justify"
                  >
                    {currentChapter.content ? (
                      currentChapter.content.split('\n\n').map((para, pIndex) => (
                        <p key={pIndex} className="indent-4 sm:indent-8">
                          {para}
                        </p>
                      ))
                    ) : (
                      <p className="italic text-slate-400 text-center py-10">
                        No text content in this section.
                      </p>
                    )}
                  </div>

                  {/* Chapter End Marker */}
                  <div className="text-center pt-10 pb-4">
                    <div className="inline-flex items-center gap-2 text-amber-500/60 text-xs">
                      <span>❖</span>
                      <span className="font-serif italic">End of Chapter {currentChapter.chapterNumber}</span>
                      <span>❖</span>
                    </div>
                  </div>

                  {/* Chapter Pagination Navigation */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 gap-3">
                    <button
                      disabled={currentChapterIndex === 0}
                      onClick={() => {
                        setCurrentChapterIndex((prev) => Math.max(0, prev - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-xs font-semibold transition-colors text-slate-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Chapter</span>
                    </button>

                    <span className="text-xs text-slate-400 font-mono">
                      {currentChapterIndex + 1} / {chapters.length}
                    </span>

                    <button
                      disabled={currentChapterIndex === chapters.length - 1}
                      onClick={() => {
                        setCurrentChapterIndex((prev) =>
                          Math.min(chapters.length - 1, prev + 1)
                        );
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-30 text-xs font-bold transition-colors shadow-md"
                    >
                      <span>Next Chapter</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm">No chapters available for this story.</p>
                </div>
              )}
            </div>

            {/* Reader Reflections & Notes */}
            <div className={`p-6 rounded-2xl border shadow-xl ${getContainerBg()}`}>
              <h3 className="font-serif-heading text-base font-bold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Reader Reflections ({comments.length})
              </h3>

              <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Leave a thoughtful reflection on this story..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-slate-700/80 rounded-lg px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-200 placeholder-slate-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors flex items-center gap-1"
                >
                  <span>Post</span>
                  <Send className="w-3 h-3" />
                </button>
              </form>

              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-lg bg-black/20 border border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-amber-400">{c.user}</span>
                      <span className="text-[10px] text-slate-500">{c.time}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* ================= RIGHT CONTROLS SIDEBAR (3 cols) ================= */}
          <aside className="order-3 lg:order-3 lg:col-span-3 space-y-5 lg:sticky lg:top-20">
            {/* Reading Preferences Card */}
            <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl ${getContainerBg()}`}>
              <h4 className="font-serif-heading text-sm font-bold mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                Reader Controls
              </h4>

              {/* Theme Selector */}
              <div className="space-y-2 mb-5">
                <label className="text-xs font-semibold text-slate-400">Color Theme</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'dark', label: 'Dark', bg: 'bg-[#070b14] text-slate-100 border-slate-700' },
                    { id: 'sepia', label: 'Sepia', bg: 'bg-[#fbf0d9] text-[#2d2013] border-amber-300' },
                    { id: 'light', label: 'Light', bg: 'bg-white text-slate-900 border-slate-300' },
                    { id: 'midnight', label: 'OLED', bg: 'bg-black text-slate-300 border-slate-800' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id as ReaderTheme)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${t.bg} ${
                        theme === t.id ? 'ring-2 ring-amber-500 font-bold scale-105' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Adjuster */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span>Font Size</span>
                  <span className="font-mono text-amber-400">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                    className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize(18)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200"
                  >
                    Default
                  </button>
                  <button
                    onClick={() => setFontSize((s) => Math.min(26, s + 2))}
                    className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Auto-Scroll Toggle */}
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                  <span>Auto-Scroll</span>
                  <button
                    onClick={() => setAutoScrollActive(!autoScrollActive)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-all ${
                      autoScrollActive
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {autoScrollActive ? 'Active' : 'Off'}
                  </button>
                </div>
                {autoScrollActive && (
                  <div className="flex gap-1.5 pt-1">
                    {[1, 2, 3].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setAutoScrollSpeed(speed)}
                        className={`flex-1 py-1 rounded text-[10px] font-mono border ${
                          autoScrollSpeed === speed
                            ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Audio Narration */}
              <div className="pt-3 border-t border-slate-800/80">
                <button
                  onClick={toggleSpeech}
                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    isSpeaking
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                  }`}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                  <span>{isSpeaking ? 'Pause Audio Voice' : 'Listen with Audio Voice'}</span>
                </button>
              </div>
            </div>

            {/* Share Story Card */}
            <div className={`p-4 rounded-2xl border shadow-xl ${getContainerBg()}`}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Share this Story
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Read "${story.title}" by ${story.author} on StoryNest: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 hover:bg-emerald-900/60 transition-colors"
                  title="Share on WhatsApp"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Report Story Modal */}
      <ReportModal
        story={story}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      {/* PDF E-Reader Modal */}
      <PdfViewerModal
        story={story}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
};
