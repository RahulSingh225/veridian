'use client';

import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import yaml from 'js-yaml';

type Format = 'csv' | 'json' | 'yaml';

interface ConversionResult {
  output: string;
  error?: string;
}

export default function ConverterTool() {
  const [inputFormat, setInputFormat] = useState<Format>('json');
  const [outputFormat, setOutputFormat] = useState<Format>('yaml');
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [validationError, setValidationError] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const validateAndConvert = (data: string) => {
    setValidationError('');
    setResult(null);

    if (!data.trim()) return;

    let parsed: any;
    try {
      if (inputFormat === 'json') {
        parsed = JSON.parse(data);
      } else if (inputFormat === 'yaml') {
        parsed = yaml.load(data);
      } else if (inputFormat === 'csv') {
        const parseResult = Papa.parse(data, { header: true, skipEmptyLines: true });
        if (parseResult.errors.length > 0) {
          throw new Error(parseResult.errors[0].message);
        }
        parsed = parseResult.data;
      }
    } catch (err) {
      setValidationError(`Invalid ${inputFormat.toUpperCase()}: ${(err as Error).message}`);
      return;
    }

    let output = '';
    let outputError = '';
    try {
      if (outputFormat === 'json') {
        output = JSON.stringify(parsed, null, 2);
      } else if (outputFormat === 'yaml') {
        output = yaml.dump(parsed, { indent: 2 });
      } else if (outputFormat === 'csv') {
        if (!Array.isArray(parsed)) {
          throw new Error('Input must be an array of objects for CSV output.');
        }
        output = Papa.unparse(parsed);
      }
    } catch (err) {
      outputError = `Conversion error: ${(err as Error).message}`;
    }

    setResult({ output, error: outputError });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => validateAndConvert(e.target.value), 500);
  };

  const handleDownload = () => {
    if (!result || !result.output) return;

    const blob = new Blob([result.output], { type: `text/${outputFormat}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!result || !result.output) return;
    navigator.clipboard.writeText(result.output);
    setValidationError('Copied to clipboard!');
    setTimeout(() => setValidationError(''), 2000);
  };

  const clearInput = () => {
    setInput('');
    setResult(null);
    setValidationError('');
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">CSV/JSON/YAML Converter</h2>
          <p>Bidirectional conversion with on-the-fly validation. Supports array of objects for CSV.</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Input Format</span>
              </label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value as Format)}
                className="select select-bordered w-full"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Output Format</span>
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as Format)}
                className="select select-bordered w-full"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="yaml">YAML</option>
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Input {inputFormat.toUpperCase()}</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-48 font-mono"
              placeholder={`Enter ${inputFormat.toUpperCase()} data...`}
              value={input}
              onChange={handleInputChange}
            />
          </div>

          {validationError && (
            <div className={`alert mt-4 ${validationError.includes('Copied') ? 'alert-success' : 'alert-error'}`}>
              {validationError}
            </div>
          )}

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Converted Output ({outputFormat.toUpperCase()})</h3>
              {result.error ? (
                <div className="alert alert-error mt-2">{result.error}</div>
              ) : (
                <textarea
                  className="textarea textarea-bordered w-full h-48 font-mono mt-2"
                  value={result.output}
                  readOnly
                />
              )}
              {!result.error && (
                <div className="flex space-x-2 mt-2">
                  <button className="btn btn-secondary" onClick={handleDownload}>
                    Download
                  </button>
                  <button className="btn btn-secondary" onClick={handleCopy}>
                    Copy
                  </button>
                </div>
              )}
            </div>
          )}

          {input && (
            <button className="btn btn-ghost mt-4" onClick={clearInput}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}