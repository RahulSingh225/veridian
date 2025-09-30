import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    'json-formatter',
    'pdf-to-word',
    'regex-tester',
    'base64-utility',
    'qr-utility',
    'url-encode',
    'color-pallette',
    'csv-json-yaml',
    'html-css-js',
    'icon-generate',
    'img-compress',
    'mock-data',
    'uuid-pass',
    'time-convert',
  ];

  return [
    {
      url: 'https://veridian.buzz',
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    ...tools.map((slug) => ({
      url: `https://veridian.buzz/tools/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}