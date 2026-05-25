import OpenAI from 'openai';
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';
import dotenv from 'dotenv';
import { Assignment, Section, Question } from '../types';
import {
  getImageContentForAssignment,
  hasReferenceDocument,
  isImageDocument,
} from './documentService';
import {
  extractSyllabusText,
  buildSyllabusExcerpt,
  looksOffTopic,
} from './syllabusService';
import { generateTopicAlignedMock } from './topicQuestionGenerator';
import { buildTeacherIntroMessage } from './assignmentIntro';
import {
  buildSectionPlans,
  buildAnswerKeyPromptBlock,
  getQuestionTypeGuidance,
  getAnswerKeyFormatForType,
  getQuestionTypeJsonExample,
  resolveQuizTopic,
  sanitizeQuestionText,
  validateQuestionFormat,
  questionFingerprint,
  questionMentionsForbiddenMeta,
} from './questionPaperPlan';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY || '';
const configuredModel = process.env.OPENAI_MODEL?.trim() || '';

const OPENAI_MODELS = configuredModel
  ? [configuredModel]
  : ['gpt-4o-mini', 'gpt-4o'];

let openai: OpenAI | null = null;

if (apiKey) {
  try {
    openai = new OpenAI({ apiKey });
  } catch (error) {
    console.error('⚠️ Failed to initialize OpenAI client:', error);
  }
}

const SYSTEM_PROMPT = `You are an experienced school teacher writing formal exam question papers.
You always respond with valid JSON only, matching the schema requested by the user.
Never include markdown code fences.`;

export async function generateQuestionPaper(assignment: Assignment): Promise<{
  aiResponseText: string;
  sections: Section[];
  answerKey: string;
}> {
  const topic = resolveQuizTopic(assignment);
  const syllabusText = await extractSyllabusText(assignment);

  console.log(
    `🤖 Generating paper: "${assignment.title}" | Topic: "${topic}" | Syllabus chars: ${syllabusText.length}`
  );

  if (openai && apiKey) {
    try {
      return await generateWithOpenAI(assignment, syllabusText, topic);
    } catch (error) {
      console.error('⚠️ ChatGPT generation failed:', error);

      try {
        console.log('🔄 Retrying ChatGPT with expanded syllabus text...');
        return await generateWithOpenAITextOnly(assignment, syllabusText, topic);
      } catch (retryErr) {
        console.error('⚠️ ChatGPT text-only retry failed:', retryErr);
      }

      if (process.env.STRICT_MODE === 'true') {
        throw error;
      }
    }
  } else {
    console.log('💡 OPENAI_API_KEY not set — using built-in question generator.');
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));
  return generateTopicAlignedMock(assignment, syllabusText);
}

function buildGenerationPrompt(
  assignment: Assignment,
  topic: string,
  syllabusExcerpt: string,
  hasDocument: boolean
): string {
  const plans = buildSectionPlans(assignment.questionTypes);
  const totalQuestions = plans.reduce((sum, p) => sum + p.count, 0);
  const docNote = hasDocument
    ? `A syllabus document was uploaded. Use extracted syllabus content below (and the attached image if provided) for question ideas, focused on the quiz topic.`
    : syllabusExcerpt
      ? `Use the SYLLABUS TEXT below as the primary content source for questions.`
      : `No syllabus file — use standard curriculum content appropriate for the quiz topic and level.`;

  const sectionBlocks = plans
    .map(
      (plan) => `
${plan.title} — ${plan.type}
  • Exact count: ${plan.count} questions (no more, no fewer)
  • Marks per question: ${plan.marks}
  • ${getQuestionTypeGuidance(plan.type, plan.marks)}
  • Answer key style for this section: ${getAnswerKeyFormatForType(plan.type, plan.marks)}
  • Instruction line: "${plan.instruction}"`
    )
    .join('\n');

  const sectionJsonExample = plans
    .map(
      (plan) => `    {
      "title": "${plan.title}",
      "instruction": "${plan.instruction}",
      "questions": [
        ${getQuestionTypeJsonExample(plan.type, plan.marks)}
      ]
    }`
    )
    .join(',\n');

  return `
=== CONTENT SCOPE (internal — do NOT write these in questions) ===
Quiz topic to assess: "${topic}"
Curriculum level: ${assignment.className} ${assignment.subject}
Teacher notes: ${assignment.additionalInfo || 'None'}

${docNote}

=== SYLLABUS CONTENT ===
${syllabusExcerpt || '(Use standard curriculum content for the quiz topic.)'}

=== SECTIONS (${plans.length} sections — each type has a DIFFERENT format) ===
${sectionBlocks}

=== STRICT RULES FOR QUESTION TEXT ===
1. Write like a real teacher's exam paper: direct, professional, no filler.
2. NEVER mention subject names (Science, English, Mathematics, etc.), class/grade, NCERT, CBSE, "students", or "syllabus" inside any question.
3. NEVER mention chapter/unit names or numbers.
4. Do NOT repeat the quiz topic as a title prefix on every question.
5. Every question in the entire paper must be UNIQUE — different concept, wording, and skill tested.
6. Multiple Choice sections: MUST use (a) (b) (c) (d) options on the same line — never write MCQs as short-answer sentences.
7. Short-answer sections: NO (a)(b)(c)(d) options — one clear question only.
8. Diagram sections: MUST start with Draw/Sketch and ask for a labeled diagram.
9. Numerical sections: MUST include given values and ask to Calculate/Find.
10. Difficulty: ONLY "Easy", "Moderate", or "Hard".
11. Exact question counts and marks per section as specified above.

${buildAnswerKeyPromptBlock(totalQuestions)}

Return JSON with this exact shape:
{
  "aiResponseText": "One brief sentence (no subject/class names).",
  "sections": [
${sectionJsonExample}
  ],
  "answerKey": "1. [Full type-appropriate answer for Q1]\\n\\n2. [Full type-appropriate answer for Q2]\\n\\n..."
}
`;
}

function normalizeAiResult(
  parsed: any,
  assignment: Assignment,
  topic: string
): { aiResponseText: string; sections: Section[]; answerKey: string } {
  if (!parsed.sections || !parsed.answerKey) {
    throw new Error('Invalid JSON structure returned by ChatGPT');
  }

  const plans = buildSectionPlans(assignment.questionTypes);
  const rawSections = parsed.sections as any[];

  if (rawSections.length !== plans.length) {
    throw new Error(
      `Expected ${plans.length} sections but ChatGPT returned ${rawSections.length}.`
    );
  }

  const sections: Section[] = rawSections.map((sec: any, index: number) => {
    const plan = plans[index];
    const questions: Question[] = (sec.questions as any[]).map((q: any) => {
      let diff = String(q.difficulty).trim().toLowerCase();
      let normalizedDiff: Question['difficulty'] = 'Moderate';
      if (diff === 'easy') normalizedDiff = 'Easy';
      else if (diff === 'moderate' || diff === 'medium') normalizedDiff = 'Moderate';
      else if (diff === 'hard' || diff === 'difficult') normalizedDiff = 'Hard';

      const rawText = String(q.text).trim();
      const cleaned = sanitizeQuestionText(rawText, topic, assignment);
      if (!cleaned) {
        throw new Error(`Empty question text in ${plan.title}.`);
      }
      if (questionMentionsForbiddenMeta(cleaned, assignment)) {
        throw new Error(`Question contains forbidden meta text: "${cleaned.slice(0, 80)}…"`);
      }

      const formatError = validateQuestionFormat(plan.type, cleaned);
      if (formatError) {
        throw new Error(`${plan.type}: ${formatError} Got: "${cleaned.slice(0, 80)}…"`);
      }

      return {
        text: cleaned,
        difficulty: normalizedDiff,
        marks: Number(q.marks) || plan.marks,
      };
    });

    if (questions.length !== plan.count) {
      throw new Error(
        `${plan.title} (${plan.type}): expected ${plan.count} questions, got ${questions.length}.`
      );
    }

    return {
      title: String(sec.title || plan.title).trim(),
      instruction: String(sec.instruction || plan.instruction).trim(),
      questions,
    };
  });

  validateGeneratedPaper(sections, topic, assignment);

  return {
    aiResponseText: buildTeacherIntroMessage(assignment),
    sections,
    answerKey: String(parsed.answerKey),
  };
}

function validateGeneratedPaper(
  sections: Section[],
  topic: string,
  assignment: Assignment
): void {
  const allQuestions = sections.flatMap((s) => s.questions);
  const offTopic = allQuestions.filter((q) => looksOffTopic(q.text, topic));

  if (offTopic.length > 0) {
    const sample = offTopic[0].text.slice(0, 80);
    throw new Error(
      `Generated questions are off-topic for "${topic}". Example: "${sample}…"`
    );
  }

  const seen = new Set<string>();
  for (const q of allQuestions) {
    const fp = questionFingerprint(q.text);
    if (seen.has(fp)) {
      throw new Error(`Duplicate question detected: "${q.text.slice(0, 60)}…"`);
    }
    seen.add(fp);

    if (questionMentionsForbiddenMeta(q.text, assignment)) {
      throw new Error(`Question mentions forbidden meta: "${q.text.slice(0, 60)}…"`);
    }
  }
}

function parseAiJson(responseText: string): any {
  let text = responseText.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  else if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  return JSON.parse(text.trim());
}

async function callOpenAI(
  assignment: Assignment,
  userContent: string | ChatCompletionContentPart[],
  label: string
): Promise<{ aiResponseText: string; sections: Section[]; answerKey: string }> {
  if (!openai) throw new Error('OpenAI client not initialized');

  const topic = resolveQuizTopic(assignment);
  let lastError: Error | null = null;

  for (const modelName of OPENAI_MODELS) {
    try {
      console.log(`📡 ChatGPT [${label}] model: ${modelName}`);
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.65,
        max_tokens: 16384,
      });

      const text = response.choices[0]?.message?.content;
      if (!text) throw new Error('Empty response from ChatGPT');

      const parsed = parseAiJson(text);
      return normalizeAiResult(parsed, assignment, topic);
    } catch (err: any) {
      lastError = err;
      console.warn(`⚠️ Model ${modelName} failed:`, err.message);
    }
  }

  throw lastError || new Error('All ChatGPT models failed');
}

async function buildUserContent(
  assignment: Assignment,
  topic: string,
  syllabusExcerpt: string,
  excerptLimit: number
): Promise<string | ChatCompletionContentPart[]> {
  const hasDoc = hasReferenceDocument(assignment);
  const prompt = buildGenerationPrompt(assignment, topic, syllabusExcerpt, hasDoc);
  const imagePart = await getImageContentForAssignment(assignment);

  const parts: ChatCompletionContentPart[] = [];

  if (syllabusExcerpt) {
    parts.push({
      type: 'text',
      text: `SYLLABUS CONTENT (generate questions from this for topic "${topic}"):\n\n${syllabusExcerpt.slice(0, excerptLimit)}`,
    });
  }

  if (imagePart && isImageDocument(assignment)) {
    parts.push(imagePart);
  }

  parts.push({ type: 'text', text: prompt });

  if (parts.length === 1 && parts[0].type === 'text') {
    return parts[0].text;
  }

  return parts;
}

async function generateWithOpenAI(
  assignment: Assignment,
  syllabusText: string,
  topic: string
): Promise<{ aiResponseText: string; sections: Section[]; answerKey: string }> {
  const excerpt = buildSyllabusExcerpt(syllabusText, 20000);
  const userContent = await buildUserContent(assignment, topic, excerpt, 20000);
  return callOpenAI(assignment, userContent, 'syllabus+prompt');
}

async function generateWithOpenAITextOnly(
  assignment: Assignment,
  syllabusText: string,
  topic: string
): Promise<{ aiResponseText: string; sections: Section[]; answerKey: string }> {
  const excerpt = buildSyllabusExcerpt(syllabusText, 28000);
  const userContent = await buildUserContent(assignment, topic, excerpt, 28000);
  return callOpenAI(assignment, userContent, 'text-only');
}
