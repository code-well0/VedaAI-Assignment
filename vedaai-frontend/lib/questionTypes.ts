import type { QuestionType } from './store';

export const QUESTION_TYPE_OPTIONS = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'Fill in the Blanks',
  'True or False',
  'Match the Following',
] as const;

/** All types listed on first load — teacher removes or sets counts as needed */
export function buildDefaultQuestionTypes(): QuestionType[] {
  return QUESTION_TYPE_OPTIONS.map((type, index) => ({
    id: String(index + 1),
    type,
    count: 0,
    marks: 0,
  }));
}

export function getActiveQuestionTypes(types: QuestionType[]): QuestionType[] {
  return types.filter((qt) => qt.count > 0);
}
