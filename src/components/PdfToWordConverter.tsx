'use client';

import { useState } from 'react';
import { convertPdfToWord } from '@/app/actions'; // Server Action

export default function PdfToWordConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await convertPdfToWord(formData);
    if (res.success) {
      setResult(res?.docUrl); // e.g., Blob URL or download link
    } else {
      setError(res?.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="form-control">
        <label className="label">
          <span className="label-text">Upload PDF File</span>
        </label>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="file-input file-input-bordered w-full"
        />
        <label className="label">
          <span className="label-text-alt text-base-content/60">Maximum file size: 10MB</span>
        </label>
      </div>

      <div className="flex justify-center">
        <button 
          className={`btn btn-primary btn-wide ${!file ? 'btn-disabled' : ''}`} 
          onClick={handleConvert}
          disabled={!file}
        >
          {file ? 'Convert to Word' : 'Select a PDF file'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="alert alert-success">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Conversion successful!</span>
          <a 
            href={result} 
            download="converted.docx" 
            className="btn btn-sm btn-success"
          >
            Download Word Document
          </a>
        </div>
      )}
    </div>
  );
}