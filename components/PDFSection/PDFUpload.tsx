'use client';

import React, { useState, useRef } from 'react';
import { pdfService } from '@/lib/firebase/services/pdfService';
import { Upload, X, File, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface PDFUploadProps {
  onUploadSuccess?: () => void;
}

export default function PDFUpload({ onUploadSuccess }: PDFUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [description, setDescription] = useState('');
  
  const [isDragActive, setIsDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setSuccess(false);

    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF documents are allowed.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File size exceeds 50MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF file to upload.');
      return;
    }
    if (!year) {
      setError('Please select a valid year.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await pdfService.uploadPDF(file, Number(year), description);
      setSuccess(true);
      setFile(null);
      setDescription('');
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to upload file to Firebase storage.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-5">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Upload New Allotment PDF</h3>
      
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/50 text-red-600 dark:text-red-400 rounded-lg text-xs">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-950/50 text-emerald-650 dark:text-emerald-400 rounded-lg text-xs">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>PDF allotment metadata uploaded successfully!</span>
        </div>
      )}

      {/* Drag & Drop Box */}
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center space-y-3 cursor-pointer transition-all duration-200 ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10'
              : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 flex items-center justify-center">
            <Upload size={20} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-900 dark:text-white">
              Drag & drop your PDF file here, or <span className="text-indigo-600 dark:text-indigo-400 font-semibold">browse</span>
            </p>
            <p className="text-[10px] text-zinc-500 mt-1">Supports PDF up to 50MB</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center shrink-0">
              <File size={20} />
            </div>
            <div className="truncate max-w-[200px] md:max-w-[350px]">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{file.name}</p>
              <p className="text-[10px] text-zinc-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1.5 hover:bg-zinc-250 dark:hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Row: Year & Description */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Year */}
        <div className="space-y-2">
          <label htmlFor="year-select" className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
            Year *
          </label>
          <select
            id="year-select"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i + 2).map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="space-y-2 md:col-span-3">
          <label htmlFor="description" className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
            Description
          </label>
          <input
            id="description"
            type="text"
            placeholder="Describe the PDF allotment data (e.g. Round 2 Engineering cutoffs)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn btn-primary flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Uploading to Storage...
          </>
        ) : (
          <>
            <Upload size={16} />
            Upload PDF & Publish
          </>
        )}
      </button>
    </form>
  );
}
