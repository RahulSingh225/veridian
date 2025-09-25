// src/app/api/minify-html/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { minify as minifyHTML } from 'html-minifier-terser';

export async function POST(request: NextRequest) {
  try {
    const { html, beautify } = await request.json();
    if (!html || typeof html !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing HTML content' }, { status: 400 });
    }

    const minified = await minifyHTML(html, {
      collapseWhitespace: !beautify,
      removeComments: !beautify,
      minifyCSS: true,
      minifyJS: true,
      removeEmptyAttributes: !beautify,
      sortAttributes: true,
      sortClassName: true,
    });

    return NextResponse.json({ minified });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}