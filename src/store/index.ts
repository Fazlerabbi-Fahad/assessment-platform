import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import authReducer from './authSlice';
import examReducer from './examSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    exam: examReducer,
  },
});

// Typed hooks — use these everywhere instead of plain useDispatch/useSelector
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch         = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
