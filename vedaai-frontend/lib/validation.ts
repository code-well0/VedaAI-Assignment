import type { CreateAssignmentForm } from './store';
import { getActiveQuestionTypes } from './questionTypes';

const DATE_PATTERN = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export function validateAssignmentStep(form: CreateAssignmentForm): string | null {
  if (!form.dueDate.trim()) {
    return 'Please enter a due date (DD-MM-YYYY).';
  }
  if (!DATE_PATTERN.test(form.dueDate.trim())) {
    return 'Due date must be in DD-MM-YYYY format.';
  }

  const active = getActiveQuestionTypes(form.questionTypes);
  if (active.length === 0) {
    return 'Set at least one question type with a count greater than 0.';
  }

  for (const qt of active) {
    if (!qt.type.trim()) {
      return 'Each question type must have a valid type selected.';
    }
    if (!Number.isFinite(qt.count) || qt.count < 1) {
      return 'Number of questions must be at least 1 for each selected type.';
    }
    if (!Number.isFinite(qt.marks) || qt.marks < 1) {
      return 'Marks must be at least 1 for each question type in use.';
    }
  }
  return null;
}

export function validateReviewStep(form: CreateAssignmentForm): string | null {
  if (!form.title.trim()) {
    return 'Please enter an assignment title.';
  }
  if (form.title.trim().length < 3) {
    return 'Assignment title must be at least 3 characters.';
  }
  if (!form.quizTopic.trim()) {
    return 'Please enter the quiz topic or chapter name.';
  }
  if (form.quizTopic.trim().length < 2) {
    return 'Quiz topic must be at least 2 characters.';
  }
  if (!form.subject.trim()) {
    return 'Please select the subject for this test paper.';
  }
  return null;
}
