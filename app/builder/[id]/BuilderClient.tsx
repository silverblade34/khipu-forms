'use client';

import { useEffect, useCallback, useState } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { Form, FormField } from '@/lib/types';
import Link from 'next/link';

interface Props {
  form: Form;
  fields: FormField[];
}

const FIELD_TYPES: { type: FormField['type']; label: string; iconPath: string }[] = [
  { type: 'text',     label: 'Texto corto', iconPath: 'M4 6h16M4 12h10' },
  { type: 'textarea', label: 'Texto largo',  iconPath: 'M4 6h16M4 10h16M4 14h16M4 18h10' },
  { type: 'email',    label: 'Email',        iconPath: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6' },
  { type: 'number',   label: 'Número',       iconPath: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
  { type: 'radio',    label: 'Opción única', iconPath: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01' },
  { type: 'select',   label: 'Desplegable',  iconPath: 'M19 9l-7 7-7-7' },
  { type: 'checkbox', label: 'Checkbox',     iconPath: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
];

function FieldIcon({ path }: { path: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function BuilderClient({ form, fields: initialFields }: Props) {
  const store = useBuilderStore();
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    store.setFormId(form.id);
    store.setTitle(form.title);
    store.setDescription(form.description || '');
    store.setIsPublic(form.is_public);
    store.setAccessCode(form.access_code || '');
    store.setIsQuiz(form.is_quiz ?? false);
    store.setShowScore(form.show_score ?? true);
    store.setQuizMessage(form.quiz_message || '¡Gracias por participar!');
    store.setRequireEmail(form.require_email ?? false);
    store.setStepByStep(form.step_by_step ?? false);
    store.setInformedConsent(form.informed_consent || '');
    store.setFields(initialFields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.id]);

  const save = useCallback(async () => {
    if (store.isSaving) return;
    store.setIsSaving(true);
    try {
      await fetch(`/api/forms/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: store.title,
          description: store.description || null,
          is_public: store.isPublic,
          access_code: store.accessCode || null,
          is_quiz: store.isQuiz,
          show_score: store.showScore,
          quiz_message: store.quizMessage || null,
          require_email: store.requireEmail,
          step_by_step: store.stepByStep,
          informed_consent: store.informedConsent || null,
        }),
      });
      await fetch(`/api/forms/${form.id}/fields`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: store.fields }),
      });
      store.markClean();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      store.setIsSaving(false);
    }
  }, [store, form.id]);

  useEffect(() => {
    if (!store.isDirty) return;
    const timer = setTimeout(save, 1500);
    return () => clearTimeout(timer);
  }, [store.isDirty, save]);

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function addFieldAndClose(type: FormField['type']) {
    store.addField(type);
    setTimeout(() => {
      const fields = useBuilderStore.getState().fields;
      if (fields.length > 0) setActiveFieldId(fields[fields.length - 1].id);
    }, 50);
    setSidebarOpen(false);
  }

  const saveStatusColor = store.isSaving ? 'var(--text-muted)' : saved ? 'var(--success)' : store.isDirty ? 'var(--warning)' : 'transparent';
  const saveStatusText = store.isSaving ? 'Guardando...' : saved ? 'Guardado' : store.isDirty ? 'Sin guardar' : '';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top bar */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: '52px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 20,
        gap: '8px',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-ghost btn-sm builder-sidebar-toggle"
            style={{ padding: '0 8px', flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ padding: '0 8px', flexShrink: 0, textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>

          <div style={{ width: '1px', height: '16px', background: 'var(--border)', flexShrink: 0 }} />

          <input
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontWeight: '600', fontSize: '13px', color: 'var(--text-primary)',
              letterSpacing: '-0.01em', flex: 1, minWidth: 0,
            }}
            value={store.title}
            onChange={(e) => store.setTitle(e.target.value)}
            placeholder="Nombre del formulario"
          />
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {saveStatusText && (
            <span style={{ fontSize: '11px', color: saveStatusColor, whiteSpace: 'nowrap', display: 'none' }} className="save-status">
              {saveStatusText}
            </span>
          )}

          <button
            onClick={save}
            disabled={store.isSaving || !store.isDirty}
            className="btn btn-secondary btn-sm"
          >
            Guardar
          </button>

          <button onClick={copyLink} className="btn btn-primary btn-sm">
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
            )}
            <span className="btn-share-text">{copied ? 'Copiado' : 'Compartir'}</span>
          </button>

          <Link
            href={`/f/${form.id}`}
            target="_blank"
            className="btn btn-ghost btn-sm builder-preview-btn"
            style={{ textDecoration: 'none' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>Preview</span>
          </Link>
        </div>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 15, display: 'none',
            }}
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left sidebar */}
        <aside
          className={`builder-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}
          style={{
            width: '220px', flexShrink: 0, borderRight: '1px solid var(--border)',
            background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '16px', flex: 1 }}>
            {/* Add fields */}
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Agregar campo
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {FIELD_TYPES.map((ft) => (
                <button
                  key={ft.type}
                  onClick={() => addFieldAndClose(ft.type)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', textAlign: 'left', borderRadius: '8px',
                    padding: '8px 10px', fontSize: '13px', color: 'var(--text-secondary)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.background = 'var(--bg-elevated)';
                    el.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.background = 'transparent';
                    el.style.color = 'var(--text-secondary)';
                  }}
                >
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '6px',
                    background: 'var(--bg-elevated)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', flexShrink: 0,
                  }}>
                    <FieldIcon path={ft.iconPath} />
                  </span>
                  {ft.label}
                </button>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />

            {/* Settings */}
            <p style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
              Ajustes del formulario
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field-group">
                <label className="label">Descripción</label>
                <textarea className="textarea" style={{ minHeight: '64px', fontSize: '12px' }} value={store.description} onChange={(e) => store.setDescription(e.target.value)} placeholder="Descripción opcional..." />
              </div>

              {/* Toggle: Público */}
              <ToggleRow label="Formulario público" value={store.isPublic} onChange={() => store.setIsPublic(!store.isPublic)} />

              {!store.isPublic && (
                <div className="field-group">
                  <label className="label">Código de acceso</label>
                  <input className="input" style={{ fontSize: '12px' }} value={store.accessCode} onChange={(e) => store.setAccessCode(e.target.value)} placeholder="ej: khipu2025" />
                </div>
              )}

              {/* Toggle: Requerir email */}
              <ToggleRow
                label="Requerir email"
                description="Evita respuestas duplicadas"
                value={store.requireEmail ?? false}
                onChange={() => store.setRequireEmail(!(store.requireEmail ?? false))}
              />

              {/* Toggle: Modo quiz */}
              <ToggleRow
                label="Modo Quiz"
                description="Califica respuestas automáticamente"
                value={store.isQuiz ?? false}
                onChange={() => store.setIsQuiz(!(store.isQuiz ?? false))}
                accent
              />

              {store.isQuiz && (
                <div className="field-group">
                  <label className="label">Mensaje al finalizar</label>
                  <input className="input" style={{ fontSize: '12px' }} value={store.quizMessage ?? ''} onChange={(e) => store.setQuizMessage(e.target.value)} placeholder="¡Gracias por participar!" />
                </div>
              )}

              {/* Toggle: Step-by-Step */}
              <ToggleRow
                label="Una pregunta a la vez"
                description="Estilo Typeform (próximamente)"
                value={store.stepByStep}
                onChange={() => store.setStepByStep(!store.stepByStep)}
              />

              {/* Informed Consent */}
              <div className="field-group">
                <label className="label">Consentimiento Informado (Investigadores)</label>
                <textarea
                  className="textarea"
                  style={{ minHeight: '64px', fontSize: '12px' }}
                  value={store.informedConsent}
                  onChange={(e) => store.setInformedConsent(e.target.value)}
                  placeholder="Texto legal que el usuario debe aceptar..."
                />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
            <Link
              href={`/responses/${form.id}`}
              className="btn btn-ghost btn-sm"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', textDecoration: 'none', alignItems: 'center', gap: '6px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
              </svg>
              Ver respuestas
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
          {store.fields.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%', textAlign: 'center',
              padding: '60px 20px', minHeight: '300px',
            }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '16px', color: 'var(--text-muted)',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  <line x1="12" y1="14" x2="12" y2="20"/><line x1="9" y1="17" x2="15" y2="17"/>
                </svg>
              </div>
              <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', fontSize: '15px' }}>
                Sin campos aún
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Agrega campos desde el panel lateral
              </p>
              <button
                className="btn btn-primary btn-sm builder-add-btn"
                style={{ marginTop: '20px' }}
                onClick={() => setSidebarOpen(true)}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Agregar campo
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {store.fields.map((field, index) => (
                <FieldCard
                  key={field.id}
                  field={field}
                  index={index}
                  total={store.fields.length}
                  isActive={activeFieldId === field.id}
                  onActivate={() => setActiveFieldId(activeFieldId === field.id ? null : field.id)}
                  onUpdate={(updates) => store.updateField(field.id, updates)}
                  onDelete={() => {
                    store.removeField(field.id);
                    if (activeFieldId === field.id) setActiveFieldId(null);
                  }}
                  onMoveUp={() => store.moveFieldUp(field.id)}
                  onMoveDown={() => store.moveFieldDown(field.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`
        .builder-sidebar {
          position: relative;
        }
        @media (max-width: 767px) {
          .builder-sidebar {
            position: fixed !important;
            top: 52px;
            left: 0;
            bottom: 0;
            z-index: 16;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            width: 260px !important;
          }
          .builder-sidebar.sidebar-open {
            transform: translateX(0) !important;
          }
          .sidebar-overlay { display: block !important; }
          .builder-preview-btn { display: none !important; }
          .builder-add-btn { display: flex !important; }
        }
        @media (min-width: 768px) {
          .builder-sidebar-toggle { display: none !important; }
          .builder-add-btn { display: none !important; }
          .save-status { display: inline !important; }
        }
        @media (min-width: 480px) {
          .btn-share-text { display: inline !important; }
        }
        .btn-share-text { display: none; }
      `}</style>
    </div>
  );
}

function FieldCard({
  field, index, total, isActive, onActivate, onUpdate, onDelete, onMoveUp, onMoveDown,
}: {
  field: FormField;
  index: number;
  total: number;
  isActive: boolean;
  onActivate: () => void;
  onUpdate: (updates: Partial<FormField>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const ft = FIELD_TYPES.find((t) => t.type === field.type);

  return (
    <div style={{
      borderRadius: '10px', overflow: 'hidden', transition: 'all 0.2s',
      border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
      background: isActive ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
      boxShadow: isActive ? '0 0 0 3px var(--accent-dim)' : 'none',
    }}>
      {/* Header row */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer' }}
        onClick={onActivate}
      >
        <span style={{
          width: '22px', height: '22px', borderRadius: '6px', background: 'var(--accent-dim)',
          color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: '700', flexShrink: 0,
        }}>
          {index + 1}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: '500', fontSize: '13px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
            {field.label}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{ft?.label || field.type}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {field.required && (
            <span className="badge badge-purple" style={{ fontSize: '10px' }}>Req.</span>
          )}
          <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} disabled={index === 0}
            className="btn btn-ghost btn-sm" style={{ padding: '0 5px', opacity: index === 0 ? 0.3 : 1 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} disabled={index === total - 1}
            className="btn btn-ghost btn-sm" style={{ padding: '0 5px', opacity: index === total - 1 ? 0.3 : 1 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="btn btn-ghost btn-sm" style={{ padding: '0 5px', color: 'var(--error)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded edit */}
      {isActive && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }} className="animate-fade-in">
          <div style={{ paddingTop: '12px' }} />
          <div className="field-group">
            <label className="label">Etiqueta del campo</label>
            <input
              className="input"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              placeholder="Ej: ¿Cuál es tu nombre?"
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={field.required} onChange={(e) => onUpdate({ required: e.target.checked })} style={{ width: '14px', height: '14px', accentColor: 'var(--accent)' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Campo obligatorio</span>
          </label>

          {(field.type === 'select' || field.type === 'radio') && (
            <div className="field-group">
              <label className="label">Opciones (una por línea)</label>
              <textarea className="textarea" value={field.options.join('\n')} onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(Boolean) })} placeholder={'Opción 1\nOpción 2\nOpción 3'} style={{ minHeight: '80px' }} />
            </div>
          )}

          {(field.type === 'select' || field.type === 'radio') && field.options.length > 0 && (
            <div className="field-group">
              <label className="label">✓ Respuesta correcta (quiz)</label>
              <select className="input" style={{ fontSize: '12px' }} value={field.correct_answer ?? ''} onChange={(e) => onUpdate({ correct_answer: e.target.value || null })}>
                <option value="">Sin respuesta correcta</option>
                {field.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, description, value, onChange, accent }: { label: string; description?: string; value: boolean; onChange: () => void; accent?: boolean }) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
      <div onClick={onChange} style={{ position: 'relative', width: '36px', height: '20px', borderRadius: '10px', transition: 'background 0.2s', background: value ? (accent ? 'var(--accent)' : 'var(--accent)') : 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0, marginTop: '1px' }}>
        <div style={{ position: 'absolute', top: '2px', left: '2px', width: '14px', height: '14px', borderRadius: '50%', background: 'white', transition: 'transform 0.2s', transform: value ? 'translateX(16px)' : 'translateX(0)' }} />
      </div>
      <div>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', lineHeight: '1.4' }}>{label}</span>
        {description && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{description}</span>}
      </div>
    </label>
  );
}
