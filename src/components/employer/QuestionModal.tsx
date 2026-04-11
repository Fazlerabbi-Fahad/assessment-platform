import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Question } from '../../types';
import { generateId } from '../../lib/utils';
import { X, Plus, Trash2, Check } from 'lucide-react';

interface Props {
  isOpen: boolean; onClose: () => void;
  onSave: (q: Omit<Question, 'id'>) => void;
  initial?: Question | null;
}

interface FD {
  title: string; type: 'radio' | 'checkbox' | 'text';
  marks: number; negativeMarks: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

const blank = (): FD => ({
  title: '', type: 'radio', marks: 1, negativeMarks: 0,
  options: Array.from({ length: 4 }, () => ({ id: generateId(), text: '', isCorrect: false })),
});

export function QuestionModal({ isOpen, onClose, onSave, initial }: Props) {
  const { register, handleSubmit, watch, setValue, control, reset } = useForm<FD>({ defaultValues: blank() });
  const { fields, append, remove } = useFieldArray({ control, name: 'options' });
  const qType = watch('type');

  useEffect(() => {
    if (!isOpen) return;
    reset(initial
      ? { title: initial.title, type: initial.type, marks: initial.marks, negativeMarks: initial.negativeMarks, options: initial.options.length ? initial.options : blank().options }
      : blank()
    );
  }, [isOpen, initial, reset]);

  const toggleCorrect = (i: number) => {
    if (qType === 'radio') {
      fields.forEach((_, idx) => setValue(`options.${idx}.isCorrect`, idx === i));
    } else {
      setValue(`options.${i}.isCorrect`, !watch(`options.${i}.isCorrect`));
    }
  };

  const onSubmit = (d: FD) => {
    onSave({ title: d.title, type: d.type, marks: +d.marks, negativeMarks: +d.negativeMarks, options: d.type === 'text' ? [] : d.options.filter(o => o.text.trim()) });
    onClose();
  };

  if (!isOpen) return null;

  const types = [
    { val: 'radio',    label: 'Radio' },
    { val: 'checkbox', label: 'MCQ'   },
    { val: 'text',     label: 'Text'  },
  ] as const;

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.42)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
    >
      <div className="anim-up" style={{ background: '#fff', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.14)' }}>
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #EBEBF2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Type tabs */}
            {types.map(t => (
              <button
                key={t.val}
                type="button"
                onClick={() => setValue('type', t.val)}
                style={{ padding: '5px 14px', fontSize: 12, fontWeight: 600, borderRadius: 5, border: 'none', cursor: 'pointer', transition: 'all .15s', background: qType === t.val ? '#7B2FBE' : '#F3F0FF', color: qType === t.val ? '#fff' : '#7B2FBE' }}
              >{t.label}</button>
            ))}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A8AB0', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Question title row like Figma shows inline with marks */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <label className="fl">Question</label>
              <textarea {...register('title', { required: true })} className="fi" rows={3} placeholder="Write question here…" style={{ resize: 'vertical' }} />
            </div>
            <div style={{ width: 90, flexShrink: 0 }}>
              <label className="fl">Marks</label>
              <input {...register('marks')} type="number" min={0} step={0.5} className="fi" style={{ textAlign: 'center' }} />
            </div>
            <div style={{ width: 90, flexShrink: 0 }}>
              <label className="fl">Neg. Marks</label>
              <input {...register('negativeMarks')} type="number" min={0} step={0.5} className="fi" style={{ textAlign: 'center' }} />
            </div>
          </div>

          {/* Options */}
          {qType !== 'text' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <label className="fl" style={{ margin: 0 }}>
                  Options <span style={{ color: '#B0B4CC', fontWeight: 400 }}>— click ✓ to mark correct answer</span>
                </label>
                <button type="button" onClick={() => append({ id: generateId(), text: '', isCorrect: false })}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#F3F0FF', border: '1px solid #D4C5F0', borderRadius: 5, padding: '4px 10px', color: '#7B2FBE', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={12} /> Add
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {fields.map((field, i) => {
                  const correct = watch(`options.${i}.isCorrect`);
                  return (
                    <div key={field.id} className={`opt-row ${correct ? 'correct' : ''}`}>
                      <button
                        type="button"
                        onClick={() => toggleCorrect(i)}
                        className={`opt-check ${qType === 'checkbox' ? 'sq' : ''} ${correct ? 'on' : ''}`}
                      >
                        {correct && <Check size={12} color="#fff" strokeWidth={3} />}
                      </button>
                      <input {...register(`options.${i}.text`)} type="text" placeholder={`Option ${i + 1}`} />
                      {correct && <span style={{ fontSize: 11, color: '#38A169', fontWeight: 700, marginLeft: 4, whiteSpace: 'nowrap' }}>Correct ✓</span>}
                      {fields.length > 2 && (
                        <button type="button" onClick={() => remove(i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C4C4D8', display: 'flex', padding: 2, marginLeft: 4, flexShrink: 0 }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {qType === 'text' && (
            <div>
              <label className="fl">Sample Answer (optional)</label>
              <textarea className="fi" rows={3} placeholder="Optional: describe expected answer…" />
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 10, borderTop: '1px solid #EBEBF2', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Back</button>
            <button type="submit" className="btn btn-primary">{initial ? 'Save Changes' : 'Add Question'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
