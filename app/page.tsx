import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Khipu Forms — Constructor de formularios moderno',
  description: 'Crea formularios sin fricción, compártelos por link y recibe respuestas en tiempo real. Minimalista, rápido y bien diseñado.',
};

const features = [
  {
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    title: 'Instantáneo',
    desc: 'Crea un formulario completo en menos de un minuto. Sin configuraciones complejas.',
  },
  {
    icon: 'M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71',
    title: 'Comparte con un link',
    desc: 'Un URL limpio para compartir tu formulario con cualquier persona, en cualquier lugar.',
  },
  {
    icon: 'M3 3v18h18M18.7 8l-5.1 5.2-2.8-2.7L7 14.3',
    title: 'Respuestas en tiempo real',
    desc: 'Ve cada respuesta al instante en tu dashboard. Exporta a CSV cuando quieras.',
  },
  {
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    title: 'Sin cuenta obligatoria',
    desc: 'Empieza como invitado o conecta Google. Tú eliges cuándo registrarte.',
  },
  {
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    title: '6 tipos de campo',
    desc: 'Texto, email, número, selección, checkbox y más. Todo lo que necesitas en un MVP.',
  },
  {
    icon: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3',
    title: 'Exporta tus datos',
    desc: 'Descarga todas tus respuestas en formato CSV con un solo clic.',
  },
];

const steps = [
  { n: '01', title: 'Crea tu formulario', desc: 'Ingresa como invitado o con Google. Ponle un título y empieza a agregar campos.' },
  { n: '02', title: 'Agrega los campos', desc: 'Arrastra o selecciona tipos de campo. Marca cuáles son obligatorios.' },
  { n: '03', title: 'Comparte el link', desc: 'Copia la URL pública y envíala por WhatsApp, email o redes sociales.' },
  { n: '04', title: 'Ve las respuestas', desc: 'Cada envío aparece en tu dashboard en tiempo real. Exporta a CSV.' },
];

function SVGIcon({ path, size = 20 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
          <style>{`
        .landing-hero-title {
          font-size: clamp(32px, 6vw, 60px);
        }
        .landing-features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .landing-steps-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 24px;
        }
        @media (min-width: 480px) {
          .landing-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 900px) {
          .landing-features-grid { grid-template-columns: repeat(3, 1fr); }
          .landing-steps-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .landing-cta-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        @media (min-width: 480px) {
          .landing-cta-row { flex-direction: row; justify-content: center; }
        }
        .nav-desktop-links { display: none; }
        @media (min-width: 640px) {
          .nav-desktop-links { display: flex !important; }
        }
        .feature-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .feature-card:hover {
          border-color: var(--border-light);
          transform: translateY(-2px);
        }
        .nav-link {
          font-size: 13px;
          color: var(--text-secondary);
          padding: 6px 12px;
          border-radius: 8px;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--text-primary); }
        .btn-hero-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s, transform 0.2s;
          letter-spacing: -0.01em;
        }
        .btn-hero-primary:hover { background: var(--accent-hover); transform: translateY(-1px); }
        .btn-hero-secondary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13px;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 11px 20px;
          background: var(--bg-elevated);
          transition: border-color 0.2s, color 0.2s;
        }
        .btn-hero-secondary:hover { border-color: var(--border-light); color: var(--text-primary); }
        .btn-cta-final {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent);
          color: white;
          text-decoration: none;
          border-radius: 10px;
          padding: 14px 28px;
          font-size: 15px;
          font-weight: 600;
          transition: background 0.2s, transform 0.2s;
          letter-spacing: -0.01em;
        }
        .btn-cta-final:hover { background: var(--accent-hover); transform: translateY(-1px); }
        @media (min-width: 900px) {
          .step-arrow { display: block !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', height: '60px', borderBottom: '1px solid var(--border)',
          background: 'rgba(10,10,11,0.8)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '24px', width: 'auto' }} />
          </div>

          <div className="nav-desktop-links" style={{ alignItems: 'center', gap: '4px' }}>
            {[
              { label: 'Funciones', href: '#features' },
              { label: 'Cómo funciona', href: '#how' },
            ].map((l) => (
              <a key={l.href} href={l.href} className="nav-link">
                {l.label}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/login" style={{
              fontSize: '13px', color: 'var(--text-secondary)', textDecoration: 'none',
              padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)',
              background: 'var(--bg-elevated)', transition: 'all 0.2s',
            }}>
              Iniciar sesión
            </Link>
            <Link href="/login" style={{
              fontSize: '13px', fontWeight: '600', color: 'white', textDecoration: 'none',
              padding: '6px 14px', borderRadius: '8px', background: 'var(--accent)',
              transition: 'background 0.2s', display: 'none',
            }} className="nav-desktop-links">
              Crear formulario
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', textAlign: 'center',
          padding: '80px 24px 60px',
          backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,106,247,0.15) 0%, transparent 70%)',
        }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'var(--accent-dim)', color: 'var(--accent)',
              borderRadius: '9999px', padding: '4px 12px', fontSize: '12px', fontWeight: '500',
              border: '1px solid rgba(124,106,247,0.2)',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              Beta · forms.khipu.lat
            </span>
          </div>

          <h1
            className="landing-hero-title"
            style={{
              fontWeight: '800', color: 'var(--text-primary)',
              letterSpacing: '-0.04em', lineHeight: '1.05',
              maxWidth: '700px', marginBottom: '20px',
            }}
          >
            Formularios que{' '}
            <span style={{
              background: 'linear-gradient(135deg, #7c6af7 0%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              simplemente funcionan.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2vw, 16px)', color: 'var(--text-secondary)',
            maxWidth: '520px', lineHeight: '1.75', marginBottom: '36px',
          }}>
            Crea formularios hermosos en segundos, compártelos con un link y recibe respuestas en tiempo real.
            Sin complejidad innecesaria.
          </p>

          <div className="landing-cta-row">
            <Link href="/login" className="btn-hero-primary">
              Crear mi primer formulario
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a href="#how" className="btn-hero-secondary">
              Cómo funciona
            </a>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' }}>
            Gratis · Sin tarjeta de crédito · Empieza en segundos
          </p>
        </section>

        {/* Features */}
        <section id="features" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '12px' }}>
                Todo lo que necesitas
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                Sin exceso de funciones. Solo lo esencial, hecho bien.
              </p>
            </div>

            <div className="landing-features-grid">
              {features.map((f) => (
                <div key={f.title} className="feature-card">
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'var(--accent-dim)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', marginBottom: '16px',
                  }}>
                    <SVGIcon path={f.icon} size={18} />
                  </div>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" style={{ padding: '80px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '12px' }}>
                Cómo funciona
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '360px', margin: '0 auto' }}>
                Cuatro pasos para tener tu formulario en marcha
              </p>
            </div>

            <div className="landing-steps-grid">
              {steps.map((s, i) => (
                <div key={s.n} style={{ position: 'relative' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700', color: 'var(--accent)',
                    letterSpacing: '0.05em', marginBottom: '12px', fontFamily: 'monospace',
                  }}>{s.n}</div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {s.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                    {s.desc}
                  </p>
                  {i < steps.length - 1 && (
                    <div style={{
                      display: 'none', position: 'absolute', top: '6px', right: '-12px',
                      color: 'var(--border)',
                    }} className="step-arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* CTA final */}
        <section style={{
          padding: '80px 24px', textAlign: 'center',
          borderTop: '1px solid var(--border)',
          backgroundImage: 'radial-gradient(ellipse 80% 100% at 50% 100%, rgba(124,106,247,0.1) 0%, transparent 70%)',
        }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '16px' }}>
            Empieza ahora, gratis.
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '380px', margin: '0 auto 32px' }}>
            Sin tarjeta de crédito. Sin configuraciones. Solo formularios que funcionan.
          </p>
          <Link href="/login" className="btn-cta-final">
            Crear mi formulario gratis
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid var(--border)', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/logo-form-khipu.png" alt="Khipu Forms" style={{ height: '20px', width: 'auto' }} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Khipu Forms · forms.khipu.lat
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
            © 2025 · Hecho con cuidado
          </p>
        </footer>
      </div>
    </>
  );
}
