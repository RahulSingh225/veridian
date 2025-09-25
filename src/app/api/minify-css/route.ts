// src/app/api/minify-css/route.ts
import { NextRequest, NextResponse } from 'next/server';
import CleanCSS from 'clean-css';

export async function POST(request: NextRequest) {
  try {
    const { css, beautify } = await request.json();
    if (!css || typeof css !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing CSS content' }, { status: 400 });
    }

    const cleanCSS = new CleanCSS({
      level: 2,
      format: beautify ? 'beautify' : undefined,
    });
    const result = cleanCSS.minify(css);

    if (result.errors.length > 0) {
      return NextResponse.json({ error: result.errors.join(', ') }, { status: 400 });
    }

    return NextResponse.json({ minified: result.styles });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}