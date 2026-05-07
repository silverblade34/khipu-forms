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
  const [confirmDeleteForm, setConfirmDeleteForm] = useState<Form | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [shareForm, setShareForm] = useState<Form | null>(null);
  const [activeTab, setActiveTab] = useState<'my-forms' | 'templates'>('my-forms');

  const templates = [
    {
      id: 'template-quiz',
      title: 'Examen de Certificación',
      description: 'Preguntas con tiempo, pistas y gamificación activa.',
      icon: '🎯',
      mode: 'duolingo',
      gamification: true,
      isQuiz: true,
      lives: 3,
      fields: [
        { label: '¿Cuál es la capital de Francia? (Radio)', type: 'radio', options: ['París', 'Londres', 'Berlín'], correct_answer: 'París', hint: 'Es conocida como la ciudad de la luz.', explanation: 'París ha sido la capital desde el siglo X.' },
        { label: 'Calcula: 15 x 3 (Casillas)', type: 'checkbox', options: ['45', '30', '60'], correct_answer: '45', hint: 'Suma 15 tres veces.' },
        { label: 'Define la fotosíntesis (Lista)', type: 'select', options: ['Proceso de plantas', 'Proceso animal', 'Mineral'], correct_answer: 'Proceso de plantas' }
      ]
    },
    {
      id: 'template-survey',
      title: 'Encuesta de Satisfacción',
      description: 'Diseño clásico y formal para recolectar feedback profesional.',
      icon: '📊',
      mode: 'classic',
      gamification: false,
      isQuiz: false,
      fields: [
        { label: '¿Cómo calificaría nuestra atención? (Lista)', type: 'select', options: ['Excelente', 'Bueno', 'Regular', 'Malo'] },
        { label: '¿Qué es lo que más le gustó del servicio? (Radio)', type: 'radio', options: ['Rapidez', 'Calidad', 'Precio'] },
        { label: 'Sugerencias de mejora (Lista)', type: 'textarea' }
      ]
    },
    {
      id: 'template-leads',
      title: 'Registro de Evento',
      description: 'Experiencia fluida paso a paso ideal para móviles.',
      icon: '🚀',
      mode: 'cards',
      gamification: false,
      isQuiz: false,
      fields: [
        { label: 'Nombre completo (Lista)', type: 'text', required: true },
        { label: 'Correo electrónico (Lista)', type: 'email', required: true },
        { label: '¿Cómo se enteró de nosotros? (Radio)', type: 'radio', options: ['Redes Sociales', 'Amigos', 'Publicidad'] }
      ]
    },
    {
      id: 'template-trivia',
      title: 'Trivia de Cultura Pop',
      description: 'Pura diversión con rachas, puntos y nuestra mascota.',
      icon: '🎮',
      mode: 'duolingo',
      gamification: true,
      isQuiz: true,
      lives: 5,
      fields: [
        { label: '¿En qué año se lanzó el primer iPhone? (Radio)', type: 'radio', options: ['2007', '2005', '2010'], correct_answer: '2007', hint: 'Fue presentado por Steve Jobs.', explanation: 'El iPhone cambió la telefonía en junio de 2007.' },
        { label: 'Personajes de Star Wars (Casillas)', type: 'checkbox', options: ['Luke Skywalker', 'Batman', 'Darth Vader'], correct_answer: 'Luke Skywalker,Darth Vader' }
      ]
    }
  ];

  async function handleCreateFromTemplate(template: any) {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: template.title,
          presentation_mode: template.mode,
          gamification: template.gamification,
          is_quiz: template.isQuiz,
          initial_lives: template.lives
        }),
      });
      const form = await res.json();
      
      // Add fields
      for (const field of template.fields) {
        await fetch(`/api/forms/${form.id}/fields`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(field),
        });
      }
      
      router.push(`/builder/${form.id}`);
    } catch (e) {
      console.error(e);
      setCreating(false);
    }
  }

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
    setDeletingId(formId);
    try {
      await fetch(`/api/forms/${formId}`, { method: 'DELETE' });
      setForms(forms.filter((f) => f.id !== formId));
      setConfirmDeleteForm(null);
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

  const ShareModal = () => {
    if (!shareForm) return null;
    const url = `${window.location.origin}/f/${shareForm.id}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&bgcolor=111113&color=ffffff&margin=10`;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setShareForm(null)}>
        <div style={{ background: '#111113', border: '1px solid var(--border)', borderRadius: '28px', padding: '36px', maxWidth: '420px', width: '100%', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }} className="animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => setShareForm(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🚀</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>Compartir formulario</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>Tu formulario está listo para recibir respuestas.</p>
          </div>

          <div style={{ background: '#1a1a1c', padding: '24px', borderRadius: '20px', display: 'flex', justifyContent: 'center', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
            <img src={qrUrl} alt="QR Code" style={{ width: '160px', height: '160px', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <button 
              onClick={() => {
                const text = encodeURIComponent(`¡Hola! Te comparto este formulario de Khipu Forms: ${url}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#25D366', color: 'white', border: 'none', borderRadius: '14px', height: '48px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp
            </button>
            <button 
              onClick={() => handleCopyLink(shareForm.id)} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', height: '48px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
            >
              {copied === shareForm.id ? '¡Copiado!' : 'Copiar Link'}
            </button>
          </div>

          <div style={{ background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--accent)', textAlign: 'center', margin: 0, fontWeight: '500' }}>
              💡 ¡Ideal para universitarios! Pega el código QR en los pasillos para obtener respuestas rápidas.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const DeleteModal = () => {
    if (!confirmDeleteForm) return null;
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setConfirmDeleteForm(null)}>
        <div style={{ background: '#111113', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '100%', position: 'relative', boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }} className="animate-scale-in" onClick={(e) => e.stopPropagation()}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#ef4444' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>¿Eliminar formulario?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Estás por eliminar <strong style={{ color: 'white' }}>"{confirmDeleteForm.title}"</strong>. Esta acción es permanente y no se puede deshacer.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setConfirmDeleteForm(null)} className="btn btn-ghost" style={{ flex: 1, height: '48px', borderRadius: '14px' }}>
              Cancelar
            </button>
            <button 
              onClick={() => handleDelete(confirmDeleteForm.id)} 
              disabled={deletingId === confirmDeleteForm.id}
              className="btn btn-primary" 
              style={{ flex: 1, height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', fontWeight: '700' }}
            >
              {deletingId === confirmDeleteForm.id ? <IconSpinner /> : 'Sí, eliminar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const userName = isGuest ? 'Invitado' : (user.name || user.email.split('@')[0]);
  const userInitial = isGuest ? null : (user.name?.[0] || user.email[0]).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <ShareModal />
      <DeleteModal />
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
          <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '24px', width: 'auto' }} />
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
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '32px' }}>
          <button 
            onClick={() => setActiveTab('my-forms')}
            style={{ padding: '12px 4px', fontSize: '14px', fontWeight: '600', color: activeTab === 'my-forms' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${activeTab === 'my-forms' ? 'var(--accent)' : 'transparent'}`, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Mis Formularios ({forms.length})
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            style={{ padding: '12px 4px', fontSize: '14px', fontWeight: '600', color: activeTab === 'templates' ? 'var(--accent)' : 'var(--text-muted)', borderBottom: `2px solid ${activeTab === 'templates' ? 'var(--accent)' : 'transparent'}`, background: 'none', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Plantillas ✨
          </button>
        </div>

        {activeTab === 'templates' ? (
          <div className="animate-fade-in">
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '8px', letterSpacing: '-0.02em' }}>Galería de Plantillas</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Selecciona una base para empezar a crear tu formulario profesional en segundos.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {templates.map((template) => (
                <div key={template.id} className="public-form-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', height: '100%', transition: 'all 0.3s', cursor: 'default', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '20px' }}>{template.icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'white', marginBottom: '10px' }}>{template.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', flex: 1, marginBottom: '28px' }}>{template.description}</p>
                  <button 
                    onClick={() => handleCreateFromTemplate(template)}
                    disabled={creating}
                    className="btn btn-primary" 
                    style={{ width: '100%', height: '44px', fontSize: '14px', borderRadius: '12px', fontWeight: '700' }}
                  >
                    {creating ? <IconSpinner /> : 'Usar esta plantilla'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Mis formularios</h1>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{forms.length === 0 ? 'Crea tu primer formulario' : `${forms.length} formulario${forms.length !== 1 ? 's' : ''}`}</p>
              </div>
              <button onClick={handleCreateForm} disabled={creating} className="btn btn-primary">
                {creating ? <><IconSpinner /> Creando...</> : <><IconPlus /> Nuevo formulario</>}
              </button>
            </div>

            {forms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '2px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>✍️</div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>Aún no tienes formularios</h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '320px', margin: '0 auto 32px' }}>
                  Crea tu primer formulario o usa una de nuestras plantillas para empezar.
                </p>
                <button onClick={handleCreateForm} className="btn btn-primary" style={{ padding: '0 32px', height: '48px', borderRadius: '16px' }}>
                  Crear mi primer formulario
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {forms.map((form) => (
                  <div key={form.id} className="form-card animate-fade-in" style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--accent)', background: 'rgba(124,106,247,0.1)', padding: '2px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>
                            {form.presentation_mode}
                          </span>
                          {form.is_quiz && <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '6px' }}>Quiz</span>}
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{form.title}</h3>
                      </div>
                      <button onClick={() => setConfirmDeleteForm(form)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', padding: '4px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}>
                        <IconTrash />
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconGrid /> {form.field_count || 0} campos
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      <Link href={`/builder/${form.id}`} className="btn btn-secondary" style={{ padding: '0', height: '36px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <IconEdit /> Editar
                      </Link>
                      <Link href={`/f/${form.id}`} target="_blank" className="btn btn-secondary" style={{ padding: '0', height: '36px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <IconLink /> Ver
                      </Link>
                      <button onClick={() => setShareForm(form)} className="btn btn-primary" style={{ padding: '0', height: '36px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderRadius: '10px' }}>
                        Compartir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
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
