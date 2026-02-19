import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-4 text-4xl font-bold font-mono text-gray-900">
            Fost Documentation
          </h1>
          <p className="text-lg text-gray-600 font-mono max-w-2xl">
            Complete guide to generating type-safe SDKs for REST APIs and Web3 smart contracts
            across multiple chains with Fost.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-8">
        {/* Doc Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {/* Web2 SDKs */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition">
            <div className="mb-4 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="text-lg">🌐</span>
            </div>
            <h3 className="mb-2 text-xl font-bold font-mono">Web2 REST APIs</h3>
            <p className="mb-4 text-sm text-gray-600 font-mono">
              Generate type-safe SDKs from OpenAPI and Swagger specifications
            </p>
            <ul className="space-y-2 text-sm font-mono text-gray-700">
              <li>✓ OpenAPI 3.0 & Swagger 2.0 support</li>
              <li>✓ Full type safety</li>
              <li>✓ Request/Response validation</li>
              <li>✓ Error handling</li>
              <li>✓ Multiple language output</li>
            </ul>
          </div>

          {/* Web3 SDKs */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 hover:shadow-lg transition">
            <div className="mb-4 h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="text-lg">⛓️</span>
            </div>
            <h3 className="mb-2 text-xl font-bold font-mono">Web3 Smart Contracts</h3>
            <p className="mb-4 text-sm text-gray-600 font-mono">
              Generate SDKs from Solidity contract ABIs with full blockchain support
            </p>
            <ul className="space-y-2 text-sm font-mono text-gray-700">
              <li>✓ Contract ABI parsing</li>
              <li>✓ Multi-chain support</li>
              <li>✓ Gas estimation</li>
              <li>✓ Event subscriptions</li>
              <li>✓ Wallet integration</li>
            </ul>
          </div>
        </div>

        {/* Getting Started Section */}
        <section className="mb-12 rounded-lg bg-accent-green bg-opacity-10 border border-accent-green border-opacity-20 p-8">
          <h2 className="mb-6 text-2xl font-bold font-mono">Quick Start Guide</h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-mono font-semibold text-gray-800 mb-2">Step 1: Create an Account</p>
              <p className="text-gray-700 font-mono text-sm">
                Sign up on Fost to get 100 free credits and start generating SDKs immediately.
              </p>
            </div>

            <div>
              <p className="font-mono font-semibold text-gray-800 mb-2">Step 2: Upload Your Spec</p>
              <p className="text-gray-700 font-mono text-sm">
                Upload an OpenAPI spec for REST APIs or a contract ABI for Web3 smart contracts.
              </p>
            </div>

            <div>
              <p className="font-mono font-semibold text-gray-800 mb-2">Step 3: Select Languages</p>
              <p className="text-gray-700 font-mono text-sm">
                Choose from 8 supported languages: TypeScript, Python, Go, Java, C#, Rust, Swift, Kotlin.
              </p>
            </div>

            <div>
              <p className="font-mono font-semibold text-gray-800 mb-2">Step 4: Generate & Download</p>
              <p className="text-gray-700 font-mono text-sm">
                Get a production-ready SDK with full type safety and comprehensive documentation.
              </p>
            </div>
          </div>

          <Link
            href="/platform/dashboard"
            className="inline-block mt-6 rounded bg-accent-green px-6 py-2 font-mono font-bold text-white hover:bg-accent-green-dark"
          >
            Open Dashboard
          </Link>
        </section>

        {/* Features Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mono">Core Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="mb-3 text-2xl">📝</div>
              <h3 className="font-semibold text-gray-900 mb-2 font-mono">REST API SDKs</h3>
              <p className="text-sm text-gray-600 font-mono">
                Generate type-safe SDKs from OpenAPI 3.0 and Swagger 2.0 specifications.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="mb-3 text-2xl">🔗</div>
              <h3 className="font-semibold text-gray-900 mb-2 font-mono">Smart Contract SDKs</h3>
              <p className="text-sm text-gray-600 font-mono">
                Generate SDKs from Solidity contract ABIs with full Web3 support.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="mb-3 text-2xl">🌍</div>
              <h3 className="font-semibold text-gray-900 mb-2 font-mono">Multi-Chain Support</h3>
              <p className="text-sm text-gray-600 font-mono">
                Deploy to Ethereum, Polygon, Arbitrum, Optimism, Base, and BSC.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="mb-3 text-2xl">👛</div>
              <h3 className="font-semibold text-gray-900 mb-2 font-mono">Wallet Integration</h3>
              <p className="text-sm text-gray-600 font-mono">
                Built-in MetaMask and WalletConnect support for Web3 SDKs.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="mb-3 text-2xl">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2 font-mono">Gas Estimation</h3>
              <p className="text-sm text-gray-600 font-mono">
                Automatic gas estimation and optimization for all transactions.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-6 hover:shadow-lg transition">
              <div className="mb-3 text-2xl">📡</div>
              <h3 className="font-semibold text-gray-900 mb-2 font-mono">Event Subscriptions</h3>
              <p className="text-sm text-gray-600 font-mono">
                Listen to blockchain events with real-time subscriptions.
              </p>
            </div>
          </div>
        </section>

        {/* Supported Languages */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mono">Supported Languages</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'TypeScript',
              'Python',
              'Go',
              'Java',
              'C#',
              'Rust',
              'Swift',
              'Kotlin',
            ].map((lang) => (
              <div
                key={lang}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center hover:bg-white hover:border-accent-green transition"
              >
                <p className="font-mono font-semibold text-sm text-gray-900">
                  {lang}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-mono">REST API Reference</h2>
          <div className="space-y-3">
            {[
              { method: 'POST', path: '/api/auth/signup', desc: 'Create a new user account' },
              { method: 'POST', path: '/api/auth/login', desc: 'Login with email and password' },
              { method: 'POST', path: '/api/auth/logout', desc: 'Logout and clear session' },
              { method: 'GET', path: '/api/auth/me', desc: 'Get current authenticated user' },
              { method: 'POST', path: '/api/sdk/generate', desc: 'Generate SDK from OpenAPI spec' },
              { method: 'POST', path: '/api/sdk/generate-web3', desc: 'Generate SDK from smart contract ABI' },
              { method: 'GET', path: '/api/sdk/download', desc: 'Download generated SDK package' },
              { method: 'GET', path: '/api/user/stats', desc: 'Get user generation statistics' },
            ].map((endpoint) => (
              <div
                key={endpoint.path}
                className="rounded border border-gray-200 p-4 font-mono text-sm hover:bg-gray-50 transition"
              >
                <div className="flex flex-wrap items-start gap-4">
                  <span className="inline-block rounded bg-gray-200 px-2 py-1 font-bold text-gray-900 whitespace-nowrap">
                    {endpoint.method}
                  </span>
                  <code className="text-gray-700 break-all flex-1">{endpoint.path}</code>
                </div>
                <p className="mt-2 text-gray-600 text-xs">{endpoint.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Help Section */}
        <section className="rounded-lg bg-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 font-mono">Need Help?</h2>
          <p className="text-gray-700 font-mono mb-4">
            Check out our comprehensive guides and resources to get started with Fost.
          </p>
          <ul className="space-y-3 text-sm font-mono">
            <li>
              <a
                href="https://github.com/zelius/fost"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-green hover:underline"
              >
                → GitHub Repository
              </a>
            </li>
            <li>
              <Link
                href="/platform/dashboard"
                className="text-accent-green hover:underline"
              >
                → Generate Your First SDK
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/zelius/fost/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-green hover:underline"
              >
                → Report Issues
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
