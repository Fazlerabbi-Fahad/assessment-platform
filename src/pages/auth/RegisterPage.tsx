import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '../../store';
import { registerThunk, clearError } from '../../store/authSlice';
import { FieldError, Alert, Spinner } from '../../components/ui';
import { Footer } from '../../components/shared/Footer';

const schema = z.object({
  name:     z.string().min(2, 'Min 2 chars'),
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 chars'),
  role:     z.enum(['employer', 'candidate']),
  company:  z.string().optional(),
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

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'candidate' },
  });
  const role = watch('role');

  const onSubmit = async (data: F) => {
    dispatch(clearError());
    const res = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(res)) {
      navigate(data.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard', { replace: true });
    }
  };

  return (
    <div className="auth-shell">
      <header className="auth-nav">
        <Logo />
        <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 15, color: '#1A1A2E' }}>AKIj Resource</span>
        <div style={{ width: 120 }} />
      </header>

      <div className="auth-center">
        <div className="auth-card anim-up" style={{ maxWidth: 460 }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#1A1A2E', textAlign: 'center', marginBottom: 26 }}>
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <Alert type="error">{error}</Alert>}

            {/* Role picker */}
            <div>
              <label className="fl">Account Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(['candidate', 'employer'] as const).map(r => (
                  <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: `1.5px solid ${role === r ? '#7B2FBE' : '#CACDE0'}`, borderRadius: 7, cursor: 'pointer', background: role === r ? '#F3F0FF' : '#fff', transition: 'all .15s' }}>
                    <input {...register('role')} type="radio" value={r} style={{ accentColor: '#7B2FBE', width: 14, height: 14 }} />
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: role === r ? '#7B2FBE' : '#4A4A6A', textTransform: 'capitalize' }}>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="fl">Full Name</label>
              <input {...register('name')} className="fi" placeholder="Your full name" />
              <FieldError msg={errors.name?.message} />
            </div>

            {role === 'employer' && (
              <div>
                <label className="fl">Company</label>
                <input {...register('company')} className="fi" placeholder="Company name" />
              </div>
            )}

            <div>
              <label className="fl">Email</label>
              <input {...register('email')} type="email" className="fi" placeholder="Enter your email" />
              <FieldError msg={errors.email?.message} />
            </div>

            <div>
              <label className="fl">Password</label>
              <input {...register('password')} type="password" className="fi" placeholder="Min 6 characters" />
              <FieldError msg={errors.password?.message} />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={isLoading} style={{ marginTop: 6, gap: 8 }}>
              {isLoading ? <><Spinner size={16} /> Creating…</> : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#8A8AB0' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#7B2FBE', fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
