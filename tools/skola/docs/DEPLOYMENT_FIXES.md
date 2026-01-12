# GitHub Pages Deployment Fixes

## Issues Fixed

### 1. Base Path for Static Assets
**Problem**: GitHub Pages serves from a subdirectory (e.g., `/skola/`), but the app used absolute paths like `/decks/system-design.v1.json`, causing 404 errors.

**Solution**:
- Updated `vite.config.ts` to support `VITE_BASE_URL` environment variable
- Updated `seedSystemDesignDeck.ts` to use `import.meta.env.BASE_URL` for fetching deck files
- Vite automatically handles asset paths in `index.html` when base is set correctly

**Usage**:
```bash
# For GitHub Pages deployment (if repo name is 'skola')
VITE_BASE_URL=/skola/ npm run build

# For root deployment
npm run build  # Uses default "/"
```

### 2. Deprecated Meta Tag
**Problem**: `apple-mobile-web-app-capable` is deprecated.

**Solution**: Added the new `mobile-web-app-capable` meta tag while keeping the Apple one for backward compatibility.

### 3. CORS Error with Dexie Cloud
**Problem**: Dexie Cloud sync was trying to connect to `https://zo30f12v5.dexie.cloud` but GitHub Pages blocked the CORS request.

**Solution**:
- Made Dexie Cloud optional via environment variable
- Added graceful error handling
- App continues to work locally without cloud sync

**Usage**:
```bash
# Disable Dexie Cloud (for GitHub Pages)
VITE_ENABLE_DEXIE_CLOUD=false npm run build

# Use custom Dexie Cloud URL
VITE_DEXIE_CLOUD_URL=https://your-custom-url.dexie.cloud npm run build
```

## Deployment Steps

### For GitHub Pages (with subdirectory)

1. **Set the base path** in your build:
   ```bash
   # If your repo is 'skola' and deployed to ido777.github.io/skola/
   VITE_BASE_URL=/skola/ npm run build
   ```

2. **Disable Dexie Cloud** (unless you've configured CORS):
   ```bash
   VITE_BASE_URL=/skola/ VITE_ENABLE_DEXIE_CLOUD=false npm run build
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

### For Custom Domain (root deployment)

1. **Build with root base**:
   ```bash
   npm run build
   ```

2. **Deploy**:
   ```bash
   npm run deploy
   ```

## Import Capability

The import feature will work correctly because:
- It uses the same `import.meta.env.BASE_URL` mechanism for any file fetches
- File uploads via `<input type="file">` work regardless of base path
- The `dexie-export-import` library handles paths relative to the app

**No additional changes needed** for import functionality.

## Environment Variables Summary

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BASE_URL` | `/` | Base path for the app (e.g., `/skola/` for GitHub Pages) |
| `VITE_ENABLE_DEXIE_CLOUD` | `true` | Enable/disable Dexie Cloud sync |
| `VITE_DEXIE_CLOUD_URL` | `https://zo30f12v5.dexie.cloud` | Custom Dexie Cloud database URL |

## Testing Locally

To test the GitHub Pages deployment locally:

```bash
# Build with base path
VITE_BASE_URL=/skola/ npm run build

# Preview the build
npm run serve

# Visit http://localhost:4173/skola/
```

## Notes

- Hash routing (`#/home`) works correctly regardless of base path
- Static assets in `public/` are automatically handled by Vite
- The app will work offline with local IndexedDB storage even without cloud sync
