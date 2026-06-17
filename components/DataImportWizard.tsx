'use client';

import { useState, useEffect } from 'react';
import { parseKCETExcel, ImportResult, RawAllotmentRecord } from '@/lib/data/excelImport';
import { saveAllotmentData, getDataSummary, deleteImport, getImportHistory } from '@/lib/data/indexedDB';
import { Round, ROUND_LABELS } from '@/lib/data/roundFactors';
import {
  UploadCloud, AlertCircle, CheckCircle2, Trash2, Database,
  FileSpreadsheet, FileWarning, ArrowRight, Loader2, Sparkles
} from 'lucide-react';

export default function DataImportWizard() {
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState<number>(2025);
  const [round, setRound] = useState<Round>('R1');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Db state
  const [summary, setSummary] = useState<{
    totalRecords: number;
    years: number[];
    rounds: Round[];
    imports: any[];
  } | null>(null);

  const refreshSummary = async () => {
    try {
      const data = await getDataSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  useEffect(() => {
    refreshSummary();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setImportResult(null);
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError('Please select an Excel file first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await parseKCETExcel(file, year, round);
      if (result.errors.length > 0) {
        setError(result.errors.join('\n'));
      } else {
        setImportResult(result);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse Excel file.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!importResult) return;
    setLoading(true);
    try {
      await saveAllotmentData(importResult.records, year, round, file?.name || 'Uploaded File');
      await refreshSummary();
      setImportResult(null);
      setFile(null);
      alert('Data successfully imported to browser IndexedDB!');
    } catch (err: any) {
      setError(err.message || 'Failed to save data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (y: number, r: Round) => {
    if (!confirm(`Are you sure you want to delete all imported data for ${y} ${ROUND_LABELS[r]}?`)) {
      return;
    }
    try {
      await deleteImport(y, r);
      await refreshSummary();
    } catch (err: any) {
      alert('Failed to delete import: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }} className="animate-fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left: Upload and wizard */}
        <div>
          <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
            <h2 className="font-display" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} className="text-gradient" /> Ingest Real KEA Allotment Data
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Upload official KCET cut-off Excel files. The parser automatically detects categories, college codes, branch codes, and cutoff ranks. Data stays inside your browser.
            </p>

            {/* Select options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Academic Year</label>
                <select className="input" value={year} onChange={e => setYear(Number(e.target.value))}>
                  {[2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Allotment Round</label>
                <select className="input" value={round} onChange={e => setRound(e.target.value as Round)}>
                  {(Object.entries(ROUND_LABELS) as [Round, string][]).map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Drop area */}
            <div style={{
              border: '2px dashed var(--surface-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              background: file ? 'rgba(99,102,241,0.03)' : 'var(--surface-1)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 200ms',
              marginBottom: '1.5rem',
            }}>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                style={{
                  position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%'
                }}
              />
              <UploadCloud size={40} style={{ color: 'var(--color-brand-500)', marginBottom: '0.75rem' }} />
              {file ? (
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Drag & drop KEA Excel or Click to Browse
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Supports .xlsx, .xls, .csv files
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div style={{
                display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem',
                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)',
                color: '#dc2626', fontSize: '0.85rem', marginBottom: '1.25rem',
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ whiteSpace: 'pre-line' }}>{error}</div>
              </div>
            )}

            {!importResult ? (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!file || loading}
                onClick={handleParse}
              >
                {loading ? <Loader2 className="spinner" size={18} /> : 'Parse & Validate File'}
              </button>
            ) : (
              <div className="animate-fade-in" style={{
                padding: '1.25rem', background: 'var(--surface-2)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)',
                marginBottom: '1.25rem',
              }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Sparkles size={16} className="text-gradient" /> Validation Result
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.82rem', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.5rem', background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Valid Rows</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-safe)' }}>{importResult.validRows.toLocaleString()}</div>
                  </div>
                  <div style={{ padding: '0.5rem', background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>Skipped Rows</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{importResult.skippedRows.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <strong>Auto-Detected Columns:</strong>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.25rem', marginTop: '0.35rem' }}>
                    {Object.entries(importResult.columnMapping).map(([field, orig]) => (
                      <span key={field} style={{ display: 'flex', gap: 4 }}>
                        <span style={{ color: 'var(--text-muted)' }}>{field}:</span>
                        <strong>{orig}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setImportResult(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', gap: '0.35rem' }} onClick={handleSave} disabled={loading}>
                    {loading ? <Loader2 className="spinner" size={14} /> : <>Save to Database <ArrowRight size={14} /></>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Database Stats and Import History */}
        <div>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} style={{ color: 'var(--color-brand-500)' }} /> Database Summary
            </h3>
            
            <div style={{
              padding: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)',
              borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.1)',
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Real Records Stored
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {summary ? summary.totalRecords.toLocaleString() : '0'}
              </div>
            </div>

            {summary && summary.imports.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Imported Datasets
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 240, overflowY: 'auto' }}>
                  {summary.imports.map(imp => (
                    <div key={imp.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.625rem 0.75rem', background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-border)',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {imp.academicYear} — {ROUND_LABELS[imp.round as Round] || imp.round}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {imp.fileName} • {imp.rowCount} rows
                        </span>
                      </div>
                      <button
                        className="btn btn-icon btn-ghost btn-sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDelete(imp.academicYear, imp.round as Round)}
                        title="Delete this dataset"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!summary || summary.imports.length === 0) && (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--surface-border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.8rem',
              }}>
                <FileWarning size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                No uploaded datasets. The engine is currently using synthetic baseline data.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
