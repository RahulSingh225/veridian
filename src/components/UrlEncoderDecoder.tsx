'use client';

import { useState } from 'react';

interface QueryParam {
  key: string;
  value: string;
}

interface Result {
  output: string;
  type: 'encoded' | 'decoded' | 'base64-encoded' | 'base64-decoded' | 'query-built';
}

export default function URLEncoderDecoder() {
  const [mode, setMode] = useState<'encode-decode' | 'query-builder'>('encode-decode');
  const [input, setInput] = useState('');
  const [base64Toggle, setBase64Toggle] = useState(false);
  const [queryParams, setQueryParams] = useState<QueryParam[]>([{ key: '', value: '' }]);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState('');

  const handleEncodeDecode = (isEncode: boolean) => {
    setError('');
    setResults([]);

    if (!input.trim()) {
      setError('Please enter a URL or text.');
      return;
    }

    try {
      let output = '';
      let type: Result['type'] = isEncode ? 'encoded' : 'decoded';

      if (base64Toggle) {
        if (isEncode) {
          output = btoa(input);
          type = 'base64-encoded';
        } else {
          output = atob(input);
          type = 'base64-decoded';
        }
      } else {
        if (isEncode) {
          output = encodeURIComponent(input);
        } else {
          output = decodeURIComponent(input);
        }
      }

      setResults([{ output, type }]);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    }
  };

  const handleQueryBuild = () => {
    setError('');
    setResults([]);

    const validParams = queryParams.filter(param => param.key.trim() && param.value.trim());
    if (validParams.length === 0) {
      setError('Please add at least one valid key-value pair.');
      return;
    }

    try {
      const queryString = validParams
        .map(param => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
        .join('&');
      setResults([{ output: queryString, type: 'query-built' }]);
    } catch (err) {
      setError(`Error building query: ${(err as Error).message}`);
    }
  };

  const addQueryParam = () => {
    setQueryParams([...queryParams, { key: '', value: '' }]);
  };

  const updateQueryParam = (index: number, field: 'key' | 'value', value: string) => {
    const updatedParams = [...queryParams];
    updatedParams[index][field] = value;
    setQueryParams(updatedParams);
  };

  const removeQueryParam = (index: number) => {
    if (queryParams.length > 1) {
      setQueryParams(queryParams.filter((_, i) => i !== index));
    }
  };

  const handleCopy = (output: string) => {
    navigator.clipboard.writeText(output);
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const handleDownload = () => {
    if (!results.length) return;

    const content = results.map(r => r.output).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'url-output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearInput = () => {
    setInput('');
    setQueryParams([{ key: '', value: '' }]);
    setResults([]);
    setError('');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">URL Encoder/Decoder & Query Builder</h2>
          <p>Percent-encode/decode URLs, Base64 encode/decode, or build query strings.</p>

          <div className="tabs tabs-boxed mb-4">
            <a className={`tab ${mode === 'encode-decode' ? 'tab-active' : ''}`} onClick={() => setMode('encode-decode')}>
              Encode/Decode
            </a>
            <a className={`tab ${mode === 'query-builder' ? 'tab-active' : ''}`} onClick={() => setMode('query-builder')}>
              Query Builder
            </a>
          </div>

          {mode === 'encode-decode' && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Input URL or Text</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 font-mono"
                  placeholder="Enter URL or text to encode/decode"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <div className="form-control mt-4">
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    checked={base64Toggle}
                    className="checkbox checkbox-primary mr-2"
                    onChange={(e) => setBase64Toggle(e.target.checked)}
                  />
                  <span className="label-text">Use Base64 Encoding/Decoding</span>
                </label>
              </div>
              <div className="flex space-x-2 mt-4">
                <button className="btn btn-primary" onClick={() => handleEncodeDecode(true)} disabled={!input.trim()}>
                  Encode
                </button>
                <button className="btn btn-primary" onClick={() => handleEncodeDecode(false)} disabled={!input.trim()}>
                  Decode
                </button>
                {input && (
                  <button className="btn btn-ghost" onClick={clearInput}>
                    Clear
                  </button>
                )}
              </div>
            </>
          )}

          {mode === 'query-builder' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Query Parameters</span>
              </label>
              {queryParams.map((param, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Key"
                    className="input input-bordered flex-1"
                    value={param.key}
                    onChange={(e) => updateQueryParam(index, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    className="input input-bordered flex-1"
                    value={param.value}
                    onChange={(e) => updateQueryParam(index, 'value', e.target.value)}
                  />
                  {queryParams.length > 1 && (
                    <button className="btn btn-error btn-sm" onClick={() => removeQueryParam(index)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button className="btn btn-secondary mt-2" onClick={addQueryParam}>
                Add Parameter
              </button>
              <div className="flex space-x-2 mt-4">
                <button
                  className="btn btn-primary"
                  onClick={handleQueryBuild}
                  disabled={!queryParams.some(p => p.key.trim() && p.value.trim())}
                >
                  Build Query
                </button>
                <button className="btn btn-ghost" onClick={clearInput}>
                  Clear
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className={`alert mt-4 ${error.includes('Copied') ? 'alert-success' : 'alert-error'}`}>
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Result</h3>
              {results.map((result, idx) => (
                <div key={idx} className="mt-4 border p-4 rounded">
                  <p className="font-mono break-all">{result.output}</p>
                  <p className="text-sm mt-1">Type: {result.type}</p>
                  <div className="flex space-x-2 mt-2">
                    <button className="btn btn-secondary" onClick={() => handleCopy(result.output)}>
                      Copy
                    </button>
                  </div>
                </div>
              ))}
              <button className="btn btn-secondary mt-4" onClick={handleDownload}>
                Download
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}