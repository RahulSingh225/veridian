'use client';

import { useState, useRef } from 'react';
import ColorThief from 'colorthief';
import Color from 'color';

interface PaletteColor {
  hex: string;
  rgb: [number, number, number];
  hsl: [number, number, number];
}

interface PaletteResult {
  colors: PaletteColor[];
  source: 'image' | 'color';
}

export default function ColorPaletteGenerator() {
  const [mode, setMode] = useState<'image' | 'color'>('image');
  const [inputColor, setInputColor] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [palette, setPalette] = useState<PaletteResult | null>(null);
  const [exportFormat, setExportFormat] = useState<'css' | 'sass' | 'json'>('css');
  const [paletteType, setPaletteType] = useState<'dominant' | 'complementary' | 'analogous'>('dominant');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const colorThief = new ColorThief();

  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && supportedFormats.includes(selectedFile.type)) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a valid image (JPG, PNG, WebP, AVIF).');
      setFile(null);
    }
  };

  const validateColor = (input: string): Color | null => {
    try {
      return Color(input);
    } catch {
      return null;
    }
  };

  const generatePaletteFromColor = (color: Color): PaletteColor[] => {
    const baseColor: PaletteColor = {
      hex: color.hex(),
      rgb: color.rgb().array() as [number, number, number],
      hsl: color.hsl().array() as [number, number, number],
    };

    if (paletteType === 'dominant') {
      return [baseColor];
    } else if (paletteType === 'complementary') {
      const compColor = color.rotate(180);
      return [
        baseColor,
        {
          hex: compColor.hex(),
          rgb: compColor.rgb().array() as [number, number, number],
          hsl: compColor.hsl().array() as [number, number, number],
        },
      ];
    } else {
      // Analogous
      const color1 = color.rotate(-30);
      const color2 = color.rotate(30);
      return [
        baseColor,
        {
          hex: color1.hex(),
          rgb: color1.rgb().array() as [number, number, number],
          hsl: color1.hsl().array() as [number, number, number],
        },
        {
          hex: color2.hex(),
          rgb: color2.rgb().array() as [number, number, number],
          hsl: color2.hsl().array() as [number, number, number],
        },
      ];
    }
  };

  const handleGenerate = async () => {
    setError('');
    setPalette(null);

    if (mode === 'image' && file && imgRef.current) {
      try {
        const img = imgRef.current;
        await new Promise((resolve) => {
          if (img.complete) resolve(null);
          else img.onload = resolve;
        });

        const colors = colorThief.getPalette(img, paletteType === 'dominant' ? 5 : 3);
        const paletteColors = colors.map((rgb) => {
          const color = Color(rgb);
          return {
            hex: color.hex(),
            rgb: color.rgb().array() as [number, number, number],
            hsl: color.hsl().array() as [number, number, number],
          };
        });

        setPalette({ colors: paletteColors, source: 'image' });
      } catch (err) {
        setError(`Image processing error: ${(err as Error).message}`);
      }
    } else if (mode === 'color' && inputColor) {
      const color = validateColor(inputColor);
      if (!color) {
        setError('Invalid color input. Use hex, RGB, or HSL (e.g., #FF0000, rgb(255,0,0), hsl(0,100%,50%)).');
        return;
      }
      setPalette({ colors: generatePaletteFromColor(color), source: 'color' });
    } else {
      setError(mode === 'image' ? 'Please upload an image.' : 'Please enter a color.');
    }
  };

  const handleDownload = () => {
    if (!palette) return;

    let content = '';
    if (exportFormat === 'css') {
      content = `:root {\n${palette.colors
        .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
        .join('\n')}\n}`;
    } else if (exportFormat === 'sass') {
      content = palette.colors.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n');
    } else {
      content = JSON.stringify(palette.colors, null, 2);
    }

    const blob = new Blob([content], { type: `text/${exportFormat}` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!palette) return;

    let content = '';
    if (exportFormat === 'css') {
      content = `:root {\n${palette.colors
        .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
        .join('\n')}\n}`;
    } else if (exportFormat === 'sass') {
      content = palette.colors.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n');
    } else {
      content = JSON.stringify(palette.colors, null, 2);
    }

    navigator.clipboard.writeText(content);
    setError('Copied to clipboard!');
    setTimeout(() => setError(''), 2000);
  };

  const clearInput = () => {
    setFile(null);
    setInputColor('');
    setPalette(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Color Palette Generator</h2>
          <p>Generate palettes from an image or a single color. Export as CSS, SASS, or JSON.</p>

          <div className="tabs tabs-boxed mb-4">
            <a className={`tab ${mode === 'image' ? 'tab-active' : ''}`} onClick={() => setMode('image')}>
              From Image
            </a>
            <a className={`tab ${mode === 'color' ? 'tab-active' : ''}`} onClick={() => setMode('color')}>
              From Color
            </a>
          </div>

          {mode === 'image' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Upload Image</span>
              </label>
              <input
                type="file"
                accept={supportedFormats.join(',')}
                className="file-input file-input-bordered w-full"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {file && (
                <img
                  ref={imgRef}
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="mt-4 max-w-xs rounded"
                  crossOrigin="anonymous"
                />
              )}
            </div>
          )}

          {mode === 'color' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Enter Color (Hex, RGB, HSL)</span>
              </label>
              <input
                type="text"
                placeholder="#FF0000 or rgb(255,0,0) or hsl(0,100%,50%)"
                className="input input-bordered w-full"
                value={inputColor}
                onChange={(e) => setInputColor(e.target.value)}
              />
            </div>
          )}

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Palette Type</span>
            </label>
            <select
              value={paletteType}
              onChange={(e) => setPaletteType(e.target.value as any)}
              className="select select-bordered w-full"
            >
              <option value="dominant">Dominant Colors</option>
              <option value="complementary">Complementary</option>
              <option value="analogous">Analogous</option>
            </select>
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">Export Format</span>
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="select select-bordered w-full"
            >
              <option value="css">CSS</option>
              <option value="sass">SASS</option>
              <option value="json">JSON</option>
            </select>
          </div>

          <div className="flex space-x-2 mt-4">
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={mode === 'image' ? !file : !inputColor.trim()}
            >
              Generate Palette
            </button>
            {(file || inputColor) && (
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

          {palette && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Generated Palette</h3>
              <div className="flex flex-wrap gap-4 mt-4">
                {palette.colors.map((color, idx) => (
                  <div key={idx} className="text-center">
                    <div
                      className="w-20 h-20 rounded"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="mt-2 text-sm">HEX: {color.hex}</p>
                    <p className="text-sm">RGB: {color.rgb.join(',')}</p>
                    <p className="text-sm">HSL: {color.hsl.map(n => Math.round(n)).join(',')}</p>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 mt-4">
                <button className="btn btn-secondary" onClick={handleDownload}>
                  Download
                </button>
                <button className="btn btn-secondary" onClick={handleCopy}>
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}