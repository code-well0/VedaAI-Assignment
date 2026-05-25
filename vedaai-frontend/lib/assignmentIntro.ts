import { Assignment } from './store';
import { formatSubjectLabel } from './subjectUtils';

function firstName(name: string): string {
  const t = name.trim();
  if (!t) return 'Teacher';
  return t.split(/\s+/)[0];
}

function formatClass(className?: string): string {
  const c = (className || '').trim();
  if (!c) return '';
  if (/grade/i.test(c)) return c;
  const n = c.match(/^(\d{1,2})/);
  if (n) return `Grade ${n[1]}`;
  return c;
}

export function buildTeacherIntroMessage(
  assignment: Assignment,
  profileTeacherName?: string
): string {
  const teacher = (assignment.teacherName || profileTeacherName || '').trim();
  const topic = (assignment.quizTopic || assignment.title || 'the selected chapter').trim();
  const classPart = formatClass(assignment.className);
  const subject = formatSubjectLabel(assignment.subject || '');
  const classSubject =
    classPart && subject ? `${classPart} ${subject}` : classPart || subject || 'your class';

  return `Certainly, ${firstName(teacher)}! Here are customized Question Paper for your CBSE ${classSubject} class on the chapter: ${topic}.`;
}
