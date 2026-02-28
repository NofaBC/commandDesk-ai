import Link from 'next/link';
import { Mail, Zap, Shield, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Mail className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">CommandDesk AI™</span>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Dashboard →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            AI-Powered Customer
            <br />
            <span className="text-blue-600">Command Center</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            CommandDesk AI monitors your inbox, understands customer intent,
            responds instantly, and routes technical issues to TechSupport AI™
            for resolution.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Open Dashboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Email Monitoring</h3>
            <p className="text-sm text-gray-600">
              Continuously monitors your support inbox and processes every email in real time.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Instant Classification</h3>
            <p className="text-sm text-gray-600">
              AI classifies intent, product, and severity — then auto-replies or escalates.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Routing</h3>
            <p className="text-sm text-gray-600">
              Technical issues go to TechSupport AI™. Everything else gets an instant response.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500">
            CommandDesk AI™ — NOFA AI Factory
          </p>
        </div>
      </footer>
    </div>
  );
}
