'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Tool categories for better organization
const categories = {
  "Popular": ["json-formatter", "regex-tester", "pdf-to-word", "img-compress"],
  "Code & Development": ["json-formatter", "regex-tester", "html-css-js", "mock-data", "uuid-pass"],
  "Data Conversion": ["csv-json-yaml", "base64-utility", "pdf-to-word"],
  "Image & Design": ["color-pallette", "icon-generate", "img-compress", "qr-utility"],
  "Text & Encoding": ["url-encode", "base64-utility", "uuid-pass"],
  "Time & Date": ["time-convert"]
};

// Define available tools with updated icons
const tools: Tool[] = [
  {
    slug: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Format, validate, and beautify your JSON data with our easy-to-use tool.',
    icon: '📋'
  },
  {
    slug: 'regex-tester',
    title: 'Regex Tester',
    description: 'Test and debug your regular expressions with real-time matching and validation.',
    icon: '🔍'
  },
  {
    slug: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files while maintaining formatting.',
    icon: '📄'
  },
  {
    slug: 'base64-utility',
    title: 'Base64 Utility',
    description: 'Encode and decode Base64 strings and files with ease.',
    icon: '🔒'
  },
  {
    slug: 'qr-utility',
    title: 'QR-Code Utility',
    description: 'Generate and scan QR codes effortlessly.',
    icon: '📷'
  },
  {
    slug: 'url-encode',
    title: 'URL Encoder/Decoder',
    description: 'Encode and decode URLs, and build query strings easily.',
    icon: '🔗'
  },
  {
    slug: 'color-pallette',
    title: 'Color Palette Generator',
    description: 'Generate color palettes from images or base colors.',
    icon: '🎨'
  },
  {
    slug: 'csv-json-yaml',
    title: 'CSV/JSON/YAML Converter',
    description: 'Convert between CSV, JSON, and YAML formats seamlessly.',
    icon: '🔄'
  },
  {
    slug: 'html-css-js',
    title: 'HTML/CSS/JS Minifier',
    description: 'Minify or beautify your HTML, CSS, and JavaScript code.',
    icon: '💻'
  },
  {
    slug: 'icon-generate',
    title: 'App Icon Generator',
    description: 'Generate app icons in various sizes for different platforms.',
    icon: '🖼️'
  },
  {
    slug: 'img-compress',
    title: 'Image Compressor',
    description: 'Compress images without losing quality.',
    icon: '🖼️'
  },
  {
    slug: 'mock-data',
    title: 'Mock Data Generator',
    description: 'Generate realistic mock data for testing and development.',
    icon: '📊'
  },
  {
    slug: 'uuid-pass',
    title: 'Password & UUID Generator',
    description: 'Generate secure passwords and UUIDs quickly.',
    icon: '🔐'
  },
  {
    slug: 'time-convert',
    title: 'Timestamp Converter',
    description: 'Convert and manipulate timestamps easily.',
    icon: '⏰'
  }
];

interface Tool {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Popular");

  // Filter tools based on search query
  const filteredTools = tools.filter(tool =>
    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get tools for the active category
  const getCategoryTools = (categoryName: string) => {
    const categoryToolSlugs = categories[categoryName as keyof typeof categories];
    return tools.filter(tool => categoryToolSlugs.includes(tool.slug));
  };

  // Get tools to display based on search or category
  const displayTools = searchQuery ? filteredTools : getCategoryTools(activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200">
      {/* Hero Section */}
      <div className="hero py-12 bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-5xl font-bold text-base-content">
              Welcome to <span className="text-primary">Veridian</span>
            </h1>
            <p className="text-xl text-base-content/80">
              Your all-in-one platform for powerful online tools. Simplify your workflow with our carefully crafted solutions.
            </p>
            
            {/* Search Bar */}
            <div className="form-control w-full max-w-xl mx-auto">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Search tools..." 
                  className="input input-bordered w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {/* <button className="btn btn-square btn-primary w-half max-w-xl mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button> */}
              </div>
            </div>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center gap-4 text-sm pt-4">
              <span className="badge badge-primary badge-lg">Free to Use</span>
              <span className="badge badge-primary badge-lg">No Sign-up Required</span>
              <span className="badge badge-primary badge-lg">Privacy Focused</span>
              <span className="badge badge-primary badge-lg">Regular Updates</span>
            </div>
          </div>
        </div>
      </div>
{/* Tools Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-center mb-6 text-base-content">
              Browse by Category
            </h2>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {Object.keys(categories).map((category) => (
                <button
                  key={category}
                  className={`btn btn-sm md:btn-md transition-all duration-200 ${
                    activeCategory === category 
                      ? 'btn-primary shadow-lg scale-105' 
                      : 'btn-outline btn-primary hover:scale-105'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {activeCategory === category && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {category}
                  <span className={`ml-2 badge badge-sm ${
                    activeCategory === category ? 'badge-neutral' : 'badge-ghost'
                  }`}>
                    {categories[category as keyof typeof categories].length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayTools.map((tool) => (
            <Link 
              key={tool.slug}
              href={`/tools/${tool.slug}`} 
              className="block transform hover:scale-105 transition-transform duration-200"
            >
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-base-300 hover:border-primary h-full">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl text-primary">{tool.icon}</div>
                    <h3 className="card-title text-xl font-semibold text-base-content">
                      {tool.title}
                    </h3>
                  </div>
                  <p className="text-base-content/70">
                    {tool.description}
                  </p>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-ghost btn-sm">
                      Try Now →
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Links for Most Used Tools */}
        {!searchQuery && activeCategory === 'Popular' && (
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <h3 className="w-full text-center text-xl font-semibold mb-4">Quick Access</h3>
            {getCategoryTools('Popular').slice(0, 4).map((tool) => (
              <Link 
                key={`quick-${tool.slug}`}
                href={`/tools/${tool.slug}`}
                className="btn btn-outline btn-primary"
              >
                {tool.icon} {tool.title}
              </Link>
            ))}
          </div>
        )}

        {/* Coming Soon Notice */}
        <div className="text-center mt-16">
          <div className="max-w-md mx-auto p-4 bg-base-100 rounded-lg shadow-lg border border-base-300">
            <h3 className="font-semibold text-lg mb-2">🚀 Coming Soon</h3>
            <p className="text-base-content/70">
              We're constantly adding new tools and features.
              Have a suggestion? Let us know!
            </p>
            <button 
              className="btn btn-ghost btn-sm mt-2"
              onClick={() => (document.getElementById('suggestion_modal') as HTMLDialogElement)?.showModal()}
            >
              Suggest a Tool
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}