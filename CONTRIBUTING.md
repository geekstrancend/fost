# Contributing to Fost

Thank you for your interest in contributing to Fost! We welcome contributions from the community.

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Emmyhack/fost.git
   cd fost
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your OpenAI API key
   nano .env.local
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Run tests:**
   ```bash
   npm test
   ```

6. **Watch mode (for development):**
   ```bash
   npm run watch
   ```

## Development Workflow

### Testing the CLI Locally

After making changes, test the CLI with:

```bash
# From the root directory
node dist/src/cli/index.js generate examples/petstore.openapi.yaml --lang typescript --output ./test-sdk

# Or use the bin file directly
node bin/fost.js generate examples/petstore.openapi.yaml --lang typescript --output ./test-sdk
```

### Running Tests

- **Run all tests once:** `npm test`
- **Watch mode (rerun on changes):** `npm test:watch`
- **With coverage report:** `npm test`

### Code Style

We use ESLint and Prettier for code formatting:

```bash
npm run lint          # Check for linting issues
npm run build         # TypeScript compilation also checks types
```

## Branching Strategy

- `main` — Production-ready code. All tests must pass. Merges require PR review.
- `develop` — Integration branch for features
- `feature/*` — Feature branches (e.g., `feature/python-generator`)
- `bugfix/*` — Bug fix branches (e.g., `bugfix/openapi-parsing`)

## Pull Request Process

1. Create a feature branch off `develop`:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and commit with clear messages:
   ```bash
   git commit -m "feat: add support for GraphQL subscriptions"
   ```

3. Push your branch:
   ```bash
   git push origin feature/your-feature
   ```

4. Open a Pull Request with:
   - Clear description of the change
   - Link to related issue (if any)
   - Verification that tests pass locally
   - Verification that `npm run lint` passes

5. Address review feedback and merge once approved.

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — A new feature
- `fix:` — A bug fix
- `docs:` — Documentation changes
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks, dependency updates
- `refactor:` — Code refactoring without feature changes

Examples:
```
feat: add Python SDK generator
fix: handle null values in OpenAPI spec parsing
docs: update README with authentication examples
test: add E2E test for CLI generate command
```

## Areas for Contribution

### High-Priority Items

- [ ] Python SDK generator (currently stubbed)
- [ ] Go SDK generator (currently stubbed)
- [ ] Solid test coverage for LLM integration
- [ ] Complete documentation

### Good First Issues

- Documentation improvements
- Test coverage expansion
- Bug fixes in error handling
- Performance optimizations

## Reporting Issues

If you find a bug or have a feature request:

1. Check if the issue already exists: https://github.com/Emmyhack/fost/issues
2. Create a new issue with:
   - Clear title
   - Description of the problem or request
   - Steps to reproduce (for bugs)
   - Expected vs. actual behavior
   - Environment (OS, Node version, etc.)

## Licensing

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

---

**Questions?** Open an issue or discussion on GitHub: https://github.com/Emmyhack/fost

Thank you for contributing to Fost! 🚀
