import { create } from 'zustand';
import api from '../lib/api';
import type { Exam, Question } from '../types';
import { generateId } from '../lib/utils';

const DEFAULT_FORM: Partial<Exam> = {
  title: '', totalCandidates: 50, totalSlots: 10,
  questionSets: 1, questionType: 'mcq',
  startTime: '', endTime: '', duration: 60,
  negativeMarking: false, questions: [],
};

interface ExamStore {
  exams: Exam[];
  isLoading: boolean;
  formStep: number;
  formData: Partial<Exam>;

  fetchExams: () => Promise<void>;
  createExam: (data: Partial<Exam>) => Promise<Exam>;
  deleteExam: (id: string) => Promise<void>;

  setStep: (n: number) => void;
  setFormData: (d: Partial<Exam>) => void;
  resetForm: () => void;

  addQuestion: (q: Omit<Question, 'id'>) => void;
  updateQuestion: (id: string, q: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
}

export const useExamStore = create<ExamStore>((set) => ({
  exams: [],
  isLoading: false,
  formStep: 1,
  formData: { ...DEFAULT_FORM },

  fetchExams: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/exams');
      set({ exams: data });
    } finally {
      set({ isLoading: false });
    }
  },

  createExam: async (data) => {
    const { data: exam } = await api.post('/exams', data);
    set((s) => ({ exams: [exam, ...s.exams] }));
    return exam;
  },

  deleteExam: async (id) => {
    await api.delete(`/exams/${id}`);
    set((s) => ({ exams: s.exams.filter((e) => e._id !== id) }));
  },

  setStep: (n) => set({ formStep: n }),
  setFormData: (d) => set((s) => ({ formData: { ...s.formData, ...d } })),
  resetForm: () => set({ formStep: 1, formData: { ...DEFAULT_FORM } }),

  addQuestion: (q) => {
    const question: Question = { ...q, id: generateId() };
    set((s) => ({ formData: { ...s.formData, questions: [...(s.formData.questions || []), question] } }));
  },

  updateQuestion: (id, q) => {
    set((s) => ({
      formData: {
        ...s.formData,
        questions: (s.formData.questions || []).map((qu) => (qu.id === id ? { ...qu, ...q } : qu)),
      },
    }));
  },

  deleteQuestion: (id) => {
    set((s) => ({
      formData: { ...s.formData, questions: (s.formData.questions || []).filter((q) => q.id !== id) },
    }));
  },
}));
