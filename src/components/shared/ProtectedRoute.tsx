import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store';

interface Props { children: React.ReactNode; role?: 'employer' | 'candidate'; }

export function ProtectedRoute({ children, role }: Props) {
  const { user, token } = useAppSelector((s) => s.auth);
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role)
    return <Navigate to={user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'} replace />;
  return <>{children}</>;
}
