'use client';
import { useState } from 'react';

export default function IconGenerator() {
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('icon', file);

    const res = await fetch('/api/generate-icons', { method: 'POST', body: formData });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app-icons.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept="image/png,image/jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button type="submit">Generate & Download ZIP</button>
    </form>
  );
}