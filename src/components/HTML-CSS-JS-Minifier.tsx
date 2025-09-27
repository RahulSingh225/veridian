'use client';

import { useState, useRef } from 'react';
import { minify as minifyJS } from 'terser';

interface MinifyResult {
  original: string;
  minified: string;
  originalSize: number;
  minifiedSize: number;
  error?: string;
}

export default function MinifierTool() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'html' | 'css' | 'js'>('html');
  const [results, setResults] = useState<MinifyResult[]>([]);
  const [beautify, setBeautify] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMinify = async () => {
    if (!input.trim()) {
      setError('Please enter code to minify.');
      return;
    }

    setError('');
    setResults([]);
    setProcessing(true);

    try {
      let minified = '';
      let errorMsg = '';

      if (mode === 'html') {
        try {
          const response = await fetch('/api/minify-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: input, beautify }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to minify HTML');
          }

          minified = data.minified;
        } catch (err) {
          errorMsg = `HTML Error: ${(err as Error).message}`;
        }
      } else if (mode === 'css') {
        try {
          const response = await fetch('/api/minify-css', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ css: input, beautify }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to minify CSS');
          }

          minified = data.minified;
        } catch (err) {
          errorMsg = `CSS Error: ${(err as Error).message}`;
        }
      } else if (mode === 'js') {
        try {
          const result = await minifyJS(input, {
            compress: !beautify,
            mangle: !beautify,
            format: { beautify },
          });
          if (result && result.code) {
            minified = result.code;
          } else {
            errorMsg = 'JS Error: Failed to minify JavaScript code';
          }
        } catch (err) {
          errorMsg = `JS Error: ${(err as Error).message}`;
        }
      }

      if (errorMsg) {
        setError(errorMsg);
        setProcessing(false);
        return;
      }

      const result: MinifyResult = {
        original: input,
        minified,
        originalSize: new TextEncoder().encode(input).length,
        minifiedSize: new TextEncoder().encode(minified).length,
      };
      setResults([result]);
    } catch (err) {
      setError(`Unexpected error: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (result: MinifyResult) => {
    const blob = new Blob([result.minified], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const ext = mode === 'html' ? 'html' : mode === 'css' ? 'css' : 'js';
    const a = document.createElement('a');
    a.href = url;
    a.download = `minified.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const clearInput = () => {
    setInput('');
    setResults([]);
    setError('');
    if (textareaRef.current) textareaRef.current.value = '';
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">HTML/CSS/JS Minifier</h2>
          <p>Minify or beautify your code. Supports HTML, CSS, and JavaScript.</p>

          <div role="tablist" className="tabs tabs-boxed mb-4">
            <button
              role="tab"
              className={`tab ${mode === 'html' ? 'tab-active' : ''}`}
              onClick={() => setMode('html')}
            >
              HTML
            </button>
            <button
              role="tab"
              className={`tab ${mode === 'css' ? 'tab-active' : ''}`}
              onClick={() => setMode('css')}
            >
              CSS
            </button>
            <button
              role="tab"
              className={`tab ${mode === 'js' ? 'tab-active' : ''}`}
              onClick={() => setMode('js')}
            >
              JavaScript
            </button>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Input Code</span>
            </label>
            <textarea
              ref={textareaRef}
              className="textarea textarea-bordered h-48 font-mono w-full"
              placeholder={`Enter ${mode.toUpperCase()} code...`}
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
            />
          </div>

          <div className="form-control mt-4">
            <label className="label cursor-pointer justify-start">
              <input
                type="checkbox"
                checked={beautify}
                className="checkbox checkbox-primary mr-2"
                onChange={(e) => setBeautify(e.target.checked)}
              />
              <span className="label-text">Beautify (instead of minify)</span>
            </label>
          </div>

          <div className="flex space-x-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={handleMinify}
              disabled={processing || !input.trim()}
            >
              {processing ? 'Processing...' : beautify ? 'Beautify' : 'Minify'}
            </button>
            {input && (
              <button className="btn btn-ghost" onClick={clearInput}>
                Clear
              </button>
            )}
          </div>

          {processing && (
            <progress className="progress progress-primary w-full mt-4" value={50} max="100"></progress>
          )}

          {error && (
            <div className={`alert mt-4 ${error.includes('Copied') ? 'alert-success' : 'alert-error'}`}>
              <span>{error}</span>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Results</h3>
              {results.map((result, idx) => (
                <div key={idx} className="mt-4 border p-4 rounded">
                  <p>
                    Original Size: {(result.originalSize / 1024).toFixed(2)} KB | Minified Size:{' '}
                    {(result.minifiedSize / 1024).toFixed(2)} KB | Savings:{' '}
                    {(((result.originalSize - result.minifiedSize) / result.originalSize) * 100).toFixed(2)}%
                  </p>
                  <textarea
                    className="textarea textarea-bordered w-full mt-2 font-mono"
                    value={result.minified}
                    readOnly
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDownload(result)}
                    >
                      Download
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCopy(result.minified)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}