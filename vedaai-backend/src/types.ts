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
  title: string;      // e.g., "Section A"
  instruction: string;// e.g., "Attempt all questions. Each question carries 2 marks"
  questions: Question[];
}

export interface Answer {
  questionNumber: number;
  answerText: string;
}

export interface Teacher {
  id: string;
  externalId: string;
  name: string;
  subject: string;
  classes: string[];
  schoolName: string;
  schoolAddress: string;
  avatar?: string;
  assignments?: Assignment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Assignment {
  id: string;
  teacherId?: string;
  title: string;
  quizTopic?: string;
  teacherName?: string;
  subject: string;
  className: string;
  schoolName: string;
  dueDate: string;
  assignedOn: string;
  additionalInfo?: string;
  fileUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  questionTypes: QuestionType[];
  totalQuestions: number;
  totalMarks: number;
  aiResponseText?: string;
  sections?: Section[];
  answerKey?: string; // Markdown or detailed text list of answers
  createdAt?: Date;
  updatedAt?: Date;
}
