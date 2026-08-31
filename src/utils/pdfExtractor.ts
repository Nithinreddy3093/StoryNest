import * as pdfjsLib from 'pdfjs-dist';
import { Chapter } from '../types';

// Configure pdfjs worker
if (typeof window !== 'undefined') {
  try {
    // Attempt standard worker source resolution
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Worker configuration notice:', e);
  }
}

export interface ExtractedPdfData {
  fullText: string;
  chapters: Chapter[];
  pageCount: number;
  hasSelectableText: boolean;
  rawPages: { pageNumber: number; text: string }[];
  coverImageUrl?: string;
}

/**
 * Renders a specific page of a PDF (default page 1) to a crisp image data URL
 * suitable for use as the story cover artwork.
 */
export async function extractCoverImageFromPdf(
  input: File | Blob | ArrayBuffer | Uint8Array | string,
  pageNumber: number = 1,
  targetWidth: number = 640
): Promise<{ coverImageUrl: string; width: number; height: number } | null> {
  try {
    let dataUint8: Uint8Array | undefined;
    let url: string | undefined;

    if (typeof input === 'string') {
      url = input;
    } else if (input instanceof ArrayBuffer) {
      if (input.byteLength === 0 || (input as any).detached) return null;
      dataUint8 = new Uint8Array(input.slice(0));
    } else if (input instanceof Uint8Array) {
      if (input.byteLength === 0 || input.buffer.byteLength === 0 || (input.buffer as any).detached) return null;
      dataUint8 = new Uint8Array(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
    } else if (input instanceof Blob) {
      const buffer = await input.arrayBuffer();
      dataUint8 = new Uint8Array(buffer);
    }

    const loadingTask = pdfjsLib.getDocument(
      dataUint8 ? { data: dataUint8 } : { url: url! }
    );

    const pdf = await loadingTask.promise;
    if (pdf.numPages < 1) return null;

    const targetPageNum = Math.min(Math.max(1, pageNumber), pdf.numPages);
    const page = await pdf.getPage(targetPageNum);
    const unscaledViewport = page.getViewport({ scale: 1 });
    const scale = Math.max(1, targetWidth / unscaledViewport.width);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const canvasContext = canvas.getContext('2d', { alpha: false });

    if (!canvasContext) return null;

    // Fill white background before drawing
    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    await (page.render as any)({
      canvasContext,
      viewport,
      canvas,
    }).promise;

    const coverImageUrl = canvas.toDataURL('image/jpeg', 0.88);

    return {
      coverImageUrl,
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err) {
    console.warn('Cover extraction from PDF page failed:', err);
    return null;
  }
}

/**
 * Parses a PDF file or ArrayBuffer, extracts text from all pages,
 * extracts page 1 as a candidate cover image,
 * and structures it into chapters with paragraph preservation.
 */
export async function extractTextAndChaptersFromPdf(
  input: File | Blob | ArrayBuffer | Uint8Array | string
): Promise<ExtractedPdfData> {
  let dataUint8: Uint8Array | undefined;
  let url: string | undefined;

  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof ArrayBuffer) {
    if (input.byteLength === 0 || (input as any).detached) {
      throw new Error('PDF ArrayBuffer is detached or empty.');
    }
    dataUint8 = new Uint8Array(input.slice(0));
  } else if (input instanceof Uint8Array) {
    if (input.byteLength === 0 || input.buffer.byteLength === 0 || (input.buffer as any).detached) {
      throw new Error('PDF Uint8Array buffer is detached or empty.');
    }
    dataUint8 = new Uint8Array(input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength));
  } else if (input instanceof Blob) {
    const buffer = await input.arrayBuffer();
    dataUint8 = new Uint8Array(buffer);
  }

  const loadingTask = pdfjsLib.getDocument(
    dataUint8 ? { data: dataUint8 } : { url: url! }
  );

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // Extract Page 1 as cover artwork
  let extractedCoverImageUrl: string | undefined = undefined;
  try {
    const page1 = await pdf.getPage(1);
    const unscaledViewport = page1.getViewport({ scale: 1 });
    const scale = Math.max(1, 640 / unscaledViewport.width);
    const viewport = page1.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const canvasContext = canvas.getContext('2d', { alpha: false });
    if (canvasContext) {
      canvasContext.fillStyle = '#ffffff';
      canvasContext.fillRect(0, 0, canvas.width, canvas.height);
      await (page1.render as any)({
        canvasContext,
        viewport,
        canvas,
      }).promise;
      extractedCoverImageUrl = canvas.toDataURL('image/jpeg', 0.88);
    }
  } catch (coverErr) {
    console.warn('Could not render cover preview from PDF page 1:', coverErr);
  }

  const rawPages: { pageNumber: number; text: string }[] = [];
  let combinedText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    let pageText = '';
    let lastY: number | null = null;

    for (const item of textContent.items as any[]) {
      if (!item.str) continue;

      if (lastY !== null && Math.abs(item.transform[5] - lastY) > 8) {
        // Vertical displacement indicates new line or paragraph
        if (Math.abs(item.transform[5] - lastY) > 16) {
          pageText += '\n\n';
        } else {
          pageText += '\n';
        }
      } else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) {
        pageText += ' ';
      }

      pageText += item.str;
      lastY = item.transform[5];
    }

    const cleanPageText = cleanExtractedPageText(pageText);
    rawPages.push({
      pageNumber: pageNum,
      text: cleanPageText,
    });

    if (cleanPageText.trim().length > 0) {
      combinedText += (combinedText ? '\n\n' : '') + cleanPageText;
    }
  }

  const hasSelectableText = combinedText.trim().length > 40;

  if (!hasSelectableText) {
    return {
      fullText: '',
      chapters: [
        {
          id: 'ch-1',
          chapterNumber: 1,
          chapterTitle: 'Uploaded PDF Document',
          content: 'This PDF does not contain selectable text (it may be a scanned or image-based document). Please use the "Open in PDF E-Reader" option on the left to read the full original document.',
          readTime: '1 min read',
        },
      ],
      pageCount: numPages,
      hasSelectableText: false,
      rawPages,
      coverImageUrl: extractedCoverImageUrl,
    };
  }

  // Parse chapters from extracted text
  const detectedChapters = detectChaptersFromText(rawPages, combinedText);

  return {
    fullText: combinedText,
    chapters: detectedChapters,
    pageCount: numPages,
    hasSelectableText: true,
    rawPages,
    coverImageUrl: extractedCoverImageUrl,
  };
}

/**
 * Removes header/footer noise and multiple trailing spaces
 */
function cleanExtractedPageText(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim())
    // Filter out common header/footer line patterns like lone page numbers or "Page 1 of 5"
    .filter((line) => {
      if (/^page\s+\d+(\s+of\s+\d+)?$/i.test(line)) return false;
      if (/^\d{1,4}$/.test(line)) return false; // Single isolated page number
      return true;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Identifies chapter breaks in the document
 */
function detectChaptersFromText(
  pages: { pageNumber: number; text: string }[],
  fullText: string
): Chapter[] {
  // Regex to match chapter headings
  const chapterPattern = /(?:^|\n\n)(Chapter\s+(?:\d+|[IVXLCDM]+|[A-Za-z]+)[^\n]*|Act\s+[IVXLCDM\d]+[^\n]*|Part\s+(?:\d+|[IVXLCDM]+|[A-Za-z]+)[^\n]*|Prologue|Epilogue)/gi;

  const matches: { title: string; index: number }[] = [];
  let match;

  while ((match = chapterPattern.exec(fullText)) !== null) {
    matches.push({
      title: match[1].trim(),
      index: match.index,
    });
  }

  // If we found at least 2 distinct chapter headings with good distribution
  if (matches.length >= 2) {
    const chapters: Chapter[] = [];
    for (let i = 0; i < matches.length; i++) {
      const current = matches[i];
      const nextIndex = i < matches.length - 1 ? matches[i + 1].index : fullText.length;
      let chapterContent = fullText.slice(current.index, nextIndex).trim();

      // Remove the chapter heading from content start if repeated
      chapterContent = chapterContent.replace(new RegExp(`^${escapeRegex(current.title)}\\s*`, 'i'), '').trim();

      if (!chapterContent) {
        chapterContent = 'End of chapter.';
      }

      const wordCount = chapterContent.split(/\s+/).filter(Boolean).length;
      const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

      chapters.push({
        id: `ch-${i + 1}`,
        chapterNumber: i + 1,
        chapterTitle: current.title,
        content: chapterContent,
        wordCount,
        readTime: `${readMinutes} min read`,
      });
    }

    if (chapters.length > 0 && chapters.some((c) => c.content.length > 50)) {
      return chapters;
    }
  }

  // If no explicit chapter headings found, split by pages or logical segments
  if (pages.length > 1) {
    // If multiple pages, group 1-3 pages per chapter or 1 page per chapter if long
    const chapters: Chapter[] = [];
    const pagesPerChapter = pages.length > 10 ? Math.ceil(pages.length / 5) : 1;

    for (let i = 0; i < pages.length; i += pagesPerChapter) {
      const chunk = pages.slice(i, i + pagesPerChapter);
      const chunkText = chunk.map((p) => p.text).filter(Boolean).join('\n\n');
      const startPage = i + 1;
      const endPage = Math.min(pages.length, i + pagesPerChapter);

      const title =
        startPage === endPage
          ? `Section ${chapters.length + 1} (Page ${startPage})`
          : `Section ${chapters.length + 1} (Pages ${startPage}-${endPage})`;

      const wordCount = chunkText.split(/\s+/).filter(Boolean).length;
      const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

      if (chunkText.trim().length > 0) {
        chapters.push({
          id: `ch-${chapters.length + 1}`,
          chapterNumber: chapters.length + 1,
          chapterTitle: title,
          content: chunkText,
          wordCount,
          readTime: `${readMinutes} min read`,
        });
      }
    }

    if (chapters.length > 0) {
      return chapters;
    }
  }

  // Single continuous story
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const readMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return [
    {
      id: 'ch-1',
      chapterNumber: 1,
      chapterTitle: 'The Story',
      content: fullText,
      wordCount,
      readTime: `${readMinutes} min read`,
    },
  ];
}

function escapeRegex(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
