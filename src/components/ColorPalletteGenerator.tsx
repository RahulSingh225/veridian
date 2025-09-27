'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Palette, Download, Copy, Eye, Zap, Image as ImageIcon, RefreshCw, Heart, Star, Sparkles } from 'lucide-react';
import NextImage  from 'next/image';

// Color manipulation utilities
const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h: number, s: number; const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    return [
      Math.round(hue2rgb(p, q, h + 1/3) * 255),
      Math.round(hue2rgb(p, q, h) * 255),
      Math.round(hue2rgb(p, q, h - 1/3) * 255)
    ];
  }
};

const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

const getContrastRatio = (rgb1: [number, number, number], rgb2: [number, number, number]): number => {
  const lum1 = getLuminance(...rgb1);
  const lum2 = getLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
};

interface PaletteColor {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
  name?: string;
  role?: 'primary' | 'secondary' | 'accent' | 'neutral' | 'base';
}

interface PaletteResult {
  colors: PaletteColor[];
  source: 'image' | 'color';
  theme?: string;
}

// Smart color palette generators
const generateMonochromaticPalette = (baseColor: [number, number, number]): PaletteColor[] => {
  const [h, s, l] = rgbToHsl(...baseColor);
  const lightness = [20, 35, 50, 65, 80, 95];
  
  return lightness.map((lightness, index) => {
    const [r, g, b] = hslToRgb(h, s, lightness);
    return {
      hex: rgbToHex(r, g, b),
      rgb: [r, g, b] as [number, number, number],
      hsl: [h, s, lightness] as [number, number, number],
      name: `Shade ${index + 1}`,
      role: index === 0 ? 'base' : index === 2 ? 'primary' : 'neutral'
    };
  });
};

const generateComplementaryPalette = (baseColor: [number, number, number]): PaletteColor[] => {
  const [h, s, l] = rgbToHsl(...baseColor);
  const complementaryH = (h + 180) % 360;
  
  const colors = [
    { h: h, s: s, l: l, name: 'Primary', role: 'primary' as const },
    { h: complementaryH, s: s, l: l, name: 'Complementary', role: 'secondary' as const },
    { h: h, s: s * 0.3, l: Math.min(l + 30, 95), name: 'Light Primary', role: 'accent' as const },
    { h: complementaryH, s: s * 0.3, l: Math.min(l + 30, 95), name: 'Light Complementary', role: 'neutral' as const },
    { h: (h + complementaryH) / 2, s: s * 0.5, l: 50, name: 'Balance', role: 'base' as const }
  ];

  return colors.map(({ h, s, l, name, role }) => {
    const [r, g, b] = hslToRgb(h, s, l);
    return {
      hex: rgbToHex(r, g, b),
      rgb: [r, g, b] as [number, number, number],
      hsl: [h, s, l] as [number, number, number],
      name,
      role
    };
  });
};

const generateTriadicPalette = (baseColor: [number, number, number]): PaletteColor[] => {
  const [h, s, l] = rgbToHsl(...baseColor);
  
  const colors = [
    { h: h, s: s, l: l, name: 'Primary', role: 'primary' as const },
    { h: (h + 120) % 360, s: s, l: l, name: 'Triadic 1', role: 'secondary' as const },
    { h: (h + 240) % 360, s: s, l: l, name: 'Triadic 2', role: 'accent' as const },
    { h: h, s: s * 0.2, l: 90, name: 'Light Neutral', role: 'neutral' as const },
    { h: h, s: s * 0.2, l: 15, name: 'Dark Neutral', role: 'base' as const }
  ];

  return colors.map(({ h, s, l, name, role }) => {
    const [r, g, b] = hslToRgb(h, s, l);
    return {
      hex: rgbToHex(r, g, b),
      rgb: [r, g, b] as [number, number, number],
      hsl: [h, s, l] as [number, number, number],
      name,
      role
    };
  });
};

const generateAnalogousPalette = (baseColor: [number, number, number]): PaletteColor[] => {
  const [h, s, l] = rgbToHsl(...baseColor);
  
  const colors = [
    { h: (h - 30 + 360) % 360, s: s, l: l, name: 'Analogous -30°', role: 'secondary' as const },
    { h: h, s: s, l: l, name: 'Base Color', role: 'primary' as const },
    { h: (h + 30) % 360, s: s, l: l, name: 'Analogous +30°', role: 'accent' as const },
    { h: h, s: s * 0.3, l: Math.min(l + 25, 90), name: 'Light Tint', role: 'neutral' as const },
    { h: h, s: s * 0.8, l: Math.max(l - 25, 10), name: 'Dark Shade', role: 'base' as const }
  ];

  return colors.map(({ h, s, l, name, role }) => {
    const [r, g, b] = hslToRgb(h, s, l);
    return {
      hex: rgbToHex(r, g, b),
      rgb: [r, g, b] as [number, number, number],
      hsl: [h, s, l] as [number, number, number],
      name,
      role
    };
  });
};

// Preset color themes
const presetThemes = [
  { name: 'Ocean Breeze', colors: ['#0077BE', '#00A8CC', '#7FDBFF', '#B3E5FC', '#E1F5FE'], icon: '🌊' },
  { name: 'Sunset Glow', colors: ['#FF6B35', '#F7931E', '#FFD23F', '#FFF1C1', '#FFEBCD'], icon: '🌅' },
  { name: 'Forest Deep', colors: ['#2D5016', '#4F7942', '#8FBC8F', '#98FB98', '#F0FFF0'], icon: '🌲' },
  { name: 'Royal Purple', colors: ['#4B0082', '#663399', '#9966CC', '#DDA0DD', '#F8F8FF'], icon: '👑' },
  { name: 'Cherry Blossom', colors: ['#8B0000', '#DC143C', '#FFB6C1', '#FFC0CB', '#FFF0F5'], icon: '🌸' },
  { name: 'Midnight Blue', colors: ['#191970', '#000080', '#4169E1', '#87CEEB', '#F0F8FF'], icon: '🌙' }
];

export default function ColorPaletteGenerator() {
  const [mode, setMode] = useState<'image' | 'color' | 'preset'>('color');
  const [inputColor, setInputColor] = useState('#3B82F6');
  const [file, setFile] = useState<File | null>(null);
  const [palette, setPalette] = useState<PaletteResult | null>(null);
  const [exportFormat, setExportFormat] = useState<'css' | 'sass' | 'json' | 'tailwind'>('css');
  const [paletteType, setPaletteType] = useState<'monochromatic' | 'complementary' | 'triadic' | 'analogous'>('complementary');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
    setTimeout(() => setError(''), 5000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && supportedFormats.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
    } else {
      showError('Please upload a valid image (JPG, PNG, WebP, AVIF, GIF).');
      setFile(null);
    }
  };

  const extractColorsFromImage = (imageData: ImageData): [number, number, number][] => {
    const data = imageData.data;
    const colorMap = new Map<string, number>();
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];
      
      if (alpha > 128) { // Only consider non-transparent pixels
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }
    }
    
    // Sort by frequency and get top colors
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([key]) => key.split(',').map(Number) as [number, number, number]);
    
    // Cluster similar colors
    const clusteredColors: [number, number, number][] = [];
    const threshold = 50;
    
    for (const color of sortedColors) {
      const similar = clusteredColors.find(existing => {
        const [r1, g1, b1] = existing;
        const [r2, g2, b2] = color;
        const distance = Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
        return distance < threshold;
      });
      
      if (!similar) {
        clusteredColors.push(color);
        if (clusteredColors.length >= 8) break;
      }
    }
    
    return clusteredColors;
  };

  const generatePaletteFromColor = (color: [number, number, number]): PaletteColor[] => {
    switch (paletteType) {
      case 'monochromatic':
        return generateMonochromaticPalette(color);
      case 'complementary':
        return generateComplementaryPalette(color);
      case 'triadic':
        return generateTriadicPalette(color);
      case 'analogous':
        return generateAnalogousPalette(color);
      default:
        return [];
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setPalette(null);

    try {
      if (mode === 'image' && file) {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });

        // Resize for better performance
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        const extractedColors = extractColorsFromImage(imageData);
        const paletteColors: PaletteColor[] = extractedColors.map((rgb, index) => {
          const [h, s, l] = rgbToHsl(...rgb);
          return {
            hex: rgbToHex(...rgb),
            rgb,
            hsl: [h, s, l] as [number, number, number],
            name: `Color ${index + 1}`,
            role: index === 0 ? 'primary' : index === 1 ? 'secondary' : 'accent'
          };
        });

        setPalette({ colors: paletteColors, source: 'image' });
        
      } else if (mode === 'color' && inputColor) {
        const rgb = hexToRgb(inputColor);
        const paletteColors = generatePaletteFromColor(rgb);
        setPalette({ colors: paletteColors, source: 'color', theme: paletteType });
        
      } else if (mode === 'preset' && selectedPreset) {
        const preset = presetThemes.find(p => p.name === selectedPreset);
        if (preset) {
          const paletteColors: PaletteColor[] = preset.colors.map((hex, index) => {
            const rgb = hexToRgb(hex);
            const [h, s, l] = rgbToHsl(...rgb);
            return {
              hex,
              rgb,
              hsl: [h, s, l] as [number, number, number],
              name: `${preset.name} ${index + 1}`,
              role: index === 0 ? 'primary' : index === 1 ? 'secondary' : 'accent'
            };
          });
          setPalette({ colors: paletteColors, source: 'color', theme: preset.name });
        }
      }
      
      showSuccess('Palette generated successfully!');
    } catch (err) {
      showError(`Error generating palette: ${(err as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: 'download' | 'copy') => {
    if (!palette) return;

    let content = '';
    const fileName = `palette.${exportFormat}`;

    switch (exportFormat) {
      case 'css':
        content = `:root {\n${palette.colors
          .map((c, i) => `  --color-${c.role || (i + 1)}: ${c.hex};`)
          .join('\n')}\n}`;
        break;
      case 'sass':
        content = palette.colors.map((c, i) => `$color-${c.role || (i + 1)}: ${c.hex};`).join('\n');
        break;
      case 'tailwind':
        content = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${palette.colors
          .map((c, i) => `        '${c.role || `color-${i + 1}`}': '${c.hex}',`)
          .join('\n')}\n      }\n    }\n  }\n}`;
        break;
      case 'json':
        content = JSON.stringify({
          theme: palette.theme,
          colors: palette.colors.map(c => ({
            name: c.name,
            role: c.role,
            hex: c.hex,
            rgb: c.rgb,
            hsl: c.hsl.map(n => Math.round(n))
          }))
        }, null, 2);
        break;
    }

    if (format === 'copy') {
      navigator.clipboard.writeText(content);
      showSuccess('Palette copied to clipboard!');
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('Palette downloaded!');
    }
  };

  const toggleFavorite = (hex: string) => {
    setFavorites(prev => 
      prev.includes(hex) 
        ? prev.filter(c => c !== hex)
        : [...prev, hex]
    );
  };

  const clearAll = () => {
    setFile(null);
    setInputColor('#3B82F6');
    setPalette(null);
    setSelectedPreset('');
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Header */}
        <div className="hero bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-box">
          <div className="hero-content text-center py-12">
            <div className="max-w-md">
              <div className="flex justify-center mb-4">
                <div className="bg-white/20 rounded-full p-4">
                  <Palette className="w-8 h-8" />
                </div>
              </div>
              <h1 className="text-5xl font-bold">Smart Color Palette Generator</h1>
              <p className="py-6">Create beautiful, accessible color palettes from images, colors, or preset themes with AI-powered color harmony</p>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">
              <Sparkles className="w-6 h-6" />
              Choose Your Method
            </h2>
            
            <div className="tabs tabs-boxed bg-base-200 w-fit">
              <button 
                className={`tab tab-lg ${mode === 'color' ? 'tab-active' : ''}`}
                onClick={() => setMode('color')}
              >
                <Palette className="w-4 h-4 mr-2" />
                From Color
              </button>
              <button 
                className={`tab tab-lg ${mode === 'image' ? 'tab-active' : ''}`}
                onClick={() => setMode('image')}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                From Image
              </button>
              <button 
                className={`tab tab-lg ${mode === 'preset' ? 'tab-active' : ''}`}
                onClick={() => setMode('preset')}
              >
                <Star className="w-4 h-4 mr-2" />
                Preset Themes
              </button>
            </div>

            <div className="mt-6">
              {mode === 'color' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Base Color</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={inputColor}
                        onChange={(e) => setInputColor(e.target.value)}
                        className="btn btn-square btn-lg"
                      />
                      <input
                        type="text"
                        value={inputColor}
                        onChange={(e) => setInputColor(e.target.value)}
                        className="input input-bordered input-lg flex-1 font-mono"
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Palette Type</span>
                    </label>
                    <select
                      value={paletteType}
                      onChange={(e) => setPaletteType(e.target.value as any)}
                      className="select select-bordered select-lg"
                    >
                      <option value="complementary">Complementary - Bold contrasts</option>
                      <option value="analogous">Analogous - Harmonious neighbors</option>
                      <option value="triadic">Triadic - Balanced triangular</option>
                      <option value="monochromatic">Monochromatic - Single hue variations</option>
                    </select>
                  </div>
                </div>
              )}

              {mode === 'image' && (
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Upload Image</span>
                    <span className="label-text-alt">JPG, PNG, WebP, AVIF, GIF</span>
                  </label>
                  <div className="form-control">
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept={supportedFormats.join(',')}
                        className="file-input file-input-bordered file-input-lg flex-1"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-primary btn-lg"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  {file && (
                    <div className="mt-4">
                      <div className="card bg-base-200 shadow-md">
                        <figure className="px-4 pt-4">
                         <NextImage
  src={URL.createObjectURL(file)}
  alt="Preview"
  className="rounded-lg max-h-64 w-auto object-contain"
  width={500}
  height={300}
  unoptimized={true}
/>
                          
                        </figure>
                        <div className="card-body text-center">
                          <p className="text-sm text-base-content/70">{file.name}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mode === 'preset' && (
                <div>
                  <label className="label">
                    <span className="label-text font-semibold">Choose Preset Theme</span>
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presetThemes.map((theme) => (
                      <div
                        key={theme.name}
                        className={`card card-compact cursor-pointer transition-all hover:shadow-lg ${
                          selectedPreset === theme.name ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedPreset(theme.name)}
                      >
                        <div className="card-body">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{theme.icon}</span>
                            <h3 className="card-title text-sm">{theme.name}</h3>
                          </div>
                          <div className="flex gap-1">
                            {theme.colors.map((color, i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              <button
                className={`btn btn-primary btn-lg ${isGenerating ? 'loading' : ''}`}
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  (mode === 'image' && !file) ||
                  (mode === 'color' && !inputColor) ||
                  (mode === 'preset' && !selectedPreset)
                }
              >
                {isGenerating ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Zap className="w-5 h-5" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Palette'}
              </button>
              
              {(file || inputColor !== '#3B82F6' || selectedPreset || palette) && (
                <button className="btn btn-ghost btn-lg" onClick={clearAll}>
                  <RefreshCw className="w-5 h-5" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
        )}

        {/* Generated Palette */}
        {palette && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="card-title text-2xl">
                  <Eye className="w-6 h-6" />
                  Generated Palette
                  {palette.theme && (
                    <div className="badge badge-primary badge-lg">{palette.theme}</div>
                  )}
                </h2>
                
                <div className="flex gap-2">
                  <div className="form-control">
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as any)}
                      className="select select-bordered select-sm"
                    >
                      <option value="css">CSS Variables</option>
                      <option value="sass">SASS Variables</option>
                      <option value="tailwind">Tailwind Config</option>
                      <option value="json">JSON Format</option>
                    </select>
                  </div>
                  
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleExport('copy')}
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleExport('download')}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Color Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
                {palette.colors.map((color, idx) => {
                  const contrastWhite = getContrastRatio(color.rgb, [255, 255, 255]);
                  const contrastBlack = getContrastRatio(color.rgb, [0, 0, 0]);
                  const textColor = contrastWhite > contrastBlack ? 'white' : 'black';
                  const isFavorite = favorites.includes(color.hex);
                  
                  return (
                    <div key={idx} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
                      <div className="card-body p-4">
                        <div className="relative">
                          <div
                            className="w-full h-24 rounded-lg shadow-inner mb-3 flex items-center justify-center cursor-pointer group"
                            style={{ backgroundColor: color.hex, color: textColor }}
                            onClick={() => {
                              navigator.clipboard.writeText(color.hex);
                              showSuccess(`${color.hex} copied!`);
                            }}
                          >
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-sm bg-black/20 px-2 py-1 rounded">
                              Click to copy
                            </span>
                          </div>
                          
                          <button
                            className={`absolute top-2 right-2 btn btn-sm btn-circle ${isFavorite ? 'btn-error' : 'btn-ghost'}`}
                            onClick={() => toggleFavorite(color.hex)}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {color.name && (
                            <h3 className="font-semibold text-sm">{color.name}</h3>
                          )}
                          
                          {color.role && (
                            <div className={`badge badge-sm ${
                              color.role === 'primary' ? 'badge-primary' : 
                              color.role === 'secondary' ? 'badge-secondary' : 
                              color.role === 'accent' ? 'badge-accent' : 
                              'badge-neutral'
                            }`}>
                              {color.role}
                            </div>
                          )}
                          
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-base-content/60">HEX</span>
                              <span className="font-mono">{color.hex}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">RGB</span>
                              <span className="font-mono">{color.rgb.join(', ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-base-content/60">HSL</span>
                              <span className="font-mono">{color.hsl.map(n => Math.round(n)).join(', ')}</span>
                            </div>
                          </div>
                          
                          {/* Accessibility Info */}
                          <div className="pt-2 border-t border-base-300">
                            <div className="text-xs text-base-content/60 mb-1">Accessibility</div>
                            <div className="flex gap-1">
                              <div className={`badge badge-xs ${contrastWhite >= 4.5 ? 'badge-success' : contrastWhite >= 3 ? 'badge-warning' : 'badge-error'}`}>
                                White: {contrastWhite.toFixed(1)}
                              </div>
                              <div className={`badge badge-xs ${contrastBlack >= 4.5 ? 'badge-success' : contrastBlack >= 3 ? 'badge-warning' : 'badge-error'}`}>
                                Black: {contrastBlack.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Palette Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Palette Preview</h3>
                
                {/* Color Strip */}
                <div className="h-16 rounded-lg overflow-hidden shadow-lg flex">
                  {palette.colors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: color.hex }}
                      onClick={() => {
                        navigator.clipboard.writeText(color.hex);
                        showSuccess(`${color.hex} copied!`);
                      }}
                    />
                  ))}
                </div>

                {/* Usage Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mockup-browser border border-base-300">
                    <div className="mockup-browser-toolbar">
                      <div className="input">Website Preview</div>
                    </div>
                    <div className="bg-base-200 p-4" style={{ backgroundColor: palette.colors[0]?.hex }}>
                      <div className="space-y-2">
                        <div className="h-4 rounded" style={{ backgroundColor: palette.colors[1]?.hex, width: '60%' }}></div>
                        <div className="h-3 rounded" style={{ backgroundColor: palette.colors[2]?.hex, width: '40%' }}></div>
                        <div className="h-3 rounded" style={{ backgroundColor: palette.colors[3]?.hex || palette.colors[1]?.hex, width: '70%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="mockup-phone border border-base-300">
                    <div className="camera"></div>
                    <div className="display">
                      <div className="artboard artboard-demo phone-1" style={{ backgroundColor: palette.colors[0]?.hex }}>
                        <div className="space-y-2 p-4">
                          <div className="h-8 rounded" style={{ backgroundColor: palette.colors[1]?.hex }}></div>
                          <div className="flex gap-2">
                            <div className="h-4 rounded flex-1" style={{ backgroundColor: palette.colors[2]?.hex }}></div>
                            <div className="h-4 rounded w-16" style={{ backgroundColor: palette.colors[3]?.hex || palette.colors[1]?.hex }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Preview */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Export Preview</h3>
                <div className="mockup-code text-sm">
                  <pre data-prefix="1">
                    <code>
                      {exportFormat === 'css' && 
                        `:root {\n${palette.colors.map((c, i) => `  --color-${c.role || (i + 1)}: ${c.hex};`).join('\n')}\n}`
                      }
                      {exportFormat === 'sass' && 
                        palette.colors.map((c, i) => `$color-${c.role || (i + 1)}: ${c.hex};`).join('\n')
                      }
                      {exportFormat === 'tailwind' && 
                        `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${palette.colors.map((c, i) => `        '${c.role || `color-${i + 1}`}': '${c.hex}',`).join('\n')}\n      }\n    }\n  }\n}`
                      }
                      {exportFormat === 'json' && 
                        JSON.stringify({
                          theme: palette.theme,
                          colors: palette.colors.map(c => ({
                            name: c.name,
                            role: c.role,
                            hex: c.hex,
                            rgb: c.rgb,
                            hsl: c.hsl.map(n => Math.round(n))
                          }))
                        }, null, 2)
                      }
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl">
                <Heart className="w-5 h-5 fill-current text-error" />
                Favorite Colors ({favorites.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {favorites.map((hex) => (
                  <div
                    key={hex}
                    className="tooltip"
                    data-tip={hex}
                  >
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-base-300 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: hex }}
                      onClick={() => {
                        navigator.clipboard.writeText(hex);
                        showSuccess(`${hex} copied!`);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="card bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
          <div className="card-body">
            <h2 className="card-title text-blue-800">
              💡 Pro Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h3 className="font-semibold mb-2">Accessibility:</h3>
                <ul className="space-y-1">
                  <li>• Aim for contrast ratios ≥4.5 for normal text</li>
                  <li>• Use ≥3.0 for large text (18pt+)</li>
                  <li>• Check color-blind friendly combinations</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Best Practices:</h3>
                <ul className="space-y-1">
                  <li>• Use 60-30-10 rule for color distribution</li>
                  <li>• Test palettes in different lighting</li>
                  <li>• Consider brand personality and emotions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}