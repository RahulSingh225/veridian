'use client';

import { useState } from 'react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('');
  const [testText, setTestText] = useState('');
  const [matches, setMatches] = useState<string[]>([]);
  const [error, setError] = useState('');

  const testRegex = () => {
    try {
      setError('');
      const regex = new RegExp(pattern, flags);
      const allMatches = [...testText.matchAll(regex)].map(match => match[0]);
      setMatches(allMatches);
    } catch (err) {
      setError('Invalid regular expression');
      setMatches([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Regular Expression</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter pattern... (e.g., \w+)"
          />
        </div>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Flags</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="g, i, m..."
          />
        </div>
      </div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Test Text</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-32"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter text to test against..."
        />
      </div>

      <div className="flex justify-center">
        <button 
          className="btn btn-primary btn-wide" 
          onClick={testRegex}
        >
          Test Regex
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {matches.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-base-content">
              Matches ({matches.length})
            </h3>
            <div className="space-y-2">
              {matches.map((match, index) => (
                <div key={index} className="badge badge-primary badge-lg">
                  {match}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}