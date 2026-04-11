import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import type { Exam, Submission } from '../../types';
import { formatDateTime, formatDuration } from '../../lib/utils';
import { Spinner } from '../../components/ui';
import { ChevronRight, AlertTriangle, Users, Award, TrendingUp } from 'lucide-react';

export default function ViewCandidatesPage() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam]             = useState<Exam | null>(null);
  const [submissions, setSubs]      = useState<Submission[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [eRes, sRes] = await Promise.all([api.get(`/exams/${id}`), api.get(`/exams/${id}/candidates`)]);
        setExam(eRes.data);
        setSubs(sRes.data);
      } finally { setLoading(false); }
    })();
  }, [id]);

  const avgScore = submissions.length
    ? (submissions.reduce((s, x) => s + (x.totalMarks ? (x.score / x.totalMarks) * 100 : 0), 0) / submissions.length).toFixed(1)
    : null;

  return (
    <div className="page-body">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#8A8AB0', marginBottom: 20 }}>
        <Link to="/employer/dashboard" style={{ color: '#7B2FBE', fontWeight: 500 }}>Dashboard</Link>
        <ChevronRight size={13} />
        <span style={{ color: '#1A1A2E', fontWeight: 500 }}>{exam?.title ?? 'Candidates'}</span>
      </div>

      {/* Stats row */}
      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Submissions', value: submissions.length,          icon: <Users size={18} />,   color: '#7B2FBE' },
            { label: 'Average Score',     value: avgScore ? `${avgScore}%` : '—', icon: <Award size={18} />,   color: '#38A169' },
            { label: 'Avg Tab Switches',  value: submissions.length ? (submissions.reduce((s,x)=>s+x.tabSwitchCount,0)/submissions.length).toFixed(1) : '—', icon: <TrendingUp size={18} />, color: '#DD6B20' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 9, background: `${s.color}18`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
              <div>
                <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#1A1A2E', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: '#8A8AB0', marginTop: 3 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-card">
        <div className="section-head">
          <h2>{exam?.title ?? 'Candidates'}</h2>
          <span style={{ fontSize: 13, color: '#8A8AB0' }}>{submissions.length} submission{submissions.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}><Spinner size={32} /></div>
        ) : submissions.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><Users size={32} color="#8A8AB0" /></div>
            <h3>No submissions yet</h3>
            <p>Candidates haven't submitted this exam yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Candidate</th>
                  <th>Score</th>
                  <th>Time Taken</th>
                  <th>Tab Switches</th>
                  <th>FS Exits</th>
                  <th>Submitted</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub, i) => {
                  const c   = sub.candidate as any;
                  const pct = sub.totalMarks ? Math.round((sub.score / sub.totalMarks) * 100) : 0;
                  const scoreColor = pct >= 70 ? '#38A169' : pct >= 40 ? '#D97706' : '#E53E3E';
                  return (
                    <tr key={sub._id}>
                      <td style={{ color: '#B0B4CC', fontWeight: 600 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: 12, background: '#7B2FBE' }}>
                            {c?.name?.[0] ?? '?'}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: '#1A1A2E', fontSize: 13 }}>{c?.name}</p>
                            <p style={{ fontSize: 11, color: '#8A8AB0' }}>{c?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 15, color: scoreColor }}>{pct}%</span>
                        <p style={{ fontSize: 11, color: '#8A8AB0' }}>{sub.score}/{sub.totalMarks} pts</p>
                      </td>
                      <td>{sub.timeTaken ? formatDuration(Math.round(sub.timeTaken / 60)) : '—'}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: sub.tabSwitchCount > 2 ? '#E53E3E' : sub.tabSwitchCount > 0 ? '#D97706' : '#38A169' }}>
                          {sub.tabSwitchCount > 2 && <AlertTriangle size={12} />}
                          {sub.tabSwitchCount}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: sub.fullscreenExitCount > 0 ? '#D97706' : '#38A169' }}>{sub.fullscreenExitCount}</td>
                      <td style={{ fontSize: 12, color: '#8A8AB0', whiteSpace: 'nowrap' }}>{formatDateTime(sub.submittedAt)}</td>
                      <td>
                        <span className={`badge ${sub.autoSubmitted ? 'badge-amber' : 'badge-green'}`}>
                          {sub.autoSubmitted ? 'Auto' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
