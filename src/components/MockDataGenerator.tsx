'use client';

import { useState } from 'react';
import { Faker, en } from '@faker-js/faker';

const faker = new Faker({ locale: [en] });

interface GeneratedData {
  data: any[];
}

export default function MockDataGenerator() {
  const [inputJson, setInputJson] = useState('');
  const [numItems, setNumItems] = useState(1);
  const [results, setResults] = useState<GeneratedData | null>(null);
  const [error, setError] = useState('');

  const inferTypeAndGenerate = (key: string, sampleValue?: any) => {
    const lowerKey = key.toLowerCase();

    if (lowerKey.includes('name')) {
      if (lowerKey.includes('first')) return faker.person.firstName();
      if (lowerKey.includes('last')) return faker.person.lastName();
      if (lowerKey.includes('full')) return faker.person.fullName();
      return faker.person.fullName();
    }

    if (lowerKey.includes('email')) {
      if (sampleValue && typeof sampleValue === 'string') {
        const domain = sampleValue.split('@')[1] || 'example.com';
        return faker.internet.email({ provider: domain });
      }
      return faker.internet.email();
    }

    if (lowerKey.includes('address')) {
      if (lowerKey.includes('street')) return faker.location.streetAddress();
      if (lowerKey.includes('city')) return faker.location.city();
      if (lowerKey.includes('state')) return faker.location.state();
      if (lowerKey.includes('zip') || lowerKey.includes('postal')) return faker.location.zipCode();
      if (lowerKey.includes('country')) return faker.location.country();
      return faker.location.streetAddress(true);
    }

    if (lowerKey.includes('phone')) {
      return faker.phone.number();
    }

    if (lowerKey.includes('age')) {
      return faker.number.int({ min: 18, max: 80 });
    }

    if (lowerKey.includes('sex') || lowerKey.includes('gender')) {
      return faker.person.sex();
    }

    if (lowerKey.includes('id') || lowerKey.includes('uuid')) {
      return faker.string.uuid();
    }

    if (lowerKey.includes('date') || lowerKey.includes('birth')) {
      return faker.date.past().toISOString();
    }

    if (lowerKey.includes('username')) {
      return faker.internet.userName();
    }

    if (lowerKey.includes('password')) {
      return faker.internet.password();
    }

    if (typeof sampleValue === 'number') {
      return faker.number.int({ min: Math.max(0, sampleValue - 10), max: sampleValue + 10 });
    }

    if (typeof sampleValue === 'boolean') {
      return faker.datatype.boolean();
    }

    if (Array.isArray(sampleValue)) {
      return sampleValue.map(() => inferTypeAndGenerate(key, sampleValue[0]));
    }

    if (typeof sampleValue === 'object' && sampleValue !== null) {
      return generateMockObject(sampleValue);
    }

    // Default to string
    return faker.lorem.word();
  };

  const generateMockObject = (template: any) => {
    const mock: any = {};
    for (const [key, value] of Object.entries(template)) {
      mock[key] = inferTypeAndGenerate(key, value);
    }
    return mock;
  };

  const handleGenerate = () => {
    setError('');
    setResults(null);

    if (!inputJson.trim()) {
      setError('Please enter a JSON template.');
      return;
    }

    try {
      const template = JSON.parse(inputJson);
      if (typeof template !== 'object' || template === null) {
        throw new Error('Input must be a valid JSON object.');
      }

      const data = Array.from({ length: numItems }, () => generateMockObject(template));
      setResults({ data });
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    }
  };

  const handleCopy = () => {
    if (!results) return;
    navigator.clipboard.writeText(JSON.stringify(results.data, null, 2));
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const handleDownload = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mock-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearInput = () => {
    setInputJson('');
    setResults(null);
    setError('');
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Mock Data Generator</h2>
          <p>Provide a JSON template; generates fake data inferring types from keys/values (names, emails, addresses, etc.). Keeps similar structure/styles.</p>

          <div className="form-control">
            <label className="label">
              <span className="label-text">JSON Template</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-48 font-mono"
              placeholder='e.g., {"name": "John Doe", "email": "john@example.com", "age": 30}'
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Number of Items</span>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              className="input input-bordered w-full"
              value={numItems}
              onChange={(e) => setNumItems(Math.max(1, Number(e.target.value)))}
            />
          </div>

          <div className="flex space-x-2 mt-4">
            <button className="btn btn-primary" onClick={handleGenerate} disabled={!inputJson.trim()}>
              Generate
            </button>
            {inputJson && (
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

          {results && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Generated Data</h3>
              <textarea
                className="textarea textarea-bordered w-full h-48 font-mono mt-2"
                value={JSON.stringify(results.data, null, 2)}
                readOnly
              />
              <div className="flex space-x-2 mt-2">
                <button className="btn btn-secondary" onClick={handleCopy}>
                  Copy
                </button>
                <button className="btn btn-secondary" onClick={handleDownload}>
                  Download JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}