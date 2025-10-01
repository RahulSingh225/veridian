'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Code, 
  Copy, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Minimize, 
  Maximize, 
  Eye, 
  EyeOff,
  Zap,
  Search,
  Settings
} from 'lucide-react';

interface JsonStats {
  size: number;
  lines: number;
  depth: number;
  objects: number;
  arrays: number;
  strings: number;
  numbers: number;
  booleans: number;
  nulls: number;
}

export default function JsonFormatter() {
  // Add responsive container class
  const containerClasses = "flex flex-col gap-4 p-4 sm:p-6 max-w-full h-full";
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [minifyMode, setMinifyMode] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [stats, setStats] = useState<JsonStats>({
    size: 0,
    lines: 0,
    depth: 0,
    objects: 0,
    arrays: 0,
    strings: 0,
    numbers: 0,
    booleans: 0,
    nulls: 0
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLPreElement>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(message);
      setSuccess('');
      setTimeout(() => setError(''), 5000);
    }
  };

  const calculateStats = (obj: any, depth = 0): JsonStats => {
    const stats: JsonStats = {
      size: JSON.stringify(obj).length,
      lines: JSON.stringify(obj, null, 2).split('\n').length,
      depth: depth,
      objects: 0,
      arrays: 0,
      strings: 0,
      numbers: 0,
      booleans: 0,
      nulls: 0
    };

    const traverse = (value: any, currentDepth: number) => {
      stats.depth = Math.max(stats.depth, currentDepth);
      
      if (value === null) {
        stats.nulls++;
      } else if (typeof value === 'boolean') {
        stats.booleans++;
      } else if (typeof value === 'number') {
        stats.numbers++;
      } else if (typeof value === 'string') {
        stats.strings++;
      } else if (Array.isArray(value)) {
        stats.arrays++;
        value.forEach(item => traverse(item, currentDepth + 1));
      } else if (typeof value === 'object') {
        stats.objects++;
        Object.values(value).forEach(item => traverse(item, currentDepth + 1));
      }
    };

    traverse(obj, 0);
    return stats;
  };

  const formatJson = async () => {
    if (!input.trim()) {
      showToast('Please enter some JSON to format', 'error');
      return;
    }

    setIsValidating(true);
    
    try {
      let parsed = JSON.parse(input);
      
      if (sortKeys) {
        parsed = sortObjectKeys(parsed);
      }
      
      let formatted;
      if (minifyMode) {
        formatted = JSON.stringify(parsed);
      } else {
        formatted = JSON.stringify(parsed, null, indentSize);
      }
      
      setOutput(formatted);
      setStats(calculateStats(parsed));
      setError('');
      showToast('JSON formatted successfully!');
    } catch (err) {
      const errorMsg = (err as Error).message;
      showToast(`Invalid JSON: ${errorMsg}`, 'error');
      setOutput('');
      setStats({
        size: 0,
        lines: 0,
        depth: 0,
        objects: 0,
        arrays: 0,
        strings: 0,
        numbers: 0,
        booleans: 0,
        nulls: 0
      });
    } finally {
      setIsValidating(false);
    }
  };

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
      const sorted: any = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key]);
      });
      return sorted;
    }
    return obj;
  };

  const handleCopy = async () => {
    if (!output) {
      showToast('No formatted JSON to copy', 'error');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(output);
      showToast('Copied to clipboard!');
    } catch (err) {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    if (!output) {
      showToast('No formatted JSON to download', 'error');
      return;
    }
    
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON file downloaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showToast('Please select a JSON file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
      showToast(`File "${file.name}" loaded successfully!`);
    };
    reader.readAsText(file);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setSuccess('');
    setSearchTerm('');
    setStats({
      size: 0,
      lines: 0,
      depth: 0,
      objects: 0,
      arrays: 0,
      strings: 0,
      numbers: 0,
      booleans: 0,
      nulls: 0
    });
  };

  const validateJson = (value: string) => {
    if (!value.trim()) {
      setError('');
      return;
    }
    
    try {
      JSON.parse(value);
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${(err as Error).message}`);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateJson(input);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [input]);

  const highlightSearch = (text: string) => {
    if (!searchTerm.trim()) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning text-warning-content">$1</mark>');
  };

  const sampleJsons = [
    {
      name: 'Simple Object',
      data: '{"name": "John Doe", "age": 30, "city": "New York"}'
    },
    {
      name: 'Array Example',
      data: '[{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]'
    },
    {
      name: 'Complex Nested',
      data: '{"users": [{"id": 1, "profile": {"name": "Alice", "settings": {"theme": "dark", "notifications": true}}}]}'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4 space-y-4 sm:space-y-6">
      {/* Quick Actions & Settings */}
      <div className="navbar flex-col sm:flex-row gap-2 sm:gap-0 bg-base-200 rounded-box p-2 sm:p-4">
        <div className="navbar-start w-full sm:w-auto flex flex-wrap gap-2">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm sm:btn-md">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Settings</span>
            </div>
            <div className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72 sm:w-80 mt-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-sm sm:text-base">Indent Size</span>
                  <span className="label-text-alt">{indentSize} spaces</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="8" 
                  value={indentSize} 
                  onChange={(e) => setIndentSize(Number(e.target.value))}
                  className="range range-primary range-sm" 
                />
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Sort Keys</span>
                  <input 
                    type="checkbox" 
                    checked={sortKeys}
                    onChange={(e) => setSortKeys(e.target.checked)}
                    className="toggle toggle-primary toggle-sm" 
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Minify Mode</span>
                  <input 
                    type="checkbox" 
                    checked={minifyMode}
                    onChange={(e) => setMinifyMode(e.target.checked)}
                    className="toggle toggle-secondary toggle-sm" 
                  />
                </label>
              </div>
              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Show Statistics</span>
                  <input 
                    type="checkbox" 
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                    className="toggle toggle-accent toggle-sm" 
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-ghost">
              <FileText className="w-5 h-5" />
              Samples
            </div>
            <div className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-64 mt-2">
              {sampleJsons.map((sample, index) => (
                <button
                  key={index}
                  className="btn btn-ghost btn-sm justify-start"
                  onClick={() => {
                    setInput(sample.data);
                    showToast(`Sample "${sample.name}" loaded!`);
                  }}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="navbar-end gap-2">
          <input
            type="file"
            accept=".json"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
          
          <button
            className="btn btn-ghost btn-sm"
            onClick={clearAll}
            disabled={!input && !output}
          >
            <RefreshCw className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <XCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
        </div>
      )}

      {/* Statistics */}
      {showStats && (
        <div className="stats stats-vertical lg:stats-horizontal shadow bg-base-100 w-full">
          <div className="stat">
            <div className="stat-figure text-primary">
              <FileText className="w-8 h-8" />
            </div>
            <div className="stat-title">Input Size</div>
            <div className="stat-value text-primary">{input.length.toLocaleString()}</div>
            <div className="stat-desc">{stats.lines} lines</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Code className="w-8 h-8" />
            </div>
            <div className="stat-title">Output Size</div>
            <div className="stat-value text-secondary">{output.length.toLocaleString()}</div>
            <div className="stat-desc">Depth: {stats.depth}</div>
          </div>
          
          <div className="stat">
            <div className="stat-figure text-accent">
              <Zap className="w-8 h-8" />
            </div>
            <div className="stat-title">Objects</div>
            <div className="stat-value text-accent">{stats.objects}</div>
            <div className="stat-desc">{stats.arrays} arrays</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Data Types</div>
            <div className="stat-value text-sm">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>Strings: {stats.strings}</span>
                <span>Numbers: {stats.numbers}</span>
                <span>Booleans: {stats.booleans}</span>
                <span>Nulls: {stats.nulls}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-primary">
                <Code className="w-5 h-5" />
                Input JSON
                {input && !error && (
                  <div className="badge badge-success gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Valid
                  </div>
                )}
                {error && (
                  <div className="badge badge-error gap-1">
                    <XCircle className="w-3 h-3" />
                    Invalid
                  </div>
                )}
              </h2>
            </div>
            
            <textarea
              className={`textarea textarea-bordered h-96 font-mono text-sm leading-relaxed resize-none ${
                error ? 'textarea-error' : input && !error ? 'textarea-success' : ''
              }`}
              placeholder="Paste your JSON here... or use samples from the dropdown above"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
            />
            
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                className={`btn btn-primary flex-1 min-w-32 ${isValidating ? 'loading' : ''}`}
                onClick={formatJson}
                disabled={!input.trim() || isValidating}
              >
                {isValidating ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    {minifyMode ? 'Minify' : 'Format'} JSON
                  </>
                )}
              </button>
              
              <div className="tooltip" data-tip={minifyMode ? "Switch to Pretty Print" : "Switch to Minify"}>
                <button 
                  className={`btn ${minifyMode ? 'btn-secondary' : 'btn-outline btn-secondary'}`}
                  onClick={() => setMinifyMode(!minifyMode)}
                >
                  {minifyMode ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-title text-secondary">
                <FileText className="w-5 h-5" />
                Formatted Output
                {output && (
                  <div className="badge badge-secondary">
                    {minifyMode ? 'Minified' : 'Formatted'}
                  </div>
                )}
              </h2>
              
              {output && (
                <div className="flex gap-2">
                  <div className="join">
                    <input
                      className="input input-bordered input-sm join-item w-32"
                      placeholder="Search in output..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-sm join-item">
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="tooltip" data-tip="Copy to clipboard">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={handleCopy}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="tooltip" data-tip="Download as file">
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-base-200 rounded-lg h-96 overflow-auto border">
              <pre 
                ref={outputRef}
                className="p-4 font-mono text-sm leading-relaxed h-full m-0 whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: output 
                    ? highlightSearch(output)
                    : '<span class="text-base-content/50 italic">Formatted JSON will appear here...</span>'
                }}
              />
            </div>
            
            {output && (
              <div className="mt-4 p-3 bg-base-300 rounded-lg">
                <div className="text-xs text-base-content/70">
                  <div className="grid grid-cols-2 gap-2">
                    <span>Lines: <strong>{output.split('\n').length}</strong></span>
                    <span>Size: <strong>{(new Blob([output]).size / 1024).toFixed(2)} KB</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Info */}
      <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
        <div className="card-body">
          <h3 className="font-semibold text-blue-800 mb-3">🚀 Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-700">
            <div className="space-y-1">
              <div>• Real-time JSON validation</div>
              <div>• Customizable indentation (1-8 spaces)</div>
              <div>• Minify & beautify modes</div>
            </div>
            <div className="space-y-1">
              <div>• Sort object keys alphabetically</div>
              <div>• Detailed JSON statistics</div>
              <div>• Search within formatted output</div>
            </div>
            <div className="space-y-1">
              <div>• File upload & download</div>
              <div>• Sample JSON templates</div>
              <div>• Copy to clipboard</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}