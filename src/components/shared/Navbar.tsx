import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/authSlice";
import { ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "./Logo";

/* Avatar color from name */
function avatarColor(name = "") {
  const palette = [
    "#7B2FBE",
    "#DB2777",
    "#059669",
    "#D97706",
    "#2563EB",
    "#DC2626",
    "#0891B2",
  ];
  return palette[(name.charCodeAt(0) ?? 0) % palette.length];
}

export function Navbar() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const dash =
    user?.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <nav className="topnav">
      {/* Logo */}
      <Link to={dash}>
        <Logo />
      </Link>

      {/* Centre label for candidate */}
      {user?.role === "candidate" && (
        <span
          style={{
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: 15,
            color: "#1A1A2E",
          }}
        >
          AKIj Resource
        </span>
      )}

      {/* Right side */}
      {user && (
        <div
          ref={ref}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            position: "relative",
          }}
        >
          <button
            onClick={() => setOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 2,
            }}
          >
            <div
              className="avatar"
              style={{ background: avatarColor(user.name) }}
            >
              {initials}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>
                {user.name}
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "#64748B",
                  textTransform: "capitalize",
                  marginTop: 2,
                }}
              >
                {user.role}
              </p>
            </div>
            <ChevronDown
              size={13}
              color="#8A8AB0"
              style={{
                transition: "transform .2s",
                transform: open ? "rotate(180deg)" : "none",
              }}
            />
          </button>

          {open && (
            <div className="dropdown">
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid #F3F4F6",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>
                  {user.name}
                </p>
                <p style={{ fontSize: 11, color: "#8A8AB0", marginTop: 2 }}>
                  {user.email}
                </p>
              </div>
              <div
                className="dropdown-item"
                onClick={() => {
                  setOpen(false);
                  navigate(dash);
                }}
              >
                <LayoutDashboard size={14} /> Dashboard
              </div>
              <div
                className="dropdown-item danger"
                onClick={() => {
                  dispatch(logout());
                  navigate("/login");
                }}
              >
                <LogOut size={14} /> Sign Out
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
