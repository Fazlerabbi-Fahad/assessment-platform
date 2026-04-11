import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExamTimer } from '../../hooks/useExamTimer';
import { useBehaviorTracking } from '../../hooks/useBehaviorTracking';
import type { Exam } from '../../types';
import { formatTimer } from '../../lib/utils';
import { Spinner } from '../../components/ui';
import api from '../../lib/api';
import { Navbar } from '../../components/shared/Navbar';
import { Footer } from '../../components/shared/Footer';
import { Clock, AlertTriangle, Send, ChevronLeft, ChevronRight, CheckCircle, Maximize2 } from 'lucide-react';

type Phase = 'loading' | 'briefing' | 'active' | 'submitted';
interface Result { score: number; total: number; pct: number; }

export default function ExamScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [phase, setPhase]       = useState<Phase>('loading');
  const [exam, setExam]         = useState<Exam | null>(null);
  const [answers, setAnswers]   = useState<Map<string, string | string[]>>(new Map());
  const [currentQ, setCurrentQ] = useState(0);
  const [error, setError]       = useState('');
  const [submitting, setSub]    = useState(false);
  const [result, setResult]     = useState<Result | null>(null);
  const [tabWarn, setTabWarn]   = useState(false);
  const slRef                   = useRef(0);

  const { enterFs, exitFs, getStats } = useBehaviorTracking(phase === 'active');

  /* Tab-switch warning flash */
  useEffect(() => {
    if (phase !== 'active') return;
    const h = () => { if (document.hidden) { setTabWarn(true); setTimeout(() => setTabWarn(false), 3000); } };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [phase]);

  /* Load exam */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/exams/${id}`);
        const check    = await api.get(`/submissions/check/${id}`);
        if (check.data.submitted) { navigate('/candidate/dashboard', { replace: true }); return; }
        setExam(data);
        setPhase('briefing');
      } catch { setError('Failed to load exam. Please go back.'); }
    })();
  }, [id]);

  /* Submit handler */
  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || !exam) return;
    setSub(true);
    try {
      const stats    = getStats();
      const { data } = await api.post('/submissions', {
        examId: id,
        answers: [...answers.entries()].map(([questionId, answer]) => ({ questionId, answer })),
        autoSubmitted: auto,
        timeTaken: exam.duration * 60 - slRef.current,
        ...stats,
      });
      await exitFs();
      setResult({ score: data.score, total: data.totalMarks, pct: data.totalMarks ? Math.round((data.score / data.totalMarks) * 100) : 0 });
      setPhase('submitted');
    } catch (e: any) {
      setError(e.response?.data?.message || 'Submission failed');
      setSub(false);
    }
  }, [submitting, exam, answers, id, getStats, exitFs]);

  const onTimeout = useCallback(() => handleSubmit(true), [handleSubmit]);
  const { secondsLeft, isCritical, stop } = useExamTimer(exam?.duration || 60, onTimeout);
  useEffect(() => { slRef.current = secondsLeft; }, [secondsLeft]);

  const setAns = (qId: string, val: string | string[]) =>
    setAnswers(prev => new Map(prev).set(qId, val));

  const toggleCb = (qId: string, optId: string) => {
    const cur = (answers.get(qId) as string[]) || [];
    setAns(qId, cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId]);
  };

  /* ── LOADING ── */
  if (phase === 'loading') return (
    <div className="app-shell">
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        {error ? <p style={{ color: '#E53E3E', maxWidth: 360, textAlign: 'center' }}>{error}</p> : <Spinner size={36} />}
      </div>
      <Footer />
    </div>
  );

  /* ── BRIEFING ── */
  if (phase === 'briefing' && exam) return (
    <div className="app-shell">
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card anim-up" style={{ width: '100%', maxWidth: 520, padding: 36 }}>
          <div style={{ width: 54, height: 54, borderRadius: 12, background: '#F3F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Clock size={26} color="#7B2FBE" />
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: '#1A1A2E', marginBottom: 6 }}>{exam.title}</h2>
          <p style={{ color: '#8A8AB0', fontSize: 13.5, marginBottom: 24 }}>Please read all instructions carefully before starting</p>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
            {[
              ['Duration',        `${exam.duration} min`],
              ['Questions',       exam.questions?.length || 0],
              ['Total Marks',     exam.questions?.reduce((s, q) => s + q.marks, 0) || 0],
              ['Negative Marking', exam.negativeMarking ? 'Yes' : 'No'],
            ].map(([k, v]) => (
              <div key={k as string} style={{ border: '1px solid #E2E4EE', borderRadius: 7, padding: '11px 14px', background: '#FAFAFC' }}>
                <p style={{ fontSize: 11, color: '#8A8AB0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</p>
                <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: '#1A1A2E', marginTop: 4 }}>{v}</p>
              </div>
            ))}
          </div>

          {/* Warning */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 7, padding: '12px 14px', marginBottom: 22, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
              <strong>Important:</strong> The exam enters fullscreen. Tab switching and fullscreen exits are tracked and reported to the employer. The exam auto-submits when time runs out.
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            style={{ gap: 8 }}
            onClick={async () => { await enterFs(); setPhase('active'); }}
          >
            <Maximize2 size={16} /> Start Exam (Fullscreen)
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#8A8AB0', cursor: 'pointer', fontSize: 13, padding: '8px' }}
          >← Go back</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  /* ── SUBMITTED ── */
  if (phase === 'submitted' && result) return (
    <div className="app-shell">
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div className="card anim-up" style={{ width: '100%', maxWidth: 440, padding: 40, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: result.pct >= 50 ? '#F0FFF4' : '#FFF5F5', border: `2px solid ${result.pct >= 50 ? '#9AE6B4' : '#FECACA'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <CheckCircle size={32} color={result.pct >= 50 ? '#38A169' : '#E53E3E'} />
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#1A1A2E', marginBottom: 6 }}>
            {result.pct >= 70 ? 'Excellent! 🎉' : result.pct >= 50 ? 'Well Done! 👍' : 'Better Luck Next Time'}
          </h2>
          <p style={{ color: '#8A8AB0', marginBottom: 28, fontSize: 14 }}>Your exam has been submitted successfully</p>

          <div style={{ background: '#FAFAFC', border: '1px solid #E2E4EE', borderRadius: 10, padding: 26, marginBottom: 24 }}>
            <p style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: 54, color: result.pct >= 70 ? '#38A169' : result.pct >= 50 ? '#D97706' : '#E53E3E', lineHeight: 1 }}>
              {result.pct}%
            </p>
            <p style={{ color: '#8A8AB0', marginTop: 8, fontSize: 13.5 }}>{result.score} out of {result.total} marks</p>
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/candidate/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );

  /* ── ACTIVE EXAM ── */
  if (phase !== 'active' || !exam) return null;

  const questions = exam.questions || [];
  const q         = questions[currentQ];
  if (!q) return null;

  const answered  = answers.get(q.id);
  const progress  = ((currentQ + 1) / questions.length) * 100;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F4F6FA' }}>

      {/* Tab warning overlay */}
      {tabWarn && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(229,62,62,.08)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ background: '#fff', border: '2px solid #FECACA', borderRadius: 10, padding: '16px 26px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)' }}>
            <AlertTriangle size={20} color="#E53E3E" />
            <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: '#991B1B' }}>Tab switch detected — this is being recorded!</span>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E2E4EE', padding: '10px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
        <div>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: '#1A1A2E' }}>{exam.title}</p>
          <p style={{ fontSize: 12, color: '#8A8AB0', marginTop: 1 }}>{answers.size} / {questions.length} answered</p>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: isCritical ? '#FFF5F5' : '#F3F0FF', border: `1.5px solid ${isCritical ? '#FECACA' : '#D4C5F0'}`, borderRadius: 8, padding: '8px 18px' }}>
          <Clock size={15} color={isCritical ? '#E53E3E' : '#7B2FBE'} />
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: isCritical ? '#E53E3E' : '#7B2FBE', fontVariantNumeric: 'tabular-nums', letterSpacing: '.02em' }}>
            {formatTimer(secondsLeft)}
          </span>
        </div>

        <button
          className="btn btn-primary btn-sm"
          style={{ gap: 7 }}
          disabled={submitting}
          onClick={() => { if (confirm('Submit exam now? You cannot change answers after submitting.')) { stop(); handleSubmit(false); } }}
        >
          <Send size={13} /> {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#E2E4EE' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: '#7B2FBE', transition: 'width .3s ease' }} />
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', maxWidth: 1100, margin: '0 auto', width: '100%', padding: '26px 24px', gap: 22 }}>

        {/* Question panel */}
        <div style={{ flex: 1 }} key={q.id}>
          <div className="card anim-fade" style={{ padding: 28 }}>
            {/* Q meta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8A8AB0', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                Question {currentQ + 1} / {questions.length}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="badge badge-green">+{q.marks} marks</span>
                <span className="badge badge-gray">
                  {q.type === 'radio' ? 'Single choice' : q.type === 'checkbox' ? 'Multi choice' : 'Text answer'}
                </span>
              </div>
            </div>

            {/* Question text */}
            <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 16, color: '#1A1A2E', lineHeight: 1.6, marginBottom: 22 }}>
              {q.title}
            </p>

            {/* Answer area */}
            {q.type === 'text' ? (
              <textarea
                value={(answered as string) || ''}
                onChange={e => setAns(q.id, e.target.value)}
                className="fi"
                rows={5}
                placeholder="Type your answer here…"
                style={{ resize: 'vertical' }}
              />
            ) : (
              <div>
                {q.options?.map(opt => {
                  const sel = q.type === 'radio'
                    ? answered === opt.id
                    : ((answered as string[]) || []).includes(opt.id);
                  return (
                    <div
                      key={opt.id}
                      className={`q-opt ${sel ? 'sel' : ''}`}
                      onClick={() => q.type === 'radio' ? setAns(q.id, opt.id) : toggleCb(q.id, opt.id)}
                    >
                      <div style={{ width: 18, height: 18, flexShrink: 0, borderRadius: q.type === 'radio' ? '50%' : 4, border: `2px solid ${sel ? '#7B2FBE' : '#CACDE0'}`, background: sel ? '#7B2FBE' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .14s' }}>
                        {sel && <div style={{ width: q.type === 'radio' ? 6 : 8, height: q.type === 'radio' ? 6 : 8, borderRadius: q.type === 'radio' ? '50%' : 2, background: '#fff' }} />}
                      </div>
                      <span style={{ flex: 1 }}>{opt.text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 26, paddingTop: 18, borderTop: '1px solid #F0F0F6' }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(i => i - 1)}
              ><ChevronLeft size={14} /> Previous</button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: '#7B2FBE', borderColor: '#D4C5F0' }}
                disabled={currentQ === questions.length - 1}
                onClick={() => setCurrentQ(i => i + 1)}
              >Next <ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Navigator sidebar */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div className="card" style={{ padding: 16, position: 'sticky', top: 72 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#8A8AB0', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Navigator</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 14 }}>
              {questions.map((qq, i) => {
                const isAns = answers.has(qq.id);
                const isCur = i === currentQ;
                return (
                  <button
                    key={qq.id}
                    onClick={() => setCurrentQ(i)}
                    style={{ aspectRatio: '1', borderRadius: 5, border: `1.5px solid ${isCur ? '#7B2FBE' : isAns ? '#38A169' : '#CACDE0'}`, background: isCur ? '#7B2FBE' : isAns ? '#DCFCE7' : '#fff', color: isCur ? '#fff' : isAns ? '#16A34A' : '#8A8AB0', fontSize: 11.5, fontWeight: 700, cursor: 'pointer', transition: 'all .12s' }}
                  >{i + 1}</button>
                );
              })}
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {[['#7B2FBE', '#7B2FBE', 'Current'], ['#38A169', '#DCFCE7', 'Answered'], ['#CACDE0', '#fff', 'Unanswered']].map(([border, bg, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: bg, border: `1.5px solid ${border}`, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: '#8A8AB0' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
