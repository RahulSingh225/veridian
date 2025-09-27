'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Html5Qrcode } from 'html5-qrcode';
//import { Html5QrcodeScannerState } from 'html5-qrcode/esm/html5-qrcode-scanner';

export default function QRCodeTool() {
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [input, setInput] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [scanSource, setScanSource] = useState<'camera' | 'image'>('camera');
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize scanner
  useEffect(() => {
    if (mode === 'scan' && scanSource === 'camera') {
      scannerRef.current = new Html5Qrcode('qr-reader');
    }
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [mode, scanSource]);

  const handleGenerate = () => {
    if (input.trim()) {
      setQrValue(input);
      setError('');
    } else {
      setError('Please enter text or URL');
    }
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-svg') as unknown as SVGSVGElement;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'qrcode.png';
      downloadLink.href = pngUrl;
      downloadLink.click();
    };
    img.src = url;
  };

  const startCameraScan = () => {
    setScanResult('');
    setError('');
    if (scannerRef.current) {
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      scannerRef.current
        .start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            setScanResult(decodedText);
            scannerRef.current?.stop();
          },
          (err) => console.warn(err)
        )
        .catch((err) => setError(`Camera error: ${err.message}`));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScanResult('');
      setError('');
      scannerRef.current
        ?.scanFile(file, true)
        .then((decodedText) => setScanResult(decodedText))
        .catch((err) => setError(`Scan error: ${err.message}`));
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="tabs tabs-boxed mb-4">
        <a className={`tab ${mode === 'generate' ? 'tab-active' : ''}`} onClick={() => setMode('generate')}>
          Generate QR
        </a>
        <a className={`tab ${mode === 'scan' ? 'tab-active' : ''}`} onClick={() => setMode('scan')}>
          Scan QR
        </a>
      </div>

      {mode === 'generate' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Generate QR Code</h2>
            <input
              type="text"
              placeholder="Enter text or URL"
              className="input input-bordered w-full"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="btn btn-primary mt-2" onClick={handleGenerate}>
              Generate
            </button>
            {error && <div className="alert alert-error mt-2">{error}</div>}
            {qrValue && (
              <>
                <div className="flex justify-center mt-4">
                  <QRCode id="qr-svg" value={qrValue} size={256} level="H" />
                </div>
                <button className="btn btn-secondary mt-2" onClick={handleDownload}>
                  Download PNG
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {mode === 'scan' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Scan QR Code</h2>
            <div className="tabs tabs-boxed mb-2">
              <a className={`tab ${scanSource === 'camera' ? 'tab-active' : ''}`} onClick={() => setScanSource('camera')}>
                Camera
              </a>
              <a className={`tab ${scanSource === 'image' ? 'tab-active' : ''}`} onClick={() => setScanSource('image')}>
                Image Upload
              </a>
            </div>
            {scanSource === 'camera' && (
              <>
                <div id="qr-reader" className="w-full h-64 bg-gray-200 rounded" />
                <button className="btn btn-primary mt-2" onClick={startCameraScan}>
                  Start Scan
                </button>
              </>
            )}
            {scanSource === 'image' && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </>
            )}
            {error && <div className="alert alert-error mt-2">{error}</div>}
            {scanResult && (
              <div className="alert alert-success mt-4">
                <span>Result: {scanResult}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}