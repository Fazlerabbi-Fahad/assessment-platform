import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginThunk, clearError } from '../../store/authSlice';
import { FieldError, Alert, Spinner } from '../../components/ui';
import { Footer } from '../../components/shared/Footer';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
});
type F = z.infer<typeof schema>;

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7B2FBE,#4F46E5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontFamily: 'Poppins', fontWeight: 800, fontSize: 13 }}>AK</span>
      </div>
      <div style={{ lineHeight: 1 }}>
        <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 13, color: '#1A1A2E' }}>AKIj RESOURCE</p>
        <p style={{ fontSize: 9.5, color: '#8A8AB0', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 1 }}>Management System</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    dispatch(clearError());
    const res = await dispatch(loginThunk({ email: data.email, password: data.password }));
    if (loginThunk.fulfilled.match(res)) {
      navigate(res.payload.user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard', { replace: true });
    }
  };

  return (
    <div className="auth-shell">
      {/* Nav */}
      <header className="auth-nav">
        <Logo />
        <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, color: '#1A1A2E' }}>AKIj Resource</span>
        <div style={{ width: 120 }} />
      </header>

      {/* Center */}
      <div className="auth-center">
        <div className="auth-card anim-up">
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#1A1A2E', textAlign: 'center', marginBottom: 28 }}>
            Sign In
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {error && <Alert type="error">{error}</Alert>}

            <div>
              <label className="fl">Email</label>
              <input {...register('email')} type="email" className="fi" placeholder="Enter your email address" />
              <FieldError msg={errors.email?.message} />
            </div>

            <div>
              <label className="fl">Password</label>
              <input {...register('password')} type="password" className="fi" placeholder="Enter your password" />
              <FieldError msg={errors.password?.message} />
            </div>

            <div style={{ textAlign: 'right', marginTop: -6 }}>
              <a href="#" style={{ fontSize: 12.5, color: '#7B2FBE', fontWeight: 500 }}>Forgot Password?</a>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={isLoading}
              style={{ marginTop: 4, gap: 8 }}>
              {isLoading ? <><Spinner size={16} /> Signing in…</> : 'Submit'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 22, fontSize: 13, color: '#8A8AB0' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#7B2FBE', fontWeight: 600 }}>Register</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
