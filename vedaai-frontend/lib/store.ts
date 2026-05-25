import { create } from 'zustand';

export interface QuestionType {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface Question {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface Assignment {
  id: string;
  title: string;
  quizTopic?: string;
  teacherName?: string;
  assignedOn: string;
  dueDate: string;
  subject?: string;
  className?: string;
  schoolName?: string;
  questionTypes?: QuestionType[];
  totalQuestions?: number;
  totalMarks?: number;
  status?: 'draft' | 'published' | 'graded' | 'pending' | 'completed' | 'failed';
  aiResponseText?: string;
  sections?: Section[];
  answerKey?: string;
}

export interface CreateAssignmentForm {
  currentStep: number;
  title: string;
  quizTopic: string;
  file: File | null;
  dueDate: string;
  questionTypes: QuestionType[];
  additionalInfo: string;
  subject: string;
  className: string;
  schoolName: string;
}

interface AssignmentStore {
  assignments: Assignment[];
  loading: boolean;
  error: string | null;
  createForm: CreateAssignmentForm;
  
  // API Operations
  fetchAssignments: () => Promise<void>;
  fetchAssignmentDetails: (id: string) => Promise<Assignment | null>;
  createAssignment: () => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<void>;
  
  // Local Wizard Operations
  setCreateForm: (form: Partial<CreateAssignmentForm>) => void;
  resetCreateForm: () => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, field: keyof QuestionType, value: string | number) => void;
  setStep: (step: number) => void;
}

import { ASSIGNMENTS_API } from './config';
import {
  getAssignmentFieldsFromProfile,
  getOrCreateProfileId,
  useProfileStore,
} from './profileStore';
import { buildDefaultQuestionTypes, getActiveQuestionTypes } from './questionTypes';

const API_BASE_URL = ASSIGNMENTS_API;

function apiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Backend is not running. In a terminal run: cd vedaai-backend && npm run dev (then refresh this page).';
  }
  return err instanceof Error ? err.message : fallback;
}

function buildDefaultCreateForm(): CreateAssignmentForm {
  const base: CreateAssignmentForm = {
    currentStep: 0,
    title: '',
    quizTopic: '',
    file: null,
    dueDate: '',
    questionTypes: buildDefaultQuestionTypes(),
    additionalInfo: '',
    subject: '',
    className: '',
    schoolName: '',
  };

  const { profile, isComplete } = useProfileStore.getState();
  if (isComplete) {
    return { ...base, ...getAssignmentFieldsFromProfile(profile) };
  }
  return base;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  loading: false,
  error: null,
  createForm: buildDefaultCreateForm(),

  /**
   * Fetch all assignments from the backend
   */
  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const teacherExternalId = getOrCreateProfileId();
      const res = await fetch(
        `${API_BASE_URL}?teacherExternalId=${encodeURIComponent(teacherExternalId)}`
      );
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to fetch assignments');
      }
      const data = await res.json();
      set({ assignments: data, loading: false });
    } catch (err: any) {
      console.error('fetchAssignments error:', err);
      set({ error: apiErrorMessage(err, 'Failed to fetch assignments'), loading: false });
    }
  },

  /**
   * Fetch single assignment details and update it locally in the store
   */
  fetchAssignmentDetails: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`);
      if (res.status === 404) {
        throw new Error(
          'This assignment was not found. The server may have restarted — create a new assignment or open one from your list.'
        );
      }
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to fetch assignment details');
      }
      const data = await res.json();

      set((state) => ({
        assignments: state.assignments.some((a) => a.id === id)
          ? state.assignments.map((a) => (a.id === id ? data : a))
          : [data, ...state.assignments],
        loading: false,
      }));

      return data;
    } catch (err: any) {
      console.error('fetchAssignmentDetails error:', err);
      set({ error: apiErrorMessage(err, 'Failed to load details'), loading: false });
      return null;
    }
  },

  /**
   * Create assignment by sending a multipart form to the backend
   */
  createAssignment: async () => {
    set({ loading: true, error: null });
    const { createForm } = get();
    const { profile, isComplete } = useProfileStore.getState();
    const profileFields = isComplete ? getAssignmentFieldsFromProfile(profile) : null;

    try {
      const formData = new FormData();
      formData.append('title', createForm.title.trim());
      formData.append('quizTopic', createForm.quizTopic.trim());
      formData.append('teacherName', profile.name.trim());
      formData.append('teacherExternalId', getOrCreateProfileId());
      formData.append('subject', createForm.subject.trim());
      formData.append('className', createForm.className || profileFields?.className || 'Class');
      formData.append('schoolName', createForm.schoolName || profileFields?.schoolName || 'School');
      formData.append('dueDate', createForm.dueDate || '21-06-2025');
      formData.append('additionalInfo', createForm.additionalInfo);
      const activeQuestionTypes = getActiveQuestionTypes(createForm.questionTypes);
      formData.append('questionTypes', JSON.stringify(activeQuestionTypes));
      
      if (createForm.file) {
        formData.append('file', createForm.file);
      }

      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create assignment');
      }

      const newAssignment = await res.json();
      
      set((state) => ({
        assignments: [newAssignment, ...state.assignments],
        loading: false,
      }));

      return newAssignment;
    } catch (err: any) {
      console.error('createAssignment error:', err);
      set({ error: err.message || 'Failed to create assignment', loading: false });
      throw err;
    }
  },

  /**
   * Delete an assignment by ID
   */
  deleteAssignment: async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete assignment');

      set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== id),
      }));
    } catch (err: any) {
      console.error('deleteAssignment error:', err);
      set({ error: err.message || 'Failed to delete assignment' });
    }
  },

  /**
   * Trigger paper regeneration on the backend
   */
  regenerateAssignment: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/${id}/regenerate`, {
      method: 'POST',
    });
    if (res.status === 404) {
      throw new Error(
        'Assignment not found on the server. Restart cleared in-memory data — please create the assignment again.'
      );
    }
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || 'Failed to regenerate assignment');
    }

    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, status: 'pending', sections: [], answerKey: '' } : a
      ),
    }));
  },

  // Local Wizard actions
  setCreateForm: (form) =>
    set((state) => ({ createForm: { ...state.createForm, ...form } })),
  resetCreateForm: () => set({ createForm: buildDefaultCreateForm() }),
  addQuestionType: () =>
    set((state) => ({
      createForm: {
        ...state.createForm,
        questionTypes: [
          ...state.createForm.questionTypes,
          { id: Date.now().toString(), type: 'Multiple Choice Questions', count: 0, marks: 0 },
        ],
      },
    })),
  removeQuestionType: (id) =>
    set((state) => ({
      createForm: {
        ...state.createForm,
        questionTypes: state.createForm.questionTypes.filter((qt) => qt.id !== id),
      },
    })),
  updateQuestionType: (id, field, value) =>
    set((state) => ({
      createForm: {
        ...state.createForm,
        questionTypes: state.createForm.questionTypes.map((qt) =>
          qt.id === id ? { ...qt, [field]: value } : qt
        ),
      },
    })),
  setStep: (step) =>
    set((state) => ({ createForm: { ...state.createForm, currentStep: step } })),
}));
