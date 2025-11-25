'use client'; // Client component for Next.js 13+ with App Router

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Share2, AlertCircle } from 'lucide-react'; // Icons for UI
import QRCode from 'react-qr-code'; // QR code generation

interface BuildShareProps {
  onUploadSuccess?: (shareUrl: string) => void;
}

export default function BuildShare({ onUploadSuccess }: BuildShareProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    // Validate file type: APK or IPA
    if (!file.name.endsWith('.apk') && !file.name.endsWith('.ipa')) {
      setError('Only APK and IPA files are supported.');
      return;
    }

    setError('');
    setIsUploading(true);
    setUploadProgress(0);
    setUploadedFile(file);

    try {
      // Create a unique file name
      const fileExtension = file.name.split('.').pop();
      const fileName = `builds/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

      // Upload to Vercel Blob using fetch to the API route
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-build', true);

      // Track upload progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const downloadURL = response.url;
          const shareId = Math.random().toString(36).substring(7);
          const generatedUrl = `https://yourapp.com/share/${shareId}?file=${encodeURIComponent(downloadURL)}&type=${fileExtension === 'apk' ? 'android' : 'ios'}`;

          setShareUrl(generatedUrl);
          onUploadSuccess?.(generatedUrl);
        } else {
          setError('Upload failed. Please try again.');
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        setError('Network error during upload.');
        setIsUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('An unexpected error occurred.');
      setIsUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.android.package-archive': ['.apk'], 'application/octet-stream': ['.ipa'] },
    maxFiles: 1,
    disabled: isUploading,
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    // Optional: Show DaisyUI toast here
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Upload className="mr-2" size={24} />
        Share Your App Build
      </h2>
      <p className="text-base-content/70 mb-6">Upload APK or IPA files to generate a shareable link, just like Diawi.</p>

      {!shareUrl ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-base-300 hover:border-base-400'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-primary font-medium">Drop the file here...</p>
          ) : (
            <>
              <Upload className="mx-auto mb-2 text-base-content/50" size={48} />
              <p className="text-lg font-medium">Drag & drop your APK/IPA file here, or click to select</p>
              <p className="text-sm text-base-content/60 mt-2">Supports Android APK and iOS IPA builds</p>
            </>
          )}
        </div>
      ) : (
        <div className="alert alert-success flex flex-col items-center p-6">
          <Download className="mb-2 text-success" size={48} />
          <h3 className="font-bold text-success">Upload complete!</h3>
          <p className="text-sm text-success-content mt-2">Your build is ready to share.</p>
          <div className="mt-4 w-full">
            <label className="label">
              <span className="label-text font-mono">Share Link:</span>
            </label>
            <div className="input-group flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="input input-bordered w-full text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="btn btn-primary btn-sm flex items-center"
              >
                <Share2 size={16} className="mr-1" />
                Copy
              </button>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="bg-white p-2 rounded-lg border border-base-300">
                <QRCode
                  value={shareUrl}
                  size={128}
                  level="H"
                />
              </div>
            </div>
            <p className="text-sm text-base-content/60 mt-2 text-center">Scan the QR code to share the link</p>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-base-content/70">Uploading {uploadedFile?.name}</span>
            <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
          </div>
          <progress
            className="progress progress-primary w-full"
            value={uploadProgress}
            max="100"
          ></progress>
        </div>
      )}

      {error && (
        <div className="alert alert-error mt-4 flex items-center">
          <AlertCircle className="mr-2 text-error" size={20} />
          <span className="text-error-content text-sm">{error}</span>
        </div>
      )}
    </div>
  );
}