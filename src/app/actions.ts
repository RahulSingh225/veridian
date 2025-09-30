'use server';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { writeFile, unlink } from 'fs/promises';
const fs = require('fs/promises');
import PDFUtility from '@/utils/PDFUtility';


// Utility to sanitize file names
const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50);
};

// Main Server Action to convert PDF to DOCX
export async function convertPdfToWord(formData: FormData): Promise<{
  success: boolean;
  docUrl?: string;
  error?: string;
}> {
  const file = formData.get('file') as File;
  if (!file || file.type !== 'application/pdf') {
    return { success: false, error: 'No valid PDF file provided' };
  }

  try {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return { success: false, error: 'File size exceeds 10MB limit' };
    }


    // Read PDF file
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    const tempPath = `temp_${Date.now()}.pdf`;
  await fs.writeFile(tempPath, uint8Array);

  const util = new PDFUtility();
  const docxPath = `output_${Date.now()}.docx`;
  await util.pdfToDocx(tempPath, docxPath);

    // Generate a temporary download URL
    const docUrl = `/api/download?file=${encodeURIComponent(docxPath)}`;

    // Schedule cleanup (5 minutes)
    setTimeout(async () => {
      try {
        await unlink(docxPath);
        console.log(`Cleaned up temporary file: ${docxPath}`);
      } catch (cleanupErr) {
        console.error('Cleanup failed:', cleanupErr);
      }
    }, 1000 * 60 * 5);

    return { success: true, docUrl };
  } catch (err) {
    console.error('PDF to DOCX conversion error:', err);
    return { success: false, error: (err as Error).message || 'Conversion failed' };
  }
}