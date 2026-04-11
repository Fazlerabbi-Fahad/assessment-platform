import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "../../store";
import { registerThunk, clearError } from "../../store/authSlice";
import { FieldError, Alert, Spinner } from "../../components/ui";
import { Footer } from "../../components/shared/Footer";
import { Logo } from "../../components/shared/Logo";

const schema = z.object({
  name: z.string().min(2, "Min 2 chars"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 chars"),
  role: z.enum(["employer", "candidate"]),
  company: z.string().optional(),
});
type F = z.infer<typeof schema>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { role: "candidate" },
  });
  const role = watch("role");

  const onSubmit = async (data: F) => {
    dispatch(clearError());
    const res = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(res)) {
      navigate(
        data.role === "employer"
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
            Create Account
          </h2>
          <div className="auth-card anim-up">
            <form
              onSubmit={handleSubmit(onSubmit)}
              style={{ display: "flex", flexDirection: "column", gap: 18 }}
            >
              {error && <Alert type="error">{error}</Alert>}

              {/* Role picker */}
              <div>
                <label className="fl">Account Type</label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {(["candidate", "employer"] as const).map((r) => (
                    <label
                      key={r}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "9px 14px",
                        border: `1.5px solid ${role === r ? "#7B2FBE" : "#CACDE0"}`,
                        borderRadius: 7,
                        cursor: "pointer",
                        background: role === r ? "#F3F0FF" : "#fff",
                        transition: "all .15s",
                      }}
                    >
                      <input
                        {...register("role")}
                        type="radio"
                        value={r}
                        style={{
                          accentColor: "#7B2FBE",
                          width: 14,
                          height: 14,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: role === r ? "#7B2FBE" : "#4A4A6A",
                          textTransform: "capitalize",
                        }}
                      >
                        {r}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="fl">Full Name</label>
                <input
                  {...register("name")}
                  className="fi"
                  placeholder="Your full name"
                />
                <FieldError msg={errors.name?.message} />
              </div>

              {role === "employer" && (
                <div>
                  <label className="fl">Company</label>
                  <input
                    {...register("company")}
                    className="fi"
                    placeholder="Company name"
                  />
                </div>
              )}

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
                  placeholder="Min 6 characters"
                />
                <FieldError msg={errors.password?.message} />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={isLoading}
                style={{ marginTop: 4, gap: 8 }}
              >
                {isLoading ? (
                  <>
                    <Spinner size={16} /> Creating…
                  </>
                ) : (
                  "Create Account"
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
              Already have an account?{" "}
              <Link
                to="/login"
                style={{ fontSize: 14, color: "#334155", fontWeight: 500 }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
