'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Form, FormField } from '@/lib/types';

interface FormData { form: Form; fields: FormField[]; }
interface QuizResult { score: number; max_score: number; results: Record<string, boolean>; quiz_message: string | null; }

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;

  const [data, setData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [respondentEmail, setRespondentEmail] = useState('');
  const [emailGranted, setEmailGranted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/public/forms/${formId}`)
      .then((r) => { if (!r.ok) throw new Error('Formulario no encontrado'); return r.json(); })
      .then((d: FormData) => {
        setData(d);
        if (!d.form.access_code) setAccessGranted(true);
        if (!d.form.require_email) setEmailGranted(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [formId]);

  const answered = Object.values(answers).filter((v) => v.trim()).length;
  const total = data?.fields.length ?? 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  function checkAccessCode() {
    if (accessCode === data?.form.access_code) { setAccessGranted(true); setError(null); }
    else { setError('Código de acceso incorrecto'); setTimeout(() => setError(null), 3000); }
  }

  function submitEmail() {
    if (!respondentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentEmail)) {
      setError('Ingresa un email válido'); setTimeout(() => setError(null), 3000); return;
    }
    setEmailGranted(true); setError(null);
  }

  function validate(): boolean {
    if (!data) return false;
    const errors: Record<string, string> = {};
    for (const field of data.fields) {
      const val = answers[field.id] || '';
      if (field.required && !val.trim()) errors[field.id] = 'Este campo es obligatorio';
      if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) errors[field.id] = 'Email inválido';
      if (field.type === 'number' && val && isNaN(Number(val))) errors[field.id] = 'Número inválido';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const answerArray = data!.fields.map((f) => ({ field_id: f.id, value: answers[f.id] || '' }));
      const res = await fetch(`/api/public/forms/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answerArray, access_code: accessCode || undefined, respondent_email: respondentEmail || undefined }),
      });
      const json = await res.json();
      if (res.ok) {
        setSubmitted(true);
        if (json.is_quiz && json.show_score && json.score !== undefined) {
          setQuizResult({ score: json.score, max_score: json.max_score, results: json.results ?? {}, quiz_message: json.quiz_message });
        }
      } else {
        setError(json.error || 'Error al enviar');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // --- STATES ---
  if (loading) return (
    <div className="public-form-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Cargando formulario...</p>
      </div>
    </div>
  );

  if (error && !data) return (
    <div className="public-form-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '320px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
        <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>Formulario no disponible</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{error}</p>
      </div>
    </div>
  );

  // Success / Quiz result
  if (submitted) {
    const pct = quizResult ? Math.round((quizResult.score / quizResult.max_score) * 100) : 0;
    const passed = pct >= 60;
    return (
      <div className="public-form-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '480px' }} className="animate-scale-in">
          {quizResult ? (
            <div className="score-card">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{passed ? '🎉' : '📝'}</div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {passed ? '¡Buen trabajo!' : 'Cuestionario completado'}
                </h2>
              </div>
              {/* Score circle */}
              <div className="score-circle" style={{ '--pct': `${pct}%` } as React.CSSProperties}>
                <div className="score-circle-inner">
                  <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>{pct}%</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>score</span>
                </div>
              </div>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Obtuviste <strong style={{ color: 'var(--text-primary)' }}>{quizResult.score}</strong> de{' '}
                <strong style={{ color: 'var(--text-primary)' }}>{quizResult.max_score}</strong> preguntas correctas
              </p>
              {quizResult.quiz_message && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>
                  {quizResult.quiz_message}
                </p>
              )}
              {/* Per-question breakdown */}
              {data && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left', marginBottom: '24px' }}>
                  {data.fields.filter(f => quizResult.results[f.id] !== undefined).map((field) => {
                    const correct = quizResult.results[field.id];
                    return (
                      <div key={field.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: correct ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                        <span style={{ fontSize: '14px', flexShrink: 0 }}>{correct ? '✓' : '✗'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{field.label}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: correct ? 'var(--success)' : 'var(--error)' }}>
                          {correct ? 'Correcto' : 'Incorrecto'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => { setSubmitted(false); setAnswers({}); setQuizResult(null); }} className="btn btn-secondary">
                  Intentar de nuevo
                </button>
                <a href="/" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Crear mi formulario →
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--success-dim)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '28px' }}>✓</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>¡Respuesta enviada!</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Tu respuesta ha sido registrada correctamente.</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { setSubmitted(false); setAnswers({}); }} className="btn btn-secondary">Enviar otra respuesta</button>
                <a href="/" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: '12px', color: 'var(--text-muted)' }}>Crear mi formulario →</a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Access code gate
  if (!accessGranted && data?.form.access_code) return (
    <div className="public-form-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }} className="animate-fade-in">
        <div className="public-form-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔒</div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>{data.form.title}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Este formulario requiere un código de acceso</p>
          </div>
          {error && <p style={{ fontSize: '13px', color: 'var(--error)', background: 'var(--error-dim)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input className="input" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Código de acceso" onKeyDown={(e) => e.key === 'Enter' && checkAccessCode()} />
            <button onClick={checkAccessCode} className="btn btn-primary">Acceder</button>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Formulario creado con <a href="/" style={{ color: 'var(--accent)' }}>Khipu Forms</a>
        </p>
      </div>
    </div>
  );

  // Email gate
  if (!emailGranted && data?.form.require_email) return (
    <div className="public-form-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }} className="animate-fade-in">
        <div className="public-form-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✉️</div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>{data?.form.title}</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Para responder este formulario, ingresa tu correo electrónico.<br />
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Solo se permite una respuesta por email.</span>
            </p>
          </div>
          {error && <p style={{ fontSize: '13px', color: 'var(--error)', background: 'var(--error-dim)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>{error}</p>}
          <div className="field-group" style={{ marginBottom: '16px' }}>
            <label className="label">Tu correo electrónico</label>
            <input className="input" type="email" value={respondentEmail} onChange={(e) => setRespondentEmail(e.target.value)} placeholder="correo@ejemplo.com" onKeyDown={(e) => e.key === 'Enter' && submitEmail()} />
          </div>
          <button onClick={submitEmail} className="btn btn-primary" style={{ width: '100%', height: '44px', fontSize: '14px' }}>Continuar →</button>
        </div>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Formulario creado con <a href="/" style={{ color: 'var(--accent)' }}>Khipu Forms</a>
        </p>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="public-form-wrapper">
      {/* Header */}
      <div style={{ borderBottom: '1px solid var(--border)', background: 'rgba(17,17,19,0.8)', backdropFilter: 'blur(12px)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>K</div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.form.title}</span>
        {total > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>{answered}/{total}</span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ height: '3px', background: 'var(--border)' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #a78bfa)', width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
      )}

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '40px 20px 80px' }}>
        {/* Form header */}
        <div style={{ marginBottom: '36px' }} className="animate-fade-in">
          {data.form.is_quiz && (
            <span className="badge badge-purple" style={{ marginBottom: '12px', display: 'inline-flex', gap: '5px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
              Cuestionario
            </span>
          )}
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '10px' }}>
            {data.form.title}
          </h1>
          {data.form.description && (
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7' }}>{data.form.description}</p>
          )}
          {data.form.require_email && respondentEmail && (
            <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6"/></svg>
              Respondiendo como <strong style={{ color: 'var(--text-secondary)' }}>{respondentEmail}</strong>
            </div>
          )}
        </div>

        {/* Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.fields.map((field, idx) => (
            <div key={field.id} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
              <FieldRenderer field={field} value={answers[field.id] || ''} onChange={(val) => { setAnswers({ ...answers, [field.id]: val }); if (validationErrors[field.id]) setValidationErrors({ ...validationErrors, [field.id]: '' }); }} error={validationErrors[field.id]} />
            </div>
          ))}

          {error && (
            <div style={{ background: 'var(--error-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', flexWrap: 'wrap', gap: '12px' }}>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ minWidth: '160px' }}>
              {submitting ? (
                <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Enviando...</>
              ) : (data.form.is_quiz ? '🎯 Enviar respuestas' : 'Enviar respuesta →')}
            </button>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Creado con <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Khipu Forms</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function FieldRenderer({ field, value, onChange, error }: {
  field: FormField; value: string; onChange: (val: string) => void; error?: string;
}) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`, borderRadius: '12px', padding: '20px', transition: 'border-color 0.2s' }}>
      <label style={{ display: 'block', fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '14px', lineHeight: '1.4' }}>
        {field.label}
        {field.required && <span style={{ color: 'var(--error)', marginLeft: '4px' }}>*</span>}
      </label>

      {field.type === 'text' && <input className="input" style={{ height: '44px', fontSize: '14px' }} type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Tu respuesta...`} />}
      {field.type === 'textarea' && <textarea className="textarea" style={{ minHeight: '100px', fontSize: '14px' }} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Tu respuesta..." />}
      {field.type === 'email' && <input className="input" style={{ height: '44px', fontSize: '14px' }} type="email" value={value} onChange={(e) => onChange(e.target.value)} placeholder="correo@ejemplo.com" />}
      {field.type === 'number' && <input className="input" style={{ height: '44px', fontSize: '14px' }} type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />}

      {field.type === 'select' && (
        <select className="input" style={{ height: '44px', fontSize: '14px' }} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecciona una opción</option>
          {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}

      {field.type === 'radio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options.map((opt) => (
            <div key={opt} className={`radio-option${value === opt ? ' selected' : ''}`} onClick={() => onChange(opt)}>
              <div className="radio-dot" />
              <span>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input type="checkbox" checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : 'false')} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sí</span>
        </label>
      )}

      {error && <p style={{ fontSize: '12px', color: 'var(--error)', marginTop: '8px' }}>{error}</p>}
    </div>
  );
}
