import type { Metadata } from 'next';
import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Iniciar sesión — Khipu Forms',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(124,106,247,0.12) 0%, transparent 60%)',
    }}>
      {/* Left panel - branding (hidden on mobile) */}
      <div style={{
        flex: 1,
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px',
        borderRight: '1px solid var(--border)',
      }} className="login-left-panel">
        <div style={{ maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
            <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '36px', width: 'auto' }} />
          </div>

          <h2 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: '1.2', marginBottom: '16px' }}>
            Formularios que<br />simplemente funcionan.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '40px' }}>
            Crea formularios bonitos en segundos, compártelos con un link y ve las respuestas en tiempo real.
          </p>

          {/* Feature list */}
          {[
            { label: 'Crea formularios en segundos', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { label: 'Comparte con un link público', icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
            { label: 'Respuestas en tiempo real', icon: 'M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3' },
            { label: 'Exporta a CSV con un clic', icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' },
          ].map((f) => (
            <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--accent-dim)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - login form */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 24px',
        margin: '0 auto',
      }} className="login-right-panel">

        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }} className="login-mobile-logo">
          <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '32px', width: 'auto' }} />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '8px' }}>
            Bienvenido de vuelta
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Inicia sesión para crear y gestionar tus formularios
          </p>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <LoginForm initialError={params.error} />
        </div>

        <Link href="/" style={{
          display: 'block', textAlign: 'center', marginTop: '20px',
          fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none',
        }}>
          ← Volver al inicio
        </Link>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .login-left-panel { display: flex !important; }
          .login-mobile-logo { display: none !important; }
          .login-right-panel { padding: 48px 56px !important; }
        }
      `}</style>
    </main>
  );
}
