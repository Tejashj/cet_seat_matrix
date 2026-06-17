'use client';

import { useState, useEffect } from 'react';
import { parseKCETExcel, ImportResult } from '@/lib/data/excelImport';
import { Round, ROUND_LABELS } from '@/lib/data/roundFactors';
import {
  UploadCloud, AlertCircle, CheckCircle2, Trash2, Database,
  FileSpreadsheet, FileWarning, ArrowRight, Loader2, Sparkles,
  Cpu, Activity
} from 'lucide-react';

export default function DataImportWizard() {
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState<number>(2025);
  const [round, setRound] = useState<Round>('R1');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // Server-side database state
  const [serverDatasets, setServerDatasets] = useState<any[]>([]);
  const [training, setTraining] = useState<boolean>(false);
  const [trainStatus, setTrainStatus] = useState<string | null>(null);

  const loadServerDatasets = async () => {
    try {
      const res = await fetch('/api/datasets');
      if (res.ok) {
        const data = await res.json();
        setServerDatasets(data);
      }
    } catch (err) {
      console.error('Failed to load server datasets:', err);
    }
  };

  useEffect(() => {
    loadServerDatasets();
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
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', String(year));
      formData.append('round', round);
      formData.append('fileName', file.name);

      const res = await fetch('/api/datasets', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save dataset on server.');
      }

      await loadServerDatasets();
      setImportResult(null);
      setFile(null);
      alert('Data successfully uploaded and registered on the server!');
    } catch (err: any) {
      setError(err.message || 'Failed to upload data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this dataset? This will remove all associated cutoffs from the server.`)) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/datasets?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete dataset.');
      }
      await loadServerDatasets();
    } catch (err: any) {
      alert('Error deleting dataset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true);
    setTrainStatus('Analyzing historical trends...');
    try {
      const res = await fetch('/api/datasets/train', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Training failed.');
      }
      setTrainStatus(`Successfully trained prediction model with ${data.totalOptions.toLocaleString()} cutoffs across ${data.totalDatasets} datasets!`);
    } catch (err: any) {
      setTrainStatus(`Training Error: ${err.message}`);
    } finally {
      setTraining(false);
    }
  };

  const totalServerRecords = serverDatasets.reduce((sum, d) => sum + (d.rowCount || 0), 0);

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
              Upload official KCET cut-off Excel files. The parser automatically detects categories, college codes, branch codes, and cutoff ranks. Data is stored on the backend.
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
                    {loading ? <Loader2 className="spinner" size={14} /> : <>Save to Backend <ArrowRight size={14} /></>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Database Stats and Import History */}
        <div>
          {/* Database Summary */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileSpreadsheet size={18} style={{ color: 'var(--color-brand-500)' }} /> Backend Database Summary
            </h3>
            
            <div style={{
              padding: '1rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)',
              borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.1)',
              marginBottom: '1rem',
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Backend Records
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {totalServerRecords.toLocaleString()}
              </div>
            </div>

            {serverDatasets.length > 0 && (
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Registered Datasets
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 200, overflowY: 'auto', marginBottom: '1rem' }}>
                  {serverDatasets.map(imp => (
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
                          {imp.fileName} • {imp.rowCount.toLocaleString()} rows
                        </span>
                      </div>
                      <button
                        className="btn btn-icon btn-ghost btn-sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDelete(imp.id)}
                        disabled={loading}
                        title="Delete dataset"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {serverDatasets.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--surface-border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.8rem',
                marginBottom: '1rem',
              }}>
                <FileWarning size={28} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                No uploaded datasets. The engine is currently using synthetic baseline data.
              </div>
            )}
          </div>

          {/* Model Training panel */}
          <div className="card animate-fade-in" style={{ padding: '1.5rem', border: '1.5px solid var(--color-brand-100)', background: 'var(--surface-1)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} style={{ color: 'var(--color-brand-500)' }} /> AI Prediction Modeler
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '1rem' }}>
              Run the training engine on all uploaded datasets. It aggregates cutoffs, fits historical trendlines, and updates the active prediction database.
            </p>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              onClick={handleTrain}
              disabled={serverDatasets.length === 0 || training}
            >
              {training ? <Loader2 className="spinner" size={16} /> : <Activity size={16} />}
              Train Prediction Model
            </button>

            {trainStatus && (
              <div style={{
                marginTop: '1rem', padding: '0.75rem',
                background: trainStatus.includes('Error') ? '#fef2f2' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${trainStatus.includes('Error') ? '#fecaca' : 'rgba(16,185,129,0.2)'}`,
                borderRadius: 'var(--radius-md)',
                color: trainStatus.includes('Error') ? '#dc2626' : '#059669',
                fontSize: '0.78rem',
                lineHeight: 1.5,
              }}>
                {trainStatus}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
