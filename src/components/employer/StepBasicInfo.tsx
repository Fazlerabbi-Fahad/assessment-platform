import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../../store';
import { setFormStep, setFormData } from '../../store/examSlice';
import { FieldError } from '../ui';

interface F {
  title: string; totalCandidates: number; totalSlots: number;
  questionSets: number; questionType: 'mcq' | 'text' | 'mixed';
  startTime: string; endTime: string; duration: number; negativeMarking: boolean;
}

export function StepBasicInfo() {
  const dispatch    = useAppDispatch();
  const { formData } = useAppSelector((s) => s.exam);

  const { register, handleSubmit, formState: { errors } } = useForm<F>({
    defaultValues: {
      title:           formData.title           || '',
      totalCandidates: formData.totalCandidates || 50,
      totalSlots:      formData.totalSlots      || 10,
      questionSets:    formData.questionSets    || 1,
      questionType:    formData.questionType    || 'mcq',
      startTime: formData.startTime ? new Date(formData.startTime).toISOString().slice(0,16) : '',
      endTime:   formData.endTime   ? new Date(formData.endTime).toISOString().slice(0,16)   : '',
      duration:        formData.duration        || 60,
      negativeMarking: formData.negativeMarking || false,
    },
  });

  const onSubmit = (d: F) => {
    dispatch(setFormData({ ...d, startTime: new Date(d.startTime).toISOString(), endTime: new Date(d.endTime).toISOString() }));
    dispatch(setFormStep(2));
  };

  const g2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Test title */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <label className="fl" style={{ margin: 0, whiteSpace: 'nowrap' }}>Manage Online Test</label>
          <div style={{ flex: 1 }}>
            <input
              {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 chars' } })}
              className="fi"
              placeholder="Test title"
            />
            <FieldError msg={errors.title?.message} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#8A8AB0' }}>Status</span>
            <span className="badge badge-green">Active</span>
          </div>
        </div>
        <div style={{ height: 1, background: '#F0F0F6', marginBottom: 20 }} />
      </div>

      {/* Basic Information */}
      <h4 style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13.5, color: '#1A1A2E', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 4, height: 16, background: '#7B2FBE', borderRadius: 2, display: 'inline-block' }} />
        Basic Information
      </h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 22 }}>
        <div style={g2}>
          <div>
            <label className="fl">Total Candidates</label>
            <input {...register('totalCandidates', { valueAsNumber: true, required: true, min: 1 })} type="number" min={1} className="fi" />
          </div>
          <div>
            <label className="fl">Total Slots</label>
            <input {...register('totalSlots', { valueAsNumber: true, required: true, min: 1 })} type="number" min={1} className="fi" />
          </div>
        </div>
        <div style={g2}>
          <div>
            <label className="fl">Question Sets</label>
            <input {...register('questionSets', { valueAsNumber: true, required: true, min: 1 })} type="number" min={1} className="fi" />
          </div>
          <div>
            <label className="fl">Question Type</label>
            <select {...register('questionType')} className="fi">
              <option value="mcq">MCQ (Multiple Choice)</option>
              <option value="text">Text / Written</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
        </div>
        <div style={g2}>
          <div>
            <label className="fl">Start Time</label>
            <input {...register('startTime', { required: 'Required' })} type="datetime-local" className="fi" />
            <FieldError msg={errors.startTime?.message} />
          </div>
          <div>
            <label className="fl">End Time</label>
            <input {...register('endTime', { required: 'Required' })} type="datetime-local" className="fi" />
            <FieldError msg={errors.endTime?.message} />
          </div>
        </div>
        <div style={g2}>
          <div>
            <label className="fl">Duration (minutes)</label>
            <input {...register('duration', { valueAsNumber: true, required: true, min: 1 })} type="number" min={1} className="fi" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 1 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '10px 14px', border: '1.5px solid #CACDE0', borderRadius: 7, width: '100%', background: '#FAFAFC' }}>
              <input {...register('negativeMarking')} type="checkbox" style={{ width: 15, height: 15, accentColor: '#7B2FBE' }} />
              <span style={{ fontSize: 13.5, color: '#4A4A6A', fontWeight: 500 }}>Negative Marking</span>
            </label>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 16, borderTop: '1px solid #F0F0F6' }}>
        <button type="button" className="btn btn-ghost" onClick={() => window.history.back()}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save & Next</button>
      </div>
    </form>
  );
}
