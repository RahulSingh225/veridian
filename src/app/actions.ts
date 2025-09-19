'use server';

import { Document, Packer, Paragraph, TextRun } from 'docx';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';

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

    // Dynamically import pdf-parse to avoid initialization issues
    const { default: pdfParse } = await import('pdf-parse');

    // Read PDF file
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from PDF using pdf-parse
    const pdfData = await pdfParse(buffer);
    const textContent = pdfData.text;

    if (!textContent.trim()) {
      return { success: false, error: 'No extractable text found in PDF' };
    }

    // Create DOCX document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: textContent,
                  size: 24, // Font size in half-points (12pt)
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Generate DOCX buffer
    const docxBuffer = await Packer.toBuffer(doc);

    // Save DOCX temporarily
    const tempDocxPath = `${sanitizeFileName(file.name)}-${Date.now()}.docx`;
    
    await writeFile(tempDocxPath, docxBuffer);

    // Generate a temporary download URL
    const docUrl = `/api/download?file=${encodeURIComponent(tempDocxPath)}`;

    // Schedule cleanup (5 minutes)
    setTimeout(async () => {
      try {
        await unlink(tempDocxPath);
        console.log(`Cleaned up temporary file: ${tempDocxPath}`);
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