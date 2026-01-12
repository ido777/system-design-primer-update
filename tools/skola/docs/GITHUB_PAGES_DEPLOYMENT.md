# GitHub Pages Deployment Guide

## Quick Start

If deploying to `https://ido777.github.io/skola/`:

```bash
# Build with correct base path and disable Dexie Cloud
VITE_BASE_URL=/skola/ VITE_ENABLE_DEXIE_CLOUD=false npm run build

# Deploy
npm run deploy
```

## Understanding the Issues

### 1. Base Path Problem
GitHub Pages serves your app from a subdirectory (e.g., `/skola/`), but the app was using absolute paths like:
- `/decks/system-design.v1.json` ❌
- `/logo.svg` ❌

These fail because they resolve to the root domain, not the subdirectory.

**Solution**: Use `import.meta.env.BASE_URL` for all static asset paths.

### 2. CORS with Dexie Cloud
Dexie Cloud sync requires CORS configuration on the cloud server. GitHub Pages doesn't allow configuring CORS headers, so the sync fails.

**Solution**: Disable Dexie Cloud for GitHub Pages deployment (data still works locally via IndexedDB).

### 3. Deprecated Meta Tag
The `apple-mobile-web-app-capable` meta tag is deprecated.

**Solution**: Added the new `mobile-web-app-capable` tag.

## Files Changed

1. **`vite.config.ts`**: Added support for `VITE_BASE_URL` environment variable
2. **`src/logic/seed/seedSystemDesignDeck.ts`**: Uses `import.meta.env.BASE_URL` for deck file path
3. **`src/logic/db.ts`**: Made Dexie Cloud optional with graceful error handling
4. **`src/app/shell/Sidebar/Sidebar.tsx`**: Fixed logo path to use base URL
5. **`src/app/WelcomeView.tsx`**: Fixed logo path to use base URL
6. **`index.html`**: Added new mobile-web-app-capable meta tag

## Environment Variables

Create a `.env` file or set these when building:

```bash
# Required for GitHub Pages subdirectory deployment
VITE_BASE_URL=/skola/

# Optional: Disable Dexie Cloud to avoid CORS errors
VITE_ENABLE_DEXIE_CLOUD=false

# Optional: Use custom Dexie Cloud URL
VITE_DEXIE_CLOUD_URL=https://your-custom-url.dexie.cloud
```

## Deployment Scripts

You can update `package.json` to include GitHub Pages-specific scripts:

```json
{
  "scripts": {
    "build:gh-pages": "VITE_BASE_URL=/skola/ VITE_ENABLE_DEXIE_CLOUD=false vite build",
    "deploy:gh-pages": "npm run build:gh-pages && gh-pages -d dist"
  }
}
```

Then deploy with:
```bash
npm run deploy:gh-pages
```

## Testing Locally

Test the GitHub Pages build locally:

```bash
# Build with base path
VITE_BASE_URL=/skola/ npm run build

# Preview
npm run serve

# Visit http://localhost:4173/skola/
```

## Import Feature

The import feature will work correctly because:
- File uploads via `<input type="file">` work regardless of base path
- The `dexie-export-import` library handles paths correctly
- No additional changes needed

## Troubleshooting

### 404 Errors for Static Assets
- Ensure `VITE_BASE_URL` matches your GitHub Pages subdirectory
- Check that paths use `import.meta.env.BASE_URL`

### CORS Errors
- Set `VITE_ENABLE_DEXIE_CLOUD=false` for GitHub Pages
- Or configure CORS on your Dexie Cloud server

### Routing Issues
- Hash routing (`#/home`) works correctly regardless of base path
- No changes needed to router configuration

## Notes

- The app works **offline** with local IndexedDB storage
- Cloud sync is **optional** - the app functions without it
- All data is stored in the browser's IndexedDB
- Users can export/import their data manually
