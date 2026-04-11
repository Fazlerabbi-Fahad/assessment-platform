import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store';
import { initAuth } from './store/authSlice';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import EmployerLayout     from './pages/employer/EmployerLayout';
import EmployerDashboard  from './pages/employer/EmployerDashboard';
import CreateExamPage     from './pages/employer/CreateExamPage';
import ViewCandidatesPage from './pages/employer/ViewCandidatesPage';
import CandidateLayout    from './pages/candidate/CandidateLayout';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import ExamScreen         from './pages/candidate/ExamScreen';

function RootRedirect() {
  const { user, token } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === 'employer')  return <Navigate to="/employer/dashboard" replace />;
  if (user?.role === 'candidate') return <Navigate to="/candidate/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(initAuth()); }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<RootRedirect />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/employer" element={
          <ProtectedRoute role="employer"><EmployerLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"            element={<EmployerDashboard />} />
          <Route path="exams/create"         element={<CreateExamPage />} />
          <Route path="exams/:id/candidates" element={<ViewCandidatesPage />} />
        </Route>

        <Route path="/candidate" element={
          <ProtectedRoute role="candidate"><CandidateLayout /></ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<CandidateDashboard />} />
        </Route>

        <Route path="/candidate/exam/:id" element={
          <ProtectedRoute role="candidate"><ExamScreen /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
