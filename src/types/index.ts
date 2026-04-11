export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'employer' | 'candidate';
  company?: string;
  createdAt: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  title: string;
  type: 'radio' | 'checkbox' | 'text';
  options: Option[];
  marks: number;
  negativeMarks: number;
}

export interface Exam {
  _id: string;
  title: string;
  totalCandidates: number;
  totalSlots: number;
  questionSets: number;
  questionType: 'mcq' | 'text' | 'mixed';
  startTime: string;
  endTime: string;
  duration: number;
  negativeMarking: boolean;
  questions: Question[];
  createdBy: User | string;
  status: 'draft' | 'published' | 'closed';
  submissionCount?: number;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  answer: string | string[];
}

export interface Submission {
  _id: string;
  exam: Exam | string;
  candidate: User | string;
  answers: Answer[];
  score: number;
  totalMarks: number;
  timeTaken: number;
  autoSubmitted: boolean;
  tabSwitchCount: number;
  fullscreenExitCount: number;
  behaviorLogs: { event: string; timestamp: string; count: number }[];
  status: string;
  submittedAt: string;
  startedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'employer' | 'candidate';
  company?: string;
}
