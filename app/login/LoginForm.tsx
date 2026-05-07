'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            use_fedcm_for_prompt?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
              logo_alignment?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface Props {
  initialError?: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: 'Error al iniciar sesión con Google. Intenta de nuevo.',
  token_failed: 'No se pudo verificar tu cuenta de Google.',
  no_email: 'No pudimos obtener tu email de Google.',
  server_error: 'Error del servidor. Intenta de nuevo.',
};

export default function LoginForm({ initialError }: Props) {
  const router = useRouter();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError ? (ERROR_MESSAGES[initialError] ?? initialError) : '');
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const loadGSI = () => {
      if (!window.google || !googleBtnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        use_fedcm_for_prompt: false,
      });

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: googleBtnRef.current.offsetWidth || 340,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    };

    // Load script
    if (window.google) {
      loadGSI();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = loadGSI;
      document.head.appendChild(script);
    }
  }, []);

  async function handleGoogleCredential(response: { credential: string }) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Error al iniciar sesión. Intenta de nuevo.');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGuestLogin() {
    setGuestLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/guest', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Error al crear sesión de invitado.');
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '13px',
          color: 'var(--error)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}

      {/* Google GSI button (rendered by Google's SDK) */}
      {loading ? (
        <div style={{
          height: '44px', borderRadius: '8px', border: '1px solid var(--border)',
          background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '13px',
        }}>
          <span style={{
            width: '16px', height: '16px', border: '2px solid var(--border)',
            borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }} />
          Verificando...
        </div>
      ) : (
        <div
          ref={googleBtnRef}
          style={{ width: '100%', minHeight: '44px' }}
        />
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          o continúa sin cuenta
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
      </div>

      {/* Guest button */}
      <button
        onClick={handleGuestLogin}
        disabled={guestLoading || loading}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          width: '100%', height: '44px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'transparent',
          color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500',
          fontFamily: 'Inter, sans-serif', cursor: guestLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease', opacity: guestLoading ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!guestLoading) {
            const el = e.currentTarget;
            el.style.color = 'var(--text-primary)';
            el.style.borderColor = 'var(--border-light)';
            el.style.background = 'var(--bg-elevated)';
          }
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.color = 'var(--text-secondary)';
          el.style.borderColor = 'var(--border)';
          el.style.background = 'transparent';
        }}
      >
        {guestLoading ? (
          <>
            <span style={{
              width: '16px', height: '16px', border: '2px solid var(--border)',
              borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              display: 'inline-block',
            }} />
            Creando sesión...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Entrar como invitado
          </>
        )}
      </button>

      {/* Info box */}
      <div style={{
        background: 'rgba(124,106,247,0.06)', border: '1px solid rgba(124,106,247,0.15)',
        borderRadius: '8px', padding: '10px 14px', fontSize: '12px',
        color: 'var(--text-secondary)', lineHeight: '1.6',
      }}>
        <strong style={{ color: 'var(--accent)' }}>Modo invitado:</strong>{' '}
        tus formularios se guardan en el servidor. Puedes conectar Google después para acceder desde cualquier dispositivo.
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.6' }}>
        Al continuar, aceptas nuestros términos de uso y política de privacidad
      </p>
    </div>
  );
}
