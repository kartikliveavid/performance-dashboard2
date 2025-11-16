# Deployment Guide

## 🚀 Quick Deploy

### 1. Build for Production
```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### 2. Preview Locally
```bash
npm run preview
```

This serves the production build locally so you can test it before deploying.

### 3. Deploy Options

#### Option A: Vercel (Recommended - Easiest)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

#### Option B: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Option C: GitHub Pages
1. Build the project: `npm run build`
2. Push `dist/` folder to `gh-pages` branch
3. Enable GitHub Pages in repository settings

#### Option D: Static Hosting (Any)
Just upload the contents of the `dist/` folder to your hosting provider.

## 🔧 Troubleshooting Connection Errors

### If you see "Internet connection error" repeatedly:

1. **Clear Service Workers**:
   - Open browser DevTools (F12)
   - Go to Application > Service Workers
   - Click "Unregister" on any active service workers
   - Or visit `/clear-service-worker.html` in your browser

2. **Clear Browser Cache**:
   - DevTools > Application > Clear Storage
   - Click "Clear site data"

3. **Disable Service Worker in Development**:
   - Service worker only registers in production builds
   - In development (`npm run dev`), it won't interfere

4. **Check Console for Errors**:
   - Open DevTools Console
   - Look for service worker errors
   - Check Network tab for failed requests

### Service Worker Issues

The service worker is designed to:
- Only work in production builds
- Handle errors gracefully
- Not interfere with development

If you're seeing errors:
1. The service worker might be from a previous version
2. Clear it using the steps above
3. Rebuild and redeploy

## 📝 Production Checklist

- [ ] Build completes without errors: `npm run build`
- [ ] Preview works locally: `npm run preview`
- [ ] No console errors in browser
- [ ] Service worker registers (check DevTools > Application)
- [ ] All charts render correctly
- [ ] Performance is 60 FPS with 10k data points
- [ ] No network errors in console

## 🌐 Environment Variables

No environment variables needed for basic deployment. The app works out of the box.

## 📦 Build Output

After `npm run build`, you'll have:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── stats.html (bundle analysis)
```

Upload everything in `dist/` to your hosting provider.


