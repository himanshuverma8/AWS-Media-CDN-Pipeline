'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Book, 
  Key, 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  ChevronRight,
  Copy,
  Check,
  ArrowLeft,
  Zap,
  Shield,
  Globe,
  ExternalLink
} from 'lucide-react';

type Language = 'curl' | 'javascript' | 'python' | 'go';

const codeExamples: Record<string, Record<Language, string>> = {
  upload: {
    curl: `curl -X POST "https://cdncp.hv6.dev/api/v1/upload" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -F "file=@/path/to/image.jpg" \\
  -F "type=image" \\
  -F "folder=uploads/2024"`,
    javascript: `const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('type', 'image');
formData.append('folder', 'uploads/2024');

const response = await fetch('https://cdncp.hv6.dev/api/v1/upload', {
  method: 'POST',
  headers: {
    'X-API-Key': 'YOUR_API_KEY',
  },
  body: formData,
});

const data = await response.json();
console.log(data.file.cdnUrl);`,
    python: `import requests

url = "https://cdncp.hv6.dev/api/v1/upload"
headers = {"X-API-Key": "YOUR_API_KEY"}

with open("image.jpg", "rb") as f:
    files = {"file": f}
    data = {"type": "image", "folder": "uploads/2024"}
    
    response = requests.post(url, headers=headers, files=files, data=data)
    print(response.json()["file"]["cdnUrl"])`,
    go: `package main

import (
    "bytes"
    "mime/multipart"
    "net/http"
    "os"
)

func uploadFile() {
    file, _ := os.Open("image.jpg")
    defer file.Close()

    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    part, _ := writer.CreateFormFile("file", "image.jpg")
    io.Copy(part, file)
    writer.WriteField("type", "image")
    writer.WriteField("folder", "uploads/2024")
    writer.Close()

    req, _ := http.NewRequest("POST", 
        "https://cdncp.hv6.dev/api/v1/upload", body)
    req.Header.Set("X-API-Key", "YOUR_API_KEY")
    req.Header.Set("Content-Type", writer.FormDataContentType())
    
    client := &http.Client{}
    resp, _ := client.Do(req)
}`,
  },
  listFiles: {
    curl: `curl -X GET "https://cdncp.hv6.dev/api/v1/files?type=image&folder=uploads" \\
  -H "X-API-Key: YOUR_API_KEY"`,
    javascript: `const response = await fetch(
  'https://cdncp.hv6.dev/api/v1/files?type=image&folder=uploads',
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
    },
  }
);

const data = await response.json();
data.files.forEach(file => {
  console.log(file.fileName, file.url);
});`,
    python: `import requests

url = "https://cdncp.hv6.dev/api/v1/files"
headers = {"X-API-Key": "YOUR_API_KEY"}
params = {"type": "image", "folder": "uploads"}

response = requests.get(url, headers=headers, params=params)
files = response.json()["files"]

for file in files:
    print(file["fileName"], file["url"])`,
    go: `package main

import (
    "encoding/json"
    "net/http"
)

func listFiles() {
    req, _ := http.NewRequest("GET", 
        "https://cdncp.hv6.dev/api/v1/files?type=image", nil)
    req.Header.Set("X-API-Key", "YOUR_API_KEY")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
}`,
  },
  presigned: {
    curl: `curl -X GET "https://cdncp.hv6.dev/api/v1/presigned?path=uploads/image.jpg&type=image&expires=3600" \\
  -H "X-API-Key: YOUR_API_KEY"`,
    javascript: `const response = await fetch(
  'https://cdncp.hv6.dev/api/v1/presigned?path=uploads/image.jpg&type=image&expires=3600',
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
    },
  }
);

const data = await response.json();
console.log('Presigned URL:', data.url);`,
    python: `import requests

url = "https://cdncp.hv6.dev/api/v1/presigned"
headers = {"X-API-Key": "YOUR_API_KEY"}
params = {
    "path": "uploads/image.jpg",
    "type": "image",
    "expires": 3600
}

response = requests.get(url, headers=headers, params=params)
presigned_url = response.json()["url"]
print("Presigned URL:", presigned_url)`,
    go: `package main

import (
    "encoding/json"
    "net/http"
)

func getPresignedUrl() {
    req, _ := http.NewRequest("GET", 
        "https://cdncp.hv6.dev/api/v1/presigned?path=image.jpg&type=image", nil)
    req.Header.Set("X-API-Key", "YOUR_API_KEY")
    
    client := &http.Client{}
    resp, _ := client.Do(req)
    
    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
}`,
  },
};

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('curl');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'introduction', label: 'Introduction', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'upload', label: 'Upload Files', icon: Upload },
    { id: 'list-files', label: 'List Files', icon: FileText },
    { id: 'presigned', label: 'Presigned URLs', icon: LinkIcon },
    { id: 'cdn-urls', label: 'CDN URL Format', icon: Globe },
    { id: 'errors', label: 'Error Handling', icon: Shield },
  ];

  const languages: { id: Language; label: string }[] = [
    { id: 'curl', label: 'cURL' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'go', label: 'Go' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-slate-400 text-sm">API v1.0</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="sticky top-24 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Documentation
              </h3>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Links */}
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link 
                    href="/"
                    className="flex items-center space-x-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <a 
                    href="https://cdn.hv6.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-sm text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>CDN Endpoint</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Introduction */}
            {activeSection === 'introduction' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl p-8 border border-blue-500/20">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    API Documentation
                  </h1>
                  <p className="text-lg text-slate-300 mb-6">
                    This API allows you to programmatically upload, 
                    manage, and deliver your media files through our global CDN network.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                      <Globe className="w-5 h-5 text-green-400" />
                      <span className="text-slate-300">Global CDN</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      <span className="text-slate-300">Image Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <span className="text-slate-300">Secure Access</span>
                    </div>
                  </div>
                </div>

                {/* Base URL */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Base URL</h2>
                  <code className="block bg-slate-900 px-4 py-3 rounded-lg text-green-400 font-mono">
                    https://cdncp.hv6.dev/api/v1
                  </code>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">File Upload</h3>
                    <p className="text-slate-400 text-sm">
                      Upload images and files directly to our CDN with automatic optimization.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">File Management</h3>
                    <p className="text-slate-400 text-sm">
                      List, organize, and manage your files with folder support.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                      <LinkIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Presigned URLs</h3>
                    <p className="text-slate-400 text-sm">
                      Generate temporary secure URLs for private file access.
                    </p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Image Transforms</h3>
                    <p className="text-slate-400 text-sm">
                      On-the-fly image resizing, format conversion, and optimization.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Authentication */}
            {activeSection === 'authentication' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-4">Authentication</h1>
                  <p className="text-slate-300">
                    All API requests require authentication using your API key. You can generate 
                    API credentials from the dashboard.
                  </p>
                </div>

                {/* API Key Header */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Using API Key</h2>
                  <p className="text-slate-400 mb-4">
                    Include your API key in the <code className="px-2 py-1 bg-slate-700 rounded text-blue-400">X-API-Key</code> header:
                  </p>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                    <div className="text-slate-500"># Request Header</div>
                    <div className="text-green-400">X-API-Key: hv_xxxxxxxxxxxxxxxxxxxx</div>
                  </div>
                </div>

                {/* Alternative: Query Parameter */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Alternative: Query Parameter</h2>
                  <p className="text-slate-400 mb-4">
                    You can also pass the API key as a query parameter (not recommended for production):
                  </p>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm">
                    <div className="text-slate-500"># URL with API key</div>
                    <div className="text-green-400 break-all">
                      https://cdncp.hv6.dev/api/v1/files?api_key=hv_xxxxxxxxxxxxxxxxxxxx
                    </div>
                  </div>
                </div>

                {/* Generate API Key */}
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 border border-yellow-500/20">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Generate API Credentials</h3>
                      <p className="text-slate-300 mb-4">
                        To get your API key, go to the Dashboard and click on &quot;API Keys&quot; button. 
                        Your API secret will only be shown once, so save it securely.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                      >
                        <span>Go to Dashboard</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Files */}
            {activeSection === 'upload' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded">POST</span>
                    <code className="text-lg text-slate-300 font-mono">/api/v1/upload</code>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4">Upload Files</h1>
                  <p className="text-slate-300">
                    Upload images or files to the CDN. Files are automatically stored in your 
                    user-specific directory and served through the global CDN.
                  </p>
                </div>

                {/* Code Examples */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <h2 className="text-lg font-bold text-white">Code Examples</h2>
                    <div className="flex space-x-1 bg-slate-900 rounded-lg p-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLanguage(lang.id)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            selectedLanguage === lang.id
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="p-6 overflow-x-auto">
                      <code className="text-sm text-slate-300 font-mono whitespace-pre">
                        {codeExamples.upload[selectedLanguage]}
                      </code>
                    </pre>
                    <button
                      onClick={() => copyCode(codeExamples.upload[selectedLanguage], 'upload')}
                      className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'upload' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List Files */}
            {activeSection === 'list-files' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded">GET</span>
                    <code className="text-lg text-slate-300 font-mono">/api/v1/files</code>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4">List Files</h1>
                  <p className="text-slate-300">
                    Retrieve a list of all your uploaded files with their CDN URLs and metadata.
                  </p>
                </div>

                {/* Code Examples */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <h2 className="text-lg font-bold text-white">Code Examples</h2>
                    <div className="flex space-x-1 bg-slate-900 rounded-lg p-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLanguage(lang.id)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            selectedLanguage === lang.id
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="p-6 overflow-x-auto">
                      <code className="text-sm text-slate-300 font-mono whitespace-pre">
                        {codeExamples.listFiles[selectedLanguage]}
                      </code>
                    </pre>
                    <button
                      onClick={() => copyCode(codeExamples.listFiles[selectedLanguage], 'list')}
                      className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'list' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Presigned URLs */}
            {activeSection === 'presigned' && (
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded">GET</span>
                    <code className="text-lg text-slate-300 font-mono">/api/v1/presigned</code>
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-4">Generate Presigned URL</h1>
                  <p className="text-slate-300">
                    Generate a temporary presigned URL for direct S3 access.
                  </p>
                </div>

                {/* Code Examples */}
                <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
                    <h2 className="text-lg font-bold text-white">Code Examples</h2>
                    <div className="flex space-x-1 bg-slate-900 rounded-lg p-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.id}
                          onClick={() => setSelectedLanguage(lang.id)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            selectedLanguage === lang.id
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <pre className="p-6 overflow-x-auto">
                      <code className="text-sm text-slate-300 font-mono whitespace-pre">
                        {codeExamples.presigned[selectedLanguage]}
                      </code>
                    </pre>
                    <button
                      onClick={() => copyCode(codeExamples.presigned[selectedLanguage], 'presigned')}
                      className="absolute top-4 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      {copiedCode === 'presigned' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CDN URL Format */}
            {activeSection === 'cdn-urls' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-4">CDN URL Format</h1>
                  <p className="text-slate-300">
                    Files uploaded to the CDN can be accessed via two different URL formats.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">Image URLs</h2>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <code className="text-green-400 break-all">
                      https://cdn.hv6.dev/images/&#123;userId&#125;/&#123;folder&#125;/&#123;filename&#125;
                    </code>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">File URLs</h2>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <code className="text-green-400 break-all">
                      https://cdn.hv6.dev/files/&#123;userId&#125;/&#123;folder&#125;/&#123;filename&#125;
                    </code>
                  </div>
                </div>
              </div>
            )}

            {/* Error Handling */}
            {activeSection === 'errors' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-4">Error Handling</h1>
                  <p className="text-slate-300">
                    The API uses standard HTTP status codes and returns JSON error responses.
                  </p>
                </div>

                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <h2 className="text-xl font-bold text-white mb-4">HTTP Status Codes</h2>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-4 py-2 border-b border-slate-700/50">
                      <span className="font-mono text-green-400 w-16">200</span>
                      <span className="text-slate-300">OK - Request successful</span>
                    </div>
                    <div className="flex items-center space-x-4 py-2 border-b border-slate-700/50">
                      <span className="font-mono text-yellow-400 w-16">400</span>
                      <span className="text-slate-300">Bad Request - Invalid parameters</span>
                    </div>
                    <div className="flex items-center space-x-4 py-2 border-b border-slate-700/50">
                      <span className="font-mono text-red-400 w-16">401</span>
                      <span className="text-slate-300">Unauthorized - Invalid API key</span>
                    </div>
                    <div className="flex items-center space-x-4 py-2">
                      <span className="font-mono text-red-400 w-16">500</span>
                      <span className="text-slate-300">Server Error - Internal error</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-slate-400">HV6 CDN</span>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()}{' '}
              <a
                href="https://hv6.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors animate-blink"
              >
                hv6.dev
              </a>
              . All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}


