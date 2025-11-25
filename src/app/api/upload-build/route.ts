import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Create a unique file name
    const fileExtension = file.name.split('.').pop();
    const fileName = `builds/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Upload to Vercel Blob
    const { url } = await put(fileName, file, {
      access: 'public',
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}