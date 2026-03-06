# NPM Publishing Guide - FOST v0.1.0

**Status**: Ready for Publication  
**Date**: March 6, 2026  
**Version**: 0.1.0  

---

## Overview

The FOST CLI is ready to publish to npm. The package is fully configured with:
- ✅ Complete SDK generation from OpenAPI specs
- ✅ All tests passing (31/31)
- ✅ Clean build with zero TypeScript errors
- ✅ Proper npm metadata and bin entry point
- ✅ GitHub Actions workflow for automated publishing

---

## Pre-Publishing Checklist

### 1. Verify Build & Tests
```bash
npm run build      # Should complete with 0 errors
npm test           # Should pass all tests (31/31)
npm run lint       # Should pass linting (optional)
```

**Status**: ✅ All passing

### 2. Verify Package Contents
```bash
npm pack --dry-run
```

**Expected Files**:
- ✅ `LICENSE` (MIT license)
- ✅ `README.md` (with usage instructions)
- ✅ `bin/fost.js` (CLI entry point with shebang)
- ✅ `dist/` (compiled TypeScript)
- ✅ `package.json` (with metadata)

**Excluded Files** (via .npmignore):
- ✓ Source files (src/ directory)
- ✓ Test files (tests/ directory)
- ✓ Landing page (landing/ directory)
- ✓ Development configs

### 3. Verify Package Metadata
```json
{
  "name": "fost",
  "version": "0.1.0",
  "description": "AI-powered SDK generator for Web2 and Web3 APIs",
  "bin": { "fost": "./bin/fost.js" },
  "main": "dist/src/index.js",
  "types": "dist/src/index.d.ts",
  "keywords": ["sdk", "generator", "openapi", "typescript"],
  "repository": "https://github.com/Emmyhack/fost.git",
  "engines": { "node": ">=18.0.0" }
}
```

**Status**: ✅ All correct

### 4. Verify bin Entry Point
```bash
cat bin/fost.js
```

**Status**: ✅ Has proper shebang `#!/usr/bin/env node`

### 5. Verify GitHub Actions Workflow
```bash
cat .github/workflows/release.yml
```

**Contains**:
- ✅ Trigger on version tags (`v*`)
- ✅ Node.js setup with npm registry
- ✅ Build and test steps
- ✅ `npm publish --access public`
- ✅ GitHub release creation

**Status**: ✅ Properly configured

---

## Publishing Process

### Automated Publishing (Recommended)

The GitHub Actions workflow automates the entire publishing process. To publish:

#### Step 1: Create and Push a Version Tag
```bash
# From the root directory
git tag v0.1.0

# Push the tag
git push origin v0.1.0
```

This triggers the Release workflow which:
1. Checks out the code
2. Installs dependencies
3. Builds the TypeScript
4. Runs all tests
5. Publishes to npm with `--access public`
6. Creates a GitHub release with automatically generated notes

#### Step 2: Verify on npm Registry
After ~1-2 minutes, verify the package appears on npm:

```bash
# Check npm registry
npm view fost

# Or visit: https://www.npmjs.com/package/fost
```

**Expected Output**:
```
{ 
  name: 'fost', 
  version: '0.1.0', 
  description: 'AI-powered SDK generator...',
  dist: { ... }
}
```

#### Step 3: Verify Installation Works
```bash
npm install -g fost

# Test the CLI
fost --version
# Should output: fost 0.1.0

fost --help
# Should show help message
```

---

### Manual Publishing (Alternative)

If you need to publish manually:

#### Step 1: Ensure Dependencies
```bash
npm ci        # Install exact versions from lock file
npm run build # Build TypeScript
npm test      # Run all tests
```

#### Step 2: Create NPM Account (First Time Only)
```bash
npm adduser
# Enter username, password, email
```

#### Step 3: Publish Package
```bash
npm publish --access public
```

**Flags**:
- `--access public` — Allow anyone to install
- `--tag` — Add a tag (e.g., `--tag beta` for v0.2.0-beta)
- `--dry-run` — Test without publishing

#### Step 4: Create and Push Git Tag
```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## Verification Commands

### After Publishing

#### 1. Verify on npm Registry
```bash
npm view fost@0.1.0
npm search fost
```

#### 2. Install Globally and Test
```bash
npm install -g fost@0.1.0

fost --version
# Output: fost 0.1.0

fost --help
# Output: FOST SDK Generator CLI
```

#### 3. Generate a Test SDK
```bash
fost generate \
  --input tests/fixtures/petstore.openapi.yaml \
  --lang typescript \
  --type web2 \
  --output /tmp/test-sdk

ls -la /tmp/test-sdk/
# Should show: types.ts, client.ts, errors.ts, auth.ts, index.ts, README.md, package.json, tsconfig.json, .gitignore
```

#### 4. Check GitHub Release
Visit: https://github.com/Emmyhack/fost/releases/tag/v0.1.0

Should show:
- ✅ Release name: v0.1.0
- ✅ Automatically generated release notes
- ✅ No assets (source code available via git)

---

## NPM Registry Settings

### Access Level
The package is published with `--access public`:
- Anyone can install: `npm install fost`
- Anyone can view: `npm view fost`
- Only owner can publish updates

### Scope Verification
The package is **NOT scoped** (no `@` prefix):
- Package name: `fost` (not `@fost/cli`)
- Install command: `npm install fost`
- npm URL: https://www.npmjs.com/package/fost

### Keywords for Discovery
The package includes SEO-friendly keywords:
- `sdk`, `generator`, `ai`, `openapi`, `typescript`, `cli`, `code-generation`, `graphql`, `web3`, `smart-contracts`

---

## Future Publishing (v0.2.0+)

### Version Bumping
```bash
# Update version in package.json
npm version minor  # 0.1.0 → 0.2.0
npm version patch  # 0.1.0 → 0.1.1
npm version major  # 0.1.0 → 1.0.0

# This automatically:
# 1. Updates package.json version
# 2. Creates a git commit
# 3. Creates a git tag
# 4. Pushes to remote

git push origin main --follow-tags
```

### Prerelease Versions
```bash
# For beta testing
npm publish --tag beta

# Users can install with:
npm install fost@beta

# Later promote to latest:
npm dist-tag add fost@0.2.0 latest
```

---

## Environment Setup

### Required Secrets (GitHub Actions)
Set up these secrets in GitHub repository settings:

#### NPM_TOKEN
1. Create npm account at https://www.npmjs.com/
2. Generate token: https://www.npmjs.com/settings/~/tokens
3. Copy token value
4. Add to GitHub secrets:
   - Go to: Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `NPM_TOKEN`
   - Value: `npm_xxxxxxxxxxxxx`

#### GITHUB_TOKEN
This is automatically available in GitHub Actions (no setup needed).

---

## Troubleshooting

### Issue: "npm ERR! 403 Forbidden"
**Cause**: Invalid or missing NPM_TOKEN  
**Solution**: 
1. Verify token is correct in GitHub secrets
2. Regenerate token at https://www.npmjs.com/settings/~/tokens
3. Update secret value

### Issue: "npm ERR! You must be logged in"
**Cause**: Not authenticated with npm  
**Solution**:
```bash
npm logout
npm login
# Enter credentials
```

### Issue: "npm ERR! Package already published"
**Cause**: Trying to publish same version twice  
**Solution**: Bump version in package.json before publishing

### Issue: "npm ERR! publish fails in CI"
**Cause**: Node.js version mismatch or dependencies not installed  
**Solution**: Check GitHub Actions logs for details

---

## Package Maintenance

### After v0.1.0 Release

#### Monitor
- npm download stats: https://npm-stat.com/charts.html?package=fost
- npm sentiment: https://www.npmjs.com/package/fost
- GitHub issues and stars

#### Update
- Regular dependency updates (npm audit)
- Bug fixes and patches
- New features in v0.2.0

#### Deprecate
- Mark old versions as deprecated if needed:
```bash
npm deprecate fost@0.1.0 "Use version 1.0.0 or later"
```

---

## Security & Best Practices

### Before Every Release
- [ ] Run full test suite: `npm test`
- [ ] Check dependencies: `npm audit`
- [ ] Update CHANGELOG.md with release notes
- [ ] Verify bin entry point works: `node bin/fost.js --version`
- [ ] Test npm pack: `npm pack --dry-run`

### Version Strategy
- MAJOR (1.0.0): Breaking changes, major features
- MINOR (0.1.0): New features, backward compatible
- PATCH (0.1.1): Bug fixes only

### Semantic Versioning
Currently at **v0.1.0** (experimental):
- v0.1.0 — Initial release with OpenAPI SDK generation
- v0.2.0 — Add test generation, doc generation, Web3 support
- v1.0.0 — Stable release with all planned features

---

## Success Criteria

✅ **v0.1.0 Publishing Success**:
- Package appears on npm: https://www.npmjs.com/package/fost
- Installation works: `npm install -g fost`
- CLI works: `fost --version`, `fost --help`, `fost generate`
- GitHub release created with auto-generated notes
- 0 TypeScript errors in published build
- 31/31 tests pass in CI/CD

---

## Next Steps After Publishing

1. **Announce Release**
   - Blog post or Twitter
   - Link to npm package and GitHub release

2. **Gather Feedback**
   - Monitor GitHub issues
   - Track npm downloads
   - Collect user feedback

3. **Plan v0.2.0**
   - Test generation from specs
   - Documentation auto-generation
   - Web3/Contract ABI support
   - Multi-language support

4. **Maintain Package**
   - Regular dependency updates
   - Security patches
   - Documentation improvements

---

## Contact & Support

For publishing issues:
- GitHub: https://github.com/Emmyhack/fost
- npm: https://www.npmjs.com/package/fost
- Issues: https://github.com/Emmyhack/fost/issues

---

**Last Updated**: March 6, 2026  
**Status**: Ready for v0.1.0 Publication
