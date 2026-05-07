'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Form, FormField } from '@/lib/types';

interface FormData { form: Form; fields: FormField[]; }
interface QuizResult { score: number; max_score: number; results: Record<string, boolean>; quiz_message: string | null; }

const cleanLabel = (label: string) => label.replace(/\s*\((Casillas|Radio|Lista)\)/gi, '').trim();

// ── Shared header (standalone to prevent flickering) ──────────────────────────
const TopBar = ({ 
  formTitle, 
  currentMode, 
  streak, 
  points, 
  lives, 
  total, 
  currentIndex, 
  answered, 
  progress, 
  timeLeft,
  showGamification,
  maxLives
}: { 
  formTitle: string;
  currentMode: string;
  streak: number;
  points: number;
  lives: number;
  total: number;
  currentIndex: number;
  answered: number;
  progress: number;
  timeLeft: number | null;
  showGamification: boolean;
  maxLives: number;
}) => (
  <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(10,10,11,0.9)', backdropFilter: 'blur(20px)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', position: 'sticky', top: 0, zIndex: 10 }} className="top-bar-container">
      <style>{`
        @media (max-width: 640px) {
          .top-bar-title { display: none !important; }
          .top-bar-container { padding: 12px 14px !important; gap: 10px !important; }
          .gamification-stats { gap: 14px !important; }
          .stat-item { font-size: 14px !important; gap: 6px !important; }
          .stat-icon { width: 18px !important; height: 18px !important; }
          .lives-container { gap: 6px !important; }
          .life-icon { width: 16px !important; height: 16px !important; }
        }
        @keyframes pulse-red {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(239,68,68,0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239,68,68,0); }
        }
        .timer-urgent { animation: pulse-red 1s infinite !important; background: rgba(239,68,68,0.9) !important; color: white !important; border-color: #ef4444 !important; }
      `}</style>
      <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '20px', width: 'auto', flexShrink: 0 }} />
      <span className="top-bar-title" style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formTitle}</span>
      
      {currentMode === 'duolingo' && showGamification && (
        <div className="gamification-stats" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span className="stat-item" style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg className="stat-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 12 7.5 12 11C12 11 14.5 10 16 10C17.5 10 19 12.5 19 15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15C5 12 7 9 9 7C9 7 9 11 11 11C11 11 12 2 12 2Z"/></svg>
            {streak}
          </span>
          <span className="stat-item" style={{ fontSize: '12px', fontWeight: '800', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg className="stat-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
            {points}
          </span>
          <div className="lives-container" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[...Array(maxLives)].map((_, i) => (
              <svg key={i} className="life-icon" width="14" height="14" viewBox="0 0 24 24" fill={i < lives ? "#ef4444" : "rgba(255,255,255,0.15)"} style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.41 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.59 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/>
              </svg>
            ))}
          </div>
        </div>
      )}
      {currentMode !== 'duolingo' && total > 0 && (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>{currentMode === 'classic' ? `${answered}/${total}` : `${currentIndex + 1}/${total}`}</span>
      )}
    </div>

    {/* Dedicated Timer Row */}
    {timeLeft !== null && (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-1px', pointerEvents: 'none' }}>
        <div className={`timer-box ${timeLeft < 5 ? 'timer-urgent' : ''}`} style={{ 
          padding: '4px 14px', 
          background: 'rgba(255,255,255,0.08)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderTop: 'none',
          borderRadius: '0 0 12px 12px', 
          color: 'white', 
          fontSize: '13px', 
          fontWeight: '800', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'all 0.3s'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span style={{ fontFamily: 'monospace' }}>0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
        </div>
      </div>
    )}

    {/* Progress bar */}
    <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', marginTop: timeLeft !== null ? '4px' : '0' }}>
      <div style={{ height: '100%', background: currentMode === 'duolingo' ? 'linear-gradient(90deg,#22c55e,#86efac)' : 'linear-gradient(90deg,var(--accent),#a78bfa)', width: currentMode === 'classic' ? `${progress}%` : `${Math.round(((currentIndex) / total) * 100)}%`, transition: 'width 0.4s ease', boxShadow: '0 0 8px rgba(124,106,247,0.4)' }} />
    </div>
  </div>
);

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
  // v2.2 Gamification
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string | null } | null>(null);
  const [showHint, setShowHint] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');

  useEffect(() => {
    // Check if already submitted in this browser
    if (typeof window !== 'undefined' && localStorage.getItem(`khipu_submitted_${formId}`)) {
      setAlreadySubmitted(true);
    }

    fetch(`/api/public/forms/${formId}`)
      .then((r) => { if (!r.ok) throw new Error('Formulario no encontrado'); return r.json(); })
      .then((d: FormData) => {
        setData(d);
        if (!d.form.access_code) setAccessGranted(true);
        if (!d.form.require_email) setEmailGranted(true);
        if (!d.form.informed_consent) setConsentAccepted(true);
        setLives(d.form.initial_lives ?? 3);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [formId]);

  // Timer logic
  useEffect(() => {
    if (!data || submitted || alreadySubmitted || feedback) return;
    const mode = data.form.presentation_mode;
    if (mode !== 'cards' && mode !== 'duolingo') return;

    const currentField = data.fields[currentIndex];
    if (currentField && currentField.time_limit && currentField.time_limit > 0) {
      setTimeLeft(currentField.time_limit);
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            // Auto-advance
            if (mode === 'duolingo' && currentField.correct_answer) {
              checkAnswer(currentField.id, ''); // Mark as wrong
            } else {
              goNext('right');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [currentIndex, data, feedback, submitted, alreadySubmitted]);

  const answered = Object.values(answers).filter((v) => v.trim()).length;
  const total = data?.fields.length ?? 0;
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  const goNext = (dir: 'left' | 'right' = 'right') => {
    if (!data) return;
    const currentField = data.fields[currentIndex];
    const val = answers[currentField.id] || '';
    
    // Only enforce required if we haven't given feedback yet
    if (!feedback && currentField.required && !val.trim()) {
      setValidationErrors({ ...validationErrors, [currentField.id]: 'Esta pregunta es obligatoria' });
      return;
    }
    
    setFeedback(null);
    setSlideDir(dir);
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowHint(null);
    }
  };

  const goPrev = () => {
    setSlideDir('left');
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  // Duolingo: check answer immediately
  const checkAnswer = (fieldId: string, val: string) => {
    if (!data) return;
    const field = data.fields.find(f => f.id === fieldId);
    if (!field?.correct_answer) {
      setFeedback(null);
      return;
    }
    
    let isCorrect = false;
    if (field.type === 'checkbox') {
      const selected = val.split(',').filter(Boolean).sort().join(',');
      const correct = field.correct_answer.split(',').filter(Boolean).sort().join(',');
      isCorrect = selected === correct;
    } else {
      isCorrect = val.trim().toLowerCase() === field.correct_answer.trim().toLowerCase();
    }

    setFeedback({ correct: isCorrect, explanation: field.explanation });
    if (isCorrect) {
      if (data.form.gamification) {
        setPoints(p => p + 10);
        setStreak(s => s + 1);
      }
    } else {
      if (data.form.gamification) {
        setStreak(0);
        setLives(l => Math.max(0, l - 1));
      }
    }
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
      if (field.required && !val.trim()) errors[field.id] = 'Esta pregunta es obligatoria';
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
        localStorage.setItem(`khipu_submitted_${formId}`, 'true');
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
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {passed ? (
                    <img src="/llama-happy.png" alt="Llama Feliz" style={{ width: '80px', height: '80px', margin: '0 auto', display: 'block' }} className="animate-bounce" />
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color: 'var(--text-muted)'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  )}
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  {passed ? '¡Excelente trabajo!' : 'Formulario completado'}
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
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1 }}>{cleanLabel(field.label)}</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: correct ? 'var(--success)' : 'var(--error)' }}>
                          {correct ? 'Correcto' : 'Incorrecto'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <a href="/" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '12px', opacity: 0.5 }} />
                  <span>Crear mi propio formulario →</span>
                </a>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--success-dim)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#22c55e' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '8px' }}>¡Respuesta enviada!</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Tu respuesta ha sido registrada correctamente.</p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <a href="/" className="btn btn-ghost" style={{ textDecoration: 'none', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '12px', opacity: 0.5 }} />
                  <span>Crear mi propio formulario →</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="public-form-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }} className="animate-scale-in">
          <div style={{ marginBottom: '24px', color: '#22c55e', display: 'flex', justifyContent: 'center' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>Ya has respondido</h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>
            Este formulario solo permite una respuesta por persona y ya hemos registrado la tuya. ¡Gracias por participar!
          </p>
          <div style={{ marginTop: '32px' }}>
            <a href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Volver al inicio</a>
          </div>
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
            <div style={{ marginBottom: '16px', color: 'var(--accent)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
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
            <div style={{ marginBottom: '16px', color: 'var(--accent)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
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
            <div style={{ marginBottom: '16px', color: 'var(--accent)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
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

  const field = data.fields[currentIndex];

  // Logic to determine presentation mode
  // If step_by_step is true, we force 'cards' mode even if it was 'classic'
  let mode = data.form.presentation_mode ?? 'classic';
  if (data.form.step_by_step && mode === 'classic') {
    mode = 'cards';
  }

  if (mode === 'classic') return (
    <div className="public-form-wrapper">
      <div className="mesh-gradient" />
      <TopBar 
        formTitle={data.form.title}
        currentMode="classic"
        streak={streak}
        points={points}
        lives={lives}
        total={total}
        currentIndex={currentIndex}
        answered={answered}
        progress={progress}
        timeLeft={timeLeft}
        showGamification={data.form.gamification}
        maxLives={data.form.initial_lives ?? 3}
      />
      <div style={{ maxWidth: '640px', width: '100%', margin: '0 auto', padding: '40px 20px 80px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '32px', padding: '0 4px' }} className="animate-fade-in">
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '10px' }}>{data.form.title}</h1>
          {data.form.description && <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6' }}>{data.form.description}</p>}
          {data.form.require_email && respondentEmail && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)', marginTop: '12px' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#22c55e' }} />
              {respondentEmail}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {data.fields.map((f, idx) => (
            <div key={f.id} className="animate-fade-in" style={{ animationDelay: `${idx * 40}ms` }}>
              <FieldRenderer field={f} value={answers[f.id] || ''} onChange={(val) => { setAnswers({ ...answers, [f.id]: val }); if (validationErrors[f.id]) setValidationErrors({ ...validationErrors, [f.id]: '' }); }} error={validationErrors[f.id]} />
            </div>
          ))}
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: '#ef4444', textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: '700', borderRadius: '14px', boxShadow: '0 8px 20px rgba(124,106,247,0.2)', marginTop: '4px' }}>
            {submitting ? <><span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', marginRight: '8px' }} />Enviando...</> : (data.form.is_quiz ? '🎯 Finalizar Cuestionario' : 'Enviar respuesta →')}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.35, gap: '6px' }}>
            <span style={{ fontSize: '11px' }}>Potenciado por</span>
            <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '13px', width: 'auto' }} />
          </div>
        </form>
      </div>
    </div>
  );

  // ── CARDS mode ───────────────────────────────────────────────────────────────
  if (mode === 'cards') return (
    <div className="public-form-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="mesh-gradient" />
      <TopBar 
        formTitle={data.form.title}
        currentMode="cards"
        streak={streak}
        points={points}
        lives={lives}
        total={total}
        currentIndex={currentIndex}
        answered={answered}
        progress={progress}
        timeLeft={timeLeft}
        showGamification={data.form.gamification}
        maxLives={data.form.initial_lives ?? 3}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        {/* Step counter */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Pregunta</span>
          <div style={{ fontSize: '52px', fontWeight: '900', color: 'white', lineHeight: 1, letterSpacing: '-0.04em' }}>{currentIndex + 1}<span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '32px' }}>/{total}</span></div>
        </div>

        {/* Card */}
        <div key={`card-${currentIndex}-${slideDir}`} className={`animate-slide-${slideDir}`} style={{ width: '100%', maxWidth: '560px' }}>
          <div className="field-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(17,17,19,0.7)' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
              {field?.required && '* '}Campo {currentIndex + 1}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '20px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                {cleanLabel(field?.label || '')}
              </label>
                {field?.hint && data.form.show_hints && (
                  <button 
                    type="button" 
                    onClick={() => setShowHint(showHint === field.id ? null : field.id)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: showHint === field.id ? '#fbbf24' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
                    title="Ver pista"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                  </button>
                )}
              </div>
            
            {showHint === field?.id && field?.hint && (
              <div className="animate-fade-in" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#fbbf24', lineHeight: '1.5' }}>
                <strong>Pista:</strong> {field.hint}
              </div>
            )}

            {field && (
              <FieldRenderer field={field} value={answers[field.id] || ''} onChange={(val) => { setAnswers({ ...answers, [field.id]: val }); if (validationErrors[field.id]) setValidationErrors({ ...validationErrors, [field.id]: '' }); }} error={validationErrors[field.id]} hideLabel />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '28px', width: '100%', maxWidth: '560px' }}>
          <button type="button" onClick={goPrev} disabled={currentIndex === 0} className="btn btn-secondary" style={{ height: '50px', flex: 1, borderRadius: '14px', opacity: currentIndex === 0 ? 0.3 : 1 }}>
            ← Atrás
          </button>
          {currentIndex < total - 1 ? (
            <button type="button" onClick={() => goNext('right')} className="btn btn-primary" style={{ height: '50px', flex: 2, borderRadius: '14px', fontWeight: '700', fontSize: '15px' }}>
              Siguiente →
            </button>
          ) : (
            <button type="button" onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={submitting} className="btn btn-primary" style={{ height: '50px', flex: 2, borderRadius: '14px', fontWeight: '700', fontSize: '15px' }}>
              {submitting ? 'Enviando...' : '✓ Finalizar'}
            </button>
          )}
        </div>
        {error && <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px' }}>{error}</p>}
      </div>
    </div>
  );

  // ── DUOLINGO mode ─────────────────────────────────────────────────────────────
  const isGameOver = data.form.gamification && lives <= 0;
  return (
    <div className="public-form-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="mesh-gradient" style={{ opacity: feedback?.correct ? 0.6 : feedback ? 0.3 : 1, transition: 'opacity 0.3s' }} />
      <TopBar 
        formTitle={data.form.title}
        currentMode="duolingo"
        streak={streak}
        points={points}
        lives={lives}
        total={total}
        currentIndex={currentIndex}
        answered={answered}
        progress={progress}
        timeLeft={timeLeft}
        showGamification={data.form.gamification}
        maxLives={data.form.initial_lives ?? 3}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        {isGameOver ? (
          <div className="animate-scale-in" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ marginBottom: '24px' }}>
              <img src="/llama-sad.png" alt="Llama Triste" style={{ width: '140px', height: '140px', margin: '0 auto' }} className="animate-pulse" />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>¡Ups! Te quedaste sin vidas</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>No te preocupes, ¡la práctica hace al maestro! Vuelve a intentarlo para mejorar tu puntuación.</p>
            <button onClick={() => { setLives(data.form.initial_lives ?? 3); setPoints(0); setStreak(0); setCurrentIndex(0); setAnswers({}); setFeedback(null); }} className="btn btn-primary" style={{ height: '54px', padding: '0 40px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', boxShadow: '0 10px 25px rgba(124,106,247,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Reintentar desafío
            </button>
          </div>
        ) : (
          <>
            {/* Question card */}
            <div key={`duo-${currentIndex}`} className="animate-scale-in" style={{ width: '100%', maxWidth: '560px', marginBottom: '20px' }}>
              <div style={{ padding: '28px 28px 24px', borderRadius: '24px', border: `2px solid ${feedback ? (feedback.correct ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)') : 'rgba(255,255,255,0.08)'}`, background: feedback ? (feedback.correct ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)') : 'rgba(17,17,19,0.7)', transition: 'all 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{currentIndex + 1} / {total}</span>
                  {streak >= 2 && <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '3px 10px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '4px' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C12 2 12 7.5 12 11C12 11 14.5 10 16 10C17.5 10 19 12.5 19 15C19 18.866 15.866 22 12 22C8.13401 22 5 18.866 5 15C5 12 7 9 9 7C9 7 9 11 11 11C11 11 12 2 12 2Z"/></svg> Racha x{streak}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '20px', fontWeight: '700', color: 'white', lineHeight: '1.4' }}>
                    {cleanLabel(field?.label || '')}
                  </label>
                  {field?.hint && data.form.show_hints && !feedback && (
                    <button 
                      type="button" 
                      onClick={() => setShowHint(showHint === field.id ? null : field.id)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: showHint === field.id ? '#fbbf24' : 'rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                    </button>
                  )}
                </div>
                
                {showHint === field?.id && field?.hint && !feedback && (
                  <div className="animate-fade-in" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', fontSize: '13px', color: '#fbbf24', lineHeight: '1.5' }}>
                    <strong>Pista:</strong> {field.hint}
                  </div>
                )}
                {field && !feedback && (
                  <FieldRenderer
                    field={field}
                    value={answers[field.id] || ''}
                    onChange={(val) => {
                      setAnswers({ ...answers, [field.id]: val });
                      // Auto-check for radio/select with correct_answer
                      if ((field.type === 'radio' || field.type === 'select') && field.correct_answer) {
                        checkAnswer(field.id, val);
                      }
                    }}
                    error={validationErrors[field.id]}
                    hideLabel
                  />
                )}

                 {/* Feedback panel */}
                 {feedback && (
                   <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                     <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                       <img 
                         src={feedback.correct ? "/llama-happy.png" : "/llama-sad.png"} 
                         alt="Feedback Mascot" 
                         style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                         className={feedback.correct ? "animate-fade-in" : "animate-shake"}
                       />
                       <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: feedback.correct ? '#22c55e' : '#ef4444', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid #111113' }}>
                         {feedback.correct ? (
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                         ) : (
                           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                         )}
                       </div>
                     </div>
                     <div style={{ textAlign: 'center' }}>
                       <p style={{ fontWeight: '800', fontSize: '18px', color: feedback.correct ? '#22c55e' : '#ef4444', marginBottom: '4px' }}>
                         {feedback.correct ? `¡Increíble! +10 puntos` : '¡Oh no! Casi lo logras'}
                       </p>
                       {!feedback.correct && field?.correct_answer && (
                         <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>La respuesta correcta es: <strong style={{ color: 'white' }}>{field.correct_answer}</strong></p>
                       )}
                     </div>
                     {feedback.explanation && (
                       <div style={{ background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: '16px', padding: '16px', width: '100%' }}>
                         <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                           Fundamentación
                         </p>
                         <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: '1.6' }}>{feedback.explanation}</p>
                       </div>
                     )}
                   </div>
                 )}

                {/* Manual check for multi-step fields or any field that didn't auto-check */}
                {!feedback && field && (
                  <button 
                    type="button" 
                    onClick={() => {
                      const val = answers[field.id] || '';
                      if (field.required && !val.trim()) {
                        setValidationErrors({ ...validationErrors, [field.id]: 'Esta pregunta es obligatoria' });
                        return;
                      }
                      checkAnswer(field.id, val);
                    }} 
                    className="btn btn-secondary" 
                    style={{ marginTop: '12px', height: '44px', width: '100%', fontSize: '14px', borderRadius: '12px', fontWeight: '600' }}
                  >
                    {field.correct_answer ? 'Comprobar respuesta' : 'Confirmar selección'}
                  </button>
                )}
              </div>
            </div>


            {/* Action button */}
            <div style={{ width: '100%', maxWidth: '560px' }}>
              {feedback || !field?.correct_answer ? (
                currentIndex < total - 1 ? (
                  <button type="button" onClick={() => goNext('right')} className="btn btn-primary" style={{ width: '100%', height: '52px', borderRadius: '16px', fontWeight: '700', fontSize: '16px', background: feedback?.correct ? 'linear-gradient(135deg,#22c55e,#16a34a)' : undefined }}>
                    Continuar →
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmit as unknown as React.MouseEventHandler} disabled={submitting} className="btn btn-primary" style={{ width: '100%', height: '52px', borderRadius: '16px', fontWeight: '700', fontSize: '16px' }}>
                    {submitting ? 'Enviando...' : '🏆 Ver resultados'}
                  </button>
                )
              ) : null}
            </div>
          </>
        )}
        {error && <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px' }}>{error}</p>}
      </div>
    </div>
  );
}

function FieldRenderer({ field, value, onChange, error, hideLabel }: {
  field: FormField; value: string; onChange: (val: string) => void; error?: string; hideLabel?: boolean;
}) {
  return (
    <div>
      {!hideLabel && (
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'white', marginBottom: '12px', lineHeight: '1.4' }}>
          {cleanLabel(field.label)}{field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      {field.type === 'text' && <input className="input glass-input" type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder="Escribe aquí..." />}
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
            <div key={opt} className={`radio-option${value === opt ? ' selected' : ''}`} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${value === opt ? 'rgba(124,106,247,0.5)' : 'rgba(255,255,255,0.06)'}`, borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', transition: 'all 0.15s' }} onClick={() => onChange(opt)}>
              <div className="radio-dot" style={{ width: '14px', height: '14px', flexShrink: 0 }} />
              <span style={{ fontSize: '14px' }}>{opt}</span>
            </div>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options.map((opt) => {
            const selected = (value?.split(',') || []).includes(opt);
            return (
              <div 
                key={opt} 
                className={`radio-option${selected ? ' selected' : ''}`} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: `1px solid ${selected ? 'rgba(124,106,247,0.5)' : 'rgba(255,255,255,0.06)'}`, 
                  borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '10px'
                }} 
                onClick={() => {
                  const current = value?.split(',').filter(Boolean) || [];
                  const updated = selected ? current.filter(o => o !== opt) : [...current, opt];
                  onChange(updated.join(','));
                }}
              >
                <div style={{ 
                  width: '18px', height: '18px', borderRadius: '4px', 
                  border: `2px solid ${selected ? 'var(--accent)' : 'rgba(255,255,255,0.2)'}`,
                  background: selected ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s'
                }}>
                  {selected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontSize: '14px' }}>{opt}</span>
              </div>
            );
          })}
        </div>
      )}

      {error && <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {error}
      </p>}
    </div>
  );
}


