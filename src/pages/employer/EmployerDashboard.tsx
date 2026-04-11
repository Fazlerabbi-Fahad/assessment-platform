import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchExamsThunk, deleteExamThunk } from "../../store/examSlice";
import type { Exam } from "../../types";
import { formatDuration, getExamStatus } from "../../lib/utils";
import { Spinner } from "../../components/ui";
import {
  Search,
  Plus,
  Clock,
  BookOpen,
  Layers,
  Users,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";

const PER = 6;

export default function EmployerDashboard() {
  const dispatch = useAppDispatch();
  const { exams, isLoading } = useAppSelector((s) => s.exam);
  const [q, setQ] = useState("");
  const [pg, setPg] = useState(1);
  const [del, setDel] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchExamsThunk());
  }, [dispatch]);

  const filtered = exams.filter((e) =>
    e.title.toLowerCase().includes(q.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const shown = filtered.slice((pg - 1) * PER, pg * PER);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exam permanently?")) return;
    setDel(id);
    await dispatch(deleteExamThunk(id));
    setDel(null);
  };

  return (
    <div className="page-body">
      {/* Page header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 600, color: "#334155" }}>
          Online Tests
        </h1>
        <div
          style={{
            width: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="search-box">
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPg(1);
              }}
              className="fi"
              placeholder="Search by exam title"
              style={{
                paddingRight: 0,
                width: 400,
                padding: "7px 30px 7px 7px",
                fontSize: 12,
                borderRadius: 8,
                height: 48,
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.04)",
              }}
            />
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                width="30"
                height="30"
                rx="15"
                fill="#673FED"
                fill-opacity="0.1"
              />
              <path
                d="M19.333 19.75L22.6663 23.0833"
                stroke="url(#paint0_linear_1_7476)"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M20.9997 15.5833C20.9997 18.805 18.388 21.4166 15.1663 21.4166C11.9447 21.4166 9.33301 18.805 9.33301 15.5833C9.33301 12.3617 11.9447 9.75 15.1663 9.75"
                stroke="url(#paint1_linear_1_7476)"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.9167 8.91699L19.1316 9.49785C19.4134 10.2595 19.5543 10.6403 19.8322 10.9182C20.11 11.196 20.4908 11.3369 21.2525 11.6187L21.8333 11.8337L21.2525 12.0486C20.4908 12.3304 20.11 12.4714 19.8322 12.7492C19.5543 13.027 19.4134 13.4078 19.1316 14.1695L18.9167 14.7503L18.7017 14.1695C18.4199 13.4078 18.279 13.027 18.0012 12.7492C17.7233 12.4714 17.3425 12.3304 16.5808 12.0486L16 11.8337L16.5808 11.6187C17.3425 11.3369 17.7233 11.196 18.0012 10.9182C18.279 10.6403 18.4199 10.2595 18.7017 9.49785L18.9167 8.91699Z"
                stroke="url(#paint2_linear_1_7476)"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_1_7476"
                  x1="20.9996"
                  y1="19.75"
                  x2="20.9996"
                  y2="23.0833"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#27ACFF" />
                  <stop offset="0.504808" stop-color="#A000E9" />
                  <stop offset="1" stop-color="#673FED" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_1_7476"
                  x1="15.1663"
                  y1="9.75"
                  x2="15.1663"
                  y2="21.4166"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#27ACFF" />
                  <stop offset="0.504808" stop-color="#A000E9" />
                  <stop offset="1" stop-color="#673FED" />
                </linearGradient>
                <linearGradient
                  id="paint2_linear_1_7476"
                  x1="18.9167"
                  y1="8.91699"
                  x2="18.9167"
                  y2="14.7503"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stop-color="#27ACFF" />
                  <stop offset="0.504808" stop-color="#A000E9" />
                  <stop offset="1" stop-color="#673FED" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <Link to="/employer/exams/create">
            <button
              className="btn btn-primary btn-sm"
              style={{
                backgroundColor: "#6633FF",
                borderRadius: "10px",
                fontSize: 16,
                color: "#fff",
                fontWeight: 600,
                padding: "16px 24px",
              }}
            >
              Create Online Test
            </button>
          </Link>
        </div>
      </div>

      <div style={{ borderRadius: 10, overflow: "hidden" }}>
        {/* Body */}
        <div>
          {isLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "48px 0",
              }}
            >
              <Spinner size={32} />
            </div>
          ) : shown.length === 0 ? (
            <EmptyState hasSearch={!!q} />
          ) : (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 14,
                }}
              >
                {shown.map((exam) => (
                  <ExamCard
                    key={exam._id}
                    exam={exam}
                    onDelete={handleDelete}
                    isDeleting={del === exam._id}
                  />
                ))}
              </div>
              {pages > 1 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 6,
                    marginTop: 18,
                  }}
                >
                  <div className="pager">
                    <button
                      className="pager-btn"
                      onClick={() => setPg((p) => p - 1)}
                      disabled={pg === 1}
                    >
                      <ChevronLeft size={13} />
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        className={`pager-btn ${n === pg ? "active" : ""}`}
                        onClick={() => setPg(n)}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      className="pager-btn"
                      onClick={() => setPg((p) => p + 1)}
                      disabled={pg === pages}
                    >
                      <ChevronRight size={13} />
                    </button>
                  </div>
                  <span style={{ fontSize: 12, color: "#8A8AB0" }}>
                    Online Test Page {pg}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <BookOpen size={32} color="#8A8AB0" />
      </div>
      <h3>{hasSearch ? "No results found" : "No test found!"}</h3>
      <p>
        {hasSearch
          ? "Try a different search term."
          : "Sorry, there are no tests available yet. Start by creating one."}
      </p>
      {!hasSearch && (
        <Link to="/employer/exams/create">
          <button className="btn btn-primary">Create Online Test</button>
        </Link>
      )}
    </div>
  );
}

function ExamCard({
  exam,
  onDelete,
  isDeleting,
}: {
  exam: Exam;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const navigate = useNavigate();
  const status = getExamStatus(exam.startTime, exam.endTime);
  const badgeMap = {
    active: "badge-green",
    upcoming: "badge-blue",
    ended: "badge-gray",
  } as const;
  const labelMap = { active: "Live", upcoming: "Upcoming", ended: "Ended" };

  return (
    <div className="exam-card">
      {/* Title + badge */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <p className="exam-card-title" style={{ flex: 1 }}>
          {exam.title}
        </p>
        <span className={`badge ${badgeMap[status]}`}>{labelMap[status]}</span>
      </div>

      {/* Meta */}
      <div className="exam-meta">
        <span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.5 11C15.5 9.067 13.933 7.5 12 7.5C10.067 7.5 8.5 9.067 8.5 11C8.5 12.933 10.067 14.5 12 14.5C13.933 14.5 15.5 12.933 15.5 11Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M15.4825 11.3499C15.8045 11.4475 16.146 11.5 16.4998 11.5C18.4328 11.5 19.9998 9.933 19.9998 8C19.9998 6.067 18.4328 4.5 16.4998 4.5C14.6849 4.5 13.1926 5.8814 13.0171 7.65013"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M10.9827 7.65013C10.8072 5.8814 9.31492 4.5 7.5 4.5C5.567 4.5 4 6.067 4 8C4 9.933 5.567 11.5 7.5 11.5C7.85381 11.5 8.19535 11.4475 8.51727 11.3499"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22 16.5C22 13.7386 19.5376 11.5 16.5 11.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17.5 19.5C17.5 16.7386 15.0376 14.5 12 14.5C8.96243 14.5 6.5 16.7386 6.5 19.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7.5 11.5C4.46243 11.5 2 13.7386 2 16.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>{" "}
          <span style={{ color: "#64748B", fontWeight: 400 }}>
            Candidates:{" "}
          </span>
          <span style={{ color: "#334155", fontWeight: 500 }}>1</span>
        </span>
        <span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 17H16"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M8 13H12"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>{" "}
          <span style={{ color: "#64748B", fontWeight: 400 }}>
            Question Set
          </span>
          :{" "}
          <span style={{ color: "#334155", fontWeight: 500 }}>
            {exam.questions?.length ?? 0}
          </span>
        </span>
        <span>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 22C13.1046 22 14 21.1046 14 20C14 18.8954 13.1046 18 12 18C10.8954 18 10 18.8954 10 20C10 21.1046 10.8954 22 12 22Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 2C8.96243 2 6.5 4.46243 6.5 7.5C6.5 10.0176 8.1915 12.14 10.5 12.793L12 15L13.5 12.793C15.8085 12.14 17.5 10.0176 17.5 7.5C17.5 4.46243 15.0376 2 12 2Z"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 5V7.5L13.5 8.5"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M14 20H21M10 20H3"
              stroke="#9CA3AF"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>{" "}
          <span style={{ color: "#64748B", fontWeight: 400 }}>Exam Slots</span>:{" "}
          <span style={{ color: "#334155", fontWeight: 500 }}>
            {exam.totalSlots}
          </span>
        </span>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/employer/exams/${exam._id}/candidates`)}
        >
          View Candidates
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          <button
            onClick={() => navigate(`/employer/exams/${exam._id}/candidates`)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8A8AB0",
              padding: "4px 6px",
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              transition: "color .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#7B2FBE")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8AB0")}
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDelete(exam._id)}
            disabled={isDeleting}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8A8AB0",
              padding: "4px 6px",
              borderRadius: 5,
              display: "flex",
              alignItems: "center",
              transition: "color .15s",
              opacity: isDeleting ? 0.5 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E53E3E")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8AB0")}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
