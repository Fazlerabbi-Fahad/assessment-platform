import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../lib/api';
import type { Exam, Question } from '../types';
import { generateId } from '../lib/utils';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const fetchExamsThunk = createAsyncThunk(
  'exam/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/exams');
      return data as Exam[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch exams');
    }
  }
);

export const createExamThunk = createAsyncThunk(
  'exam/create',
  async (examData: Partial<Exam>, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/exams', examData);
      return data as Exam;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create exam');
    }
  }
);

export const deleteExamThunk = createAsyncThunk(
  'exam/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/exams/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete exam');
    }
  }
);

// ─── Default form data ────────────────────────────────────────────────────────

const DEFAULT_FORM: Partial<Exam> = {
  title: '',
  totalCandidates: 50,
  totalSlots: 10,
  questionSets: 1,
  questionType: 'mcq',
  startTime: '',
  endTime: '',
  duration: 60,
  negativeMarking: false,
  questions: [],
};

// ─── State ───────────────────────────────────────────────────────────────────

interface ExamState {
  exams: Exam[];
  isLoading: boolean;
  error: string | null;
  // Multi-step form
  formStep: number;
  formData: Partial<Exam>;
}

const initialState: ExamState = {
  exams: [],
  isLoading: false,
  error: null,
  formStep: 1,
  formData: { ...DEFAULT_FORM, questions: [] },
};

// ─── Slice ───────────────────────────────────────────────────────────────────

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    // Form navigation
    setFormStep(state, action: PayloadAction<number>) {
      state.formStep = action.payload;
    },
    setFormData(state, action: PayloadAction<Partial<Exam>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm(state) {
      state.formStep = 1;
      state.formData = { ...DEFAULT_FORM, questions: [] };
    },

    // Question management (operates on formData.questions)
    addQuestion(state, action: PayloadAction<Omit<Question, 'id'>>) {
      const question: Question = { ...action.payload, id: generateId() };
      state.formData.questions = [...(state.formData.questions || []), question];
    },
    updateQuestion(state, action: PayloadAction<{ id: string; changes: Partial<Question> }>) {
      state.formData.questions = (state.formData.questions || []).map((q) =>
        q.id === action.payload.id ? { ...q, ...action.payload.changes } : q
      );
    },
    deleteQuestion(state, action: PayloadAction<string>) {
      state.formData.questions = (state.formData.questions || []).filter(
        (q) => q.id !== action.payload
      );
    },

    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch exams
    builder
      .addCase(fetchExamsThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchExamsThunk.fulfilled, (state, action: PayloadAction<Exam[]>) => {
        state.isLoading = false;
        state.exams     = action.payload;
      })
      .addCase(fetchExamsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });

    // Create exam
    builder
      .addCase(createExamThunk.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(createExamThunk.fulfilled, (state, action: PayloadAction<Exam>) => {
        state.isLoading = false;
        state.exams     = [action.payload, ...state.exams];
      })
      .addCase(createExamThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });

    // Delete exam
    builder
      .addCase(deleteExamThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.exams = state.exams.filter((e) => e._id !== action.payload);
      })
      .addCase(deleteExamThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setFormStep, setFormData, resetForm,
  addQuestion, updateQuestion, deleteQuestion,
  clearError,
} = examSlice.actions;

export default examSlice.reducer;
