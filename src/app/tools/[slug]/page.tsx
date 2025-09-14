import JsonFormatter from '@/components/JsonFormatter';
import PdfToWordConverter from '@/components/PdfToWordConverter';
import RegexTester from '@/components/RegexTester';
import { notFound } from 'next/navigation';

// Define your tools slugs and metadata
const tools = {
  'json-formatter': { component: JsonFormatter, title: 'JSON Formatter' },
  'pdf-to-word': { component: PdfToWordConverter, title: 'PDF to Word Converter' },
  'regex-tester': { component: RegexTester, title: 'Regex Tester & Builder' },
  // Add more: base64, app-icon-generator, markdown-to-html, html-viewer, etc.
};

export async function generateStaticParams() {
  return Object.keys(tools).map((slug) => ({ slug }));
}

export default function ToolPage({ params }: { params: { slug: string } }) {
  const tool = tools[params.slug as keyof typeof tools];
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