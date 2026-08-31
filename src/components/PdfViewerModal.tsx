import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Story } from '../types';
import { getLocalPdfData, downloadStoryPdfFile } from '../utils/pdfStorage';
import { generateStoryPdfUint8Array } from '../utils/pdfGenerator';
import { ensurePdfWorker } from '../utils/pdfWorkerInit';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Maximize2,
  Minimize2,
  RotateCcw,
  AlertCircle,
  Loader2,
  FileQuestion,
} from 'lucide-react';
import { motion } from 'motion/react';

// Configure pdfjs worker
ensurePdfWorker();

interface PdfViewerModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ story, isOpen, onClose }) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF when story changes or modal opens
  useEffect(() => {
    if (!isOpen || !story) {
      setPdfDoc(null);
      setCurrentPage(1);
      setErrorMessage(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);
    ensurePdfWorker();

    const loadPdfDocument = async () => {
      let loadedDoc: any = null;

      // 1. Check IndexedDB / Memory Cache for local uploaded PDF binary
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
          const doc = await loadingTask.promise;
          if (doc && doc.numPages > 0) {
            loadedDoc = doc;
          }
        }
      } catch (localErr) {
        console.warn('Local PDF cache check notice:', localErr);
      }

      // 2. If no local doc, try remote URL if valid
      if (!loadedDoc && story.pdfUrl && !story.pdfUrl.startsWith('blob:')) {
        try {
          const loadingTask = pdfjsLib.getDocument({
            url: story.pdfUrl,
            withCredentials: false,
          });
          const doc = await loadingTask.promise;
          if (doc && doc.numPages > 0) {
            loadedDoc = doc;
          }
        } catch (urlErr) {
          console.warn('Remote story.pdfUrl load notice:', urlErr);
        }
      }

      // 3. If story.pdfUrl is a blob URL from current session, attempt loading with fast timeout
      if (!loadedDoc && story.pdfUrl && story.pdfUrl.startsWith('blob:')) {
        try {
          const loadingTask = pdfjsLib.getDocument({
            url: story.pdfUrl,
            withCredentials: false,
          });
          const doc = await loadingTask.promise;
          if (doc && doc.numPages > 0) {
            loadedDoc = doc;
          }
        } catch (blobErr) {
          console.warn('Session blob URL was expired or unreachable:', blobErr);
        }
      }

      // 4. Ultimate Fallback: Synthesize the pristine StoryNest PDF on the fly
      if (!loadedDoc) {
        try {
          const generatedBytes = generateStoryPdfUint8Array(story);
          const loadingTask = pdfjsLib.getDocument({
            data: generatedBytes,
          });
          const doc = await loadingTask.promise;
          if (doc && doc.numPages > 0) {
            loadedDoc = doc;
          }
        } catch (genErr) {
          console.error('Dynamic PDF synthesis notice:', genErr);
        }
      }

      if (!isMounted) return;

      if (loadedDoc) {
        setPdfDoc(loadedDoc);
        setTotalPages(loadedDoc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } else {
        setErrorMessage('Unable to format PDF for this story. Please try again later.');
        setIsLoading(false);
      }
    };

    loadPdfDocument();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [isOpen, story?.id, story?.pdfUrl]);

  // Render current page onto canvas
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || isLoading) return;

    let isCancelled = false;

    const renderCurrentPage = async () => {
      try {
        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch (e) {
            // ignore cancel errors
          }
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled || !canvasRef.current) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        // Support high DPI displays
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
      } catch (renderError: any) {
        if (renderError?.name !== 'RenderingCancelledException') {
          console.warn('Canvas render notice:', renderError);
        }
      }
    };

    renderCurrentPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, [pdfDoc, currentPage, scale, isLoading]);

  const handleZoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(1)));
  const handleZoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(1)));
  const handleResetZoom = () => setScale(1.2);

  const handleFitWidth = () => {
    if (containerRef.current && pdfDoc) {
      const containerWidth = containerRef.current.clientWidth - 48;
      // Default standard page width is ~595pt
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
    } catch (e) {
      console.error('Download failed:', e);
      alert('Could not download PDF.');
    }
  };

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md">
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-6xl h-[94vh] bg-[#0b111e] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
      >
        {/* PDF Reader Top Control Bar */}
        <div className="h-14 px-4 bg-[#070b14] border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
          {/* Story Meta */}
          <div className="flex items-center gap-2.5 min-w-0">
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-200 truncate">{story.title}</h3>
              <p className="text-[10px] text-slate-400 truncate">
                By {story.author} • {story.pdfFileName || 'PDF E-Reader'}
              </p>
            </div>
          </div>

          {/* Center Pagination controls */}
          {!isLoading && !errorMessage && totalPages > 0 && (
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-lg border border-slate-800">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 text-slate-300 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-300 font-mono">
                <span className="text-amber-400 font-bold">{currentPage}</span> / {totalPages}
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

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            {!isLoading && !errorMessage && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 rounded-lg p-0.5 border border-slate-800">
                <button
                  onClick={handleZoomOut}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="text-[11px] font-mono px-1.5 text-slate-300 hover:text-amber-300"
                  title="Reset Zoom"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFitWidth}
                  className="px-1.5 py-0.5 text-[10px] text-amber-400 font-medium rounded hover:bg-slate-800"
                  title="Fit to Width"
                >
                  Fit Width
                </button>
              </div>
            )}

            {/* Download Original PDF */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-sm"
              title="Download exact uploaded PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download PDF</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close / Return to StoryNest */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Back to StoryNest Reader"
              title="Back to StoryNest Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Canvas Viewport Area */}
        <div className="flex-1 overflow-auto bg-[#070b14] p-4 sm:p-8 flex justify-center items-start relative">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">
                Loading original PDF for <span className="text-amber-400 font-semibold">{story.title}</span>...
              </p>
            </div>
          )}

          {/* Error / Story Unavailable State */}
          {errorMessage && !isLoading && (
            <div className="max-w-md my-16 p-6 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-3 text-rose-200">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <h4 className="text-sm font-bold">PDF Document Unavailable</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors"
                >
                  Return to StoryNest Reader
                </button>
              </div>
            </div>
          )}

          {/* Canvas Rendering Area */}
          {!isLoading && !errorMessage && (
            <div className="flex flex-col items-center shadow-2xl border border-slate-800/80 rounded-lg overflow-hidden bg-white">
              <canvas ref={canvasRef} className="block max-w-full" />
            </div>
          )}
        </div>

        {/* Bottom Status bar */}
        <div className="h-8 px-4 bg-[#070b14] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Story ID: {story.id}</span>
          <span>{story.pdfFileName ? `File: ${story.pdfFileName}` : 'StoryNest Document Reader'}</span>
        </div>
      </motion.div>
    </div>
  );
};
