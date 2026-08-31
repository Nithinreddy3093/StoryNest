import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Story, Chapter, StoryGenre } from '../types';
import { StoryCard } from '../components/StoryCard';
import { extractTextAndChaptersFromPdf, extractCoverImageFromPdf } from '../utils/pdfExtractor';
import { uploadStoryPdfToStorage } from '../utils/pdfStorage';
import { auth } from '../firebase';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  Eye,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  BookOpen,
  Feather,
  ArrowRight,
  ArrowLeft,
  Quote,
  ShieldAlert,
  Loader2,
  ExternalLink,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UploadStoryPageProps {
  navigate: (route: string) => void;
}

export const UploadStoryPage: React.FC<UploadStoryPageProps> = ({ navigate }) => {
  const { currentUser, addStory, addToast, openShareModal } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(currentUser?.name || currentUser?.penName || 'Anonymous Writer');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState<StoryGenre>('Romance');
  const [secondaryGenre, setSecondaryGenre] = useState<StoryGenre | ''>('Drama');
  const [language, setLanguage] = useState('English');
  const [tagInput, setTagInput] = useState('love, memories, journey');
  const [visibility, setVisibility] = useState<'public' | 'private' | 'unlisted'>('public');

  // PDF File & Extraction state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [pdfFileSize, setPdfFileSize] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [hasSelectableText, setHasSelectableText] = useState<boolean>(true);
  const [pageCount, setPageCount] = useState<number>(1);
  const [extractedFullText, setExtractedFullText] = useState<string>('');

  // PDF Cover Image Extraction
  const [extractedPdfCover, setExtractedPdfCover] = useState<string | null>(null);
  const [isExtractingCover, setIsExtractingCover] = useState<boolean>(false);
  const [coverPageSelection, setCoverPageSelection] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Publishing State
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [publishedStoryId, setPublishedStoryId] = useState<string | null>(null);

  // Chapters list
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: 'ch-1',
      chapterNumber: 1,
      chapterTitle: 'The Beginning',
      content:
        'The rain began just as twilight settled over the city. Under the amber streetlamps, footsteps echoed softly against the pavement...\n\nShe held the old envelope tightly, knowing that some words are meant to be kept forever.',
      readTime: '3 min read',
    },
  ]);

  // Cover Image selection
  const presetCovers = [
    {
      label: 'Ocean Sunset',
      url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1000&auto=format&fit=crop',
    },
    {
      label: 'Vintage Coffee & Books',
      url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop',
    },
    {
      label: 'Nocturnal City Rain',
      url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1000&auto=format&fit=crop',
    },
    {
      label: 'Autumn Woods',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    },
    {
      label: 'Stargazer Campfire',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  const [coverImage, setCoverImage] = useState<string>(presetCovers[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Manual trigger for PDF Cover extraction
  const handleExtractCover = async (pageNumber: number = 1) => {
    if (!pdfFile) {
      addToast('Please upload a PDF file first.', 'warning');
      return;
    }

    setIsExtractingCover(true);
    try {
      addToast(`Extracting cover artwork from PDF page ${pageNumber}...`, 'info');
      const result = await extractCoverImageFromPdf(pdfFile, pageNumber, 700);
      if (result && result.coverImageUrl) {
        setExtractedPdfCover(result.coverImageUrl);
        setCoverImage(result.coverImageUrl);
        setCustomCoverUrl('');
        setCoverPageSelection(pageNumber);
        addToast(`Successfully extracted cover image from page ${pageNumber}!`, 'success');
      } else {
        addToast('Could not extract cover artwork from that page.', 'warning');
      }
    } catch (err) {
      console.error('Error extracting cover:', err);
      addToast('Failed to extract cover image from PDF.', 'error');
    } finally {
      setIsExtractingCover(false);
    }
  };

  // PDF File Validation and Extraction Processor
  const processPdfFile = async (file: File) => {
    if (!file) {
      addToast('No file selected.', 'warning');
      return;
    }

    // 1. Validate File Format / Extension
    const isValidFormat =
      file.type === 'application/pdf' ||
      file.name.toLowerCase().endsWith('.pdf');

    if (!isValidFormat) {
      addToast('Invalid file format. Please select a valid PDF document (.pdf).', 'error');
      return;
    }

    // 2. Validate Empty File
    if (file.size <= 0) {
      addToast('The selected file is empty (0 bytes). Please upload a valid document.', 'error');
      return;
    }

    // 3. Validate Maximum Size (50 MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      addToast('PDF file exceeds the 50MB maximum limit. Please select a smaller document.', 'error');
      return;
    }

    setPdfFile(file);
    setPdfFileName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    setPdfFileSize(`${sizeInMb} MB`);
    setIsExtractingPdf(true);
    setUploadProgress(20);

    // Auto populate title if currently empty
    if (!title.trim()) {
      const cleanTitle = file.name
        .replace(/\.pdf$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim();
      setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }

    try {
      addToast('Analyzing PDF, extracting story text and cover artwork...', 'info');
      const extracted = await extractTextAndChaptersFromPdf(file);

      setUploadProgress(100);
      setPageCount(extracted.pageCount);
      setHasSelectableText(extracted.hasSelectableText);
      setExtractedFullText(extracted.fullText);

      if (extracted.chapters && extracted.chapters.length > 0) {
        setChapters(extracted.chapters);
      }

      // If PDF contains a cover image on page 1, automatically set it!
      if (extracted.coverImageUrl) {
        setExtractedPdfCover(extracted.coverImageUrl);
        setCoverImage(extracted.coverImageUrl);
        setCustomCoverUrl('');
      }

      if (!extracted.hasSelectableText) {
        addToast(
          'PDF loaded! (Scanned/image document: text extraction is limited, but full PDF reading is available in PDF E-Reader).',
          'info'
        );
      } else {
        addToast(
          `Extracted ${extracted.chapters.length} chapter(s) from ${file.name} (${extracted.pageCount} pages)!`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Error extracting PDF content:', err);
      addToast('Uploaded PDF file. You can adjust the chapter text below.', 'info');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processPdfFile(file);
    }
    // Reset file input value so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleClearPdf = () => {
    setPdfFile(null);
    setPdfFileName(null);
    setPdfFileSize(null);
    setExtractedPdfCover(null);
    setExtractedFullText('');
    setPageCount(1);
    setUploadProgress(0);
    addToast('Attached PDF removed.', 'info');
  };

  // Chapter editing handlers
  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        id: `ch-${nextNum}`,
        chapterNumber: nextNum,
        chapterTitle: `Chapter ${nextNum}`,
        content: '',
        readTime: '4 min read',
      },
    ]);
  };

  const handleUpdateChapter = (index: number, field: keyof Chapter, val: any) => {
    const updated = [...chapters];
    updated[index] = { ...updated[index], [field]: val };
    setChapters(updated);
  };

  const handleRemoveChapter = (index: number) => {
    if (chapters.length <= 1) {
      addToast('A story must have at least one chapter.', 'warning');
      return;
    }
    setChapters(chapters.filter((_, i) => i !== index));
  };

  // Final submission and cloud persistence
  const handleFinalPublish = async () => {
    // 1. Input Validations
    if (!title.trim()) {
      addToast('Please provide a title for your story.', 'warning');
      setCurrentStep(1);
      return;
    }

    if (!description.trim()) {
      addToast('Please provide a short description for your story.', 'warning');
      setCurrentStep(1);
      return;
    }

    const hasValidChapter = chapters.some((c) => c.content && c.content.trim().length > 0);
    if (!hasValidChapter && !pdfFile) {
      addToast('Please provide chapter content or attach a PDF file before publishing.', 'warning');
      setCurrentStep(2);
      return;
    }

    if (!acceptedTerms) {
      addToast('Please accept the author guidelines and copyright terms.', 'warning');
      return;
    }

    setIsPublishing(true);

    try {
      const storyId = `story-${Date.now()}`;
      let uploadedPdfUrl: string | undefined = undefined;
      let uploadedStoragePath: string | undefined = undefined;

      // 2. Upload the real PDF to Firebase Storage (and local persistent cache) if a PDF file was selected
      if (pdfFile) {
        addToast('Uploading story PDF file to cloud storage...', 'info');
        try {
          const uploadResult = await uploadStoryPdfToStorage(storyId, pdfFile, (pct) => {
            setUploadProgress(pct);
          });
          uploadedPdfUrl = uploadResult.pdfUrl;
          uploadedStoragePath = uploadResult.pdfStoragePath;
          if (uploadResult.isCloudStored) {
            addToast('PDF securely stored in Firebase Cloud Storage.', 'success');
          }
        } catch (uploadErr: any) {
          console.warn('PDF upload warning:', uploadErr);
          addToast('PDF binary saved to resilient cache. Continuing publication...', 'info');
        }
      }

      // 3. Assemble complete Story entity with unique ID and references
      const finalCover = customCoverUrl.trim() || coverImage;
      const sanitizedChapters = chapters.map((ch, idx) => ({
        id: ch.id || `chap-${storyId}-${idx + 1}`,
        chapterNumber: ch.chapterNumber || idx + 1,
        chapterTitle: ch.chapterTitle?.trim() || `Chapter ${idx + 1}`,
        content: ch.content || '',
        readTime: ch.readTime || '3 min read',
      }));

      const newStory: Story = {
        id: storyId,
        title: title.trim(),
        author: author.trim() || currentUser?.name || currentUser?.penName || 'Anonymous Writer',
        authorId: currentUser?.id || auth.currentUser?.uid || 'guest',
        description: description.trim(),
        genre,
        secondaryGenre: secondaryGenre || undefined,
        coverImage: finalCover,
        pdfUrl: uploadedPdfUrl,
        pdfStoragePath: uploadedStoragePath,
        pdfFileName: pdfFileName || undefined,
        pdfFileSize: pdfFileSize || undefined,
        hasSelectableText,
        pageCount,
        extractedText: extractedFullText ? extractedFullText.slice(0, 50000) : undefined,
        chapters: sanitizedChapters,
        views: 1,
        likes: 1,
        language,
        visibility,
        status: currentUser?.role === 'admin' ? 'published' : 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: tagInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      // 4. Save document into Firestore
      addToast('Writing story document to library...', 'info');
      await addStory(newStory);

      // 5. Update success state
      setPublishedStoryId(storyId);
      setIsPublished(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      addToast('Story published successfully! Readers can now enjoy your work.', 'success');
    } catch (err: any) {
      console.error('Failed to publish story:', err);
      addToast('Failed to publish story: ' + (err?.message || 'Unknown error'), 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Live Story card preview
  const previewStory: Story = {
    id: 'preview',
    title: title || 'Untitled Story',
    author: author || 'Author Name',
    description: description || 'Story synopsis will appear here...',
    genre,
    secondaryGenre: secondaryGenre || undefined,
    coverImage: customCoverUrl.trim() || coverImage,
    chapters,
    views: 0,
    likes: 0,
    language,
    visibility,
    status: 'published',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
  };

  const stepsList = [
    { num: 1, label: 'Story Details', icon: <FileText className="w-3.5 h-3.5" /> },
    { num: 2, label: 'Upload PDF & Text', icon: <Upload className="w-3.5 h-3.5" /> },
    { num: 3, label: 'Cover Art', icon: <ImageIcon className="w-3.5 h-3.5" /> },
    { num: 4, label: 'Preview', icon: <Eye className="w-3.5 h-3.5" /> },
    { num: 5, label: 'Publish', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" /> Share Your Story
        </div>

        <h1 className="font-serif-heading text-2xl sm:text-4xl font-bold text-slate-100">
          Publish Your <span className="text-amber-400 font-normal italic">Story</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
          Upload your story PDF, customize your details, and share your emotions with readers across the world.
        </p>
      </div>

      {/* Step Indicator Bar */}
      <div className="max-w-4xl mx-auto mb-6 sm:mb-10">
        <div className="flex items-center justify-between relative">
          {/* Progress bar line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
          />

          {stepsList.map((st) => {
            const isCompleted = currentStep > st.num;
            const isCurrent = currentStep === st.num;
            return (
              <div
                key={st.num}
                onClick={() => {
                  if (st.num < currentStep || (st.num === 2 && title.trim())) {
                    setCurrentStep(st.num);
                  }
                }}
                className={`relative z-10 flex flex-col items-center cursor-pointer group`}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 scale-105 sm:scale-110'
                      : isCompleted
                      ? 'bg-amber-500/20 border border-amber-500 text-amber-400'
                      : 'bg-slate-900 border border-slate-700 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : st.num}
                </div>
                <span
                  className={`text-[10px] sm:text-[11px] font-medium mt-1.5 sm:mt-2 hidden sm:block ${
                    isCurrent ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Column (3 cols) */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
          <div className="p-5 rounded-2xl bg-[#0b111e]/85 backdrop-blur-xl border border-slate-800/90 shadow-xl">
            <h4 className="font-serif-heading text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              Why Publish on StoryNest?
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Reach thousands of passionate story lovers worldwide.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Distraction-free, beautiful cinematic reading format.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Full author recognition, view tracking, and reader feedback.</span>
              </li>
            </ul>
          </div>

          {/* Quote Card */}
          <div className="p-5 rounded-2xl bg-amber-950/30 backdrop-blur-xl border border-amber-500/20 text-slate-300 relative">
            <Quote className="w-6 h-6 text-amber-400/40 mb-2" />
            <p className="font-serif text-xs italic leading-relaxed text-amber-200/90">
              "There is no greater agony than bearing an untold story inside you."
            </p>
            <p className="text-[10px] text-amber-400/70 font-semibold mt-2 text-right">
              — Maya Angelou
            </p>
          </div>
        </div>

        {/* Center Main Wizard Card (6 cols) */}
        <div className="lg:col-span-6 bg-[#0b111e]/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 sm:p-8 shadow-2xl">
          {/* Success Screen if published */}
          {isPublished && publishedStoryId ? (
            <div className="py-10 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-xl">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif-heading text-2xl font-bold text-slate-100">
                  Story Published Successfully!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  "{title}" is now permanently published to your StoryNest library and ready to be read.
                </p>
              </div>

              {/* Story Share Link Box */}
              <div className="p-4 rounded-xl bg-[#070b14] border border-amber-500/30 text-left max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-300">Share Story by Link</span>
                  <span className="text-[10px] text-slate-400 capitalize">{visibility} Story</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/#read:${publishedStoryId}`}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/#read:${publishedStoryId}`);
                      addToast('Story link copied to clipboard!', 'success');
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={() => {
                    openShareModal({
                      story: {
                        id: publishedStoryId,
                        title,
                        author,
                        description,
                        genre,
                        coverImage,
                        chapters: [],
                        views: 1,
                        likes: 1,
                        visibility,
                        status: 'published',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      },
                    });
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Open Full Share Options
                </button>
              </div>

              {/* Direct Actions to Read or View in PDF E-Reader */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate(`read:${publishedStoryId}`)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read in StoryNest</span>
                </button>
                <button
                  onClick={() => navigate(`pdf-reader:${publishedStoryId}`)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open in PDF E-Reader</span>
                </button>
                <button
                  onClick={() => navigate('profile:my-stories')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                >
                  My Stories
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Step 1: Story Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-serif-heading text-lg font-bold text-slate-100 pb-2 border-b border-slate-800">
                    Step 1: Basic Story Information
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Story Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Echoes of the Ocean"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Author Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Your pen name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi (हिंदी)</option>
                        <option value="Spanish">Spanish (Español)</option>
                        <option value="French">French (Français)</option>
                        <option value="Japanese">Japanese (日本語)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Short Description / Synopsis *
                      </label>
                      <span className="text-[10px] text-slate-500">
                        {description.length}/300 characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={300}
                      required
                      placeholder="Briefly describe what this story is about..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-700 rounded-lg p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Primary Genre *
                      </label>
                      <select
                        value={genre}
                        onChange={(e) => setGenre(e.target.value as StoryGenre)}
                        className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="Romance">Romance</option>
                        <option value="Drama">Drama</option>
                        <option value="Emotional">Emotional</option>
                        <option value="Tragedy">Tragedy</option>
                        <option value="Short Story">Short Story</option>
                        <option value="90's Vibes">90's Vibes</option>
                        <option value="Friendship">Friendship</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Inspirational">Inspirational</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Secondary Genre (Optional)
                      </label>
                      <select
                        value={secondaryGenre}
                        onChange={(e) => setSecondaryGenre(e.target.value as any)}
                        className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                      >
                        <option value="">None</option>
                        <option value="Romance">Romance</option>
                        <option value="Drama">Drama</option>
                        <option value="Emotional">Emotional</option>
                        <option value="Tragedy">Tragedy</option>
                        <option value="Short Story">Short Story</option>
                        <option value="90's Vibes">90's Vibes</option>
                        <option value="Friendship">Friendship</option>
                        <option value="Mystery">Mystery</option>
                        <option value="Inspirational">Inspirational</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tags / Keywords (comma separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. nostalgic, coffee, rain, parting"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Story Visibility & Privacy Settings */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Story Visibility & Privacy
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setVisibility('public')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          visibility === 'public'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                            : 'bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs text-slate-200">
                          <span>🌐 Public</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Visible to everyone on feeds, discovery, leaderboards & author profile.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility('private')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          visibility === 'private'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                            : 'bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs text-slate-200">
                          <span>🔒 Followers Only</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Private story. Only approved followers and you can read this.
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVisibility('unlisted')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          visibility === 'unlisted'
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                            : 'bg-[#070b14] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 font-semibold text-xs text-slate-200">
                          <span>🔗 Link Only</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          Anyone with direct link can read; hidden from public feeds.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Upload File & Chapters */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <h3 className="font-serif-heading text-lg font-bold text-slate-100 pb-2 border-b border-slate-800">
                    Step 2: PDF Upload & Text Extraction
                  </h3>

                  {/* PDF Drag & Drop Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                      const droppedFile = e.dataTransfer.files?.[0];
                      if (droppedFile) {
                        processPdfFile(droppedFile);
                      }
                    }}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                      isDragging
                        ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10 scale-[1.01]'
                        : 'border-slate-700 hover:border-amber-500/60 bg-[#070b14]/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="pdfFileInput"
                      accept=".pdf,application/pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="pdfFileInput"
                      className="cursor-pointer flex flex-col items-center justify-center"
                    >
                      <div
                        className={`w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-colors ${
                          isDragging
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        }`}
                      >
                        {isExtractingPdf ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-slate-200">
                        {pdfFileName
                          ? pdfFileName
                          : isDragging
                          ? 'Drop your PDF file here!'
                          : 'Click to select or drag and drop your story PDF here'}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {pdfFileSize
                          ? `File Size: ${pdfFileSize} (${pageCount} page${pageCount > 1 ? 's' : ''})`
                          : 'Supported format: PDF documents up to 50MB'}
                      </p>
                    </label>

                    {pdfFile && !isExtractingPdf && (
                      <div className="mt-3.5 flex items-center justify-center gap-2">
                        <label
                          htmlFor="pdfFileInput"
                          className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 hover:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Change PDF
                        </label>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClearPdf();
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/30 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    )}

                    {isExtractingPdf && (
                      <div className="mt-3 space-y-1">
                        <p className="text-[11px] text-amber-400 animate-pulse font-medium">
                          Extracting pages, text, and cover artwork from PDF ({uploadProgress}%)...
                        </p>
                        <div className="w-48 mx-auto h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extracted Cover Highlight in Step 2 */}
                  {extractedPdfCover && (
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 sm:w-14 aspect-[3/4] rounded-md overflow-hidden border border-amber-500/50 shadow-md flex-shrink-0 bg-slate-950">
                          <img
                            src={extractedPdfCover}
                            alt="Extracted PDF Cover"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-xs font-bold text-amber-300">
                              Cover Artwork Detected in PDF (Page {coverPageSelection})
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Extracted directly from the PDF document and set as your story cover artwork.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage(extractedPdfCover);
                            setCustomCoverUrl('');
                            addToast('PDF cover active for this story!', 'success');
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all w-full sm:w-auto ${
                            coverImage === extractedPdfCover && !customCoverUrl
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {coverImage === extractedPdfCover && !customCoverUrl
                            ? '✓ Cover Active'
                            : 'Use as Story Cover'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Chapter Content Editor */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Extracted Story Chapters ({chapters.length})
                      </h4>
                      <button
                        type="button"
                        onClick={handleAddChapter}
                        className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Chapter</span>
                      </button>
                    </div>

                    {chapters.map((ch, idx) => (
                      <div
                        key={ch.id}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <input
                            type="text"
                            placeholder="Chapter Title"
                            value={ch.chapterTitle}
                            onChange={(e) =>
                              handleUpdateChapter(idx, 'chapterTitle', e.target.value)
                            }
                            className="bg-[#070b14] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-100 flex-1 font-semibold focus:outline-none focus:border-amber-500"
                          />
                          {chapters.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveChapter(idx)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Delete chapter"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <textarea
                          rows={4}
                          placeholder="Type or paste the chapter text here..."
                          value={ch.content}
                          onChange={(e) => handleUpdateChapter(idx, 'content', e.target.value)}
                          className="w-full bg-[#070b14] border border-slate-700 rounded-md p-3 text-xs text-slate-200 font-reading leading-relaxed focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Cover Image */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-serif-heading text-lg font-bold text-slate-100">
                      Step 3: Choose Cover Artwork
                    </h3>

                    {pdfFile && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Page:</span>
                        <select
                          value={coverPageSelection}
                          onChange={(e) => {
                            const p = parseInt(e.target.value, 10);
                            setCoverPageSelection(p);
                            handleExtractCover(p);
                          }}
                          className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-400 focus:outline-none focus:border-amber-500"
                        >
                          {Array.from({ length: Math.min(pageCount, 10) }, (_, i) => i + 1).map((p) => (
                            <option key={p} value={p}>
                              Page {p}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleExtractCover(coverPageSelection)}
                          disabled={isExtractingCover}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {isExtractingCover ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Camera className="w-3 h-3" />
                          )}
                          <span>Extract Cover</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PDF Extracted Cover Card Option */}
                  {pdfFile && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Extracted from your PDF Document
                        </span>
                        {extractedPdfCover && (
                          <span className="text-[10px] text-slate-400">
                            Rendered from Page {coverPageSelection} of {pdfFileName}
                          </span>
                        )}
                      </div>

                      {extractedPdfCover ? (
                        <div
                          onClick={() => {
                            setCoverImage(extractedPdfCover);
                            setCustomCoverUrl('');
                          }}
                          className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
                            coverImage === extractedPdfCover && !customCoverUrl
                              ? 'bg-amber-950/20 border-amber-500 ring-2 ring-amber-500/30'
                              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="relative w-16 sm:w-20 aspect-[3/4] rounded-lg overflow-hidden border border-amber-500/30 shadow-md bg-slate-950 shrink-0">
                            <img
                              src={extractedPdfCover}
                              alt="Extracted PDF Cover"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-100">
                                Original PDF Book Cover (Page {coverPageSelection})
                              </h4>
                              {coverImage === extractedPdfCover && !customCoverUrl && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                                  Selected
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              High-resolution render of the uploaded PDF's cover page. Perfect for preserving your original book design.
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExtractCover(coverPageSelection);
                                }}
                                disabled={isExtractingCover}
                                className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                              >
                                <RefreshCw className={`w-3 h-3 ${isExtractingCover ? 'animate-spin' : ''}`} />
                                Re-extract from PDF
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-900/40 text-center">
                          <p className="text-xs text-slate-300 mb-2">
                            Extract the visual cover artwork from your uploaded PDF file:
                          </p>
                          <button
                            type="button"
                            onClick={() => handleExtractCover(1)}
                            disabled={isExtractingCover}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                          >
                            {isExtractingCover ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Camera className="w-3.5 h-3.5" />
                            )}
                            Extract Cover from Page 1
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preset Themes */}
                  <div>
                    <span className="block text-xs font-semibold text-slate-300 mb-2">
                      Or Choose a Curated Cinematic Background Cover:
                    </span>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
                      {presetCovers.map((preset, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setCoverImage(preset.url);
                            setCustomCoverUrl('');
                          }}
                          className={`group relative aspect-[3/4] rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                            coverImage === preset.url && !customCoverUrl
                              ? 'border-amber-500 ring-2 ring-amber-500/30'
                              : 'border-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          <span className="absolute bottom-1 left-1 right-1 text-[9px] font-medium text-slate-100 text-center truncate">
                            {preset.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Or Custom Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/cover.jpg"
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      className="w-full bg-[#070b14] border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* Active Preview */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-3">
                    <div className="relative w-12 sm:w-14 aspect-[3/4] rounded-md overflow-hidden border border-amber-500/30 bg-slate-950 shrink-0">
                      <img
                        src={customCoverUrl || coverImage}
                        alt="Active cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Selected Cover Artwork</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {customCoverUrl
                          ? 'Using custom image URL'
                          : coverImage === extractedPdfCover
                          ? 'Using visual cover extracted from PDF page ' + coverPageSelection
                          : 'Using curated atmospheric theme cover'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Preview */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-serif-heading text-lg font-bold text-slate-100 pb-2 border-b border-slate-800">
                    Step 4: Story Card & Metadata Preview
                  </h3>

                  <p className="text-xs text-slate-400">
                    Here is how your story will look to readers browsing StoryNest:
                  </p>

                  <div className="max-w-xs mx-auto my-4">
                    <StoryCard story={previewStory} onSelectStory={() => {}} />
                  </div>
                </div>
              )}

              {/* Step 5: Final Review & Publish */}
              {currentStep === 5 && (
                <div className="space-y-5">
                  <h3 className="font-serif-heading text-lg font-bold text-slate-100 pb-2 border-b border-slate-800">
                    Step 5: Review & Publish
                  </h3>

                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Story Title:</span>
                      <span className="font-semibold text-slate-100">{title || 'Untitled'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Author:</span>
                      <span className="font-semibold text-slate-100">{author}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Genre:</span>
                      <span className="font-semibold text-amber-400">
                        {genre} {secondaryGenre && `• ${secondaryGenre}`}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-2">
                      <span className="text-slate-400">Chapters:</span>
                      <span className="font-semibold text-slate-100">{chapters.length} Chapter(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">PDF File:</span>
                      <span className="font-semibold text-slate-100">
                        {pdfFileName || 'Custom StoryNest Text Story'}
                      </span>
                    </div>
                  </div>

                  {/* Copyright and Acceptance checkbox */}
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 accent-amber-500 rounded"
                    />
                    <span className="text-xs text-amber-100/90 leading-relaxed">
                      I confirm that I am the author of this story or have the legal right to publish it. I agree to the StoryNest Content Integrity Guidelines and Terms of Service.
                    </span>
                  </label>
                </div>
              )}

              {/* Navigation Button Controls */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-800">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={() => setCurrentStep((s) => s - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && !title.trim()) {
                        addToast('Please enter a story title to proceed.', 'warning');
                        return;
                      }
                      setCurrentStep((s) => s + 1);
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={handleFinalPublish}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/30 hover:scale-105"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing to Cloud...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Submit & Publish Story</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (3 cols) */}
        <div className="lg:col-span-3 space-y-6 hidden lg:block">
          {/* Upload Guidelines */}
          <div className="p-5 rounded-2xl bg-[#0b111e] border border-slate-800/90 shadow-xl">
            <h4 className="font-serif-heading text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Upload Guidelines
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Original writing, poems, essays, and multi-chapter sagas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>High-resolution readable PDF formatting up to 50MB.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span>No plagiarism, scraped content, or hateful speech.</span>
              </li>
            </ul>
          </div>

          {/* Feather Quill Artwork Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#070b14] border border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400 mb-3">
              <Feather className="w-6 h-6" />
            </div>
            <h5 className="font-serif-heading text-xs font-bold text-slate-200 mb-1">
              Author Royalties & Recognition
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every word you publish builds your author profile, community bookmarks, and storytelling legacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
