import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { useApp } from '../context/AppContext';
import { Story, User } from '../types';
import { getLocalPdfData, downloadStoryPdfFile } from '../utils/pdfStorage';
import { generateStoryPdfUint8Array } from '../utils/pdfGenerator';
import { ensurePdfWorker } from '../utils/pdfWorkerInit';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Maximize2,
  Minimize2,
  AlertCircle,
  Loader2,
  Sliders,
  FileText,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

// Configure pdfjs worker
ensurePdfWorker();

interface PdfReaderPageProps {
  storyId: string;
  navigate: (route: string) => void;
}

export const PdfReaderPage: React.FC<PdfReaderPageProps> = ({ storyId, navigate }) => {
  const {
    stories,
    addToast,
    recordView,
    canViewUserStories,
    getUserByIdOrPenName,
    toggleFollowUser,
    getFollowStatus,
  } = useApp();

  const [story, setStory] = useState<Story | null>(() => {
    return stories.find((s) => s.id === storyId) || null;
  });
  const [authorUser, setAuthorUser] = useState<User | null>(null);

  const [isFetchingStory, setIsFetchingStory] = useState<boolean>(!story);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Fetch story if not in context
  useEffect(() => {
    let isMounted = true;
    const fetchStoryDoc = async () => {
      if (story && story.id === storyId) {
        setIsFetchingStory(false);
        getUserByIdOrPenName(story.authorId || story.author).then((u) => {
          if (isMounted) setAuthorUser(u);
        });
        return;
      }

      try {
        setIsFetchingStory(true);
        const storyRef = doc(db, 'stories', storyId);
        const snap = await getDoc(storyRef);
        if (snap.exists() && isMounted) {
          const loadedStory = { id: snap.id, ...snap.data() } as Story;
          setStory(loadedStory);
          recordView(loadedStory.id);
          getUserByIdOrPenName(loadedStory.authorId || loadedStory.author).then((u) => {
            if (isMounted) setAuthorUser(u);
          });
        } else if (isMounted) {
          setStory(null);
          setErrorMessage('Story unavailable. The story with this ID does not exist.');
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching story:', err);
          setErrorMessage('Failed to load story details.');
        }
      } finally {
        if (isMounted) setIsFetchingStory(false);
      }
    };

    fetchStoryDoc();
    return () => {
      isMounted = false;
    };
  }, [storyId]);

  // Load PDF when story is available
  useEffect(() => {
    if (!story) return;

    let isMounted = true;
    setIsLoadingPdf(true);
    setErrorMessage(null);
    ensurePdfWorker();

    const loadPdf = async () => {
      let loadedDoc: any = null;

      // 1. Check local IndexedDB / Memory Cache
      try {
        const localData = await getLocalPdfData(story.id);
        if (
          localData &&
          localData.data &&
          localData.data.byteLength > 0 &&
          !(localData.data as any).detached
        ) {
          const loadingTask = pdfjsLib.getDocument({
            data: new Uint8Array(localData.data.slice(0)),
          });
          const docLoaded = await loadingTask.promise;
          if (docLoaded && docLoaded.numPages > 0) {
            loadedDoc = docLoaded;
          }
        }
      } catch (localErr) {
        console.warn('Local PDF cache read notice:', localErr);
      }

      // 2. If no local doc, try remote URL if valid http/https
      if (!loadedDoc && story.pdfUrl && !story.pdfUrl.startsWith('blob:')) {
        try {
          const loadingTask = pdfjsLib.getDocument({
            url: story.pdfUrl,
            withCredentials: false,
          });
          const docLoaded = await loadingTask.promise;
          if (docLoaded && docLoaded.numPages > 0) {
            loadedDoc = docLoaded;
          }
        } catch (urlErr) {
          console.warn('Remote story.pdfUrl load notice:', urlErr);
        }
      }

      // 3. If story.pdfUrl is a blob URL from the current active session
      if (!loadedDoc && story.pdfUrl && story.pdfUrl.startsWith('blob:')) {
        try {
          const loadingTask = pdfjsLib.getDocument({
            url: story.pdfUrl,
            withCredentials: false,
          });
          const docLoaded = await loadingTask.promise;
          if (docLoaded && docLoaded.numPages > 0) {
            loadedDoc = docLoaded;
          }
        } catch (blobErr) {
          console.warn('Current session blob URL was expired or unreachable:', blobErr);
        }
      }

      // 4. Fallback: Synthesize the full multi-page PDF dynamically
      if (!loadedDoc) {
        try {
          const generatedBytes = generateStoryPdfUint8Array(story);
          const loadingTask = pdfjsLib.getDocument({
            data: generatedBytes,
          });
          const docLoaded = await loadingTask.promise;
          if (docLoaded && docLoaded.numPages > 0) {
            loadedDoc = docLoaded;
          }
        } catch (genErr) {
          console.error('Dynamic PDF synthesis notice in reader:', genErr);
        }
      }

      if (!isMounted) return;

      if (loadedDoc) {
        setPdfDoc(loadedDoc);
        setTotalPages(docLoadedNumPages(loadedDoc));
        setCurrentPage(1);
        setIsLoadingPdf(false);
      } else {
        setErrorMessage('Unable to render PDF document for this story. Please try again later.');
        setIsLoadingPdf(false);
      }
    };

    const docLoadedNumPages = (docItem: any) => docItem?.numPages || 1;

    loadPdf();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [story?.id, story?.pdfUrl]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || isLoadingPdf) return;

    let isCancelled = false;

    const renderPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {}
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          transform,
          viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn('Canvas render issue:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDoc, currentPage, scale, isLoadingPdf]);

  const handleZoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(1)));
  const handleZoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));
  const handleResetZoom = () => setScale(1.2);

  const handleFitWidth = () => {
    if (containerRef.current && pdfDoc) {
      const containerWidth = containerRef.current.clientWidth - 48;
      const newScale = Math.max(0.7, Math.min(2.0, containerWidth / 620));
      setScale(+newScale.toFixed(2));
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleDownload = async () => {
    if (!story) return;
    try {
      await downloadStoryPdfFile(story);
      addToast('PDF download initiated', 'success');
    } catch (e) {
      console.error('Download failed:', e);
      addToast('Could not download PDF.', 'error');
    }
  };

  // Story unavailable error state (NO SILENT FALLBACK)
  if (!isFetchingStory && !story) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0b111e] border border-slate-800 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold">Story Unavailable</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested story (ID: <code className="text-amber-400">{storyId}</code>) could not be found or has been removed.
          </p>
          <button
            onClick={() => navigate('stories')}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
          >
            Browse Stories
          </button>
        </div>
      </div>
    );
  }

  // Check private access permission
  if (story) {
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
                Private PDF Edition
              </span>
              <h2 className="font-serif-heading text-2xl font-bold text-slate-100 pt-2">
                "{story.title}"
              </h2>
              <p className="text-xs text-amber-400 font-mono">By @{authorHandle}</p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Direct access to this PDF edition is protected. Follow @{authorHandle} to request access to this manuscript.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {authorFollowStatus === 'pending' ? (
                <button
                  onClick={() => toggleFollowUser(story.authorId)}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-all"
                >
                  Follow Request Pending
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
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      {/* Top Header Control Toolbar */}
      <header className="h-16 px-4 sm:px-6 bg-[#0b111e] border-b border-slate-800 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-md">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(`read:${story?.id || storyId}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to StoryNest Reader</span>
            <span className="sm:hidden">Back</span>
          </button>

          <div className="hidden md:block h-5 w-px bg-slate-800" />

          {story && (
            <div className="min-w-0 hidden md:block">
              <h2 className="text-xs font-bold text-slate-200 truncate">{story.title}</h2>
              <p className="text-[10px] text-amber-400 truncate">
                By {story.author} • {story.pdfFileName || 'PDF Edition'}
              </p>
            </div>
          )}
        </div>

        {/* Center: Pagination */}
        {!isLoadingPdf && !errorMessage && totalPages > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 shadow-inner">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-slate-300 font-mono">
              Page <span className="text-amber-400 font-bold">{currentPage}</span> of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right: Zoom & Actions */}
        <div className="flex items-center gap-2">
          {!isLoadingPdf && !errorMessage && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="text-[11px] font-mono px-2 text-slate-300 hover:text-amber-400"
                title="Reset Zoom"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleFitWidth}
                className="px-2 py-1 text-[11px] text-amber-400 font-semibold rounded hover:bg-slate-800"
              >
                Fit Width
              </button>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md shadow-amber-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Canvas Viewport */}
      <main className="flex-1 overflow-auto bg-[#05070f] p-4 sm:p-8 flex justify-center items-start">
        {/* Loading Spinner */}
        {(isFetchingStory || isLoadingPdf) && (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">
              Loading original PDF for <span className="text-amber-400 font-semibold">{story?.title || storyId}</span>...
            </p>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoadingPdf && !isFetchingStory && (
          <div className="max-w-md my-20 p-8 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-4 text-rose-200 shadow-2xl">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="font-serif-heading text-lg font-bold">PDF Document Unavailable</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => navigate(`read:${storyId}`)}
                className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-amber-400 transition-colors"
              >
                Open in Web Reader
              </button>
              <button
                onClick={() => navigate('stories')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors"
              >
                Back to Stories
              </button>
            </div>
          </div>
        )}

        {/* Rendered PDF Canvas */}
        {!isLoadingPdf && !isFetchingStory && !errorMessage && (
          <div className="flex flex-col items-center shadow-2xl border border-slate-800 rounded-lg overflow-hidden bg-white my-2">
            <canvas ref={canvasRef} className="block max-w-full" />
          </div>
        )}
      </main>

      {/* Footer Info Bar */}
      <footer className="h-8 px-4 bg-[#0b111e] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-mono">
        <span>Story ID: {story?.id || storyId}</span>
        <span>{story?.pdfFileName || 'StoryNest Original PDF Document'}</span>
      </footer>
    </div>
  );
};
