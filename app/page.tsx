import { ArrowLeftCircle, Sparkles, FileText, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 px-4">
      {/* Hero Section */}
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <ArrowLeftCircle className="h-10 w-10 text-blue-500" />
          <h1 className="text-3xl font-bold text-gray-800">Welcome to WorkNest</h1>
        </div>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          Create collaborative documents with your team and transform them into beautiful websites using AI. 
          Get started by creating a new document to begin collaborating and building.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Collaborative Editing</h3>
          <p className="text-sm text-gray-600">Work together in real-time with live cursors and instant updates</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">AI Website Generation</h3>
          <p className="text-sm text-gray-600">Transform your documents into stunning websites with AI</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Globe className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Instant Publishing</h3>
          <p className="text-sm text-gray-600">Share your generated websites instantly with a live URL</p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="text-center mt-8">
        <p className="text-gray-500 text-sm">
          👈 Create your first document using the sidebar to get started
        </p>
      </div>
    </div>
  );
}
