import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = decodeURIComponent(searchParams.get('file') || '');
  
  // Security: Validate file path to prevent directory traversal
  if (!filePath.startsWith(path.join(process.cwd(), 'tmp'))) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  try {
    const fileBuffer = await readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="converted.docx"',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}