'use client';

import { useState } from 'react';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

interface GeneratedResult {
  value: string;
  type: 'password' | 'uuid';
  strength?: 'weak' | 'medium' | 'strong' | 'very strong';
}

export default function PasswordUUIDGenerator() {
  const [mode, setMode] = useState<'password' | 'uuid'>('password');
  const [passwordLength, setPasswordLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [uuidVersion, setUuidVersion] = useState<'v4' | 'v5'>('v4');
  const [uuidNamespace, setUuidNamespace] = useState('');
  const [uuidName, setUuidName] = useState('');
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [error, setError] = useState('');

  const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBERS = '0123456789';
  const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' | 'very strong' => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return 'weak';
    if (score === 3) return 'medium';
    if (score === 4) return 'strong';
    return 'very strong';
  };

  const generatePassword = () => {
    let chars = '';
    if (includeUppercase) chars += UPPERCASE;
    if (includeLowercase) chars += LOWERCASE;
    if (includeNumbers) chars += NUMBERS;
    if (includeSymbols) chars += SYMBOLS;

    if (!chars) {
      setError('Select at least one character type.');
      return '';
    }

    const array = new Uint8Array(passwordLength);
    crypto.getRandomValues(array);
    let password = '';
    for (let i = 0; i < passwordLength; i++) {
      password += chars[array[i] % chars.length];
    }
    return password;
  };

  const handleGenerate = () => {
    setError('');
    setResults([]);

    if (mode === 'password') {
      const password = generatePassword();
      if (!password) return;
      const result: GeneratedResult = {
        value: password,
        type: 'password',
        strength: checkPasswordStrength(password),
      };
      setResults([result]);
    } else {
      let uuid: string;
      if (uuidVersion === 'v4') {
        uuid = uuidv4();
      } else {
        if (!uuidNamespace || !uuidName) {
          setError('Namespace and name are required for UUID v5.');
          return;
        }
        try {
          uuid = uuidv5(uuidName, uuidNamespace);
        } catch (err) {
          setError(`Invalid UUID v5 inputs: ${(err as Error).message}`);
          return;
        }
      }
      setResults([{ value: uuid, type: 'uuid' }]);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const handleDownload = () => {
    if (!results.length) return;

    const content = results.length === 1
      ? results[0].value
      : JSON.stringify(results.map(r => ({ value: r.value, type: r.type, strength: r.strength })), null, 2);
    const ext = results.length === 1 ? 'txt' : 'json';
    const blob = new Blob([content], { type: `text/${ext}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearInput = () => {
    setResults([]);
    setError('');
    setUuidNamespace('');
    setUuidName('');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Password/UUID Generator</h2>
          <p>Generate secure passwords or UUIDs (v4/v5) with customizable options.</p>

          <div className="tabs tabs-boxed mb-4">
            <a className={`tab ${mode === 'password' ? 'tab-active' : ''}`} onClick={() => setMode('password')}>
              Password
            </a>
            <a className={`tab ${mode === 'uuid' ? 'tab-active' : ''}`} onClick={() => setMode('uuid')}>
              UUID
            </a>
          </div>

          {mode === 'password' && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Password Length</span>
                </label>
                <input
                  type="range"
                  min="4"
                  max="50"
                  value={passwordLength}
                  className="range range-primary"
                  onChange={(e) => setPasswordLength(Number(e.target.value))}
                />
                <div className="w-full flex justify-between text-xs px-2">
                  <span>4</span><span>25</span><span>50</span>
                </div>
                <div className="text-center mt-1">{passwordLength} characters</div>
              </div>

              <div className="form-control mt-4">
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    checked={includeUppercase}
                    className="checkbox checkbox-primary mr-2"
                    onChange={(e) => setIncludeUppercase(e.target.checked)}
                  />
                  <span className="label-text">Uppercase (A-Z)</span>
                </label>
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    checked={includeLowercase}
                    className="checkbox checkbox-primary mr-2"
                    onChange={(e) => setIncludeLowercase(e.target.checked)}
                  />
                  <span className="label-text">Lowercase (a-z)</span>
                </label>
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    checked={includeNumbers}
                    className="checkbox checkbox-primary mr-2"
                    onChange={(e) => setIncludeNumbers(e.target.checked)}
                  />
                  <span className="label-text">Numbers (0-9)</span>
                </label>
                <label className="label cursor-pointer justify-start">
                  <input
                    type="checkbox"
                    checked={includeSymbols}
                    className="checkbox checkbox-primary mr-2"
                    onChange={(e) => setIncludeSymbols(e.target.checked)}
                  />
                  <span className="label-text">Symbols (!@#$%)</span>
                </label>
              </div>
            </>
          )}

          {mode === 'uuid' && (
            <>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">UUID Version</span>
                </label>
                <select
                  value={uuidVersion}
                  onChange={(e) => setUuidVersion(e.target.value as any)}
                  className="select select-bordered w-full"
                >
                  <option value="v4">UUID v4 (Random)</option>
                  <option value="v5">UUID v5 (Name-based)</option>
                </select>
              </div>
              {uuidVersion === 'v5' && (
                <>
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Namespace (UUID or Predefined)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                      className="input input-bordered w-full"
                      value={uuidNamespace}
                      onChange={(e) => setUuidNamespace(e.target.value)}
                    />
                  </div>
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., example.com"
                      className="input input-bordered w-full"
                      value={uuidName}
                      onChange={(e) => setUuidName(e.target.value)}
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex space-x-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={mode === 'password' && !includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols}
            >
              Generate
            </button>
            {results.length > 0 && (
              <button className="btn btn-ghost" onClick={clearInput}>
                Clear
              </button>
            )}
          </div>

          {error && (
            <div className={`alert mt-4 ${error.includes('Copied') ? 'alert-success' : 'alert-error'}`}>
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Generated Results</h3>
              {results.map((result, idx) => (
                <div key={idx} className="mt-4 border p-4 rounded">
                  <p className="font-mono break-all">{result.value}</p>
                  {result.type === 'password' && (
                    <p className="text-sm mt-1">
                      Strength:{' '}
                      <span className={
                        result.strength === 'weak' ? 'text-error' :
                        result.strength === 'medium' ? 'text-warning' :
                        result.strength === 'strong' ? 'text-success' : 'text-success font-bold'
                      }>
                        {result.strength}
                      </span>
                    </p>
                  )}
                  <div className="flex space-x-2 mt-2">
                    <button className="btn btn-secondary" onClick={() => handleCopy(result.value)}>
                      Copy
                    </button>
                  </div>
                </div>
              ))}
              <button className="btn btn-secondary mt-4" onClick={handleDownload}>
                Download {results.length > 1 ? 'JSON' : 'Text'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}