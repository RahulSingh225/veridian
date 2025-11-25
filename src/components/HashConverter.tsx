'use client';

import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const HashCalculator: React.FC = () => {
  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [text, setText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [algos, setAlgos] = useState<string[]>(['sha256']);
  const [format, setFormat] = useState<'hex' | 'base64'>('hex');
  const [results, setResults] = useState<{[key: string]: string}>({});
  const [compareHash, setCompareHash] = useState<string>('');
  const [match, setMatch] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<string>('');
  const [history, setHistory] = useState<Array<{text: string, algo: string, hash: string, timestamp: number}>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [autoCompute, setAutoCompute] = useState(false);
  const [fileInfo, setFileInfo] = useState<{size: string, type: string} | null>(null);

  const availableAlgos = [
    { value: 'md5', label: 'MD5', description: '128-bit hash' },
    { value: 'sha1', label: 'SHA-1', description: '160-bit hash' },
    { value: 'sha256', label: 'SHA-256', description: '256-bit hash' },
    { value: 'sha512', label: 'SHA-512', description: '512-bit hash' },
    { value: 'sha3', label: 'SHA-3', description: 'SHA-3 256-bit' },
  ];

  useEffect(() => {
    if (autoCompute && (text || file)) {
      const timer = setTimeout(() => {
        computeHash();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [text, autoCompute]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setResults({});
    setMatch(null);
    setError('');
    
    if (selectedFile) {
      const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      setFileInfo({
        size: selectedFile.size < 1024 ? `${selectedFile.size} B` : 
              selectedFile.size < 1024 * 1024 ? `${(selectedFile.size / 1024).toFixed(2)} KB` :
              `${sizeInMB} MB`,
        type: selectedFile.type || 'Unknown'
      });
    } else {
      setFileInfo(null);
    }
  };

  const toggleAlgo = (algo: string) => {
    if (algos.includes(algo)) {
      if (algos.length > 1) {
        setAlgos(algos.filter(a => a !== algo));
      }
    } else {
      setAlgos([...algos, algo]);
    }
  };

  const computeHash = async () => {
    if (inputType === 'text' && !text.trim()) {
      setError('Please enter text.');
      return;
    }
    if (inputType === 'file' && !file) {
      setError('Please select a file.');
      return;
    }

    setLoading(true);
    setError('');
    setResults({});
    setMatch(null);

    try {
      const newResults: {[key: string]: string} = {};

      for (const algo of algos) {
        let hasher;
        switch (algo) {
          case 'md5':
            hasher = CryptoJS.algo.MD5.create();
            break;
          case 'sha1':
            hasher = CryptoJS.algo.SHA1.create();
            break;
          case 'sha256':
            hasher = CryptoJS.algo.SHA256.create();
            break;
          case 'sha512':
            hasher = CryptoJS.algo.SHA512.create();
            break;
          case 'sha3':
            hasher = CryptoJS.algo.SHA3.create();
            break;
          default:
            throw new Error('Invalid algorithm');
        }

        if (inputType === 'text') {
          hasher.update(text);
        } else if (file) {
          await new Promise<void>((resolve, reject) => {
            const chunkSize = 1024 * 1024;
            let offset = 0;
            const reader = new FileReader();

            reader.onerror = () => reject(new Error('File read error'));

            const readChunk = () => {
              if (offset >= file.size) {
                resolve();
                return;
              }
              const slice = file.slice(offset, offset + chunkSize);
              reader.readAsArrayBuffer(slice);
            };

            reader.onload = (e) => {
              if (e.target?.result) {
                const arrayBuffer = e.target.result as ArrayBuffer;
                const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
                hasher.update(wordArray);
                offset += arrayBuffer.byteLength;
                readChunk();
              }
            };

            readChunk();
          });
        }

        const hash = hasher.finalize();
        const output = format === 'hex' ? hash.toString(CryptoJS.enc.Hex) : hash.toString(CryptoJS.enc.Base64);
        newResults[algo] = output;

        // Add to history
        if (inputType === 'text' && text.length < 100) {
          setHistory(prev => [{
            text: text.substring(0, 50),
            algo: algo.toUpperCase(),
            hash: output.substring(0, 32) + '...',
            timestamp: Date.now()
          }, ...prev.slice(0, 9)]);
        }
      }

      setResults(newResults);

      if (compareHash.trim() && algos.length === 1) {
        setMatch(newResults[algos[0]].toLowerCase() === compareHash.trim().toLowerCase());
      }
    } catch (err) {
      setError(`Error computing hash: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, algo: string) => {
    navigator.clipboard.writeText(text);
    setCopied(algo);
    setTimeout(() => setCopied(''), 2000);
  };

  const downloadResults = () => {
    const content = Object.entries(results)
      .map(([algo, hash]) => `${algo.toUpperCase()}: ${hash}`)
      .join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'hashes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setText('');
    setFile(null);
    setResults({});
    setCompareHash('');
    setMatch(null);
    setError('');
    setFileInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Hash Calculator Pro
          </h1>
          <p className="text-base-content/70">Compute cryptographic hashes with multiple algorithms</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {error && (
                  <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Input Type Tabs */}
                <div className="tabs tabs-boxed justify-center">
                  <a className={`tab tab-lg ${inputType === 'text' ? 'tab-active' : ''}`} onClick={() => setInputType('text')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Text
                  </a>
                  <a className={`tab tab-lg ${inputType === 'file' ? 'tab-active' : ''}`} onClick={() => setInputType('file')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    File
                  </a>
                </div>

                {/* Input Area */}
                {inputType === 'text' ? (
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">Enter text to hash</span>
                      <span className="label-text-alt">{text.length} characters</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-40 font-mono text-sm"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Type or paste your text here..."
                    />
                  </div>
                ) : (
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-semibold">Select file to hash</span>
                    </label>
                    <input type="file" className="file-input file-input-bordered file-input-primary w-full" onChange={handleFileChange} />
                    {fileInfo && (
                      <div className="mt-3 p-3 bg-base-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-semibold">{file?.name}</span>
                        </div>
                        <div className="text-sm text-base-content/70">
                          <span className="badge badge-sm mr-2">{fileInfo.size}</span>
                          <span className="badge badge-sm">{fileInfo.type}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Algorithm Selection */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Select Algorithms</span>
                    <span className="label-text-alt">{algos.length} selected</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableAlgos.map((algo) => (
                      <div key={algo.value} className="form-control">
                        <label className="label cursor-pointer gap-2 bg-base-200 px-4 py-2 rounded-lg hover:bg-base-300 transition-colors">
                          <input
                            type="checkbox"
                            className="checkbox checkbox-primary checkbox-sm"
                            checked={algos.includes(algo.value)}
                            onChange={() => toggleAlgo(algo.value)}
                          />
                          <span className="label-text">
                            <span className="font-semibold">{algo.label}</span>
                            <span className="text-xs text-base-content/60 ml-1">({algo.description})</span>
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-semibold">Output Format</span>
                  </label>
                  <div className="flex gap-2">
                    <label className="label cursor-pointer gap-2 bg-base-200 px-4 py-2 rounded-lg hover:bg-base-300 transition-colors flex-1">
                      <input
                        type="radio"
                        className="radio radio-primary"
                        checked={format === 'hex'}
                        onChange={() => setFormat('hex')}
                      />
                      <span className="label-text">Hexadecimal</span>
                    </label>
                    <label className="label cursor-pointer gap-2 bg-base-200 px-4 py-2 rounded-lg hover:bg-base-300 transition-colors flex-1">
                      <input
                        type="radio"
                        className="radio radio-primary"
                        checked={format === 'base64'}
                        onChange={() => setFormat('base64')}
                      />
                      <span className="label-text">Base64</span>
                    </label>
                  </div>
                </div>

                {/* Auto-compute Toggle */}
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={autoCompute}
                      onChange={(e) => setAutoCompute(e.target.checked)}
                    />
                    <span className="label-text">Auto-compute on text change</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="btn btn-primary flex-1" onClick={computeHash} disabled={loading}>
                    {loading && <span className="loading loading-spinner"></span>}
                    {loading ? 'Computing...' : 'Compute Hashes'}
                  </button>
                  <button className="btn btn-outline" onClick={clearAll}>
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {Object.keys(results).length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="card-title">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Results
                    </h3>
                    <button className="btn btn-sm btn-outline" onClick={downloadResults}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(results).map(([algo, hash]) => (
                      <div key={algo} className="bg-base-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="badge badge-primary badge-lg">{algo.toUpperCase()}</span>
                          <button
                            className="btn btn-xs btn-ghost"
                            onClick={() => copyToClipboard(hash, algo)}
                          >
                            {copied === algo ? (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                        <code className="text-xs break-all block font-mono">{hash}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Verification */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Verify Hash
                </h3>
                <div className="form-control w-full">
                  <textarea
                    className="textarea textarea-bordered h-24 text-xs font-mono"
                    value={compareHash}
                    onChange={(e) => setCompareHash(e.target.value)}
                    placeholder="Paste hash to verify..."
                  />
                </div>
                {match !== null && (
                  <div className={`alert ${match ? 'alert-success' : 'alert-warning'} py-2`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                      {match ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      )}
                    </svg>
                    <span className="text-sm font-semibold">{match ? '✓ Match' : '✗ No Match'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    History
                  </h3>
                  {history.length > 0 && (
                    <button className="btn btn-xs btn-ghost" onClick={() => setHistory([])}>Clear</button>
                  )}
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-sm text-base-content/60 text-center py-4">No history yet</p>
                  ) : (
                    history.map((item, idx) => (
                      <div key={idx} className="bg-base-200 rounded p-2 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="badge badge-xs badge-primary">{item.algo}</span>
                          <span className="text-base-content/60">{new Date(item.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-base-content/80 truncate mb-1">{item.text}</div>
                        <code className="text-base-content/60 truncate block">{item.hash}</code>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </h3>
                <div className="text-xs space-y-2 text-base-content/70">
                  <p>This tool computes cryptographic hashes using various algorithms.</p>
                  <div className="stats stats-vertical shadow-sm">
                    <div className="stat py-2 px-3">
                      <div className="stat-title text-xs">Algorithms</div>
                      <div className="stat-value text-lg">{availableAlgos.length}</div>
                    </div>
                    <div className="stat py-2 px-3">
                      <div className="stat-title text-xs">Max File Size</div>
                      <div className="stat-value text-lg">∞</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HashCalculator;