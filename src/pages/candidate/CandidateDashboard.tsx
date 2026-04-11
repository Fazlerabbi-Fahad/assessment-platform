import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchExamsThunk } from '../../store/examSlice';
import type { Exam } from '../../types';
import { formatDateTime, formatDuration, getExamStatus } from '../../lib/utils';
import { Spinner } from '../../components/ui';
import api from '../../lib/api';
import { Search, Clock, BookOpen, MinusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const PER = 6;

export default function CandidateDashboard() {
  const dispatch = useAppDispatch();
  const { exams, isLoading } = useAppSelector((s) => s.exam);
  const [submitted, setSubmitted]   = useState<Set<string>>(new Set());
  const [q, setQ]                   = useState('');
  const [pg, setPg]                 = useState(1);
  const navigate = useNavigate();

  useEffect(() => { dispatch(fetchExamsThunk()); }, [dispatch]);

  useEffect(() => {
    if (!exams.length) return;
    (async () => {
      const results = await Promise.allSettled(exams.map(e => api.get(`/submissions/check/${e._id}`)));
      const ids = new Set<string>();
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value.data.submitted) ids.add(exams[i]._id);
      });
      setSubmitted(ids);
    })();
  }, [exams]);

  const filtered = exams.filter(e => e.title.toLowerCase().includes(q.toLowerCase()));
  const pages    = Math.max(1, Math.ceil(filtered.length / PER));
  const shown    = filtered.slice((pg - 1) * PER, pg * PER);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#1A1A2E' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#8A8AB0', marginTop: 3 }}>Assessments</p>
      </div>

      <div className="section-card">
        <div className="section-head">
          <h2>Online Tests</h2>
          <div className="search-box">
            <Search size={13} />
            <input
              value={q}
              onChange={e => { setQ(e.target.value); setPg(1); }}
              className="fi"
              placeholder="Search tests…"
              style={{ paddingLeft: 30, width: 200, padding: '7px 12px 7px 30px', fontSize: 13 }}
            />
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}><Spinner size={32} /></div>
          ) : shown.length === 0 ? (
            <div className="empty">
              <div className="empty-icon"><BookOpen size={32} color="#8A8AB0" /></div>
              <h3>{q ? 'No results found' : 'No test found!'}</h3>
              <p>{q ? 'Try a different search term.' : 'Sorry, there are no tests available right now. Check back later.'}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {shown.map(exam => (
                  <CandidateCard
                    key={exam._id}
                    exam={exam}
                    submitted={submitted.has(exam._id)}
                    onStart={() => navigate(`/candidate/exam/${exam._id}`)}
                  />
                ))}
              </div>

              {pages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 18 }}>
                  <div className="pager">
                    <button className="pager-btn" onClick={() => setPg(p => p - 1)} disabled={pg === 1}><ChevronLeft size={13} /></button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                      <button key={n} className={`pager-btn ${n === pg ? 'active' : ''}`} onClick={() => setPg(n)}>{n}</button>
                    ))}
                    <button className="pager-btn" onClick={() => setPg(p => p + 1)} disabled={pg === pages}><ChevronRight size={13} /></button>
                  </div>
                  <span style={{ fontSize: 12, color: '#8A8AB0' }}>Online Test Page {pg}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateCard({ exam, submitted, onStart }: { exam: Exam; submitted: boolean; onStart: () => void }) {
  const status   = getExamStatus(exam.startTime, exam.endTime);
  const badgeMap = { active: 'badge-green', upcoming: 'badge-blue', ended: 'badge-gray' } as const;
  const labelMap = { active: 'Live', upcoming: 'Upcoming', ended: 'Ended' };

  return (
    <div className="exam-card">
      {/* Title + status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <p className="exam-card-title" style={{ flex: 1 }}>{exam.title}</p>
        {submitted
          ? <span className="badge badge-purple">Submitted</span>
          : <span className={`badge ${badgeMap[status]}`}>{labelMap[status]}</span>
        }
      </div>

      {/* Meta */}
      <div className="exam-meta">
        <span><Clock size={12} /> Duration: {formatDuration(exam.duration)}</span>
        <span><BookOpen size={12} /> Questions: {exam.questions?.length ?? 0}</span>
        <span><MinusCircle size={12} /> Neg Marking: {exam.negativeMarking ? 'Yes' : 'No'}</span>
      </div>

      {/* CTA */}
      {submitted ? (
        <button disabled className="btn btn-ghost btn-sm" style={{ opacity: .65 }}>Already Submitted</button>
      ) : status === 'ended' ? (
        <button disabled className="btn btn-ghost btn-sm" style={{ opacity: .65 }}>Exam Ended</button>
      ) : status === 'upcoming' ? (
        <button disabled className="btn btn-ghost btn-sm" style={{ opacity: .65 }}>
          Starts {formatDateTime(exam.startTime)}
        </button>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={onStart}>Start</button>
      )}
    </div>
  );
}
