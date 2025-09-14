import Image from "next/image";
import Link from "next/link";

// Define available tools
const tools = [
  {
    slug: 'json-formatter',
    title: 'JSON Formatter',
    description: 'Format, validate, and beautify your JSON data with our easy-to-use tool.',
    icon: '{ }' // You can replace this with an actual icon component
  },
  {
    slug: 'regex-tester',
    title: 'Regex Tester',
    description: 'Test and debug your regular expressions with real-time matching and validation.',
    icon: '.*' // You can replace this with an actual icon component
  },
  {
    slug: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF documents to editable Word files while maintaining formatting.',
    icon: '📄' // You can replace this with an actual icon component
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-base-100 to-base-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-base-content">
              Welcome to <span className="text-primary">Veridian</span>
            </h1>
            <p className="text-xl text-base-content/80 max-w-2xl mx-auto">
              Your all-in-one platform for powerful online tools. Simplify your workflow with our carefully crafted solutions.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="badge badge-primary badge-lg">
              Free to Use
            </span>
            <span className="badge badge-primary badge-lg">
              No Sign-up Required
            </span>
            <span className="badge badge-primary badge-lg">
              Privacy Focused
            </span>
          </div>

          <div className="pt-8">
            <h2 className="text-2xl font-semibold text-base-content mb-8">
              Essential Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Link 
                key={tool.slug}
                href={`/tools/${tool.slug}`} 
                className="transform hover:scale-105 transition-transform duration-200"
              >
                <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow border border-base-300 hover:border-primary">
                  <div className="card-body">
                    <div className="text-2xl mb-2 text-primary">{tool.icon}</div>
                    <h3 className="card-title text-xl font-semibold text-base-content mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-base-content/70">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="pt-12">
            <p className="text-sm text-base-content/60">
              More tools coming soon! Stay tuned for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
