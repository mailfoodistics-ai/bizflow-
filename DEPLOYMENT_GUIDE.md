# Deployment Examples for Auto-Update System

## 🚀 Quick Start Workflow

```bash
# 1. Make your bug fixes
# 2. Test locally
npm run dev

# 3. Update version in package.json (or just use current version)
# (Increment version number when ready)
# Edit package.json: "version": "1.0.1"

# 4. Update release notes in public/version.json
# Edit public/version.json:
{
  "version": "1.0.1",
  "releaseNotes": "• Fixed bug in billing page\n• Improved performance",
  "forceUpdate": false,
  "releaseDate": "2026-03-17"
}

# 5. Deploy using your build script
npm run build:prod

# 6. Deploy to your hosting platform (examples below)
```

---

## 📦 Vercel Deployment

### Setup (One Time)
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

### Deploy with Auto-Update
```bash
# Update version and release notes
# Then build and deploy
npm run build:prod
vercel deploy --prod

# OR use GitHub integration (automatic on push)
git add .
git commit -m "v1.0.1: Fixed billing bug"
git push origin main
# Vercel deploys automatically!
```

**Vercel handles caching automatically**, so version.json will be fetched fresh.

---

## 🔵 Netlify Deployment

### Setup (One Time)
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Link project
netlify link
```

### Deploy with Auto-Update
```bash
# Update version and release notes
npm run build:prod

# Deploy
netlify deploy --prod

# OR GitHub integration
git add .
git commit -m "v1.0.1: Fixed billing bug"
git push
# Netlify deploys automatically!
```

**Add to netlify.toml** to control caching:
```toml
[[headers]]
  for = "/version.json"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

---

## ☁️ AWS S3 + CloudFront Deployment

### Setup (One Time)
```bash
# Install AWS CLI
brew install awscli  # macOS
# OR
choco install awscliv2  # Windows

# Configure credentials
aws configure
```

### Deploy with Auto-Update
```bash
# Update version and release notes
npm run build:prod

# Sync to S3
aws s3 sync dist/ s3://your-bucket/ --delete

# Upload version.json with no-cache
aws s3 cp public/version.json s3://your-bucket/version.json \
  --cache-control "max-age=0, no-cache, no-store, must-revalidate"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"

echo "✅ Deployed to AWS!"
```

**CloudFront configuration** (AWS Console):
- Set TTL to 86400s for most files
- Set TTL to 0s for version.json

---

## 🐳 Docker + Self-Hosted Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:prod

FROM node:18-alpine
WORKDIR /app

# Install express for serving
RUN npm init -y && npm install express

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create server.js
COPY server.js .

EXPOSE 3000
CMD ["node", "server.js"]
```

### server.js
```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve version.json with no-cache
app.get('/version.json', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'version.json'));
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// SPA: redirect all routes to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Build & Deploy Docker
```bash
# Update version and release notes
npm run build:prod

# Build Docker image
docker build -t bizflow-pos:latest .

# Push to registry
docker push your-registry/bizflow-pos:latest

# Or run locally
docker run -p 3000:3000 bizflow-pos:latest

# Verify version endpoint
curl http://localhost:3000/version.json
```

---

## 🔧 GitHub Actions CI/CD (Automatic Deployment)

### `.github/workflows/deploy.yml`
```yaml
name: Deploy with Auto-Update

on:
  push:
    branches: [main, production]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Build with version update
        run: npm run build:prod

      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}

      - name: Notify Slack (optional)
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{
              "text": "BizFlow deployed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deployment Successful*\nCommit: ${{ github.sha }}\nVersion: $(cat package.json | grep version)"
                  }
                }
              ]
            }'
```

**To enable:**
1. Add `VERCEL_TOKEN` secret in GitHub Settings
2. Add `SLACK_WEBHOOK` for notifications (optional)
3. Push to main/production branch
4. GitHub automatically deploys!

---

## 📱 Testing the Auto-Update Locally

```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Serve version.json locally
# This simulates a newer version being available
python3 -m http.server 8001 --directory public

# In browser:
# 1. Open http://localhost:5173
# 2. Edit public/version.json - increment version to "2.0.0"
# 3. Refresh browser - should show update dialog!
# 4. Click "Update Now" - should reload with cache busting
```

---

## 🔍 Verify Deployment

After deploying, test the auto-update system:

```bash
# 1. Check version.json is accessible
curl https://yourdomain.com/version.json
# Should return JSON with current version

# 2. Check caching headers
curl -i https://yourdomain.com/version.json
# Should NOT have Cache-Control with long TTL

# 3. Check app loads correctly
# Open https://yourdomain.com in browser

# 4. Update version.json to a newer version
# Users should see "App Update Available" dialog

# 5. Test update functionality
# Click "Update Now" - app should reload with latest code
```

---

## 🚨 Emergency Rollback

If a bug is discovered in new version:

```bash
# Option 1: Revert to previous version.json
git revert HEAD
npm run build:prod
# (Re-deploy)

# Option 2: Set forceUpdate and warn users
# Edit public/version.json
{
  "version": "1.0.0",  // revert to working version
  "releaseNotes": "⚠️ CRITICAL: Previous update had issues. Please update to this version.",
  "forceUpdate": true,
  "releaseDate": "2026-03-17"
}
# Deploy this immediately
```

---

## Summary

| Platform | Command | Auto-Deploy |
|----------|---------|------------|
| Vercel | `npm run build:prod && vercel deploy --prod` | ✅ Yes (with GitHub) |
| Netlify | `npm run build:prod && netlify deploy --prod` | ✅ Yes (with GitHub) |
| AWS S3 | `npm run build:prod && aws s3 sync...` | ❌ Manual |
| Docker | `npm run build:prod && docker build...` | ❌ Manual |
| GitHub Actions | `.github/workflows/deploy.yml` | ✅ Yes (on push) |

**Recommended:** Use Vercel or Netlify with GitHub integration for fully automatic updates!
