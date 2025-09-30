'use server';

import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import PDFUtility from '@/utils/PDFUtility';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TEMP_DIR = 'temp';
const OUTPUT_DIR = 'output';
const CLEANUP_DELAY = 5 * 60 * 1000; // 5 minutes

// Utility to sanitize file names
const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50);
};

// Utility to validate file size
const validateFileSize = (file: File): void => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 10MB limit');
  }
};

// Utility to create temp directories
const ensureTempDirs = async (): Promise<void> => {
  await mkdir(TEMP_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
};

// Utility to schedule file cleanup
const scheduleCleanup = (filePath: string) => {
  setTimeout(async () => {
    try {
      await unlink(filePath);
      console.log(`Cleaned up temporary file: ${filePath}`);
    } catch (cleanupErr) {
      console.error('Cleanup failed:', cleanupErr);
    }
  }, CLEANUP_DELAY);
};

// Convert PDF to Word
export async function convertPdfToWord(formData: FormData): Promise<{
  success: boolean;
  docUrl?: string;
  error?: string;
}> {
  const file = formData.get('file0') as File;
  if (!file || file.type !== 'application/pdf') {
    return { success: false, error: 'No valid PDF file provided' };
  }

  try {
    validateFileSize(file);
    await ensureTempDirs();

    const tempPath = join(TEMP_DIR, `temp_${Date.now()}.pdf`);
    const docxPath = join(OUTPUT_DIR, `output_${Date.now()}.docx`);

    const buffer = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(buffer));

    const util = new PDFUtility();
    await util.pdfToDocx(tempPath, docxPath);

    const docUrl = `/api/download?file=${encodeURIComponent(docxPath)}`;
    scheduleCleanup(docxPath);
    await unlink(tempPath);

    return { success: true, docUrl };
  } catch (err) {
    console.error('PDF to DOCX conversion error:', err);
    return { success: false, error: (err as Error).message || 'Conversion failed' };
  }
}

// Convert PDF to Images
export async function convertPdfToImages(formData: FormData): Promise<{
  success: boolean;
  imageUrls?: string[];
  error?: string;
}> {
  const file = formData.get('file0') as File;
  if (!file || file.type !== 'application/pdf') {
    return { success: false, error: 'No valid PDF file provided' };
  }

  try {
    validateFileSize(file);
    await ensureTempDirs();

    const tempPath = join(TEMP_DIR, `temp_${Date.now()}.pdf`);
    const outputDir = join(OUTPUT_DIR, `images_${Date.now()}`);

    const buffer = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(buffer));

    const util = new PDFUtility();
    await util.pdfToImages(tempPath, outputDir);

    // TODO: Implement image serving
    const imageUrls = ['/api/download?file=' + encodeURIComponent(outputDir)];
    scheduleCleanup(outputDir);
    await unlink(tempPath);

    return { success: true, imageUrls };
  } catch (err) {
    console.error('PDF to Images conversion error:', err);
    return { success: false, error: (err as Error).message || 'Conversion failed' };
  }
}

// Merge PDFs
export async function mergePdfs(formData: FormData): Promise<{
  success: boolean;
  pdfUrl?: string;
  error?: string;
}> {
  const files: File[] = [];
  for (let i = 0; formData.get(`file${i}`); i++) {
    const file = formData.get(`file${i}`) as File;
    if (file.type !== 'application/pdf') {
      return { success: false, error: 'All files must be valid PDFs' };
    }
    validateFileSize(file);
    files.push(file);
  }

  if (files.length < 2) {
    return { success: false, error: 'At least two PDF files are required' };
  }

  try {
    await ensureTempDirs();
    const tempPaths: string[] = [];
    const outputPath = join(OUTPUT_DIR, `merged_${Date.now()}.pdf`);

    // Save all files to temp directory
    for (const [index, file] of files.entries()) {
      const tempPath = join(TEMP_DIR, `temp_${Date.now()}_${index}.pdf`);
      const buffer = await file.arrayBuffer();
      await writeFile(tempPath, Buffer.from(buffer));
      tempPaths.push(tempPath);
    }

    const util = new PDFUtility();
    await util.mergePdfs(tempPaths, outputPath);

    // Clean up temp files
    await Promise.all(tempPaths.map(path => unlink(path)));

    const pdfUrl = `/api/download?file=${encodeURIComponent(outputPath)}`;
    scheduleCleanup(outputPath);

    return { success: true, pdfUrl };
  } catch (err) {
    console.error('PDF merge error:', err);
    return { success: false, error: (err as Error).message || 'Merge failed' };
  }
}

// Split PDF
export async function splitPdf(formData: FormData): Promise<{
  success: boolean;
  pdfUrls?: string[];
  error?: string;
}> {
  const file = formData.get('file0') as File;
  if (!file || file.type !== 'application/pdf') {
    return { success: false, error: 'No valid PDF file provided' };
  }

  try {
    validateFileSize(file);
    await ensureTempDirs();

    const tempPath = join(TEMP_DIR, `temp_${Date.now()}.pdf`);
    const outputDir = join(OUTPUT_DIR, `split_${Date.now()}`);

    const buffer = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(buffer));

    const ranges = formData.get('ranges')?.toString() || '';
    const rangeArray = ranges ? ranges.split(',').map(range => {
      const [start, end] = range.split('-').map(Number);
      return [start, end];
    }) : [];

    const util = new PDFUtility();
    await util.splitPdf(tempPath, outputDir, rangeArray);

    // TODO: Implement proper file serving for split PDFs
    const pdfUrls = ['/api/download?file=' + encodeURIComponent(outputDir)];
    scheduleCleanup(outputDir);
    await unlink(tempPath);

    return { success: true, pdfUrls };
  } catch (err) {
    console.error('PDF split error:', err);
    return { success: false, error: (err as Error).message || 'Split failed' };
  }
}

// Edit PDF
export async function editPdf(formData: FormData): Promise<{
  success: boolean;
  pdfUrl?: string;
  error?: string;
}> {
  const file = formData.get('file0') as File;
  if (!file || file.type !== 'application/pdf') {
    return { success: false, error: 'No valid PDF file provided' };
  }

  try {
    validateFileSize(file);
    await ensureTempDirs();

    const tempPath = join(TEMP_DIR, `temp_${Date.now()}.pdf`);
    const outputPath = join(OUTPUT_DIR, `edited_${Date.now()}.pdf`);

    const buffer = await file.arrayBuffer();
    await writeFile(tempPath, Buffer.from(buffer));

    const text = formData.get('text')?.toString() || '';
    const position = JSON.parse(formData.get('position')?.toString() || '{}');
    
    const util = new PDFUtility();
    await util.editPdf(tempPath, outputPath, [{
      page: 1, // Default to first page for now
      text,
      x: position.x || 0,
      y: position.y || 0
    }]);

    const pdfUrl = `/api/download?file=${encodeURIComponent(outputPath)}`;
    scheduleCleanup(outputPath);
    await unlink(tempPath);

    return { success: true, pdfUrl };
  } catch (err) {
    console.error('PDF edit error:', err);
    return { success: false, error: (err as Error).message || 'Edit failed' };
  }
}