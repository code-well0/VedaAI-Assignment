import PDFDocument from 'pdfkit';
import { Response } from 'express';
import { Assignment } from '../types';
import { formatSubjectLabel } from './assignmentIntro';

/** Maps internal difficulty to the display label shown on the paper */
function diffLabel(d: string): string {
  if (d === 'Easy') return 'Easy';
  if (d === 'Hard') return 'Hard';
  return 'Moderate';
}

/**
 * Generates a CBSE/NCERT question paper PDF matching the reference layout and streams it to the Express Response.
 * Layout mirrors the image: centered header, stacked student fields, inline [Difficulty] tags, [X Marks] at end.
 */
export async function generateAssignmentPDF(assignment: Assignment, res: Response): Promise<void> {
  console.log(`📄 PDF Service: Generating PDF for "${assignment.title}"...`);

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    bufferPages: true,
  });

  const filename = `${assignment.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-paper.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const primaryColor = '#1F2937';
  const mutedColor = '#4B5563';
  const lightGrey = '#E5E7EB';
  const pageW = doc.page.width;
  const L = 60; // left margin
  const R = pageW - 60; // right margin
  const contentW = R - L;

  // ── 1. HEADER (centered) ──────────────────────────────────────────────────
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(16)
    .text(assignment.schoolName, L, doc.y, { width: contentW, align: 'center' });
  doc.moveDown(0.25);

  doc
    .font('Helvetica')
    .fontSize(11)
    .fillColor(primaryColor)
    .text(
      `Subject: ${formatSubjectLabel(assignment.subject)}`,
      L,
      doc.y,
      { width: contentW, align: 'center' }
    );
  doc.moveDown(0.15);

  doc
    .font('Helvetica')
    .fontSize(11)
    .text(`Class: ${assignment.className}`, L, doc.y, { width: contentW, align: 'center' });
  doc.moveDown(0.15);

  const chapter = (assignment.quizTopic || assignment.title || '').trim();
  if (chapter) {
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(`Chapter: ${chapter}`, L, doc.y, { width: contentW, align: 'center' });
    doc.moveDown(0.15);
  }

  if (assignment.teacherName?.trim()) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(mutedColor)
      .text(`Faculty: ${assignment.teacherName.trim()}`, L, doc.y, { width: contentW, align: 'center' });
    doc.moveDown(0.15);
  }

  doc.moveDown(0.35);

  // ── 2. TIME / MARKS ROW ───────────────────────────────────────────────────
  const tmY = doc.y;
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(primaryColor)
    .text('Time Allowed: 45 minutes', L, tmY);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(`Maximum Marks: ${assignment.totalMarks}`, L, tmY, { width: contentW, align: 'right' });
  doc.moveDown(0.8);

  // ── 3. GENERAL INSTRUCTION ────────────────────────────────────────────────
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(primaryColor)
    .text('All questions are compulsory unless stated otherwise.', L, doc.y, { width: contentW });
  doc.moveDown(0.8);

  // ── 4. STUDENT FIELDS (stacked vertically) ────────────────────────────────
  const fields = [
    { label: 'Name:', lineW: 160 },
    { label: 'Roll Number:', lineW: 130 },
    { label: `Class: ${assignment.className} Section:`, lineW: 90 },
  ];

  for (const f of fields) {
    const fy = doc.y;
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(primaryColor)
      .text(f.label, L, fy);

    const labelW = doc.widthOfString(f.label);
    const lineStartX = L + labelW + 4;
    const lineEndX = lineStartX + f.lineW;

    doc
      .strokeColor('#9CA3AF')
      .lineWidth(0.5)
      .moveTo(lineStartX, fy + 10)
      .lineTo(lineEndX, fy + 10)
      .stroke();

    doc.moveDown(0.55);
  }

  doc.moveDown(0.5);

  // ── 5. SECTIONS & QUESTIONS ───────────────────────────────────────────────
  let globalQIndex = 1;
  const sections = assignment.sections || [];

  const sectionLabel = (instruction: string, title: string) => {
    const first = instruction.split('.')[0]?.trim();
    return first || title;
  };

  if (sections.length === 0) {
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#E8762A')
      .text('Question paper generation is still in progress...', { align: 'center' });
  } else {
    for (const section of sections) {
      if (doc.y > doc.page.height - 130) doc.addPage();

      const label = sectionLabel(section.instruction, section.title);

      // Section title — centered, bold
      doc
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text(section.title, L, doc.y, { width: contentW, align: 'center' });
      doc.moveDown(0.35);

      // Section subtitle — left-aligned, bold
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(primaryColor)
        .text(label, L, doc.y, { width: contentW });
      doc.moveDown(0.2);

      // Section instruction — left-aligned, italic
      doc
        .font('Helvetica-Oblique')
        .fontSize(9.5)
        .fillColor(mutedColor)
        .text(section.instruction, L, doc.y, { width: contentW });
      doc.moveDown(0.6);

      // Questions — single text block with full page width (avoid continued+small width)
      for (const question of section.questions) {
        if (doc.y > doc.page.height - 100) doc.addPage();

        const marksLabel = `[${question.marks} Mark${question.marks > 1 ? 's' : ''}]`;
        const line = `${globalQIndex}. [${diffLabel(question.difficulty)}] ${question.text} ${marksLabel}`;

        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor(primaryColor)
          .text(line, L, doc.y, { width: contentW, lineGap: 3 });

        doc.moveDown(0.5);
        globalQIndex++;
      }

      doc.moveDown(0.5);
    }
  }

  // ── 6. END OF QUESTION PAPER ──────────────────────────────────────────────
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(primaryColor)
    .text('End of Question Paper', L, doc.y, { width: contentW });
  doc.moveDown(2);

  // ── 7. ANSWER KEY ─────────────────────────────────────────────────────────
  if (assignment.answerKey) {
    doc.addPage();

    doc
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text('Answer Key:', L, doc.y, { width: contentW });
    doc.moveDown(0.6);

    const answers = assignment.answerKey.split('\n\n');
    for (const answer of answers) {
      if (doc.y > doc.page.height - 100) doc.addPage();

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor(mutedColor)
        .text(answer.trim(), L, doc.y, { width: contentW, lineGap: 3 });
      doc.moveDown(0.8);
    }
  }

  // ── 8. PAGE NUMBERS ───────────────────────────────────────────────────────
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc
      .strokeColor(lightGrey)
      .lineWidth(0.5)
      .moveTo(L, doc.page.height - 40)
      .lineTo(R, doc.page.height - 40)
      .stroke();
    doc
      .fillColor(mutedColor)
      .font('Helvetica')
      .fontSize(8)
      .text(
        `VedaAI Assessment System  |  Page ${i + 1} of ${range.count}`,
        L,
        doc.page.height - 30,
        { align: 'center', width: contentW }
      );
  }

  doc.end();
}
