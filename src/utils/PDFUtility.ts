import fs from 'fs/promises';
import path from 'path';
import { PDFDocument, rgb } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { Document, Packer, Paragraph, ImageRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { createCanvas } from 'canvas'; // For PDF to image rendering
import sharp from 'sharp'; // For image optimizations if needed

export default class PDFUtility {
  constructor() {
    // Load pdfjs worker for Node.js
    pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';
  }

  // Utility to sanitize file names
  sanitizeFileName(name) {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 50);
  }

  // PDF to DOCX (extracts text and images, approximates tables/layouts)
  async pdfToDocx(inputPath, outputPath) {
    const pdfBuffer = await fs.readFile(inputPath) ;
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdfDoc = await pdfjs.getDocument({ data: uint8Array }).promise;
    const doc = new Document({ sections: [] });
    const sectionChildren = [];

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const content = await page.getTextContent();
      let text = '';
      content.items.forEach(item => {
        if ('str' in item) {
          text += item.str + ' ';
        }
      });
      sectionChildren.push(new Paragraph({ text: text.trim() }));

      // Extract images (basic; for complex, parse operators)
      const ops = await page.getOperatorList();
      for (let i = 0; i < ops.fnArray.length; i++) {
        if (ops.fnArray[i] === pdfjs.OPS.paintImageXObject) {
          const imgName = ops.argsArray[i][0];
          const img = await page.objs.get(imgName);
          if (img.kind === 'Image') {
            const imgBuffer = await this._convertImageStream(img.data, img.width, img.height);
            sectionChildren.push(new Paragraph({
              children: [new ImageRun({ data: new Uint8Array(imgBuffer), transformation: { width: img.width / 2, height: img.height / 2 },type: 'png' })],
            }));
          }
        }
      }

      // TODO: Enhance for tables (parse content streams for lines/positions to create Table objects)
    }

    const docWithSection = new Document({ sections: [{ children: sectionChildren }] });
    const docxBuffer = await Packer.toBuffer(docWithSection);
    await fs.writeFile(outputPath, docxBuffer);
  }

  // Helper for image extraction (simplified; assumes RGB)
  async _convertImageStream(data, width, height) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(data);
    ctx.putImageData(imgData, 0, 0);
    return canvas.toBuffer();
  }

  // PDF to Image (renders each page to PNG)
  async pdfToImages(inputPath, outputDir) {
    const pdfBuffer = await fs.readFile(inputPath);
    const pdfDoc = await pdfjs.getDocument({ data: pdfBuffer }).promise;
    await fs.mkdir(outputDir, { recursive: true });

    for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 }); // Higher scale for quality
      const canvas = createCanvas(viewport.width, viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvas: canvas as any, canvasContext: ctx as any, viewport }).promise;
      const outputPath = path.join(outputDir, `page_${pageNum}.png`);
      await fs.writeFile(outputPath, canvas.toBuffer('image/png'));
    }
  }

  // Image to PDF (single or multiple images)
  async imagesToPdf(imagePaths, outputPath) {
    const pdfDoc = await PDFDocument.create();
    for (const imgPath of imagePaths) {
      const imgBuffer = await fs.readFile(imgPath);
      const imgType = path.extname(imgPath).toLowerCase();
      let img;
      if (imgType === '.png') img = await pdfDoc.embedPng(imgBuffer);
      else if (imgType === '.jpg' || imgType === '.jpeg') img = await pdfDoc.embedJpg(imgBuffer);
      else throw new Error('Unsupported image type');
      
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
  }

  // Merge PDFs
  async mergePdfs(inputPaths, outputPath) {
    const mergedPdf = await PDFDocument.create();
    for (const inputPath of inputPaths) {
      const inputBuffer = await fs.readFile(inputPath);
      const inputPdf = await PDFDocument.load(inputBuffer);
      const copiedPages = await mergedPdf.copyPages(inputPdf, inputPdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    const mergedBytes = await mergedPdf.save();
    await fs.writeFile(outputPath, mergedBytes);
  }

  // Split PDF (into individual pages or ranges)
  async splitPdf(inputPath, outputDir, ranges = []) { // ranges e.g., [[1,3], [4,5]] or empty for per-page
    const inputBuffer = await fs.readFile(inputPath);
    const inputPdf = await PDFDocument.load(inputBuffer);
    await fs.mkdir(outputDir, { recursive: true });

    if (!ranges.length) {
      ranges = inputPdf.getPageIndices().map(i => [i + 1, i + 1]);
    }

    for (let i = 0; i < ranges.length; i++) {
      const [start, end] = ranges[i];
      const splitPdf = await PDFDocument.create();
      const copiedPages = await splitPdf.copyPages(inputPdf, Array.from({ length: end - start + 1 }, (_, j) => start + j - 1));
      copiedPages.forEach(page => splitPdf.addPage(page));
      const splitBytes = await splitPdf.save();
      await fs.writeFile(path.join(outputDir, `split_${i + 1}.pdf`), splitBytes);
    }
  }

  // Edit PDF (example: add text and image)
  async editPdf(inputPath, outputPath, edits) { // edits: { page: 1, text: 'Hello', x: 50, y: 50, imagePath: '/path/to/img.png' }
    const inputBuffer = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(inputBuffer);
    const pages = pdfDoc.getPages();

    for (const edit of edits) {
      const page = pages[edit.page - 1];
      if (edit.text) {
        page.drawText(edit.text, { x: edit.x, y: edit.y, size: 12, color: rgb(0, 0, 0) });
      }
      if (edit.imagePath) {
        const imgBuffer = await fs.readFile(edit.imagePath);
        const imgType = path.extname(edit.imagePath).toLowerCase();
        let img;
        if (imgType === '.png') img = await pdfDoc.embedPng(imgBuffer);
        else if (imgType === '.jpg') img = await pdfDoc.embedJpg(imgBuffer);
        page.drawImage(img, { x: edit.x || 0, y: edit.y || 0, width: img.width / 2, height: img.height / 2 });
      }
      // Add annotations? Use pdf-lib's form/annotation APIs for more.
    }

    const editedBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, editedBytes);
  }
}

// Example usage in a server action
async function exampleUsage(formData) {
  const file = formData.get('file');
  const buffer = Buffer.from(await file.arrayBuffer());
  const tempPath = `temp_${Date.now()}.pdf`;
  await fs.writeFile(tempPath, buffer);

  const util = new PDFUtility();
  const docxPath = `output_${Date.now()}.docx`;
  await util.pdfToDocx(tempPath, docxPath);

  // Cleanup...
  return { success: true, docUrl: `/download/${docxPath}` };
}