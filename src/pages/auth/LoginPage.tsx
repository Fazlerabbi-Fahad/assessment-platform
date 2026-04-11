import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "../../store";
import { loginThunk, clearError } from "../../store/authSlice";
import { FieldError, Alert, Spinner } from "../../components/ui";
import { Footer } from "../../components/shared/Footer";
import { Logo } from "../../components/shared/Logo";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
type F = z.infer<typeof schema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    dispatch(clearError());
    const res = await dispatch(
      loginThunk({ email: data.email, password: data.password }),
    );
    if (loginThunk.fulfilled.match(res)) {
      navigate(
        res.payload.user.role === "employer"
          ? "/employer/dashboard"
          : "/candidate/dashboard",
        { replace: true },
      );
    }
  };

  return (
    <div className="auth-shell">
      {/* Nav */}
      <header className="auth-nav">
        <Logo />
        <span
          style={{
            fontFamily: "Inter",
            fontWeight: 600,
            fontSize: 24,
            color: "#334155",
          }}
        >
          Akij Resource
        </span>
        <div style={{ width: 120 }} />
      </header>

      {/* Center */}
      <div className="auth-center" style={{ backgroundColor: "#f9fafc" }}>
        <div>
          <h2
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 24,
              color: "#334155",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Sign In
          </h2>
          <div className="auth-card anim-up">
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              {error && <Alert type="error">{error}</Alert>}

              <div>
                <label className="fl">Email/ User ID</label>
                <input
                  {...register("email")}
                  type="email"
                  className="fi"
                  placeholder="Enter your email/User ID"
                />
                <FieldError msg={errors.email?.message} />
              </div>

              <div>
                <label className="fl">Password</label>
                <input
                  {...register("password")}
                  type="password"
                  className="fi"
                  placeholder="Enter your password"
                />
                <FieldError msg={errors.password?.message} />
              </div>

              <div style={{ textAlign: "right", marginTop: -15 }}>
                <a
                  href="#"
                  style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={isLoading}
                style={{ marginTop: 4, gap: 8 }}
              >
                {isLoading ? (
                  <>
                    <Spinner size={16} /> Signing in…
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                marginTop: 5,
                fontSize: 14,
                color: "#8A8AB0",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
