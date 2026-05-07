'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Form, FormField } from '@/lib/types';

interface FormData {
  form: Form;
  fields: FormField[];
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;

  const [data, setData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessCode, setAccessCode] = useState('');
  const [accessGranted, setAccessGranted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`/api/public/forms/${formId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Formulario no encontrado');
        return r.json();
      })
      .then((d: FormData) => {
        setData(d);
        if (!d.form.access_code) setAccessGranted(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [formId]);

  function checkAccessCode() {
    if (accessCode === data?.form.access_code) {
      setAccessGranted(true);
    } else {
      setError('Código de acceso incorrecto');
      setTimeout(() => setError(null), 3000);
    }
  }

  function validate(): boolean {
    if (!data) return false;
    const errors: Record<string, string> = {};
    for (const field of data.fields) {
      const val = answers[field.id] || '';
      if (field.required && !val.trim()) {
        errors[field.id] = 'Este campo es obligatorio';
      }
      if (field.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        errors[field.id] = 'Ingresa un email válido';
      }
      if (field.type === 'number' && val && isNaN(Number(val))) {
        errors[field.id] = 'Ingresa un número válido';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const answerArray = data!.fields.map((f) => ({
        field_id: f.id,
        value: answers[f.id] || '',
      }));

      const res = await fetch(`/api/public/forms/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answerArray,
          access_code: accessCode || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const err = await res.json();
        setError(err.error || 'Error al enviar');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Formulario no disponible</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center animate-fade-in max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
            ✓
          </div>
          <h2 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            ¡Respuesta enviada!
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Tu respuesta ha sido registrada correctamente. Gracias por participar.
          </p>
          <button
            onClick={() => { setSubmitted(false); setAnswers({}); }}
            className="btn btn-secondary btn-sm mt-6"
          >
            Enviar otra respuesta
          </button>
        </div>
      </div>
    );
  }

  // Access code gate
  if (!accessGranted && data?.form.access_code) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-full max-w-sm animate-fade-in">
          <div className="card">
            <div className="text-2xl mb-4">🔒</div>
            <h2 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              {data.form.title}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Este formulario requiere un código de acceso
            </p>
            {error && (
              <p className="text-sm mb-3 rounded-lg px-3 py-2" style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.1)' }}>
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Código de acceso"
                onKeyDown={(e) => e.key === 'Enter' && checkAccessCode()}
              />
              <button onClick={checkAccessCode} className="btn btn-primary">
                Acceder
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-xl mx-auto animate-fade-in">
        {/* Form header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {data.form.title}
          </h1>
          {data.form.description && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              {data.form.description}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {data.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              value={answers[field.id] || ''}
              onChange={(val) => {
                setAnswers({ ...answers, [field.id]: val });
                if (validationErrors[field.id]) {
                  setValidationErrors({ ...validationErrors, [field.id]: '' });
                }
              }}
              error={validationErrors[field.id]}
            />
          ))}

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: 'var(--error)', background: 'rgba(239,68,68,0.1)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary btn-lg mt-2"
            style={{ alignSelf: 'flex-start' }}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : 'Enviar respuesta →'}
          </button>

          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Formulario creado con{' '}
            <a href="/" style={{ color: 'var(--accent)' }}>Khipu Forms</a>
          </p>
        </form>
      </div>
    </div>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: FormField;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  return (
    <div className="field-group">
      <label className="label">
        {field.label}
        {field.required && <span style={{ color: 'var(--error)' }}> *</span>}
      </label>

      {field.type === 'text' && (
        <input className="input" type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Ingresa ${field.label.toLowerCase()}`} />
      )}

      {field.type === 'textarea' && (
        <textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} placeholder={`Ingresa ${field.label.toLowerCase()}`} />
      )}

      {field.type === 'email' && (
        <input className="input" type="email" value={value} onChange={(e) => onChange(e.target.value)} placeholder="correo@ejemplo.com" />
      )}

      {field.type === 'number' && (
        <input className="input" type="number" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
      )}

      {field.type === 'select' && (
        <select
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ cursor: 'pointer' }}
        >
          <option value="">Selecciona una opción</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )}

      {field.type === 'checkbox' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="w-4 h-4 accent-purple-500"
          />
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sí</span>
        </label>
      )}

      {error && (
        <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>
      )}
    </div>
  );
}
