'use client';

import { useState, useRef } from 'react';

interface CompressedImage {
  originalName: string;
  compressedBlob: Blob;
  originalSize: number;
  compressedSize: number;
  previewUrl: string;
}

export default function ImageCompressor() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<'original' | 'jpeg' | 'png' | 'webp' | 'avif' | 'gif'>('webp');
  const [resizeWidth, setResizeWidth] = useState<number | undefined>(undefined);
  const [resizeHeight, setResizeHeight] = useState<number | undefined>(undefined);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [compressedImages, setCompressedImages] = useState<CompressedImage[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supportedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/tiff', 'image/heif'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(file => supportedFormats.includes(file.type));
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles);
      setCompressedImages([]);
      setError('');
    } else {
      setError('No supported images selected. Supported: JPG, PNG, WebP, AVIF, GIF, TIFF, HEIF.');
    }
  };

  const handleCompress = async () => {
    if (files.length === 0) return setError('No files selected.');

    setProcessing(true);
    setProgress(0);
    setError('');
    setCompressedImages([]);

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    formData.append('quality', quality.toString());
    formData.append('outputFormat', outputFormat);
    if (resizeWidth) formData.append('width', resizeWidth.toString());
    if (resizeHeight) formData.append('height', resizeHeight.toString());
    formData.append('maintainAspect', maintainAspect.toString());

    try {
      const res = await fetch('/api/compress-images', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      const isZip = contentDisposition?.includes('zip');

      if (isZip) {
        // Download ZIP for batch
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed-images.zip';
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Single image: Create preview and info
        const compressed: CompressedImage = {
          originalName: files[0].name,
          compressedBlob: blob,
          originalSize: files[0].size,
          compressedSize: blob.size,
          previewUrl: URL.createObjectURL(blob),
        };
        setCompressedImages([compressed]);
      }

      setProgress(100);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadSingle = (img: CompressedImage) => {
    const url = URL.createObjectURL(img.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${img.originalName}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFiles = () => {
    setFiles([]);
    setCompressedImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Image Compressor</h2>
          <p>Upload images (JPG, PNG, WebP, AVIF, GIF, TIFF, HEIF). Batch support. Convert to optimal formats.</p>

          <input
            type="file"
            multiple
            accept={supportedFormats.join(',')}
            className="file-input file-input-bordered w-full mb-4"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          <div className="form-control">
            <label className="label">Quality (1-100)</label>
            <input
              type="range"
              min="1"
              max="100"
              value={quality}
              className="range"
              onChange={(e) => setQuality(Number(e.target.value))}
            />
            <div className="w-full flex justify-between text-xs px-2">
              <span>1</span><span>50</span><span>100</span>
            </div>
            <div className="text-center mt-1">{quality}%</div>
          </div>

          <div className="form-control mt-4">
            <label className="label">Output Format</label>
            <select
              className="select select-bordered w-full"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as any)}
            >
              <option value="original">Original</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP (Recommended)</option>
              <option value="avif">AVIF (Best Compression)</option>
              <option value="gif">GIF</option>
            </select>
          </div>

          <div className="form-control mt-4">
            <label className="label">Resize (Optional)</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Width"
                className="input input-bordered flex-1"
                value={resizeWidth || ''}
                onChange={(e) => setResizeWidth(e.target.value ? Number(e.target.value) : undefined)}
              />
              <input
                type="number"
                placeholder="Height"
                className="input input-bordered flex-1"
                value={resizeHeight || ''}
                onChange={(e) => setResizeHeight(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
            <label className="label cursor-pointer justify-start mt-2">
              <input
                type="checkbox"
                checked={maintainAspect}
                className="checkbox checkbox-primary mr-2"
                onChange={(e) => setMaintainAspect(e.target.checked)}
              />
              Maintain Aspect Ratio
            </label>
          </div>

          <button className="btn btn-primary mt-4" onClick={handleCompress} disabled={processing || files.length === 0}>
            {processing ? 'Compressing...' : 'Compress'}
          </button>

          {processing && (
            <progress className="progress progress-primary w-full mt-4" value={progress} max="100"></progress>
          )}

          {error && <div className="alert alert-error mt-4">{error}</div>}

          {compressedImages.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-bold">Compressed Images</h3>
              {compressedImages.map((img, idx) => (
                <div key={idx} className="mt-4 border p-4 rounded">
                  <p>{img.originalName}</p>
                  <p>Original: {(img.originalSize / 1024).toFixed(2)} KB → Compressed: {(img.compressedSize / 1024).toFixed(2)} KB</p>
                  <img src={img.previewUrl} alt="Preview" className="max-w-xs mt-2" />
                  <button className="btn btn-secondary mt-2" onClick={() => handleDownloadSingle(img)}>
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}

          {files.length > 0 && (
            <button className="btn btn-ghost mt-4" onClick={clearFiles}>Clear Files</button>
          )}
        </div>
      </div>
    </div>
  );
}