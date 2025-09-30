'use client';

import { useState } from 'react';
import { convertPdfToImages, convertPdfToWord, editPdf, mergePdfs, splitPdf } from '@/app/actions';

type PdfOperation = 'word' | 'images' | 'merge' | 'split' | 'edit';

interface FileWithPath extends File {
  path?: string;
}

export default function PdfUtilities() {
  const [operation, setOperation] = useState<PdfOperation>('word');
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [splitRanges, setSplitRanges] = useState<string>('');
  const [editText, setEditText] = useState<string>('');
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, multiple: boolean = false) => {
    if (e.target.files) {
      if (multiple) {
        setFiles(Array.from(e.target.files));
      } else {
        setFiles([e.target.files[0]]);
      }
      setError('');
      setResult(null);
    }
  };

  const handleOperation = async () => {
    if (!files.length) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      if (operation === 'split' && splitRanges) {
        formData.append('ranges', splitRanges);
      }

      if (operation === 'edit') {
        formData.append('text', editText);
        formData.append('position', JSON.stringify(editPosition));
      }

      // For now, we'll just use the PDF to Word conversion
      // TODO: Add other operations when backend is ready
      const res = operation === 'word' ? await convertPdfToWord(formData) :
                  operation === 'images' ? await convertPdfToImages(formData) :
                  operation === 'merge' ? await mergePdfs(formData) :
                  operation === 'split' ? await splitPdf(formData) :
                  operation === 'edit' ? await editPdf(formData) :
                  { success: false, error: 'Invalid operation' };
      if (res.success) {
        setResult('OK');
      } else {
        setError(res.error || 'Operation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setResult(null);
    setError('');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary mb-4">PDF Utilities</h2>
          
          <div className="tabs tabs-boxed mb-6">
            <button 
              className={`tab tab-lg ${operation === 'word' ? 'tab-active' : ''}`}
              onClick={() => setOperation('word')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H9V2zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"/>
              </svg>
              PDF to Word
            </button>
            <button 
              className={`tab tab-lg ${operation === 'images' ? 'tab-active' : ''}`}
              onClick={() => setOperation('images')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
              </svg>
              PDF to Images
            </button>
            <button 
              className={`tab tab-lg ${operation === 'merge' ? 'tab-active' : ''}`}
              onClick={() => setOperation('merge')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 5a1 1 0 011 1v3h3a1 1 0 110 2H9v3a1 1 0 11-2 0v-3H4a1 1 0 110-2h3V6a1 1 0 011-1z"/>
              </svg>
              Merge PDFs
            </button>
            <button 
              className={`tab tab-lg ${operation === 'split' ? 'tab-active' : ''}`}
              onClick={() => setOperation('split')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 15a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm8 0a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-4-4a1 1 0 011 1v7a1 1 0 11-2 0v-7a1 1 0 011-1z"/>
              </svg>
              Split PDF
            </button>
            <button 
              className={`tab tab-lg ${operation === 'edit' ? 'tab-active' : ''}`}
              onClick={() => setOperation('edit')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
              </svg>
              Edit PDF
            </button>
          </div>

          <div className="form-control w-full mb-4">
            <label className="label">
              <span className="label-text">
                {operation === 'merge' ? 'Select PDF Files' : 'Upload PDF File'}
              </span>
              {files.length > 0 && (
                <span className="label-text-alt">
                  <button 
                    className="btn btn-ghost btn-xs"
                    onClick={clearFiles}
                  >
                    Clear
                  </button>
                </span>
              )}
            </label>
            <input
              type="file"
              accept=".pdf"
              multiple={operation === 'merge'}
              onChange={(e) => handleFileChange(e, operation === 'merge')}
              className="file-input file-input-bordered w-full"
            />
            <label className="label">
              <span className="label-text-alt text-base-content/60">Maximum file size: 10MB per file</span>
            </label>
          </div>

          {operation === 'split' && (
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Page Ranges (e.g., "1-3,4-6" or leave empty for single pages)</span>
              </label>
              <input
                type="text"
                value={splitRanges}
                onChange={(e) => setSplitRanges(e.target.value)}
                placeholder="1-3,4-6"
                className="input input-bordered w-full"
              />
            </div>
          )}

          {operation === 'edit' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text">Text to Add</span>
                </label>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  placeholder="Enter text..."
                  className="input input-bordered w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">X Position</span>
                  </label>
                  <input
                    type="number"
                    value={editPosition.x}
                    onChange={(e) => setEditPosition({ ...editPosition, x: Number(e.target.value) })}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text">Y Position</span>
                  </label>
                  <input
                    type="number"
                    value={editPosition.y}
                    onChange={(e) => setEditPosition({ ...editPosition, y: Number(e.target.value) })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center mt-4">
            <button 
              className={`btn btn-primary btn-wide ${loading ? 'loading' : ''}`}
              onClick={handleOperation}
              disabled={!files.length || loading}
            >
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd"/>
                </svg>
              )}
              {operation === 'word' ? 'Convert to Word' :
               operation === 'images' ? 'Convert to Images' :
               operation === 'merge' ? 'Merge PDFs' :
               operation === 'split' ? 'Split PDF' :
               'Apply Changes'}
            </button>
          </div>

          {error && (
            <div className="alert alert-error mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="alert alert-success mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Operation successful!</span>
              <a 
                href={result} 
                download
                className="btn btn-sm btn-success"
              >
                Download Result
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}