/**
 * Hero Component
 * Main landing section with Web3-focused messaging
 */

import Link from 'next/link';
import { SITE_CONFIG } from '../constants';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
      {/* Accent background elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-accent-green-light rounded-full filter blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent-green-light rounded-full filter blur-3xl opacity-15 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto text-center animate-fade-in relative z-10">
        {/* Main heading */}
        <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight font-mono">
          Best-in-Class
          <br />
          <span className="bg-gradient-to-r from-accent-green via-accent-green to-accent-green-dark bg-clip-text text-transparent">
            SDK Generation
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mb-10 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-mono">
          Web3 smart contracts & REST APIs → Type-safe SDKs in minutes. Multi-chain support, wallet integration, gas estimation, and more.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a
            href="/platform/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 bg-accent-green text-white font-semibold rounded-lg hover:bg-accent-green-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-mono"
          >
            Launch Dashboard
          </a>
          <a
            href="/docs"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-accent-green text-accent-green font-semibold rounded-lg hover:bg-accent-green-light transition-all duration-200 shadow-md hover:shadow-lg font-mono"
          >
            View Documentation
          </a>
        </div>

        {/* Quick Start Section */}
        <div className="grid gap-4 md:grid-cols-2 max-w-3xl mx-auto mb-8">
          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <h3 className="font-mono font-bold text-sm mb-3 text-accent-green">🚀 Quick Start</h3>
            <p className="text-xs text-gray-600 font-mono mb-3">Get started in 30 seconds with the init command:</p>
            <code className="text-xs bg-gray-100 p-2 rounded block text-gray-800 font-mono overflow-x-auto">
              fost init --type web3 --name my-sdk
            </code>
          </div>

          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <h3 className="font-mono font-bold text-sm mb-3 text-accent-green">📚 New Guides</h3>
            <p className="text-xs text-gray-600 font-mono">
              Comprehensive guides for <span className="font-bold">Web2</span> (REST APIs), <span className="font-bold">Web3</span> (smart contracts), and <span className="font-bold">plugins</span>
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="text-2xl font-bold text-accent-green mb-2 font-mono">✓</div>
            <h3 className="font-mono font-bold text-sm mb-2">Multi-Chain</h3>
            <p className="text-xs text-gray-600 font-mono">Ethereum, Polygon, Arbitrum, Optimism, Base</p>
          </div>

          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="text-2xl font-bold text-accent-green mb-2 font-mono">✓</div>
            <h3 className="font-mono font-bold text-sm mb-2">Type-Safe</h3>
            <p className="text-xs text-gray-600 font-mono">TypeScript, Python, Go, Rust & more</p>
          </div>

          <div className="bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg">
            <div className="text-2xl font-bold text-accent-green mb-2 font-mono">✓</div>
            <h3 className="font-mono font-bold text-sm mb-2">Production-Ready</h3>
            <p className="text-xs text-gray-600 font-mono">Gas estimation, wallets, events</p>
          </div>
        </div>

        {/* Flow */}
        <div className="mt-12 bg-white bg-opacity-70 backdrop-blur-sm border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto shadow-lg">
          <div className="space-y-3 text-sm text-gray-700 font-mono">
            <p className="text-xs text-gray-500 mb-4 font-semibold">Get started: ABI or OpenAPI → SDK</p>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">1. Upload Specification</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">2. Select Languages & Chain</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">3. Add Features (tests, docs)</span>
              <span className="text-accent-green">→</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">4. Download & Deploy</span>
              <span className="text-accent-green font-bold">✓</span>
            </div>
          </div>
        </div>

        {/* Links to Documentation */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 font-mono mb-4">Learn more:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="/docs" className="text-xs font-mono text-accent-green hover:underline">Web2 Guide</a>
            <span className="text-gray-400">•</span>
            <a href="/docs" className="text-xs font-mono text-accent-green hover:underline">Web3 Guide</a>
            <span className="text-gray-400">•</span>
            <a href="/docs" className="text-xs font-mono text-accent-green hover:underline">CLI Reference</a>
            <span className="text-gray-400">•</span>
            <a href="/docs" className="text-xs font-mono text-accent-green hover:underline">Plugin Dev</a>
          </div>
        </div>
      </div>
    </section>
  );
}
