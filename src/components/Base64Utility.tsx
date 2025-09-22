
'use client';

import { useState } from 'react';
import { saveAs } from 'file-saver';
import { 
  encodeBase64, 
  decodeBase64, 
  encodeBase64UrlSafe, 
  generateDataUri, 
  generateHexDump 
} from '@/utils/base64utils';

export default function Base64Utility() {
  const [tab, setTab] = useState<'text' | 'url-safe' | 'file' | 'image'>('text');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTextEncode = async () => {
    setLoading(true);
    try {
      const result = tab === 'url-safe' ? encodeBase64UrlSafe(input) : encodeBase64(input);
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  const handleTextDecode = async () => {
    setLoading(true);
    try {
      const result = decodeBase64(input);
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  const handleFileEncode = async () => {
    if (!file) return;
    setLoading(true);
    try {
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            const base64String = reader.result.split(',')[1];
            setOutput(base64String);
            setError('');
            if (file.type.startsWith('image/')) {
              setPreview(reader.result as string);
            }
            resolve();
          }
        };
        reader.onerror = () => {
          setError('Error reading file');
          setOutput('');
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setOutput('');
    } finally {
      setLoading(false);
    }
  };

  const handleFileDecode = async () => {
    try {
      const binary = atob(input);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: file?.type || 'application/octet-stream' });
      saveAs(blob, file?.name || 'decoded_file');
      setError('');
      if (blob.type.startsWith('image/')) {
        setPreview(URL.createObjectURL(blob));
      }
    } catch (err) {
      setError('Invalid Base64 string');
      setOutput('');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleGenerateDataUri = async () => {
    setLoading(true);
    try {
      const result = generateDataUri(output || input);
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateHexDump = async () => {
    setLoading(true);
    try {
      const result = generateHexDump(input);
      setOutput(result);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="stats shadow bg-base-200">
        <div className="stat">
          <div className="stat-title">Input Length</div>
          <div className="stat-value text-primary">{input.length}</div>
          <div className="stat-desc">Characters</div>
        </div>
        <div className="stat">
          <div className="stat-title">Output Length</div>
          <div className="stat-value text-secondary">{output.length}</div>
          <div className="stat-desc">Characters</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body p-6">
          <h2 className="card-title mb-4 text-primary">Choose Conversion Type</h2>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 w-full">
            <div className="tooltip tooltip-bottom w-full sm:w-auto" data-tip="Convert plain text to/from Base64">
              <button
                role="tab"
                className={`btn btn-lg w-full sm:w-auto ${tab === 'text' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTab('text')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                </svg>
                Text
              </button>
            </div>
            <div className="tooltip tooltip-bottom w-full sm:w-auto" data-tip="URL-safe Base64 encoding without special characters">
              <button
                role="tab"
                className={`btn btn-lg w-full sm:w-auto ${tab === 'url-safe' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTab('url-safe')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
                </svg>
                URL-safe
              </button>
            </div>
            <div className="tooltip tooltip-bottom w-full sm:w-auto" data-tip="Convert any file to/from Base64">
              <button
                role="tab"
                className={`btn btn-lg w-full sm:w-auto ${tab === 'file' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTab('file')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/>
                </svg>
                File
              </button>
            </div>
            <div className="tooltip tooltip-bottom w-full sm:w-auto" data-tip="Convert images with preview support">
              <button
                role="tab"
                className={`btn btn-lg w-full sm:w-auto ${tab === 'image' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTab('image')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                </svg>
                Image
              </button>
            </div>
          </div>

          <div className="divider"></div>

          {tab !== 'file' && tab !== 'image' ? (
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text">Input Text</span>
                <span className="label-text-alt">
                  <button 
                    className="btn btn-xs btn-ghost"
                    onClick={() => setInput('')}
                    disabled={!input}
                  >
                    Clear
                  </button>
                </span>
              </div>
              <textarea
                placeholder={tab === 'text' || tab === 'url-safe' ? 'Enter text to encode or Base64 to decode...' : 'Enter Base64 string...'}
                className="textarea textarea-bordered w-full h-32 font-mono text-base-content/70"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              />
            </div>
          ) : (
            <div className="form-control w-full">
              <div className="label">
                <span className="label-text">Select File</span>
                {file && (
                  <span className="label-text-alt">
                    <button 
                      className="btn btn-xs btn-ghost"
                      onClick={() => setFile(null)}
                    >
                      Clear
                    </button>
                  </span>
                )}
              </div>
              <input
                type="file"
                accept={tab === 'image' ? 'image/*' : '*/*'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered w-full"
              />
              {file && (
                <div className="label">
                  <span className="label-text-alt text-success">Selected: {file.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="divider">Actions</div>

          <div className="flex flex-wrap gap-2">
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={tab === 'text' || tab === 'url-safe' ? handleTextEncode : handleFileEncode}
              disabled={loading || (!input && !file)}
            >
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm3 3h6v2H7V5zm8 0h2v2h-2V5zM7 9h2v2H7V9zm4 0h2v2h-2V9z" clipRule="evenodd"/>
                </svg>
              )}
              Encode
            </button>
            <button 
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={tab === 'text' || tab === 'url-safe' ? handleTextDecode : handleFileDecode}
              disabled={loading || (!input && !file)}
            >
              {!loading && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm4 0h8v2H8V4zm0 4h8v2H8V8zm0 4h4v2H8v-2z"/>
                </svg>
              )}
              Decode
            </button>

            {(tab === 'file' || tab === 'image') && (
              <>
                <button 
                  className={`btn btn-secondary ${loading ? 'loading' : ''}`}
                  onClick={handleGenerateDataUri}
                  disabled={loading || (!file && !output)}
                >
                  {!loading && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                    </svg>
                  )}
                  Generate Data URI
                </button>
                <button 
                  className={`btn btn-secondary ${loading ? 'loading' : ''}`}
                  onClick={handleGenerateHexDump}
                  disabled={loading || !input}
                >
                  {!loading && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
                    </svg>
                  )}
                  Hex Dump
                </button>
              </>
            )}
            
            {output && (
              <button 
                className="btn btn-accent"
                onClick={handleCopy}
                disabled={loading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                </svg>
                Copy Output
              </button>
            )}
          </div>

          {error && (
            <div className={`alert ${error.includes('Copied') ? 'alert-success' : 'alert-error'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {output && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Output</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-32 font-mono"
                value={output}
                readOnly
              />
            </div>
          )}
          {preview && (
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Preview</span>
              </label>
              <div className="card bg-base-200 p-4">
                <img src={preview} alt="Preview" className="max-w-full h-auto rounded-lg" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}