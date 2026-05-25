import { Assignment, QuestionType } from '../types';

const SECTION_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface SectionPlan {
  letter: string;
  title: string;
  type: string;
  count: number;
  marks: number;
  instruction: string;
}

export function resolveQuizTopic(assignment: Assignment): string {
  const topic = (assignment.quizTopic || '').trim();
  if (topic) return topic;
  const title = (assignment.title || '').trim();
  if (title) return title;
  return assignment.subject;
}

export function buildSectionPlans(questionTypes: QuestionType[]): SectionPlan[] {
  return questionTypes.map((qt, index) => {
    const letter = SECTION_LETTERS[index] || String(index + 1);
    const count = Math.max(1, Number(qt.count) || 1);
    const marks = Math.max(1, Number(qt.marks) || 1);
    const type = String(qt.type || 'Questions').trim();
    const markLabel = marks === 1 ? '1 mark' : `${marks} marks`;

    return {
      letter,
      title: `Section ${letter}`,
      type,
      count,
      marks,
      instruction: `${type}. Attempt all questions. Each question carries ${markLabel}.`,
    };
  });
}

export function isMcqType(type: string): boolean {
  const t = type.toLowerCase();
  return t.includes('multiple choice') || t.includes('mcq');
}

export function isMcqFormat(text: string): boolean {
  return /\(a\)/i.test(text) && /\(b\)/i.test(text) && /\(c\)/i.test(text) && /\(d\)/i.test(text);
}

export function isShortAnswerType(type: string): boolean {
  const t = type.toLowerCase();
  return t.includes('short') && !isMcqType(type);
}

export function isDiagramType(type: string): boolean {
  const t = type.toLowerCase();
  return t.includes('diagram') || t.includes('graph');
}

export function isNumericalType(type: string): boolean {
  return type.toLowerCase().includes('numerical');
}

export function validateQuestionFormat(type: string, text: string): string | null {
  const t = type.toLowerCase();

  if (isMcqType(type) && !isMcqFormat(text)) {
    return 'MCQ must include options (a), (b), (c), and (d) on one line.';
  }
  if (isMcqType(type) === false && isMcqFormat(text)) {
    return 'Non-MCQ question must not use multiple-choice option format.';
  }
  if (isShortAnswerType(type) && isMcqFormat(text)) {
    return 'Short question must not be formatted as MCQ.';
  }
  if (isDiagramType(type) && !/\b(draw|sketch|label|diagram|graph)\b/i.test(text)) {
    return 'Diagram question must ask to draw, sketch, or label.';
  }
  if (isNumericalType(type) && !/\b(calculate|find|compute|determine|numerical|given)\b/i.test(text)) {
    return 'Numerical question must include calculation language and given values.';
  }
  if (t.includes('fill in the blank') && !/_{3,}|_____/.test(text)) {
    return 'Fill-in-the-blank must contain a blank (_____).';
  }
  if (t.includes('true or false') && !/\b(true or false|true\/false)\b/i.test(text)) {
    return 'True/False question must be a clear T/F statement.';
  }
  if (t.includes('match') && !/\bcolumn\s*a\b/i.test(text)) {
    return 'Match-the-following must include Column A and Column B.';
  }

  return null;
}

export function getQuestionTypeGuidance(type: string, marks: number): string {
  const t = type.toLowerCase();

  if (isMcqType(type)) {
    return `FORMAT: One line ending with four options: (a) ... (b) ... (c) ... (d) ... — exactly one correct answer. ${marks} mark(s) each. Do NOT write as a short descriptive question.`;
  }
  if (t.includes('short')) {
    return `FORMAT: Direct question only (no options a/b/c/d). Answerable in 2–4 sentences. ${marks} mark(s) each.`;
  }
  if (t.includes('long')) {
    return `FORMAT: Detailed question requiring a full paragraph answer. No MCQ options. ${marks} mark(s) each.`;
  }
  if (isDiagramType(type)) {
    return `FORMAT: Start with "Draw" or "Sketch" and ask for a labeled diagram/graph. No MCQ options. ${marks} mark(s) each.`;
  }
  if (isNumericalType(type)) {
    return `FORMAT: Word problem with numeric data (e.g. force, pressure, mass). Use "Calculate" or "Find". No MCQ options. ${marks} mark(s) each.`;
  }
  if (t.includes('fill in the blank')) {
    return `FORMAT: Sentence with "_____" blank(s). No MCQ options. ${marks} mark(s) each.`;
  }
  if (t.includes('true or false')) {
    return `FORMAT: Single declarative statement; student marks True or False. No MCQ options. ${marks} mark(s) each.`;
  }
  if (t.includes('match')) {
    return `FORMAT: "Match Column A with Column B" with two labeled lists. ${marks} mark(s) each.`;
  }

  return `Distinct format for "${type}" only — not the same style as other sections. ${marks} mark(s) each.`;
}

/** Instructions for how each question type should be answered in the marking scheme. */
export function getAnswerKeyFormatForType(type: string, marks: number): string {
  if (isMcqType(type)) {
    return `MCQ: State the correct option — (a), (b), (c), or (d) — then give a 2–3 sentence explanation of why it is correct and why others are wrong. (${marks} mark(s))`;
  }
  if (isShortAnswerType(type)) {
    return `Short answer: Write a complete model answer in 3–5 sentences covering all key points needed for full ${marks} mark(s). Include definitions, examples, or steps as needed.`;
  }
  if (type.toLowerCase().includes('long')) {
    return `Long answer: Write a detailed model answer (1–2 paragraphs) with introduction, explanation, example, and conclusion. Show what earns full ${marks} marks.`;
  }
  if (isDiagramType(type)) {
    return `Diagram: Describe exactly what to draw, list all required labels, and explain 2–3 marking points for the sketch. (${marks} mark(s))`;
  }
  if (isNumericalType(type)) {
    return `Numerical: Give full step-by-step working — formula, substitution, calculation, final answer with correct units. (${marks} mark(s))`;
  }
  if (type.toLowerCase().includes('fill in the blank')) {
    return `Fill in the blank: Provide the exact word(s) for each blank and a one-line explanation.`;
  }
  if (type.toLowerCase().includes('true or false')) {
    return `True/False: State True or False, then 2–3 sentences justifying the answer.`;
  }
  if (type.toLowerCase().includes('match')) {
    return `Match the following: List each correct pair (e.g. 1–c, 2–a) and brief notes if needed.`;
  }
  return `Provide a complete model answer appropriate for "${type}" (${marks} mark(s)).`;
}

export function buildAnswerKeyPromptBlock(totalQuestions: number): string {
  return `
=== ANSWER KEY (required — may be long, multiple pages is fine) ===
- Provide a full marking scheme for ALL ${totalQuestions} questions in paper order (Section A, then B, then C…).
- Number globally: 1, 2, 3, … matching the order questions appear on the paper.
- Separate each question's answer with a blank line (two newlines: \\n\\n).
- Format EACH answer according to its question type (see section types above):
  • Multiple Choice: correct option letter + explanation
  • Short Questions: complete short model answer (several sentences)
  • Long Questions: full paragraph model answer
  • Diagram/Graph: what to draw, labels, and marking criteria
  • Numerical: step-by-step solution with units
  • True/False, Fill in the blanks, Match: type-appropriate complete answers
- Include brief marking notes (what earns full vs partial marks) where helpful.
- Do NOT skip any question. Length is unlimited — thorough answers are required.
- Example format:
  "1. Correct answer: (b) Pascal. Pressure in SI is measured in pascals (Pa)...\\n\\n2. Pressure is force per unit area..."
`;
}

export function getQuestionTypeJsonExample(type: string, marks: number): string {
  if (isMcqType(type)) {
    return `{ "text": "Which quantity is a vector? (a) Speed (b) Distance (c) Force (d) Time", "difficulty": "Easy", "marks": ${marks} }`;
  }
  if (isShortAnswerType(type)) {
    return `{ "text": "Define pressure and state its SI unit.", "difficulty": "Moderate", "marks": ${marks} }`;
  }
  if (isDiagramType(type)) {
    return `{ "text": "Draw a labeled diagram showing how pressure varies with depth in a liquid.", "difficulty": "Moderate", "marks": ${marks} }`;
  }
  if (isNumericalType(type)) {
    return `{ "text": "A block exerts a force of 120 N on an area of 0.05 m². Calculate the pressure in pascals.", "difficulty": "Hard", "marks": ${marks} }`;
  }
  return `{ "text": "Well-formed ${type} question here.", "difficulty": "Moderate", "marks": ${marks} }`;
}

/** Fingerprint for duplicate detection (ignores option order labels). */
export function questionFingerprint(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(a\)[^(]*/gi, '')
    .replace(/\(b\)[^(]*/gi, '')
    .replace(/\(c\)[^(]*/gi, '')
    .replace(/\(d\)[^)]*/gi, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

/** Remove chapter, subject, class, and syllabus meta from question wording. */
export function sanitizeQuestionText(text: string, topic: string, assignment?: Assignment): string {
  let cleaned = String(text).trim();
  cleaned = cleaned.replace(/\(Chapter:\s*[^)]+\)/gi, '');
  cleaned = cleaned.replace(/Chapter\s*:\s*[^\n.)]+/gi, '');
  cleaned = cleaned.replace(/\b(from|in|on)\s+(chapter|unit)\s+[\w\s\d.-]+/gi, '');
  cleaned = cleaned.replace(/\bchapter\s+[\w\s\d.-]+\b/gi, '');

  const metaPatterns = [
    /\b(ncert|cbse|syllabus)\b/gi,
    /\b(class|grade)\s*[\w\d.-]+\b/gi,
    /\b\d{1,2}(st|nd|rd|th)\s+(standard|grade|class)\b/gi,
    /\bfor\s+\w+\s+students\b/gi,
    /\bat\s+\w+\s+level\b/gi,
    /\b(suitable|appropriate)\s+for\b/gi,
    /\bin\s+(science|english|mathematics|maths|hindi|social studies|physics|chemistry|biology)\b/gi,
    /\b(science|english|mathematics|maths)\s+(subject|paper|exam)\b/gi,
  ];

  if (assignment?.subject) {
    const subj = assignment.subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    metaPatterns.push(new RegExp(`\\b${subj}\\b`, 'gi'));
  }
  if (assignment?.className) {
    const cls = assignment.className.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    metaPatterns.push(new RegExp(`\\b${cls}\\b`, 'gi'));
    metaPatterns.push(new RegExp(`\\bclass\\s*${cls}\\b`, 'gi'));
  }

  for (const pat of metaPatterns) {
    cleaned = cleaned.replace(pat, '');
  }

  const topicTrimmed = topic.trim();
  if (topicTrimmed.length > 2) {
    const escaped = topicTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    cleaned = cleaned.replace(new RegExp(`\\(${escaped}\\)\\s*`, 'gi'), '');
    cleaned = cleaned.replace(new RegExp(`^\\s*${escaped}\\s*[-:–]\\s*`, 'i'), '');
  }

  return cleaned.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
}

export function questionMentionsChapterLabel(text: string): boolean {
  return /\b(chapter|unit)\s*[:#]?\s*[\w\d]/i.test(text) || /\(Chapter:/i.test(text);
}

export function questionMentionsForbiddenMeta(text: string, assignment?: Assignment): boolean {
  if (questionMentionsChapterLabel(text)) return true;
  const lower = text.toLowerCase();
  if (/\b(ncert|cbse)\b/.test(lower)) return true;
  if (/\b(class|grade)\s*[\w\d]/.test(lower)) return true;
  if (assignment?.subject && lower.includes(assignment.subject.toLowerCase())) return true;
  if (assignment?.className) {
    const cls = assignment.className.toLowerCase();
    if (cls.length > 1 && lower.includes(cls)) return true;
  }
  return false;
}

/** Pull syllabus sentences related to the quiz topic for varied fallback questions. */
export function extractSyllabusSeeds(syllabusText: string, topic: string, max = 40): string[] {
  if (!syllabusText.trim()) return [];

  const keywords = topic
    .toLowerCase()
    .split(/[\s,&/-]+/)
    .filter((w) => w.length > 3);

  const sentences = syllabusText
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && s.length < 280);

  const scored = sentences
    .map((s) => {
      const lower = s.toLowerCase();
      const score = keywords.reduce((n, k) => (lower.includes(k) ? n + 1 : n), 0);
      return { s, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  const unique: string[] = [];
  const seen = new Set<string>();
  for (const { s } of scored) {
    const key = s.toLowerCase().slice(0, 80);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(s);
    }
    if (unique.length >= max) break;
  }

  return unique;
}
