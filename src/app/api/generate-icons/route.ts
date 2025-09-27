import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import archiver from 'archiver';
import { PassThrough } from 'stream';

const IOS_SIZES = [20, 29, 40, 60, 76, 83.5, 1024];  // Points; multiply by @1x/@2x/@3x
const ANDROID_DENSITIES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('icon') as File;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseImage = sharp(buffer).png();  // Ensure PNG output

  // Generate iOS icons (simplified; add scales)
  const iosIcons: Buffer[] = [];
  for (const size of IOS_SIZES) {
    const resized = await baseImage.resize(Math.round(size * 3)).toBuffer();  // @3x example
    iosIcons.push(resized);  // Name files accordingly
  }

  // Generate Android icons
  const androidIcons: Buffer[] = [];
  for (const [density, size] of Object.entries(ANDROID_DENSITIES)) {
    const resized = await baseImage.resize(size).toBuffer();
    androidIcons.push(resized);  // e.g., ic_launcher_${density}.png
  }

  // Create ZIP
  const pass = new PassThrough();
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.pipe(pass);

  // Append files to ZIP (use fs-like streams)
  iosIcons.forEach((buf, i) => archive.append(buf, { name: `ios/Icon-${IOS_SIZES[i]}@3x.png` }));
  androidIcons.forEach((buf, i) => {
    const [density] = Object.entries(ANDROID_DENSITIES)[i];
    archive.append(buf, { name: `android/ic_launcher_${density}.png` });
  });

  archive.finalize();

  return new NextResponse(pass as unknown as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="app-icons.zip"',
    },
  });
}