import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setFormStep, addQuestion, updateQuestion, deleteQuestion } from '../../store/examSlice';
import { QuestionModal } from './QuestionModal';
import type { Question } from '../../types';
import { Plus, Edit2, Trash2, ChevronLeft } from 'lucide-react';

interface Props { onPublish: () => void; isPublishing: boolean; }

export function StepQuestions({ onPublish, isPublishing }: Props) {
  const dispatch    = useAppDispatch();
  const { formData } = useAppSelector((s) => s.exam);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Question | null>(null);

  const questions = formData.questions || [];

  const handleSave = (q: Omit<Question, 'id'>) => {
    if (edit) dispatch(updateQuestion({ id: edit.id, changes: q }));
    else      dispatch(addQuestion(q));
    setEdit(null);
  };

  const typeCls = { radio: 'badge-purple', checkbox: 'badge-amber', text: 'badge-gray' } as const;
  const typeLbl = { radio: 'Radio', checkbox: 'MCQ', text: 'Text' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14, borderBottom: '1px solid #F0F0F6' }}>
        <div>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: '#1A1A2E' }}>Questions</p>
          <p style={{ fontSize: 12, color: '#8A8AB0', marginTop: 2 }}>{questions.length} added</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setEdit(null); setOpen(true); }}>
          <Plus size={13} /> Add Question
        </button>
      </div>

      {/* List */}
      {questions.length === 0 ? (
        <div style={{ border: '2px dashed #E2E4EE', borderRadius: 9, padding: '38px 24px', textAlign: 'center' }}>
          <p style={{ color: '#8A8AB0', fontSize: 13 }}>No questions yet. Add your first question above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
          {questions.map((q, i) => (
            <div key={q.id} style={{ border: '1px solid #E2E4EE', borderRadius: 8, padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FAFAFC' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#7B2FBE', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, color: '#1A1A2E', lineHeight: 1.5, marginBottom: 6 }}>{q.title}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${typeCls[q.type]}`}>{typeLbl[q.type]}</span>
                  <span className="badge badge-green">+{q.marks} marks</span>
                  {q.type !== 'text' && <span className="badge badge-gray">{q.options?.length || 0} options</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button onClick={() => { setEdit(q); setOpen(true); }} style={{ background: '#F3F0FF', border: 'none', borderRadius: 5, padding: '5px 8px', color: '#7B2FBE', cursor: 'pointer', display: 'flex' }}><Edit2 size={12} /></button>
                <button onClick={() => dispatch(deleteQuestion(q.id))} style={{ background: '#FFF5F5', border: 'none', borderRadius: 5, padding: '5px 8px', color: '#E53E3E', cursor: 'pointer', display: 'flex' }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #F0F0F6' }}>
        <button className="btn btn-ghost" onClick={() => dispatch(setFormStep(1))}><ChevronLeft size={14} /> Back</button>
        <button className="btn btn-primary" onClick={onPublish} disabled={isPublishing}>
          {isPublishing ? 'Publishing…' : 'Save & Publish'}
        </button>
      </div>

      <QuestionModal isOpen={open} onClose={() => { setOpen(false); setEdit(null); }} onSave={handleSave} initial={edit} />
    </div>
  );
}
