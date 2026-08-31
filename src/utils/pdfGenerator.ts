import { jsPDF } from 'jspdf';
import { Story } from '../types';

export const generateStoryPdf = (story: Story) => {
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
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text('STORYNEST  —  STORIES THAT STAY WITH YOU', pageWidth / 2, 120, { align: 'center' });

  // Story Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('times', 'bold');
  const splitTitle = doc.splitTextToSize(story.title, contentWidth);
  doc.text(splitTitle, pageWidth / 2, 220, { align: 'center' });

  // Author
  doc.setTextColor(245, 158, 11);
  doc.setFontSize(15);
  doc.setFont('times', 'italic');
  doc.text(`By ${story.author}`, pageWidth / 2, 280, { align: 'center' });

  // Genre and Info Pill
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Genre: ${story.genre} ${story.secondaryGenre ? `• ${story.secondaryGenre}` : ''}  |  Language: ${story.language}`, pageWidth / 2, 330, { align: 'center' });

  // Description
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(11);
  const splitDesc = doc.splitTextToSize(`"${story.description}"`, contentWidth - 40);
  doc.text(splitDesc, pageWidth / 2, 390, { align: 'center' });

  // Footer on cover
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(10);
  doc.text('Published on StoryNest • Free Reader Edition', pageWidth / 2, pageHeight - 70, { align: 'center' });

  // Chapter Pages
  story.chapters.forEach((chapter, index) => {
    doc.addPage('a4', 'portrait');

    // Page Background - Warm reading tint
    doc.setFillColor(252, 250, 246);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Chapter Header
    doc.setTextColor(180, 83, 9); // Amber
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`CHAPTER ${chapter.chapterNumber}`, pageWidth / 2, 60, { align: 'center' });

    doc.setTextColor(15, 23, 42); // Slate 900
    doc.setFontSize(20);
    doc.setFont('times', 'bold');
    doc.text(chapter.chapterTitle, pageWidth / 2, 88, { align: 'center' });

    // Decorative separator line
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 30, 102, pageWidth / 2 + 30, 102);

    // Chapter Body Text
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11.5);
    doc.setFont('times', 'normal');

    const paragraphs = chapter.content.split('\n\n');
    let yPos = 130;

    paragraphs.forEach((p) => {
      if (!p.trim()) return;
      const splitLines = doc.splitTextToSize(p.trim(), contentWidth);
      
      // If we exceed page height, add another page
      if (yPos + splitLines.length * 16 > pageHeight - 70) {
        doc.addPage('a4', 'portrait');
        doc.setFillColor(252, 250, 246);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        yPos = 60;
      }

      doc.text(splitLines, margin, yPos, { lineHeightFactor: 1.5 });
      yPos += splitLines.length * 16 + 14;
    });

    // Page number footer
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${story.title} • Page ${index + 2}`, pageWidth / 2, pageHeight - 30, { align: 'center' });
  });

  // Download the generated PDF
  const sanitizedTitle = story.title.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedTitle}_StoryNest.pdf`);
};
