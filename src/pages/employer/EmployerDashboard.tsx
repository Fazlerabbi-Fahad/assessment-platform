import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchExamsThunk, deleteExamThunk } from '../../store/examSlice';
import type { Exam } from '../../types';
import { formatDuration, getExamStatus } from '../../lib/utils';
import { Spinner } from '../../components/ui';
import { Search, Plus, Clock, BookOpen, Layers, Users, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';

const PER = 6;

export default function EmployerDashboard() {
  const dispatch  = useAppDispatch();
  const { exams, isLoading } = useAppSelector((s) => s.exam);
  const [q, setQ] = useState('');
  const [pg, setPg] = useState(1);
  const [del, setDel] = useState<string | null>(null);

  useEffect(() => { dispatch(fetchExamsThunk()); }, [dispatch]);

  const filtered = exams.filter(e => e.title.toLowerCase().includes(q.toLowerCase()));
  const pages    = Math.max(1, Math.ceil(filtered.length / PER));
  const shown    = filtered.slice((pg - 1) * PER, pg * PER);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam permanently?')) return;
    setDel(id);
    await dispatch(deleteExamThunk(id));
    setDel(null);
  };

  return (
    <div className="page-body">
      {/* Page header */}
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, color: '#1A1A2E' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: '#8A8AB0', marginTop: 3 }}>Assessments</p>
      </div>

      <div className="section-card">
        {/* Card header */}
        <div className="section-head">
          <h2>Online Tests</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
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
            <Link to="/employer/exams/create">
              <button className="btn btn-primary btn-sm">
                <Plus size={13} strokeWidth={2.5} /> Create Online Test
              </button>
            </Link>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}><Spinner size={32} /></div>
          ) : shown.length === 0 ? (
            <EmptyState hasSearch={!!q} />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
                {shown.map(exam => (
                  <ExamCard key={exam._id} exam={exam} onDelete={handleDelete} isDeleting={del === exam._id} />
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

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <BookOpen size={32} color="#8A8AB0" />
      </div>
      <h3>{hasSearch ? 'No results found' : 'No test found!'}</h3>
      <p>{hasSearch ? 'Try a different search term.' : 'Sorry, there are no tests available yet. Start by creating one.'}</p>
      {!hasSearch && (
        <Link to="/employer/exams/create">
          <button className="btn btn-primary">Create Online Test</button>
        </Link>
      )}
    </div>
  );
}

function ExamCard({ exam, onDelete, isDeleting }: { exam: Exam; onDelete: (id: string) => void; isDeleting: boolean }) {
  const navigate = useNavigate();
  const status   = getExamStatus(exam.startTime, exam.endTime);
  const badgeMap = { active: 'badge-green', upcoming: 'badge-blue', ended: 'badge-gray' } as const;
  const labelMap = { active: 'Live', upcoming: 'Upcoming', ended: 'Ended' };

  return (
    <div className="exam-card">
      {/* Title + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <p className="exam-card-title" style={{ flex: 1 }}>{exam.title}</p>
        <span className={`badge ${badgeMap[status]}`}>{labelMap[status]}</span>
      </div>

      {/* Meta */}
      <div className="exam-meta">
        <span><Clock size={12} /> Duration: {formatDuration(exam.duration)}</span>
        <span><BookOpen size={12} /> Questions: {exam.questions?.length ?? 0}</span>
        <span><Layers size={12} /> Neg Marking: {exam.negativeMarking ? 'Yes' : 'No'}</span>
        <span><Users size={12} /> Slots: {exam.totalSlots}</span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(`/employer/exams/${exam._id}/candidates`)}
        >View</button>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => navigate(`/employer/exams/${exam._id}/candidates`)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8AB0', padding: '4px 6px', borderRadius: 5, display: 'flex', alignItems: 'center', transition: 'color .15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#7B2FBE')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8A8AB0')}
          ><Pencil size={13} /></button>
          <button
            onClick={() => onDelete(exam._id)}
            disabled={isDeleting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8AB0', padding: '4px 6px', borderRadius: 5, display: 'flex', alignItems: 'center', transition: 'color .15s', opacity: isDeleting ? .5 : 1 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#E53E3E')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8A8AB0')}
          ><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
}
