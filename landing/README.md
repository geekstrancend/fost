# FOST — AI-Powered SDK Generator

> **FOST** is an AI-powered code generation tool that transforms API specifications into complete, production-ready SDKs in minutes.

**Status**: 🟡 Alpha (v0.1.0)  
**License**: MIT  
**Repository**: [github.com/Emmyhack/fost](https://github.com/Emmyhack/fost)  
**Live Site**: [fost.vercel.app](https://fost.vercel.app)

---

## 📖 Quick Links

- 📚 **[Full Project README](./PROJECT_README.md)** - Comprehensive documentation and CLI guide
- 🏗️ **[Architecture Guide](./docs/ARCHITECTURE.md)** - Technical architecture and module breakdown
- 🤝 **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute and develop locally
- 📋 **[Changelog](./CHANGELOG.md)** - Version history and roadmap

---

## 🎯 What is FOST?

FOST generates production-ready, fully-typed SDKs from API specifications:

- **REST APIs** (OpenAPI/Swagger)
- **Smart Contracts** (EVM ABI)
- **GraphQL** (planned)
- **Solana IDL** (planned)

Output in:
- **TypeScript** ✅ (production-ready)
- **Python, Go, Rust** (planned)

---

## 🚀 Quick Start

### Installation

```bash
# Install globally (when published to npm)
npm install -g fost

# Or use npx
npx fost generate --help
```

### Generate Your First SDK

```bash
# From an OpenAPI spec
fost generate \
  --input api.openapi.yaml \
  --language typescript \
  --type web2 \
  --output ./sdk

# From a smart contract ABI
fost generate \
  --input Contract.abi.json \
  --language typescript \
  --type web3 \
  --output ./contract-sdk
```

---

## 🏗️ This Repository

This repo contains two main parts:

### `landing/` — Next.js Platform & Landing Page

- Modern, responsive design
- Documentation portal
- Platform dashboard (WIP)
- Authentication system
- Built with Next.js, React, TypeScript, Tailwind CSS

### `src/` — Core CLI & Generation Engine

- CLI tool for SDK generation
- Specification parsers (OpenAPI, ABI)
- Code generators (TypeScript)
- LLM integration (OpenAI)
- Configuration management
- Error handling & logging

See **[Architecture Guide](./docs/ARCHITECTURE.md)** for complete module breakdown.

---

## 📦 Landing Page (This Directory)

This is the Next.js landing page and platform for FOST.

### 🎨 Design Philosophy

- **Simple & Aesthetic**: Clean typography, generous spacing, no gradients
- **Green Accent Color**: `#10B981` used strategically for CTAs, icons, and highlights
- **Neutral Backgrounds**: White and light grey—never green backgrounds
- **Mobile-First**: Fully responsive design optimized for all devices
- **Educational Focus**: Step-by-step CLI walkthrough, AI explanation, code examples

## �️ Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Setup

```bash
# Clone repository
git clone https://github.com/Emmyhack/fost.git
cd fost/landing

# Install dependencies
npm install

# Set up environment (optional for local dev)
cp ../.env.example .env.local
```

### Running Locally

```bash
# Development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
npm run build
npm start
```

### Deployment

The landing page is deployed on **Vercel** automatically on commits to `main`:

```bash
# Manual deploy
vercel deploy --prod
```

See [Vercel docs](https://vercel.com/docs) for more options.

## 📁 Landing Page Structure

```
app/
├── components/
│   ├── Hero.tsx           # Main headline, CTAs, quick start
│   ├── HowItWorks.tsx     # 4-step CLI walkthrough
│   ├── Features.tsx       # 6 feature cards
│   ├── CodeExamples.tsx   # Web2 & Web3 examples
│   ├── AIExplainer.tsx    # AI system & FAQ
│   ├── CodeBlock.tsx      # Code snippet component
│   └── Footer.tsx         # CTA & footer links
├── constants.ts           # Site config, copy, links
├── globals.css            # Global styles & animations
├── layout.tsx             # Root layout
└── page.tsx               # Main landing page
```

## 🎨 Customization

Edit **[app/constants.ts](app/constants.ts)** to update:
- Site title, tagline, description
- GitHub, npm, and docs links
- Social media links
- 4-step walkthrough
- Feature cards
- Code examples
- FAQ questions

Edit **[tailwind.config.ts](tailwind.config.ts)** to customize colors, fonts, and spacing.

## 🚢 Deployment

### On Vercel (Recommended)

```bash
# First time
vercel

# Subsequent pushes to main auto-deploy
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## � Performance

## 🐛 Troubleshooting

### Build fails with module not found

Ensure Node modules are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Styles not applying

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Dev server slow

- Restart: `npm run dev`
- Check for TS errors: `npm run lint`
- Check system resources

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [FOST Documentation](./docs/)
- [FOST Architecture](./docs/ARCHITECTURE.md)

## 🤝 Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Testing guidelines
- Code style & formatting
- Pull request process
- Commit message conventions

## 📄 License

MIT — See [LICENSE](../LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Animation by [Framer Motion](https://www.framer.com/motion/)
- Part of the [FOST](https://github.com/Emmyhack/fost) project

---

**Status**: 🟡 Alpha  
**Last Updated**: March 5, 2026  
**GitHub**: [Emmyhack/fost](https://github.com/Emmyhack/fost)
