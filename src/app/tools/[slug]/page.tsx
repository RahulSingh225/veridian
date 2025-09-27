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
import { notFound } from 'next/navigation';

// Define your tools slugs and metadata
const tools = {
  'json-formatter': { component: JsonFormatter, title: 'JSON Formatter' },
  'pdf-to-word': { component: PdfToWordConverter, title: 'PDF to Word Converter' },
  'regex-tester': { component: RegexTester, title: 'Regex Tester & Builder' },
  'base64-utility': { component: Base64Utility, title: 'Base64 Encoder/Decoder' },
  'qr-utility': { component: QRCodeTool, title: 'QR Code Utility' },
  'url-encode': { component: URLEncoderDecoder, title: 'QR Code Utility' },
  'color-pallette': { component: ColorPaletteGenerator, title: 'Smart Color Palette Generator' },
  'csv-json-yaml': { component: ConverterTool, title: 'QR Code Utility' },
  'html-css-js': { component: MinifierTool, title: 'QR Code Utility' },
  'icon-generate': { component: IconGenerator, title: 'QR Code Utility' },
  'img-compress': { component: ImageCompressor, title: 'QR Code Utility' },
  'mock-data': { component: MockDataGenerator, title: 'QR Code Utility' },
  'uuid-pass': { component: PasswordUUIDGenerator, title: 'QR Code Utility' },
  'time-convert': { component: TimestampConverter, title: 'QR Code Utility' },

  // Add more: base64, app-icon-generator, markdown-to-html, html-viewer, etc.
};

export async function generateStaticParams() {
  return Object.keys(tools).map((slug) => ({ slug }));
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
    </div>
  );
}