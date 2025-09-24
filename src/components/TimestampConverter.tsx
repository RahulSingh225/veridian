'use client';

import { useState } from 'react';
import { format, parseISO, parse, fromUnixTime, getUnixTime, add, sub, differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { toZonedTime as utcToZoned, fromZonedTime as zonedToUtc } from 'date-fns-tz';

type Mode = 'convert' | 'adjust' | 'calculate';

interface ConversionResult {
  output: string;
  formatType: string;
}

export default function TimestampConverter() {
  const [mode, setMode] = useState<Mode>('convert');
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'unix' | 'iso' | 'readable'>('unix');
  const [outputType, setOutputType] = useState<'unix' | 'iso' | 'readable'>('readable');
  const [readableFormat, setReadableFormat] = useState('yyyy-MM-dd HH:mm:ss');
  const [timezone, setTimezone] = useState('UTC');
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'sub'>('add');
  const [adjustmentUnit, setAdjustmentUnit] = useState<'days' | 'hours' | 'minutes' | 'seconds'>('days');
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [diffUnit, setDiffUnit] = useState<'days' | 'hours' | 'minutes' | 'seconds'>('days');
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState('');

  const timezones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney']; // Example timezones

  const handleConvert = () => {
    setError('');
    setResults([]);

    if (!input.trim()) {
      setError('Please enter an input.');
      return;
    }

    try {
      let date: Date;
      if (inputType === 'unix') {
        date = fromUnixTime(Number(input));
      } else if (inputType === 'iso') {
        date = parseISO(input);
      } else {
        date = parse(input, readableFormat, new Date());
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date input.');
      }

      // Apply timezone if not UTC
      if (timezone !== 'UTC') {
        date = utcToZoned(date, timezone);
      }

      let output = '';
      let formatType = outputType;
      if (outputType === 'unix') {
        output = getUnixTime(date).toString();
      } else if (outputType === 'iso') {
        output = date.toISOString();
      } else {
        output = format(date, readableFormat);
      }

      setResults([{ output, formatType }]);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    }
  };

  const handleAdjust = () => {
    setError('');
    setResults([]);

    if (!input.trim() || adjustmentValue <= 0) {
      setError('Please enter a valid input and adjustment value.');
      return;
    }

    try {
      let date = parseISO(input); // Assume ISO input for adjustment
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date input (use ISO format).');
      }

      // Apply timezone
      if (timezone !== 'UTC') {
        date = utcToZoned(date, timezone);
      }

      const adjustment = { [adjustmentUnit]: adjustmentValue };
      date = adjustmentType === 'add' ? add(date, adjustment) : sub(date, adjustment);

      // Convert back to UTC if needed
      if (timezone !== 'UTC') {
        date = zonedToUtc(date, timezone);
      }

      const output = date.toISOString();
      setResults([{ output, formatType: 'iso' }]);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    }
  };

  const handleCalculate = () => {
    setError('');
    setResults([]);

    if (!startDate.trim() || !endDate.trim()) {
      setError('Please enter start and end dates.');
      return;
    }

    try {
      let start = parseISO(startDate);
      let end = parseISO(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date inputs (use ISO format).');
      }

      // Apply timezone
      if (timezone !== 'UTC') {
        start = utcToZoned(start, timezone);
        end = utcToZoned(end, timezone);
      }

      let diff: number;
      switch (diffUnit) {
        case 'days':
          diff = differenceInDays(end, start);
          break;
        case 'hours':
          diff = differenceInHours(end, start);
          break;
        case 'minutes':
          diff = differenceInMinutes(end, start);
          break;
        case 'seconds':
          diff = differenceInSeconds(end, start);
          break;
        default:
          diff = 0;
      }

      const output = diff.toString();
      setResults([{ output, formatType: diffUnit }]);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    }
  };

  const handleCopy = (output: string) => {
    navigator.clipboard.writeText(output);
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const clearInput = () => {
    setInput('');
    setStartDate('');
    setEndDate('');
    setResults([]);
    setError('');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Timestamp Converter</h2>
          <p>Convert between Unix, ISO, readable formats; adjust timezones; perform date calculations.</p>

          <div className="tabs tabs-boxed mb-4">
            <a className={`tab ${mode === 'convert' ? 'tab-active' : ''}`} onClick={() => setMode('convert')}>
              Convert
            </a>
            <a className={`tab ${mode === 'adjust' ? 'tab-active' : ''}`} onClick={() => setMode('adjust')}>
              Adjust
            </a>
            <a className={`tab ${mode === 'calculate' ? 'tab-active' : ''}`} onClick={() => setMode('calculate')}>
              Calculate
            </a>
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Timezone</span>
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="select select-bordered w-full"
            >
              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>

          {mode === 'convert' && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Input Type</span>
                  </label>
                  <select
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value as any)}
                    className="select select-bordered w-full"
                  >
                    <option value="unix">Unix Timestamp</option>
                    <option value="iso">ISO</option>
                    <option value="readable">Readable (Custom Format)</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Output Type</span>
                  </label>
                  <select
                    value={outputType}
                    onChange={(e) => setOutputType(e.target.value as any)}
                    className="select select-bordered w-full"
                  >
                    <option value="unix">Unix Timestamp</option>
                    <option value="iso">ISO</option>
                    <option value="readable">Readable (Custom Format)</option>
                  </select>
                </div>
              </div>
              {(inputType === 'readable' || outputType === 'readable') && (
                <div className="form-control mt-4">
                  <label className="label">
                    <span className="label-text">Readable Format (date-fns style, e.g., yyyy-MM-dd HH:mm:ss)</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={readableFormat}
                    onChange={(e) => setReadableFormat(e.target.value)}
                  />
                </div>
              )}
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Input</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Enter input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <button className="btn btn-primary mt-4" onClick={handleConvert} disabled={!input.trim()}>
                Convert
              </button>
            </>
          )}

          {mode === 'adjust' && (
            <>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Input Date (ISO)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., 2023-01-01T00:00:00Z"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <select
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                  className="select select-bordered w-full"
                >
                  <option value="add">Add</option>
                  <option value="sub">Subtract</option>
                </select>
                <select
                  value={adjustmentUnit}
                  onChange={(e) => setAdjustmentUnit(e.target.value as any)}
                  className="select select-bordered w-full"
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Seconds</option>
                </select>
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Value</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(Number(e.target.value))}
                />
              </div>
              <button className="btn btn-primary mt-4" onClick={handleAdjust} disabled={!input.trim() || adjustmentValue <= 0}>
                Adjust
              </button>
            </>
          )}

          {mode === 'calculate' && (
            <>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Start Date (ISO)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., 2023-01-01T00:00:00Z"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">End Date (ISO)</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., 2023-01-02T00:00:00Z"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Difference Unit</span>
                </label>
                <select
                  value={diffUnit}
                  onChange={(e) => setDiffUnit(e.target.value as any)}
                  className="select select-bordered w-full"
                >
                  <option value="days">Days</option>
                  <option value="hours">Hours</option>
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Seconds</option>
                </select>
              </div>
              <button className="btn btn-primary mt-4" onClick={handleCalculate} disabled={!startDate.trim() || !endDate.trim()}>
                Calculate Difference
              </button>
            </>
          )}

          {error && (
            <div className={`alert mt-4 ${error.includes('Copied') ? 'alert-success' : 'alert-error'}`}>
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Results</h3>
              {results.map((result, idx) => (
                <div key={idx} className="mt-4 border p-4 rounded">
                  <p className="font-mono break-all">{result.output}</p>
                  <p className="text-sm mt-1">Format: {result.formatType}</p>
                  <button className="btn btn-secondary mt-2" onClick={() => handleCopy(result.output)}>
                    Copy
                  </button>
                </div>
              ))}
            </div>
          )}

          {(input || startDate || endDate) && (
            <button className="btn btn-ghost mt-4" onClick={clearInput}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}