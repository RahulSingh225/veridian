'use client';

import { useState } from 'react';
import { TextareaAutosize } from '@mui/material'; // Or DaisyUI equivalent

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
    } catch (err) {
      setError('Invalid JSON');
      setOutput('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Input JSON</span>
        </label>
        <textarea
          className="textarea textarea-bordered textarea-lg h-64 font-mono text-base-content/70"
          placeholder="Paste your JSON here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
        <div className="mt-4">
          <button 
            className="btn btn-primary btn-wide" 
            onClick={formatJson}
          >
            Format JSON
          </button>
        </div>
      </div>
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Formatted Output</span>
        </label>
        <pre className="min-h-64 bg-base-200 rounded-lg p-4 font-mono text-base-content/70 overflow-auto">
          {output || 'Formatted JSON will appear here...'}
        </pre>
      </div>
    </div>
  );
}