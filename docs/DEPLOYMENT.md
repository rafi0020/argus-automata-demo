# Deployment Guide

## GitHub Pages Deployment

### Prerequisites

- GitHub account
- Git installed locally
- Node.js 18+ installed

### Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `argus-automata-demo`
3. Visibility: **Public** (required for free GitHub Pages)
4. Do NOT initialize with README (we have our own)
5. Click **Create repository**

### Step 2: Configure Vite Base URL

The `vite.config.ts` must have the correct base URL:

```typescript
// web/vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/argus-automata-demo/',  // Must match repo name
  // ...
});
```

### Step 3: Push to GitHub

```bash
# From project root
git init
git add -A
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/argus-automata-demo.git
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** (left sidebar)
3. Under **Build and deployment**:
   - Source: **GitHub Actions**
4. The workflow will auto-trigger

### Step 5: Verify Deployment

1. Go to **Actions** tab
2. Watch the "Deploy to GitHub Pages" workflow
3. Once complete (green checkmark), visit:

```
https://YOUR_USERNAME.github.io/argus-automata-demo/
```

---

## GitHub Actions Workflow

The deployment uses `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      - run: npm ci
        working-directory: ./web
      - run: npm run build
        working-directory: ./web
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./web/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
```

---

## Local Development

```bash
cd web
npm install
npm run dev
```

Access at: `http://localhost:5173/argus-automata-demo/`

---

## Production Build

```bash
cd web
npm run build
```

Output in `web/dist/` - can be served by any static host.

---

## Custom Domain (Optional)

1. Add a `CNAME` file to `web/public/`:
   ```
   your-domain.com
   ```

2. Update `vite.config.ts`:
   ```typescript
   base: '/',  // Root for custom domain
   ```

3. Configure DNS:
   - Add CNAME record pointing to `YOUR_USERNAME.github.io`

4. Enable HTTPS in GitHub Pages settings

---

## Troubleshooting

### Build Fails

Check the Actions log for errors. Common issues:
- Missing dependencies: Run `npm install`
- TypeScript errors: Fix type issues
- Path issues: Check `base` in vite.config.ts

### 404 on Page Load

- Ensure `base` matches repository name
- Check that `index.html` is in the build output

### Assets Not Loading

- Use `import.meta.env.BASE_URL` for asset paths
- Don't hardcode `/` paths

### Video Not Playing

- Ensure video is H.264 MP4 format
- Check browser console for CORS errors
- The system will fall back to Canvas Simulation mode

---

## Environment Variables

For local development, create `web/.env.local`:

```env
VITE_APP_TITLE=Argus Automata Demo
```

Access in code:
```typescript
const title = import.meta.env.VITE_APP_TITLE;
```

Note: Only `VITE_` prefixed variables are exposed to the client.

