'use client';
import { useState, useEffect } from 'react';
import { Eye, Copy, CheckCircle, XCircle, Mail, Phone, CreditCard, Hash, Users, Globe, Zap, Code } from 'lucide-react';

const predefinedPatterns = [
  {
    name: 'Email',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'gi',
    icon: <Mail className="w-4 h-4" />,
    description: 'Matches email addresses',
    sample: 'user@example.com, test.email+tag@domain.co.uk, admin@company.org'
  },
  {
    name: 'Indian Mobile',
    pattern: '(\\+91[\\-\\s]?)?[0]?(91)?[789]\\d{9}',
    flags: 'g',
    icon: <Phone className="w-4 h-4" />,
    description: 'Matches Indian mobile numbers',
    sample: '+91 9876543210, 9876543210, 91-7894561230, 8123456789'
  },
  {
    name: 'PAN Card',
    pattern: '[A-Z]{5}[0-9]{4}[A-Z]{1}',
    flags: 'gi',
    icon: <CreditCard className="w-4 h-4" />,
    description: 'Matches Indian PAN card format',
    sample: 'ABCDE1234F, abcde1234f, PQRST9876K'
  },
  {
    name: 'Aadhaar Number',
    pattern: '[0-9]{4}[\\s-]?[0-9]{4}[\\s-]?[0-9]{4}',
    flags: 'g',
    icon: <Hash className="w-4 h-4" />,
    description: 'Matches Aadhaar number format',
    sample: '1234 5678 9012, 1234-5678-9012, 123456789012, 9876 5432 1098'
  },
  {
    name: 'GST Number',
    pattern: '[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}',
    flags: 'gi',
    icon: <Globe className="w-4 h-4" />,
    description: 'Matches Indian GST number format',
    sample: '27AABCU9603R1ZX, 29aapcs5718j1zu, 36ABCDE1234F1Z5'
  },
  {
    name: 'URL',
    pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    flags: 'gi',
    icon: <Globe className="w-4 h-4" />,
    description: 'Matches HTTP/HTTPS URLs',
    sample: 'https://example.com, http://www.test.org/page, https://api.service.com/v1'
  },
  {
    name: 'Credit Card',
    pattern: '\\b(?:\\d{4}[\\s-]?){3}\\d{4}\\b',
    flags: 'g',
    icon: <CreditCard className="w-4 h-4" />,
    description: 'Matches credit card numbers',
    sample: '1234 5678 9012 3456, 1234-5678-9012-3456, 1234567890123456'
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    icon: <Code className="w-4 h-4" />,
    description: 'Matches IPv4 addresses',
    sample: '192.168.1.1, 10.0.0.1, 255.255.255.0, 8.8.8.8'
  }
];

// Toast notification functions
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  // Simple toast implementation using DaisyUI alert
  const toast = document.createElement('div');
  toast.className = `alert ${type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info'} fixed top-4 right-4 w-auto z-50 shadow-lg`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
};

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState('');
  const [matches, setMatches] = useState<Array<{match: string, index: number, groups?: string[]}>>([]);
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'tester' | 'cheatsheet'>('tester');

  const testRegex = () => {
    try {
      setError('');
      if (!pattern) {
        setMatches([]);
        setIsValid(false);
        return;
      }

      const regex = new RegExp(pattern, flags);
      const allMatches: Array<{match: string, index: number, groups?: string[]}> = [];
      
      if (flags.includes('g')) {
        let match;
        const globalRegex = new RegExp(pattern, flags);
        while ((match = globalRegex.exec(testText)) !== null) {
          allMatches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          });
          if (!flags.includes('g')) break;
        }
      } else {
        const match = testText.match(regex);
        if (match) {
          allMatches.push({
            match: match[0],
            index: match.index || 0,
            groups: match.slice(1)
          });
        }
      }
      
      setMatches(allMatches);
      setIsValid(true);
    } catch (err) {
      setError('Invalid regular expression: ' + (err as Error).message);
      setMatches([]);
      setIsValid(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      testRegex();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [pattern, flags, testText]);

  const selectPredefinedPattern = (predefined: typeof predefinedPatterns[0]) => {
    setPattern(predefined.pattern);
    setFlags(predefined.flags);
    setTestText(predefined.sample);
    setSelectedPattern(predefined.name);
    showToast(`Applied ${predefined.name} pattern`, 'success');
  };

  const copyToClipboard = (text: string, label?: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label || 'Text'} copied to clipboard!`, 'success');
    });
  };

  const highlightMatches = (text: string) => {
    if (!pattern || !isValid || matches.length === 0) {
      return <span>{text}</span>;
    }

    let lastIndex = 0;
    const parts = [];

    matches.forEach((match, i) => {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${i}`}>
            {text.slice(lastIndex, match.index)}
          </span>
        );
      }

      parts.push(
        <span
          key={`match-${i}`}
          className="bg-warning text-warning-content px-1 rounded font-semibold"
        >
          {match.match}
        </span>
      );

      lastIndex = match.index + match.match.length;
    });

    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.slice(lastIndex)}
        </span>
      );
    }

    return <>{parts}</>;
  };

  const cheatsheetItems = [
    { symbol: '.', description: 'Matches any single character' },
    { symbol: '*', description: 'Matches 0 or more of the preceding character' },
    { symbol: '+', description: 'Matches 1 or more of the preceding character' },
    { symbol: '?', description: 'Matches 0 or 1 of the preceding character' },
    { symbol: '^', description: 'Matches the start of a line' },
    { symbol: '$', description: 'Matches the end of a line' },
    { symbol: '\\d', description: 'Matches any digit (0-9)' },
    { symbol: '\\w', description: 'Matches any word character (a-z, A-Z, 0-9, _)' },
    { symbol: '\\s', description: 'Matches any whitespace character' },
    { symbol: '[abc]', description: 'Matches any character in the brackets' },
    { symbol: '[^abc]', description: 'Matches any character NOT in the brackets' },
    { symbol: '()', description: 'Creates a capturing group' },
    { symbol: '|', description: 'OR operator' },
    { symbol: '{n}', description: 'Matches exactly n occurrences' },
    { symbol: '{n,}', description: 'Matches n or more occurrences' },
    { symbol: '{n,m}', description: 'Matches between n and m occurrences' }
  ];

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="hero bg-gradient-to-r from-primary to-secondary text-primary-content rounded-box">
          <div className="hero-content text-center py-12">
            <div className="max-w-md">
              <div className="flex justify-center mb-4">
                <div className="bg-primary-content rounded-full p-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-5xl font-bold">Regex Tester</h1>
              <p className="py-6">Test and validate regular expressions with real-time feedback and predefined patterns</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 w-fit">
          <button 
            className={`tab tab-lg ${activeTab === 'tester' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('tester')}
          >
            <Eye className="w-4 h-4 mr-2" />
            Tester
          </button>
          <button 
            className={`tab tab-lg ${activeTab === 'cheatsheet' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('cheatsheet')}
          >
            <Code className="w-4 h-4 mr-2" />
            Cheat Sheet
          </button>
        </div>

        {activeTab === 'tester' ? (
          <>
            {/* Predefined Patterns */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">
                  <Eye className="w-6 h-6" />
                  Quick Patterns
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {predefinedPatterns.map((predefined) => (
                    <div
                      key={predefined.name}
                      className={`card card-compact cursor-pointer transition-all hover:shadow-lg ${
                        selectedPattern === predefined.name
                          ? 'bg-primary text-primary-content'
                          : 'bg-base-200 hover:bg-base-300'
                      }`}
                      onClick={() => selectPredefinedPattern(predefined)}
                    >
                      <div className="card-body">
                        <div className="flex items-center gap-2 mb-2">
                          {predefined.icon}
                          <h3 className="card-title text-sm">{predefined.name}</h3>
                        </div>
                        <p className="text-xs opacity-80 mb-2">{predefined.description}</p>
                        <div className="text-xs opacity-60 bg-black bg-opacity-10 p-2 rounded font-mono">
                          {predefined.sample.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Section */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Pattern & Flags</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-3 form-control">
                    <label className="label">
                      <span className="label-text font-medium">Regular Expression Pattern</span>
                      {pattern && (
                        <span className="label-text-alt">
                          {isValid ? (
                            <div className="badge badge-success gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Valid
                            </div>
                          ) : (
                            <div className="badge badge-error gap-1">
                              <XCircle className="w-3 h-3" />
                              Invalid
                            </div>
                          )}
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      className={`input input-bordered input-lg font-mono ${
                        error
                          ? 'input-error'
                          : isValid && pattern
                          ? 'input-success'
                          : ''
                      }`}
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="Enter regex pattern... (e.g., \\w+)"
                    />
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Flags</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-lg font-mono"
                      value={flags}
                      onChange={(e) => setFlags(e.target.value)}
                      placeholder="g, i, m..."
                    />
                    <label className="label">
                      <span className="label-text-alt">g: global, i: ignore case, m: multiline</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error mt-4">
                    <XCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Test Text Section */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">Test Text</h2>
                <div className="form-control">
                  <textarea
                    className="textarea textarea-bordered textarea-lg h-32 font-mono"
                    value={testText}
                    onChange={(e) => setTestText(e.target.value)}
                    placeholder="Enter text to test your regex pattern against..."
                  />
                </div>
                
                {/* Highlighted Preview */}
                {testText && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Preview with Matches Highlighted</h3>
                      {matches.length > 0 && (
                        <div className="badge badge-primary badge-lg">
                          {matches.length} match{matches.length !== 1 ? 'es' : ''}
                        </div>
                      )}
                    </div>
                    <div className="mockup-code bg-base-300">
                      <pre className="text-sm whitespace-pre-wrap px-4 py-2">
                        <code>{highlightMatches(testText)}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            {matches.length > 0 && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="card-title text-xl">
                      <CheckCircle className="w-6 h-6 text-success" />
                      Matches Found ({matches.length})
                    </h2>
                    <button
                      onClick={() => copyToClipboard(matches.map(m => m.match).join('\n'), 'All matches')}
                      className="btn btn-outline btn-sm gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((match, index) => (
                      <div key={index} className="card bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                        <div className="card-body p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="badge badge-primary badge-sm">Match #{index + 1}</div>
                            <button
                              onClick={() => copyToClipboard(match.match, `Match #${index + 1}`)}
                              className="btn btn-ghost btn-xs"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="mockup-code bg-base-100 text-sm">
                            <pre className="px-2 py-1"><code>{match.match}</code></pre>
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            <div>Position: <span className="badge badge-ghost badge-xs">{match.index}</span></div>
                            {match.groups && match.groups.length > 0 && (
                              <div className="mt-1">
                                Groups: 
                                {match.groups.map((group, i) => (
                                  <span key={i} className="badge badge-outline badge-xs ml-1">
                                    {group || 'null'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Matches */}
            {pattern && testText && matches.length === 0 && isValid && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <div className="text-center py-12">
                    <XCircle className="w-16 h-16 text-base-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Matches Found</h3>
                    <p className="text-base-content/70">{`The pattern didn't match any text in your input.`}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Cheat Sheet Tab */
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">
                <Code className="w-6 h-6" />
                Regex Cheat Sheet
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cheatsheetItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-base-200 rounded-lg">
                    <div className="badge badge-primary font-mono text-sm px-3 py-3">
                      {item.symbol}
                    </div>
                    <div>
                      <p className="font-medium">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="divider"></div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Common Flag Combinations</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <kbd className="kbd kbd-sm">g</kbd>
                    <span>Global - Find all matches, not just the first</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <kbd className="kbd kbd-sm">i</kbd>
                    <span>Case insensitive - Ignore case when matching</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <kbd className="kbd kbd-sm">m</kbd>
                    <span>Multiline - ^ and $ match line breaks</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <kbd className="kbd kbd-sm">gi</kbd>
                    <span>Global + Case insensitive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}