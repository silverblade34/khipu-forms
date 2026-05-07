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

  // v2.1
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/public/forms/${formId}`)
      .then((r) => { if (!r.ok) throw new Error('Formulario no encontrado'); return r.json(); })
      .then((d: FormData) => {
        setData(d);
        if (!d.form.access_code) setAccessGranted(true);
        if (!d.form.require_email) setEmailGranted(true);
        if (!d.form.informed_consent) setConsentAccepted(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [formId]);

  const answered = Object.values(answers).filter((v) => v.trim()).length;
  const total = data?.fields.length ?? 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  // Navigation for step-by-step
  const nextStep = () => {
    if (!data) return;
    const currentField = data.fields[currentIndex];
    const val = answers[currentField.id] || '';
    if (currentField.required && !val.trim()) {
      setValidationErrors({ ...validationErrors, [currentField.id]: 'Este campo es obligatorio' });
      return;
    }
    if (currentIndex < total - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevStep = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

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
      <div className="mesh-gradient" />
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
            <input className="input glass-input" type="email" value={respondentEmail} onChange={(e) => setRespondentEmail(e.target.value)} placeholder="correo@ejemplo.com" onKeyDown={(e) => e.key === 'Enter' && submitEmail()} />
          </div>
          <button onClick={submitEmail} className="btn btn-primary" style={{ width: '100%', height: '44px', fontSize: '14px' }}>Continuar →</button>
        </div>
      </div>
    </div>
  );

  // v2.1 Informed Consent Modal
  if (!consentAccepted && data?.form.informed_consent) return (
    <div className="public-form-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
      <div className="mesh-gradient" />
      <div style={{ width: '100%', maxWidth: '500px' }} className="animate-fade-in">
        <div className="public-form-card">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📜</div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '10px' }}>Consentimiento Informado</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Por favor, lee y acepta los términos antes de continuar.</p>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '12px', 
            padding: '20px', 
            maxHeight: '300px', 
            overflowY: 'auto', 
            fontSize: '13px', 
            lineHeight: '1.6', 
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '24px'
          }}>
            {data.form.informed_consent}
          </div>
          <button onClick={() => setConsentAccepted(true)} className="btn btn-primary" style={{ width: '100%', height: '50px', fontSize: '15px', fontWeight: '700' }}>
            He leído y acepto los términos
          </button>
        </div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div className="public-form-wrapper">
      <div className="mesh-gradient" />

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,11,0.7)', backdropFilter: 'blur(15px)', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '10px', position: 'sticky', top: 0, zIndex: 10 }}>
        <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '24px', width: 'auto', flexShrink: 0 }} />
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.form.title}</span>
        {total > 0 && (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>{answered}/{total}</span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', position: 'sticky', top: '44px', zIndex: 10 }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), #a78bfa)', width: `${progress}%`, transition: 'width 0.4s ease', boxShadow: '0 0 10px rgba(124,106,247,0.5)' }} />
        </div>
      )}

      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>
        {/* Form header card (only show at start or in normal mode) */}
        {(!data.form.step_by_step || currentIndex === 0) && (
          <div style={{ marginBottom: '32px', padding: '0 8px' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              {data.form.is_quiz && (
                <span className="badge badge-purple" style={{ padding: '3px 8px', fontSize: '11px' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                  Cuestionario
                </span>
              )}
              <div className="time-badge" style={{ fontSize: '10px' }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ~{Math.max(1, Math.ceil(total * 0.5))} min de lectura
              </div>
            </div>
            
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '12px' }}>
              {data.form.title}
            </h1>
            {data.form.description && (
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '16px' }}>{data.form.description}</p>
            )}
            
            {data.form.require_email && respondentEmail && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
                Respondiendo como <span style={{ color: 'white' }}>{respondentEmail}</span>
              </div>
            )}
          </div>
        )}

        {/* Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.form.step_by_step ? (
            // Step-by-Step Mode
            <div key={data.fields[currentIndex].id} className="animate-scale-in">
              <FieldRenderer 
                field={data.fields[currentIndex]} 
                value={answers[data.fields[currentIndex].id] || ''} 
                onChange={(val) => { 
                  setAnswers({ ...answers, [data.fields[currentIndex].id]: val }); 
                  if (validationErrors[data.fields[currentIndex].id]) setValidationErrors({ ...validationErrors, [data.fields[currentIndex].id]: '' }); 
                }} 
                error={validationErrors[data.fields[currentIndex].id]} 
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                {currentIndex > 0 && (
                  <button type="button" onClick={prevStep} className="btn btn-secondary" style={{ height: '46px', flex: 1, borderRadius: '12px', fontSize: '14px' }}>
                    Atrás
                  </button>
                )}
                {currentIndex < total - 1 ? (
                  <button type="button" onClick={nextStep} className="btn btn-primary" style={{ height: '46px', flex: 2, borderRadius: '12px', fontWeight: '700', fontSize: '14px' }}>
                    Siguiente →
                  </button>
                ) : (
                  <button type="submit" disabled={submitting} className="btn btn-primary" style={{ height: '46px', flex: 2, borderRadius: '12px', fontWeight: '700', fontSize: '14px' }}>
                    {submitting ? 'Enviando...' : 'Finalizar y Enviar'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            // Normal Scrolling Mode
            <>
              {data.fields.map((field, idx) => (
                <div key={field.id} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
                  <FieldRenderer field={field} value={answers[field.id] || ''} onChange={(val) => { setAnswers({ ...answers, [field.id]: val }); if (validationErrors[field.id]) setValidationErrors({ ...validationErrors, [field.id]: '' }); }} error={validationErrors[field.id]} />
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '16px', flexDirection: 'column', gap: '16px' }}>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '700', borderRadius: '14px', boxShadow: '0 8px 20px rgba(124,106,247,0.2)' }}>
                  {submitting ? (
                    <><span style={{ width: '16px', height: '16px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', marginRight: '10px' }} /> Enviando...</>
                  ) : (data.form.is_quiz ? '🎯 Finalizar Cuestionario' : 'Enviar respuesta →')}
                </button>
              </div>
            </>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '16px', opacity: 0.4, gap: '6px' }}>
            <span style={{ fontSize: '11px' }}>Potenciado por</span>
            <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '14px', width: 'auto' }} />
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
    <div className="field-card">
      <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px', lineHeight: '1.4' }}>
        {field.label}
        {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
      </label>

      {field.type === 'text' && <input className="input glass-input" type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Escribe aquí...`} />}
      {field.type === 'textarea' && <textarea className="textarea glass-input" style={{ minHeight: '100px', paddingTop: '12px' }} value={value} onChange={(e) => onChange(e.target.value)} placeholder="Escribe tu respuesta detallada..." />}
      {field.type === 'email' && <input className="input glass-input" type="email" value={value} onChange={(e) => onChange(e.target.value)} placeholder="correo@ejemplo.com" />}
      {field.type === 'number' && <input className="input glass-input" type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />}

      {field.type === 'select' && (
        <select className="input glass-input" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Selecciona una opción</option>
          {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )}

      {field.type === 'radio' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options.map((opt) => (
            <div key={opt} className={`radio-option${value === opt ? ' selected' : ''}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 16px' }} onClick={() => onChange(opt)}>
              <div className="radio-dot" style={{ width: '14px', height: '14px' }} />
              <span style={{ fontSize: '14px' }}>{opt}</span>
            </div>
          ))}
        </div>
      )}

      {field.type === 'checkbox' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <input type="checkbox" checked={value === 'true'} onChange={(e) => onChange(e.target.checked ? 'true' : 'false')} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }} />
          <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Confirmar selección</span>
        </label>
      )}

      {error && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {error}
      </p>}
    </div>
  );
}


