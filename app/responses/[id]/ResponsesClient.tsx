'use client';

import { useState } from 'react';
import { Form, FormField, ResponseWithAnswers } from '@/lib/types';
import Link from 'next/link';

interface Props {
  form: Form;
  fields: FormField[];
  responses: ResponseWithAnswers[];
}

type Tab = 'charts' | 'responses' | 'summary';

export default function ResponsesClient({ form, fields, responses }: Props) {
  const [tab, setTab] = useState<Tab>('charts');

  function exportCSV() {
    if (fields.length === 0) return;
    const headers = ['Fecha', 'Email', ...(form.is_quiz ? ['Puntuación'] : []), ...fields.map((f) => f.label)];
    const rows = responses.map((r) => {
      const date = `"${new Date(r.created_at).toLocaleString('es-PE')}"`;
      const email = `"${r.respondent_email || ''}"`;
      const score = form.is_quiz ? [`"${r.score ?? ''}/${r.max_score ?? ''}"`] : [];
      const values = fields.map((field) => {
        const ans = r.answers.find((a) => a.field_id === field.id);
        return `"${(ans?.value || '').replace(/"/g, '""')}"`;
      });
      return [date, email, ...score, ...values].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_respuestas.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const avgScore = form.is_quiz && responses.length > 0
    ? responses.filter(r => r.score !== null).reduce((acc, r) => acc + (r.score ?? 0) / (r.max_score ?? 1), 0) / responses.filter(r => r.score !== null).length * 100
    : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ padding: '0 8px', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
          <div style={{ width: '1px', height: '16px', background: 'var(--border)', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{form.title}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Panel de respuestas</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Link href={`/builder/${form.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Editar</Link>
          {responses.length > 0 && (
            <button onClick={exportCSV} className="btn btn-secondary btn-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              CSV
            </button>
          )}
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <StatCard label="Total Respuestas" value={responses.length} icon={<Icons.Responses />} />
          <StatCard label="Dimensiones" value={fields.length} icon={<Icons.Fields />} />
          {form.require_email && <StatCard label="Población Única" value={new Set(responses.map(r => r.respondent_email).filter(Boolean)).size} icon={<Icons.Emails />} />}
          {form.is_quiz && avgScore !== null && <StatCard label="Nota Promedio" value={`${Math.round(avgScore)}%`} icon={<Icons.Target />} />}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '24px', maxWidth: '420px', display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            ['charts', <svg key="c" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>, 'Gráficos'],
            ['responses', <svg key="r" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, 'Respuestas'],
            ['summary', <svg key="s" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10h-10V2z"/><path d="M12 12L2.8 2.2"/><path d="M16.2 7.8l5.7 5.7"/><path d="M12 12v10"/></svg>, 'Resumen AI']
          ].map(([t, icon, label]) => (
            <button 
              key={t as string} 
              className={`tab${tab === t ? ' active' : ''}`} 
              onClick={() => setTab(t as Tab)}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', fontSize: '13px', fontWeight: '600', borderRadius: '8px', border: 'none', background: tab === t ? 'var(--accent)' : 'transparent', color: tab === t ? 'white' : 'var(--text-muted)', transition: 'all 0.2s', cursor: 'pointer' }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {responses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed var(--border)', borderRadius: '16px', background: 'var(--bg-secondary)' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
            <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>Sin respuestas aún</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Comparte el formulario para empezar a recibir respuestas</p>
            <div style={{ display: 'flex', gap: '8px', maxWidth: '400px', margin: '0 auto' }}>
              <input readOnly className="input text-xs" value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.id}`} />
              <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`)}>Copiar</button>
            </div>
          </div>
        )}

        {/* TAB: Summary */}
        {tab === 'summary' && responses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, rgba(124,106,247,0.15) 0%, rgba(124,106,247,0.05) 100%)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: '24px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.1 }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <span style={{ background: 'var(--accent)', color: 'white', fontSize: '10px', fontWeight: '900', padding: '4px 12px', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Khipu Analytics</span>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', letterSpacing: '-0.02em' }}>Análisis Inteligente de Muestra</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Indicador de Tendencia</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '10px', 
                      background: (avgScore || 0) >= 60 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: (avgScore || 0) >= 60 ? '#22c55e' : '#ef4444'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: 0 }}>
                        {form.is_quiz ? (avgScore && avgScore >= 60 ? 'Rendimiento Alto' : 'Rendimiento Bajo') : 'Muestra Activa'}
                      </p>
                      <p style={{ fontSize: '13px', color: (avgScore || 0) >= 60 ? '#22c55e' : '#ef4444', fontWeight: '700', margin: 0 }}>
                        {form.is_quiz ? `${Math.round(avgScore || 0)}% promedio` : 'Tendencia Estable'}
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {form.is_quiz 
                      ? `La muestra presenta un desempeño medio de ${Math.round(avgScore || 0)}%. Se observa una participación consistente.` 
                      : `Se han recolectado ${responses.length} respuestas válidas. La recolección de datos sigue un patrón de crecimiento lineal.`}
                  </p>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Hallazgos de la Población</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {fields.filter(f => f.type === 'radio' || f.type === 'select').slice(0, 4).map(field => {
                      const counts: Record<string, number> = {};
                      responses.forEach(r => {
                        const ans = r.answers.find(a => a.field_id === field.id);
                        if (ans?.value) counts[ans.value] = (counts[ans.value] || 0) + 1;
                      });
                      const top = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
                      if (!top) return null;
                      return (
                        <div key={field.id} style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: 'var(--accent)', fontWeight: '800' }}>{Math.round((top[1]/responses.length)*100)}%</span>
                          {top[0]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                Ficha Técnica del Levantamiento
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Última Interacción</span>
                  <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{new Date(responses[0].created_at).toLocaleString('es-PE')}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Modo de Captura</span>
                  <span style={{ color: 'var(--accent)', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase' }}>{form.presentation_mode}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Configuración de Red</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {form.require_email && <span style={{ fontSize: '10px', color: 'white', background: '#a78bfa', padding: '2px 8px', borderRadius: '4px' }}>EMAIL</span>}
                    {form.is_quiz && <span style={{ fontSize: '10px', color: 'white', background: '#f59e0b', padding: '2px 8px', borderRadius: '4px' }}>QUIZ</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Responses table */}
        {tab === 'responses' && responses.length > 0 && fields.length > 0 && (
          <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Fecha</th>
                  {form.require_email && <th style={thStyle}>Email</th>}
                  {form.is_quiz && <th style={thStyle}>Nota</th>}
                  {fields.map((f) => <th key={f.id} style={thStyle}>{f.label}{f.required && <span style={{ color: 'var(--error)' }}> *</span>}</th>)}
                </tr>
              </thead>
              <tbody>
                {responses.map((r, i) => (
                  <tr key={r.id} style={{ background: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)' }}>
                    <td style={tdStyle}>#{i + 1}</td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>{new Date(r.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                    {form.require_email && <td style={tdStyle}><span style={{ color: 'var(--text-secondary)' }}>{r.respondent_email || '—'}</span></td>}
                    {form.is_quiz && (
                      <td style={tdStyle}>
                        {r.score !== null ? (
                          <span style={{ fontWeight: '600', color: (r.score / (r.max_score || 1)) >= 0.6 ? 'var(--success)' : 'var(--error)' }}>
                            {r.score}/{r.max_score}
                          </span>
                        ) : '—'}
                      </td>
                    )}
                    {fields.map((field) => {
                      const ans = r.answers.find((a) => a.field_id === field.id);
                      const val = ans?.value || '';
                      return (
                        <td key={field.id} style={{ ...tdStyle, maxWidth: '200px' }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: val ? 'var(--text-primary)' : 'var(--text-muted)' }} title={val}>
                            {val || '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB: Charts */}
        {tab === 'charts' && responses.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {fields.filter((f) => f.type === 'select' || f.type === 'radio').map((field) => {
              const counts: Record<string, number> = {};
              for (const opt of field.options) counts[opt] = 0;
              for (const r of responses) {
                const ans = r.answers.find((a) => a.field_id === field.id);
                if (ans?.value) counts[ans.value] = (counts[ans.value] || 0) + 1;
              }
              const max = Math.max(...Object.values(counts), 1);
              return (
                <div key={field.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '4px', height: '16px', background: 'var(--accent)', borderRadius: '2px' }} />
                    <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{field.label}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.entries(counts).map(([opt, count]) => (
                      <div key={opt} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{opt}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{count} <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({responses.length > 0 ? Math.round((count / responses.length) * 100) : 0}%)</span></span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${(count / max) * 100}%`, 
                            background: (count / max) === 1 ? 'var(--accent)' : 'linear-gradient(90deg, var(--accent) 0%, rgba(124,106,247,0.6) 100%)',
                            borderRadius: '4px',
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {fields.filter(f => f.type === 'select' || f.type === 'radio').length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>
                Los gráficos aparecen para campos de tipo "Opción única" o "Desplegable"
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '10px 14px', fontSize: '11px', fontWeight: '600',
  color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  padding: '10px 14px', fontSize: '12px', borderBottom: '1px solid var(--border)',
  color: 'var(--text-secondary)',
};

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '20px', padding: '24px', flex: 1, minWidth: '160px', transition: 'transform 0.2s' }}>
      <div style={{ color: 'var(--accent)', marginBottom: '12px' }}>{icon}</div>
      <p style={{ fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '8px' }}>{value}</p>
      <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
    </div>
  );
}

// Icon helpers for StatCards
const Icons = {
  Responses: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Fields: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Emails: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Target: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
};
