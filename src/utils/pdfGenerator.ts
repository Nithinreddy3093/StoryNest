import { jsPDF } from 'jspdf';
import { Story } from '../types';

/**
 * Builds a styled, multi-page StoryNest Reader edition PDF document from a Story entity.
 */
export const createStoryPdfDocument = (story: Story): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  // Title Page Background
  doc.setFillColor(7, 11, 20); // StoryNest dark navy
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative border
  doc.setDrawColor(245, 158, 11); // Gold accent
  doc.setLineWidth(1.5);
  doc.rect(margin - 15, margin - 15, contentWidth + 30, pageHeight - (margin - 15) * 2);

  // Logo / Header
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(13);
  doc.setFont('times', 'bold');
  doc.text('STORYNEST  —  STORIES THAT STAY WITH YOU', pageWidth / 2, 120, { align: 'center' });

  // Story Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('times', 'bold');
  const splitTitle = doc.splitTextToSize(story.title || 'Untitled Story', contentWidth - 20);
  doc.text(splitTitle, pageWidth / 2, 220, { align: 'center' });

  // Author
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(15);
  doc.setFont('times', 'italic');
  doc.text(`By ${story.author || 'StoryNest Author'}`, pageWidth / 2, 280, { align: 'center' });

  // Genre and Info Pill
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const genreText = `Genre: ${story.genre || 'Fiction'}${story.secondaryGenre ? ` • ${story.secondaryGenre}` : ''}  |  Language: ${story.language || 'English'}`;
  doc.text(genreText, pageWidth / 2, 330, { align: 'center' });

  // Description / Blurb
  if (story.description) {
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(11);
    doc.setFont('times', 'italic');
    const splitDesc = doc.splitTextToSize(`"${story.description}"`, contentWidth - 40);
    doc.text(splitDesc, pageWidth / 2, 380, { align: 'center' });
  }

  // Footer on cover
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Published on StoryNest • Free Reader Edition', pageWidth / 2, pageHeight - 65, { align: 'center' });

  // Prepare chapters / content to render
  const chapters = Array.isArray(story.chapters) && story.chapters.length > 0
    ? story.chapters
    : story.extractedText
      ? [{
          id: 'chap-extracted',
          chapterNumber: 1,
          chapterTitle: 'Complete Story',
          content: story.extractedText,
          readTime: '5 min read',
        }]
      : [{
          id: 'chap-default',
          chapterNumber: 1,
          chapterTitle: story.title || 'Story Overview',
          content: story.description || 'Welcome to StoryNest. Enjoy reading this edition.',
          readTime: '2 min read',
        }];

  let globalPageIndex = 1;

  // Render each chapter
  chapters.forEach((chapter) => {
    globalPageIndex++;
    doc.addPage('a4', 'portrait');

    // Page Background - Warm reading tint
    doc.setFillColor(252, 250, 246);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Chapter Header
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`CHAPTER ${chapter.chapterNumber || 1}`, pageWidth / 2, 60, { align: 'center' });

    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFontSize(19);
    doc.setFont('times', 'bold');
    const chapterTitleText = chapter.chapterTitle || `Chapter ${chapter.chapterNumber || 1}`;
    doc.text(chapterTitleText, pageWidth / 2, 88, { align: 'center' });

    // Decorative separator line
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 30, 100, pageWidth / 2 + 30, 100);

    // Chapter Body Text
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11.5);
    doc.setFont('times', 'normal');

    const contentStr = chapter.content || '';
    const paragraphs = contentStr.split('\n\n');
    let yPos = 130;

    paragraphs.forEach((p) => {
      const cleanPara = p.trim();
      if (!cleanPara) return;
      const splitLines = doc.splitTextToSize(cleanPara, contentWidth);

      // If we exceed page height, add another page
      if (yPos + splitLines.length * 16 > pageHeight - 70) {
        globalPageIndex++;
        doc.addPage('a4', 'portrait');
        doc.setFillColor(252, 250, 246);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Running header
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'normal');
        doc.text(`${story.title} • ${chapterTitleText}`, pageWidth / 2, 40, { align: 'center' });

        yPos = 70;
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(11.5);
        doc.setFont('times', 'normal');
      }

      doc.text(splitLines, margin, yPos, { lineHeightFactor: 1.5 });
      yPos += splitLines.length * 16 + 12;
    });

    // Page number footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${story.title || 'StoryNest'} • Page ${globalPageIndex}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
  });

  return doc;
};

/**
 * Returns a binary ArrayBuffer of the generated PDF.
 */
export const generateStoryPdfArrayBuffer = (story: Story): ArrayBuffer => {
  const doc = createStoryPdfDocument(story);
  return doc.output('arraybuffer');
};

/**
 * Returns a Uint8Array of the generated PDF suitable for PDF.js getDocument({ data }).
 */
export const generateStoryPdfUint8Array = (story: Story): Uint8Array => {
  const buffer = generateStoryPdfArrayBuffer(story);
  return new Uint8Array(buffer);
};

/**
 * Triggers a browser download of the story PDF.
 */
export const generateStoryPdf = (story: Story): void => {
  const doc = createStoryPdfDocument(story);
  const sanitizedTitle = (story.title || 'story').replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedTitle}_StoryNest.pdf`);
};

