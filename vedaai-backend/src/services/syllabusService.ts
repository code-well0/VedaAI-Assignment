import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Assignment } from '../types';

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/** Primary topic the paper must follow (quiz topic from assignment details). */
export function resolveChapterTopic(assignment: Assignment): string {
  const topic = (assignment.quizTopic || '').trim();
  if (topic) return topic;
  const title = (assignment.title || '').trim();
  if (title) return title;
  return assignment.subject;
}

/** Read uploaded syllabus PDF/TXT as plain text for prompts and fallback generation */
export async function extractSyllabusText(assignment: Assignment): Promise<string> {
  if (!assignment.fileUrl) return '';

  const filename = path.basename(assignment.fileUrl);
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) return '';

  const ext = path.extname(filename).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  try {
    if (ext === '.pdf') {
      const data = await pdfParse(buffer);
      return (data.text || '').trim();
    }
    if (ext === '.txt') {
      return buffer.toString('utf-8').trim();
    }
  } catch (err) {
    console.error('⚠️ Failed to extract syllabus text:', err);
  }

  return '';
}

/** Snippet for prompts (keeps token size reasonable) */
export function buildSyllabusExcerpt(text: string, maxChars = 12000): string {
  if (!text) return '';
  const cleaned = text.replace(/\s+/g, ' ').trim();
  return cleaned.length <= maxChars ? cleaned : `${cleaned.slice(0, maxChars)}…`;
}

export function inferCurriculumArea(assignment: Assignment): 'science' | 'math' | 'english' | 'general' {
  const blob = `${assignment.subject} ${resolveChapterTopic(assignment)} ${assignment.additionalInfo || ''}`.toLowerCase();

  if (/math|algebra|geometry|trigonometry|calculus|arithmetic|mensuration/.test(blob)) {
    return 'math';
  }
  if (/english|grammar|literature|poem|prose|comprehension|writing/.test(blob)) {
    return 'english';
  }
  if (
    /science|physics|chemistry|biology|electr|electrolysis|current|cell|acid|metal|force|energy|magnet|light|sound|heat|organism|plant|syllabus|ncert|cbse/.test(
      blob
    )
  ) {
    return 'science';
  }
  return 'general';
}

/** Detect generic off-topic filler often produced when chapter context is ignored */
export function looksOffTopic(questionText: string, topic: string): boolean {
  const q = questionText.toLowerCase();
  const t = topic.toLowerCase();

  const genericSnippets = [
    'hamlet',
    'shakespeare',
    'largest ocean',
    'world environment day',
    'photosynthesis',
    'water cycle',
    'bar graph differs from a histogram',
  ];

  if (genericSnippets.some((g) => q.includes(g))) {
    const topicMentionsGeneric =
      t.includes('hamlet') ||
      t.includes('ocean') ||
      t.includes('environment') ||
      t.includes('photosynthesis') ||
      t.includes('water cycle') ||
      t.includes('graph');
    if (!topicMentionsGeneric) return true;
  }

  return false;
}
