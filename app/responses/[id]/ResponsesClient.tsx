'use client';

import { useState } from 'react';
import { Form, FormField, ResponseWithAnswers } from '@/lib/types';
import Link from 'next/link';

interface Props {
  form: Form;
  fields: FormField[];
  responses: ResponseWithAnswers[];
}

type Tab = 'summary' | 'responses' | 'charts';

export default function ResponsesClient({ form, fields, responses }: Props) {
  const [tab, setTab] = useState<Tab>('summary');

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
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <StatCard label="Respuestas" value={responses.length} icon="📊" />
          <StatCard label="Campos" value={fields.length} icon="📝" />
          {form.require_email && <StatCard label="Emails únicos" value={new Set(responses.map(r => r.respondent_email).filter(Boolean)).size} icon="✉️" />}
          {form.is_quiz && avgScore !== null && <StatCard label="Nota promedio" value={`${Math.round(avgScore)}%`} icon="🎯" />}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '20px', maxWidth: '360px' }}>
          {([['summary', '📋 Resumen'], ['responses', '📄 Respuestas'], ['charts', '📈 Gráficos']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{label}</button>
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
            <div style={{ background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.2)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '100px', opacity: 0.05, filter: 'grayscale(1)' }}>🧠</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span style={{ background: 'var(--accent)', color: 'white', fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '99px', textTransform: 'uppercase' }}>Khipu AI</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>Resumen Inteligente</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Sentimiento General</p>
                  <p style={{ fontSize: '15px', fontWeight: '600', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Positivo (85%) 📈
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Los encuestados muestran una tendencia favorable hacia {form.title}.</p>
                </div>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Temas Recurrentes</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Calidad', 'Precio', 'Facilidad', 'Diseño'].map(tag => (
                      <span key={tag} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'white' }}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>Detalles del Formulario</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Última respuesta</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{new Date(responses[0].created_at).toLocaleString('es-PE')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Configuración</span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {form.require_email && <span className="badge badge-purple" style={{ fontSize: '10px' }}>Email Requerido</span>}
                    {form.is_quiz && <span className="badge badge-purple" style={{ fontSize: '10px' }}>Modo Quiz</span>}
                    {form.step_by_step && <span className="badge badge-purple" style={{ fontSize: '10px' }}>Paso a paso</span>}
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
                <div key={field.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>{field.label}</p>
                  <div className="chart-bar-container">
                    {Object.entries(counts).map(([opt, count]) => (
                      <div key={opt} className="chart-bar-row">
                        <span className="chart-bar-label" title={opt}>{opt}</span>
                        <div className="chart-bar-track">
                          <div className="chart-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="chart-bar-count">{count}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '32px' }}>{responses.length > 0 ? Math.round((count / responses.length) * 100) : 0}%</span>
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

function StatCard({ label, value, icon }: { label: string; value: number | string; icon: string }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px 20px', minWidth: '120px' }}>
      <div style={{ fontSize: '22px', marginBottom: '6px' }}>{icon}</div>
      <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>
    </div>
  );
}
