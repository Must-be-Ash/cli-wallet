# Publishing Guide

This guide explains how to publish the `add-wallet` CLI package to NPM.

## Prerequisites

1. **NPM Account**: You need an NPM account
   - Sign up at: https://www.npmjs.com/signup
   - Username: `ash.nouruzi`

2. **NPM CLI Installed**: Comes with Node.js
   ```bash
   npm --version
   ```

3. **Package Built**: Ensure TypeScript is compiled
   ```bash
   npm run build
   ```

## Pre-Publishing Checklist

- [ ] All tests passing (manual testing complete)
- [ ] `package.json` metadata is correct
  - [ ] Name: `add-wallet`
  - [ ] Version updated (if not first release)
  - [ ] Description accurate
  - [ ] Keywords comprehensive
  - [ ] Repository URL correct
  - [ ] Author set to `ash.nouruzi`
- [ ] `README.md` is complete and accurate
- [ ] `LICENSE` file exists (MIT)
- [ ] `CHANGELOG.md` updated with changes
- [ ] `.npmignore` or `files` field configured
- [ ] Code built successfully (`npm run build`)
- [ ] Tested locally with `npm link`

## Publishing Steps

### 1. Login to NPM

```bash
npm login
```

Enter your credentials:
- Username: `ash.nouruzi`
- Password: [your password]
- Email: [your email]
- OTP: [if 2FA is enabled]

Verify you're logged in:
```bash
npm whoami
# Should output: ash.nouruzi
```

### 2. Verify Package Contents

Check what will be published:
```bash
npm pack --dry-run
```

This shows:
- All files that will be included
- Package size
- Any warnings

### 3. Test Package Locally

Before publishing, test the package:
```bash
# From the packages/cli directory
npm pack

# This creates add-wallet-1.0.0.tgz
# Install it globally to test
npm install -g ./add-wallet-1.0.0.tgz

# Test it works
add-wallet --version

# Uninstall after testing
npm uninstall -g add-wallet
```

### 4. Publish to NPM

**First Release (v1.0.0):**
```bash
npm publish
```

**Subsequent Releases:**
```bash
# Update version in package.json first
npm version patch  # 1.0.0 -> 1.0.1
# or
npm version minor  # 1.0.0 -> 1.1.0
# or
npm version major  # 1.0.0 -> 2.0.0

# Then publish
npm publish
```

### 5. Verify Publication

After publishing:

1. **Check NPM Registry**:
   - Visit: https://www.npmjs.com/package/add-wallet
   - Verify version, description, README display

2. **Test Installation**:
   ```bash
   # Try installing via npx (doesn't install globally)
   npx add-wallet
   ```

3. **Check Download Stats**:
   - https://npm-stat.com/charts.html?package=add-wallet

## Post-Publishing

### Create Git Tag

Tag the release in git:
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Create GitHub Release

1. Go to: https://github.com/Must-be-Ash/cli-wallet/releases/new
2. Choose tag: `v1.0.0`
3. Release title: `v1.0.0 - Initial Release`
4. Description: Copy from CHANGELOG.md
5. Publish release

### Update Documentation

- Update README if needed
- Add release notes to CHANGELOG.md
- Update version references

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
  - Example: Changed CLI command structure
  - Example: Removed wallet type option

- **MINOR** (1.0.0 → 1.1.0): New features (backwards compatible)
  - Example: Added new wallet type
  - Example: Added balance checking

- **PATCH** (1.0.0 → 1.0.1): Bug fixes
  - Example: Fixed .env file write issue
  - Example: Updated error messages

## Troubleshooting

### "You do not have permission to publish"
- Check you're logged in: `npm whoami`
- Package name might be taken
- Check scope/organization permissions

### "Package name too similar to existing package"
- Choose a different name
- Or contact NPM support

### "Version already exists"
- Update version in package.json
- Use `npm version patch|minor|major`

### Files Missing in Published Package
- Check `files` field in package.json
- Ensure `npm run build` ran successfully
- Use `npm pack --dry-run` to preview

## Unpublishing (Last Resort)

**WARNING**: Only unpublish within 72 hours and if no one is using it.

```bash
# Unpublish specific version
npm unpublish add-wallet@1.0.0

# Unpublish entire package (dangerous!)
npm unpublish add-wallet --force
```

After 72 hours, you can only deprecate:
```bash
npm deprecate add-wallet@1.0.0 "Use version 1.0.1 instead"
```

## Maintenance

### Regular Updates

1. Monitor issues: https://github.com/Must-be-Ash/cli-wallet/issues
2. Update dependencies: `npm outdated` → `npm update`
3. Security: `npm audit` → `npm audit fix`
4. Keep documentation current

### Package Stats

Track your package:
- Downloads: https://npm-stat.com/charts.html?package=add-wallet
- Bundle size: https://bundlephobia.com/package/add-wallet
- Package health: https://snyk.io/advisor/npm-package/add-wallet

## Resources

- **NPM Documentation**: https://docs.npmjs.com/
- **Semantic Versioning**: https://semver.org/
- **NPM Best Practices**: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- **Package JSON Reference**: https://docs.npmjs.com/cli/v10/configuring-npm/package-json

---

**Ready to publish?** Run through the checklist above and execute the steps!
