import QRCodeTool from '@/components/BarcodeUtility';
import Base64Utility from '@/components/Base64Utility';
import ColorPaletteGenerator from '@/components/ColorPalletteGenerator';
import ConverterTool from '@/components/CSV-JSON-YAMLConverter';
import MinifierTool from '@/components/HTML-CSS-JS-Minifier';
import IconGenerator from '@/components/IconGenerator';
import ImageCompressor from '@/components/ImageCompressor';
import JsonFormatter from '@/components/JsonFormatter';
import MockDataGenerator from '@/components/MockDataGenerator';
import PasswordUUIDGenerator from '@/components/PasswordUUIDGenerator';
import PdfToWordConverter from '@/components/PdfToWordConverter';
import RegexTester from '@/components/RegexTester';
import TimestampConverter from '@/components/TimestampConverter';
import URLEncoderDecoder from '@/components/UrlEncoderDecoder';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Define your tools slugs and metadata
const tools = {
  'json-formatter': { component: JsonFormatter, title: 'JSON Formatter & Validator' },
  'pdf-to-word': { component: PdfToWordConverter, title: 'PDF to Word Converter' },
  'regex-tester': { component: RegexTester, title: 'Regex Tester & Builder' },
  'base64-utility': { component: Base64Utility, title: 'Base64 Encoder/Decoder' },
  'qr-utility': { component: QRCodeTool, title: 'QR Code Generator' },
  'url-encode': { component: URLEncoderDecoder, title: 'URL Encoder/Decoder' },
  'color-pallette': { component: ColorPaletteGenerator, title: 'Smart Color Palette Generator' },
  'csv-json-yaml': { component: ConverterTool, title: 'CSV/JSON/YAML Converter' },
  'html-css-js': { component: MinifierTool, title: 'HTML/CSS/JS Minifier' },
  'icon-generate': { component: IconGenerator, title: 'App Icon Generator' },
  'img-compress': { component: ImageCompressor, title: 'Image Compressor' },
  'mock-data': { component: MockDataGenerator, title: 'Mock Data Generator' },
  'uuid-pass': { component: PasswordUUIDGenerator, title: 'Password & UUID Generator' },
  'time-convert': { component: TimestampConverter, title: 'Timestamp Converter' },
};

export async function generateStaticParams() {
  return Object.keys(tools).map((slug) => ({ slug }));
}


export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = tools[params.slug as keyof typeof tools];
  if (!tool) return { title: 'Tool Not Found - Veridian' };

  return {
    title: `${tool.title} - Veridian`,
    description: `Free ${tool.title} tool by Veridian. Boost productivity with our easy-to-use online utility.`,
    keywords: [tool.title.toLowerCase(), 'productivity', 'converter', 'tool', 'veridian'],
    openGraph: {
      title: `${tool.title} - Veridian`,
      description: `Use Veridian's ${tool.title} for seamless productivity tasks.`,
      url: `https://veridian.buzz/tools/${params.slug}`,
      type: 'website',
      images: `/images/tools/${params.slug}.png`, // Add 1200x630 images in /public/images/tools/
    },
    twitter: {
      card: 'summary_large_image',
      title: `${tool.title} - Veridian`,
      description: `Try Veridian's ${tool.title} for free!`,
      images: `/images/tools/${params.slug}.png`,
    },
  };
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = tools[(await params).slug as keyof typeof tools];
  if (!tool) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content text-center">
            {tool.title}
          </h1>
        </div>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <tool.component />
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: tool.title,
            description: `Free ${tool.title} tool by Veridian for productivity tasks.`,
            url: `https://veridian.buzz/tools/${params.slug}`,
            applicationCategory: 'Utilities',
            operatingSystem: 'Web',
          }),
        }}
      />
    </div>
  );
}