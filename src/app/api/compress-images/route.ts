import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import archiver from 'archiver';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const images = formData.getAll('images') as File[];
  const quality = parseInt(formData.get('quality') as string) || 80;
  const outputFormat = (formData.get('outputFormat') as string) || 'webp';
  const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined;
  const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined;
  const maintainAspect = formData.get('maintainAspect') === 'true';

  // Validate inputs
  if (images.length === 0) {
    return NextResponse.json({ error: 'No images provided' }, { status: 400 });
  }

  const validFormats = ['jpeg', 'png', 'webp', 'avif', 'gif'];
  const finalFormat = outputFormat === 'original' ? images[0].type.split('/')[1] : outputFormat;
  if (!validFormats.includes(finalFormat)) {
    return NextResponse.json({ error: `Unsupported image format: ${finalFormat}` }, { status: 400 });
  }

  try {
    const processedImages: { name: string; buffer: Buffer }[] = [];

    // Process each image
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());
      let sharpImage = sharp(buffer, { animated: image.type === 'image/gif' });

      // Resize if specified
      if (width || height) {
        sharpImage = sharpImage.resize(width, height, {
          fit: maintainAspect ? 'inside' : 'fill',
          withoutEnlargement: true,
        });
      }

      // Compress based on format
      let outputBuffer: Buffer;
      const options = { quality, mozjpeg: true };

      switch (finalFormat) {
        case 'jpeg':
          outputBuffer = await sharpImage.jpeg(options).toBuffer();
          break;
        case 'png':
          outputBuffer = await sharpImage.png({ compressionLevel: Math.floor((100 - quality) / 11.11) }).toBuffer();
          break;
        case 'webp':
          outputBuffer = await sharpImage.webp({ quality, effort: 4 }).toBuffer();
          break;
        case 'avif':
          outputBuffer = await sharpImage.avif({ quality, effort: 4 }).toBuffer();
          break;
        case 'gif':
          outputBuffer = await sharpImage.gif().toBuffer();
          break;
        default:
          outputBuffer = await sharpImage.toBuffer();
      }

      const ext = outputFormat === 'original' ? image.name.split('.').pop() : outputFormat;
      const sanitizedName = `compressed_${image.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '_')}.${ext}`;
      processedImages.push({ name: sanitizedName, buffer: outputBuffer });
    }

    if (processedImages.length === 1) {
      // Single image: return as a web-compatible ReadableStream
      const buffer = processedImages[0].buffer;
      const webStream = new ReadableStream({
        start(controller) {
          controller.enqueue(buffer);
          controller.close();
        }
      });
      return new NextResponse(webStream, {
        headers: {
          'Content-Type': `image/${finalFormat}`,
          'Content-Disposition': `attachment; filename="${processedImages[0].name}"`,
        },
      });
    } else {
      // Multiple images: return as ZIP
      const archive = archiver('zip', { zlib: { level: 9 } });
      const stream = new ReadableStream({
        start(controller) {
          archive.on('data', chunk => controller.enqueue(chunk));
          archive.on('end', () => controller.close());
          archive.on('error', err => controller.error(err));

          processedImages.forEach(({ name, buffer }) => {
            archive.append(Readable.from(buffer), { name });
          });
          archive.finalize();
        },
      });

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': 'attachment; filename="compressed-images.zip"',
        },
      });
    }
  } catch (err) {
    console.error('Compression error:', err, 'for images:', images.map(img => img.name));
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}