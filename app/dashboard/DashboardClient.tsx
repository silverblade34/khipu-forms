'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form } from '@/lib/types';
import Link from 'next/link';

interface Props {
  user: { id: string; email: string; name: string | null; avatar_url: string | null };
  forms: Form[];
  isGuest: boolean;
}

// SVG Icon components
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  );
}
function IconSpinner() {
  return (
    <span style={{
      width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite',
    }} />
  );
}
function IconEdit() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
    </svg>
  );
}
function IconLink() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconLogOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}
function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconAlertTriangle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

export default function DashboardClient({ user, forms: initialForms, isGuest }: Props) {
  const router = useRouter();
  const [forms, setForms] = useState<Form[]>(initialForms);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCreateForm() {
    setCreating(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Formulario sin título' }),
      });
      const form: Form = await res.json();
      router.push(`/builder/${form.id}`);
    } catch {
      setCreating(false);
    }
  }

  async function handleDelete(formId: string) {
    if (!confirm('¿Eliminar este formulario? Esta acción no se puede deshacer.')) return;
    setDeletingId(formId);
    try {
      await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
      setForms(forms.filter((f) => f.id !== formId));
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  function handleCopyLink(formId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/f/${formId}`);
    setCopied(formId);
    setTimeout(() => setCopied(null), 2000);
  }

  const userName = isGuest ? 'Invitado' : (user.name || user.email.split('@')[0]);
  const userInitial = isGuest ? null : (user.name?.[0] || user.email[0]).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Top nav */}
      <header style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px', background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '13px', fontWeight: '700', flexShrink: 0,
          }}>K</div>
          <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)' }}>Khipu Forms</span>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isGuest && (
            <a href="/api/auth/google" className="btn btn-primary btn-sm" style={{ textDecoration: 'none', display: 'none' }} id="connect-google-btn">
              Conectar Google
            </a>
          )}

          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user.avatar_url && !isGuest ? (
              <img src={user.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)' }} />
            ) : (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: isGuest ? 'var(--bg-elevated)' : 'var(--accent)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isGuest ? 'var(--text-muted)' : 'white',
                fontSize: '12px', fontWeight: '600',
              }}>
                {isGuest ? <IconUser /> : userInitial}
              </div>
            )}
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'none' }} className="nav-username">
              {userName}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm"
            title="Cerrar sesión"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <IconLogOut />
            <span className="nav-logout-text" style={{ display: 'none' }}>Salir</span>
          </button>
        </div>
      </header>

      {/* Guest banner */}
      {isGuest && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(124,106,247,0.08) 0%, rgba(124,106,247,0.04) 100%)',
          borderBottom: '1px solid rgba(124,106,247,0.2)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0 }}>
              <IconAlertTriangle />
            </span>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Modo <strong style={{ color: 'var(--text-primary)' }}>invitado</strong> — conecta Google para no perder tus formularios
            </p>
          </div>
          <a href="/api/auth/google" style={{
            fontSize: '12px', fontWeight: '600', color: 'var(--accent)',
            textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Conectar Google →
          </a>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        {/* Page header */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          marginBottom: '28px', gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Mis formularios
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {forms.length === 0 ? 'Crea tu primer formulario' : `${forms.length} formulario${forms.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={handleCreateForm} disabled={creating} className="btn btn-primary">
            {creating ? <><IconSpinner /> Creando...</> : <><IconPlus /> Nuevo formulario</>}
          </button>
        </div>

        {/* Empty state */}
        {forms.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            border: '1px dashed var(--border)', borderRadius: '16px',
            background: 'var(--bg-secondary)',
          }} className="animate-fade-in">
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-dim)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <IconGrid />
            </div>
            <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px', fontSize: '15px' }}>
              Sin formularios aún
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
              Crea tu primer formulario y empieza a recibir respuestas
            </p>
            <button onClick={handleCreateForm} disabled={creating} className="btn btn-primary">
              {creating ? <><IconSpinner /> Creando...</> : 'Crear formulario'}
            </button>
          </div>
        )}

        {/* Forms grid */}
        {forms.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {forms.map((form, i) => {
              const formattedDate = new Date(form.created_at).toLocaleDateString('es-PE', {
                day: '2-digit', month: 'short', year: 'numeric',
              });

              return (
                <div
                  key={form.id}
                  className="animate-fade-in"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    transition: 'all 0.2s ease',
                    animationDelay: `${i * 50}ms`,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'var(--border-light)';
                    el.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget;
                    el.style.borderColor = 'var(--border)';
                    el.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Title */}
                  <Link href={`/builder/${form.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {form.title}
                    </h3>
                    {form.description && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                        {form.description}
                      </p>
                    )}
                  </Link>

                  {/* Stats */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{form.field_count ?? 0} campos</span>
                    <span style={{ color: 'var(--border)', fontSize: '10px' }}>·</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{form.response_count ?? 0} respuestas</span>
                    <span style={{ color: 'var(--border)', fontSize: '10px' }}>·</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formattedDate}</span>
                  </div>

                  {/* Actions */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    paddingTop: '10px', borderTop: '1px solid var(--border)',
                  }}>
                    <Link href={`/builder/${form.id}`} className="btn btn-secondary btn-sm" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IconEdit /> Editar
                    </Link>
                    <Link href={`/responses/${form.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <IconBarChart />
                    </Link>
                    <button
                      onClick={() => handleCopyLink(form.id)}
                      className="btn btn-ghost btn-sm"
                      title={copied === form.id ? 'Copiado' : 'Copiar link'}
                      style={{ color: copied === form.id ? 'var(--success)' : undefined }}
                    >
                      {copied === form.id ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : <IconLink />}
                    </button>
                    <button
                      onClick={() => handleDelete(form.id)}
                      disabled={deletingId === form.id}
                      className="btn btn-ghost btn-sm"
                      title="Eliminar"
                      style={{ color: 'var(--error)' }}
                    >
                      {deletingId === form.id ? (
                        <span style={{ width: '13px', height: '13px', border: '1.5px solid rgba(239,68,68,0.3)', borderTopColor: 'var(--error)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                      ) : <IconTrash />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        @media (min-width: 640px) {
          .nav-username { display: inline !important; }
          .nav-logout-text { display: inline !important; }
          #connect-google-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
