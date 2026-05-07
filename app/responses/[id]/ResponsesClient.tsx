'use client';

import { Form, FormField, ResponseWithAnswers } from '@/lib/types';
import Link from 'next/link';

interface Props {
  form: Form;
  fields: FormField[];
  responses: ResponseWithAnswers[];
}

export default function ResponsesClient({ form, fields, responses }: Props) {
  function exportCSV() {
    if (fields.length === 0) return;

    const headers = ['Fecha', ...fields.map((f) => f.label)];
    const rows = responses.map((response) => {
      const date = new Date(response.created_at).toLocaleString('es-PE');
      const values = fields.map((field) => {
        const answer = response.answers.find((a) => a.field_id === field.id);
        const val = answer?.value || '';
        // Escape CSV
        return `"${val.replace(/"/g, '""')}"`;
      });
      return [`"${date}"`, ...values].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.title.replace(/[^a-z0-9]/gi, '_')}_respuestas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 border-b sticky top-0 z-10"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ padding: '0 8px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="w-px h-4" style={{ background: 'var(--border)' }} />
          <div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {form.title}
            </span>
            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
              Respuestas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/builder/${form.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            Editar formulario
          </Link>
          {responses.length > 0 && (
            <button onClick={exportCSV} className="btn btn-secondary btn-sm">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exportar CSV
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="px-6 py-8">
        {/* Stats */}
        <div className="flex items-center gap-6 mb-8">
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {responses.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              respuesta{responses.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="w-px h-8" style={{ background: 'var(--border)' }} />
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {fields.length}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              campo{fields.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {responses.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-4xl mb-4">📭</div>
            <p className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Sin respuestas aún
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Comparte el link del formulario para empezar a recibir respuestas
            </p>
            <div className="flex items-center gap-2 max-w-sm mx-auto">
              <input
                readOnly
                className="input text-xs"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/f/${form.id}`}
              />
              <button
                className="btn btn-primary btn-sm flex-shrink-0"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/f/${form.id}`)}
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        {/* Responses table */}
        {responses.length > 0 && fields.length > 0 && (
          <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold border-b"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', whiteSpace: 'nowrap' }}>
                    # Respuesta
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold border-b"
                    style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', whiteSpace: 'nowrap' }}>
                    Fecha
                  </th>
                  {fields.map((f) => (
                    <th key={f.id} className="text-left px-4 py-3 text-xs font-semibold border-b"
                      style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', whiteSpace: 'nowrap', minWidth: '140px' }}>
                      {f.label}
                      {f.required && <span style={{ color: 'var(--error)' }}> *</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((response, i) => (
                  <tr
                    key={response.id}
                    style={{ background: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)' }}
                  >
                    <td className="px-4 py-3 text-xs border-b" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                      #{i + 1}
                    </td>
                    <td className="px-4 py-3 text-xs border-b" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border)', whiteSpace: 'nowrap' }}>
                      {new Date(response.created_at).toLocaleString('es-PE', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    {fields.map((field) => {
                      const answer = response.answers.find((a) => a.field_id === field.id);
                      const val = answer?.value || '';
                      return (
                        <td key={field.id} className="px-4 py-3 text-xs border-b"
                          style={{ color: val ? 'var(--text-primary)' : 'var(--text-muted)', borderColor: 'var(--border)', maxWidth: '200px' }}>
                          <span className="block truncate" title={val}>
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
      </main>
    </div>
  );
}
