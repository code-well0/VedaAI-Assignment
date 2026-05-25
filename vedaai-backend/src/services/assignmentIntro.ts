import { Assignment } from '../types';
import { resolveQuizTopic } from './questionPaperPlan';

function teacherFirstName(teacherName: string): string {
  const trimmed = teacherName.trim();
  if (!trimmed) return 'Teacher';
  return trimmed.split(/\s+/)[0];
}

export function formatSubjectLabel(subject: string): string {
  const t = (subject || '').trim();
  if (!t) return '';
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function formatClassLabel(className: string): string {
  const c = className.trim();
  if (!c) return '';
  if (/grade/i.test(c)) return c;
  const numeric = c.match(/^(\d{1,2})/);
  if (numeric) return `Grade ${numeric[1]}`;
  return c;
}

/** Personalized intro shown above the question paper (AI response panel). */
export function buildTeacherIntroMessage(assignment: Assignment): string {
  const firstName = teacherFirstName(assignment.teacherName || '');
  const topic = resolveQuizTopic(assignment);
  const classPart = formatClassLabel(assignment.className);
  const subject = formatSubjectLabel(assignment.subject || '');

  const classSubject =
    classPart && subject
      ? `${classPart} ${subject}`
      : classPart || subject || 'your class';

  return `Certainly, ${firstName}! Here are customized Question Paper for your CBSE ${classSubject} class on the chapter: ${topic}.`;
}
