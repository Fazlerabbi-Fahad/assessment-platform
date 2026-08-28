# AssessIQ — Online Assessment Platform

A full-stack online assessment platform with an **Employer Panel** and **Candidate Panel**, built with React + Vite, Node.js/Express, and MongoDB.

---

## 🚀 Live Demo

- **Frontend:** https://assessmentplatformbd.web.app/login
- **Backend API:** https://assessment-platform-api.vercel.app/api

## 📽️ Video Recording

_Not recorded yet._

---

## 🛠️ Tech Stack

| Layer              | Technology                      |
| ------------------ | ------------------------------- |
| Frontend Framework | React 18 + Vite + TypeScript    |
| Routing            | React Router DOM v6             |
| State Management   | Zustand                         |
| Forms              | React Hook Form                 |
| Validation         | Zod + RHF native validation     |
| Styling            | Tailwind CSS v3 + CSS Variables |
| HTTP Client        | Axios with JWT interceptors     |
| Backend            | Node.js + Express               |
| Database           | MongoDB + Mongoose              |
| Auth               | JWT + bcryptjs                  |

---

## ✨ Features

### Employer Panel

- Register / Login with JWT auth
- Dashboard with live stats (total exams, active, submissions, questions)
- Create exams via 2-step multi-form (Basic Info → Questions)
- Add / Edit / Delete questions via modal (Radio, Checkbox, Text types)
- View candidate submissions — scores, time taken, tab switches, fullscreen exits
- Delete exams

### Candidate Panel

- Register / Login
- Browse live / upcoming / ended exam cards
- Full exam screen with countdown timer
- Question navigator sidebar
- Radio, Checkbox, Text answer types
- Behavioral tracking: tab switch detection, fullscreen exit detection
- Auto-submit on timeout, manual submit with confirmation
- Result screen with score after submission

---

## 🗂️ Project Structure

```
assessment-platform/
├── backend/
│   ├── models/         User.js  Exam.js  Submission.js
│   ├── routes/         auth.js  exams.js  submissions.js
│   ├── middleware/     auth.js
│   ├── .env
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── employer/   QuestionModal  StepBasicInfo  StepQuestions
    │   │   ├── shared/     Navbar  ProtectedRoute
    │   │   └── ui/         Spinner  Alert  StatCard  FieldError
    │   ├── hooks/          useExamTimer  useBehaviorTracking
    │   ├── lib/            api.ts  utils.ts
    │   ├── pages/
    │   │   ├── auth/       LoginPage  RegisterPage
    │   │   ├── employer/   EmployerDashboard  CreateExamPage  ViewCandidatesPage
    │   │   └── candidate/  CandidateDashboard  ExamScreen
    │   ├── store/          authStore.ts  examStore.ts
    │   ├── types/          index.ts
    │   ├── App.tsx
    │   └── index.css
    ├── .env
    └── index.html
```

---

## ⚙️ Setup

### Backend

```bash
cd backend
npm install
npm run dev    # nodemon
npm start      # production
```

`.env` is pre-configured with MongoDB URI.

### Frontend

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
npm run build  # production build
```

`.env` is pre-configured pointing to `http://localhost:5001/api`.

---

## 🌐 Deployment

**Backend → Render:**
Root: `backend` | Build: `npm install` | Start: `node server.js` | Add env vars.

**Frontend → Vercel:**
Root: `frontend` | Framework: Vite | Add `VITE_API_URL=https://your-backend.onrender.com/api`

---

## ❓ Additional Questions

### MCP Integration

Yes, I have worked with MCP in Claude-based development workflows. For this project, MCP could be used in several high-value ways:

- **Figma MCP** — Sync design tokens directly from Figma into the codebase, keeping the exam UI pixel-perfect without manual design-to-code translation.
- **Supabase MCP** — Replace MongoDB/Express with Supabase for real-time exam features: live candidate presence tracking, instant submission counters on the employer dashboard without polling.
- **Chrome DevTools MCP** — Automate Lighthouse and accessibility audits in CI so the exam screen always meets WCAG standards.
- **GitHub MCP** — Automated PR reviews that flag duplicate component logic, missing types, or accessibility regressions before merge.

The most impactful integration would be **Supabase MCP** for real-time updates — employers would see candidates actively inside an exam, live.

---

### AI Tools for Development

| Tool                   | Use                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------- |
| **Claude (claude.ai)** | Architecture, complex hook logic (timer + auto-submit), TypeScript debugging across full stack |
| **Claude Code**        | Agentic terminal coding — file generation, build checks, multi-file refactoring in one pass    |
| **GitHub Copilot**     | Inline autocomplete for repetitive patterns (form fields, API calls, style objects)            |
| **ChatGPT**            | Quick API reference for react-hook-form useFieldArray, Zustand patterns                        |

**Recommended workflow:** Claude for architecture → Copilot for inline completion → Claude Code for cross-file refactoring and build verification.

---

### Offline Mode Strategy

**1. Detect and notify**

```ts
window.addEventListener("offline", () =>
  showBanner("You are offline — answers saved locally"),
);
window.addEventListener("online", () => hideBanner());
```

**2. Persist answers on every change**

```ts
localStorage.setItem(`exam_answers_${examId}`, JSON.stringify([...answersMap]));
```

Rehydrate on mount to survive page refreshes mid-exam.

**3. Wall-clock timer (already implemented)**
`useExamTimer` anchors to `Date.now()` at start — stays accurate through disconnections, tab sleeps, and device locks.

**4. Service Worker + Background Sync**
Intercept `POST /api/submissions` — if offline, queue in IndexedDB. On reconnect, the `sync` event auto-retries.

```ts
self.addEventListener("sync", (event) => {
  if (event.tag === "submit-exam") event.waitUntil(flushQueuedSubmissions());
});
```

**5. Server-side guard**
Backend validates `startedAt + duration >= submittedAt` to prevent gaming via offline manipulation.

---

## 🔒 Security

- All routes JWT-protected via `Authorization: Bearer <token>`
- Role-based access control — employers cannot submit, candidates cannot create
- Passwords hashed with bcrypt (12 salt rounds)
- `isCorrect` field stripped server-side before sending to candidates
- Behavioral logs stored per submission for employer audit

---

## 📝 License

MIT
