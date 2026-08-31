import * as pdfjsLib from 'pdfjs-dist';

let isConfigured = false;

/**
 * Ensures PDF.js worker options are properly configured across all environments
 */
export function ensurePdfWorker(): void {
  if (isConfigured || typeof window === 'undefined') return;
  try {
    const version = pdfjsLib.version || '6.3.289';
    // Use unpkg CDN with fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    isConfigured = true;
  } catch (e) {
    console.warn('PDF Worker setup notification:', e);
  }
}
