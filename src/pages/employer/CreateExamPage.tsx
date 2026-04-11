import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { createExamThunk, resetForm, setFormStep } from '../../store/examSlice';
import { StepBasicInfo } from '../../components/employer/StepBasicInfo';
import { StepQuestions } from '../../components/employer/StepQuestions';
import { Alert } from '../../components/ui';
import { ChevronRight, Check } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Basic Info',        sub: 'Test details & schedule' },
  { n: 2, label: 'Manual Question',   sub: 'Add & manage questions'  },
  { n: 3, label: 'Save',              sub: 'Review & publish'        },
];

export default function CreateExamPage() {
  const dispatch       = useAppDispatch();
  const { formStep, formData } = useAppSelector((s) => s.exam);
  const [publishing, setPub] = useState(false);
  const [err, setErr]  = useState('');
  const navigate       = useNavigate();

  const handlePublish = async () => {
    setPub(true); setErr('');
    const res = await dispatch(createExamThunk(formData));
    if (createExamThunk.fulfilled.match(res)) {
      dispatch(resetForm());
      navigate('/employer/dashboard');
    } else {
      setErr((res.payload as string) || 'Failed to create exam');
      setPub(false);
    }
  };

  return (
    <div className="page-body">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#8A8AB0', marginBottom: 20 }}>
        <Link to="/employer/dashboard" style={{ color: '#7B2FBE', fontWeight: 500 }}>Dashboard</Link>
        <ChevronRight size={13} />
        <span style={{ color: '#1A1A2E', fontWeight: 500 }}>Manage Online Test / {STEPS[formStep - 1]?.label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Sidebar stepper */}
        <div>
          <div className="card" style={{ padding: '20px 18px' }}>
            <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13.5, color: '#1A1A2E', marginBottom: 22 }}>Manage Online Test</p>
            <div className="stepper">
              {STEPS.map((step, _i) => {
                const done   = formStep > step.n;
                const active = formStep === step.n;
                return (
                  <div key={step.n} className={`step-row ${active ? 's-active' : ''} ${done ? 's-done' : ''}`}>
                    <div className="step-dot">
                      {done ? <Check size={13} strokeWidth={3} /> : step.n}
                    </div>
                    <div className="step-info">
                      <div className="step-name">{step.label}</div>
                      <div className="step-sub">{step.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="card" style={{ padding: 24 }}>
          {err && <div style={{ marginBottom: 16 }}><Alert type="error">{err}</Alert></div>}

          {formStep === 1 && <StepBasicInfo />}
          {formStep === 2 && <StepQuestions onPublish={() => { dispatch(setFormStep(3)); }} isPublishing={false} />}
          {formStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Exam title header */}
              <div style={{ paddingBottom: 14, borderBottom: '1px solid #F0F0F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
                  <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: '#1A1A2E', flex: 1 }}>{formData.title}</p>
                  <span className="badge badge-green">Ready to Publish</span>
                </div>
                <p style={{ fontSize: 13, color: '#8A8AB0' }}>Review the details below before publishing</p>
              </div>

              {/* Summary grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
                {[
                  ['Duration',     `${formData.duration} min`],
                  ['Questions',    formData.questions?.length ?? 0],
                  ['Total Slots',  formData.totalSlots],
                  ['Neg. Marking', formData.negativeMarking ? 'Yes' : 'No'],
                  ['Start Time',   formData.startTime ? new Date(formData.startTime).toLocaleString() : '—'],
                  ['End Time',     formData.endTime   ? new Date(formData.endTime).toLocaleString()   : '—'],
                ].map(([k, v]) => (
                  <div key={k as string} style={{ border: '1px solid #E2E4EE', borderRadius: 7, padding: '11px 14px', background: '#FAFAFC' }}>
                    <p style={{ fontSize: 11, color: '#8A8AB0', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1A2E', marginTop: 4, fontFamily: 'Poppins' }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* Questions preview */}
              {(formData.questions?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: '#1A1A2E', marginBottom: 10 }}>
                    Questions ({formData.questions?.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                    {formData.questions?.map((q, i) => (
                      <div key={q.id} style={{ display: 'flex', gap: 10, padding: '9px 12px', background: '#FAFAFC', border: '1px solid #E2E4EE', borderRadius: 7 }}>
                        <span style={{ color: '#8A8AB0', fontSize: 12, fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
                        <span style={{ fontSize: 13.5, color: '#1A1A2E', flex: 1 }}>{q.title}</span>
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>{q.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #F0F0F6' }}>
                <button className="btn btn-ghost" onClick={() => dispatch(setFormStep(2))}><ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back</button>
                <button className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
                  {publishing ? 'Publishing…' : 'Publish Test'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
