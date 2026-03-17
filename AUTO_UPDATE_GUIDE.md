# Auto-Update System Implementation Guide

## Overview
This guide explains how to implement the auto-update system for your web app. When you push new code, users will see an "Update Available" dialog and can click "Update Now" to fetch the latest version.

## How It Works

### 1. **Version Check Flow**
```
User opens app
    ↓
UpdateNotification component starts periodic checks
    ↓
Every 5 minutes: Check /version.json on server
    ↓
Compare server version with current version
    ↓
If newer version exists: Show update dialog
    ↓
User clicks "Update Now"
    ↓
Clear cache + reload app with cache-busting query param
    ↓
Browser downloads latest version
```

### 2. **Components Created**

#### A. `src/lib/update-service.ts`
Handles version checking and update logic:
- `getCurrentVersion()` - Get current app version
- `getLatestVersion()` - Fetch latest version from server
- `compareVersions()` - Compare semantic versions
- `isUpdateAvailable()` - Check if update is needed
- `startPeriodicCheck()` - Start checking every 5 minutes
- `performUpdate()` - Clear cache and reload

#### B. `src/components/UpdateNotification.tsx`
Shows the update dialog to users:
- Displays version number and release notes
- "Update Later" button (if not forced)
- "Update Now" button
- Shows "Required" badge for critical updates

#### C. `public/version.json`
Server-side version manifest:
```json
{
  "version": "1.0.1",
  "releaseNotes": "• Fixed billing bug\n• Improved performance",
  "forceUpdate": false,
  "releaseDate": "2026-03-17"
}
```

## Deployment Workflow

### **Step 1: Update Your Code**
```bash
# Make your bug fixes/improvements
# Test locally
npm run dev
```

### **Step 2: Update Version Files**

#### Update `package.json`
```json
{
  "version": "1.0.1",  // ← Increment this
  ...
}
```

#### Update `vite.config.ts`
```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify('1.0.1'),  // ← Match package.json
  },
  ...
});
```

#### Update `public/version.json`
```json
{
  "version": "1.0.1",
  "releaseNotes": "• Fixed billing calculation bug\n• Improved invoicing\n• Better error handling",
  "forceUpdate": false,  // Set to true if CRITICAL update
  "releaseDate": "2026-03-17"
}
```

### **Step 3: Build & Deploy**
```bash
# Build the app
npm run build

# This creates the optimized dist/ folder
# Deploy dist/ to your hosting (Vercel, Netlify, AWS, etc.)

# Also make sure public/version.json is accessible at:
# https://yourdomain.com/version.json
```

### **Step 4: Users Get Update**
✅ Users will see "App Update Available" dialog
✅ Click "Update Now" to get latest version
✅ Old users continue working until they update

## Configuration Options

### Force Update (Critical Bug)
```json
// public/version.json
{
  "version": "1.0.2",
  "releaseNotes": "CRITICAL SECURITY FIX: All users must update",
  "forceUpdate": true,  // ← User cannot skip this
  "releaseDate": "2026-03-17"
}
```

When `forceUpdate: true`:
- User cannot click "Update Later" button
- Dialog cannot be dismissed
- User MUST click "Update Now" to continue

### Custom Release Notes Format
```json
{
  "releaseNotes": "• Fixed billing calculation error\n• Improved performance by 40%\n• Added dark mode support\n• Security patch applied"
}
```

## Advanced Features

### 1. **Manual Update Check**
Users can trigger update check manually:
```typescript
import { updateService } from '@/lib/update-service';

const latestVersion = await updateService.manualCheckForUpdate();
if (latestVersion) {
  console.log('New version available:', latestVersion.version);
}
```

### 2. **Update Callbacks**
Add logic when update completes:
```tsx
<UpdateNotification 
  onUpdateComplete={() => {
    toast.success('App updated! Refreshing...');
  }}
/>
```

### 3. **Stop Checking**
Stop periodic checks when needed:
```typescript
const stopChecking = updateService.startPeriodicCheck(callback);
stopChecking(); // Stop the interval
```

## Hosting Considerations

### Vercel
```bash
# Deploy automatically after push
npm run build && vercel deploy

# version.json is automatically served from public/
```

### Netlify
```bash
# Deploy using CLI or GitHub integration
netlify deploy --prod --dir=dist

# Ensure public/version.json is served at root
```

### AWS S3 + CloudFront
```bash
# Build
npm run build

# Sync to S3
aws s3 sync dist/ s3://your-bucket/

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"

# Upload version.json with metadata
aws s3 cp public/version.json s3://your-bucket/version.json \
  --cache-control "max-age=0, no-cache"
```

### Self-Hosted (Node.js)
```javascript
// In your server.js
app.use(express.static('dist'));
app.use(express.static('public'));

// Ensure version.json doesn't cache
app.get('/version.json', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(__dirname + '/public/version.json');
});
```

## API Endpoint Alternative (Optional)

Instead of using `public/version.json`, you can create a backend endpoint:

```typescript
// Backend (Node.js/Express example)
app.get('/api/app-version', (req, res) => {
  res.json({
    version: '1.0.1',
    releaseNotes: 'Bug fixes and improvements',
    forceUpdate: false,
    releaseDate: '2026-03-17'
  });
});
```

Update `update-service.ts`:
```typescript
private versionCheckUrl = 'https://api.yourdomain.com/api/app-version';
```

## Troubleshooting

### Users still see old version after update
**Solution**: Check cache headers on your hosting
```
Cache-Control: max-age=3600  ← Too long! Use shorter duration
Cache-Control: max-age=0     ← Better for index.html
Cache-Control: no-cache      ← Best for version.json
```

### Update dialog not appearing
```bash
# 1. Check if version.json is accessible
curl https://yourdomain.com/version.json

# 2. Check browser console for errors
# 3. Verify version comparison logic
# 4. Check network tab to see if request is made
```

### Users complain about frequent updates
**Solution**: Only increment version when deploying to production
- Don't update on dev/test deployments
- Use beta versions: 1.0.1-beta.1, 1.0.1-beta.2

### Force update won't dismiss
**This is by design!** If `forceUpdate: true`, user MUST update.
Set `forceUpdate: false` once critical issue is resolved:
```json
{
  "version": "1.0.2",
  "releaseNotes": "Critical issue resolved - users can now skip updates",
  "forceUpdate": false
}
```

## Best Practices

### ✅ DO
- Increment version number for every production release
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Set `forceUpdate: true` only for security/critical bugs
- Test locally before deploying
- Keep release notes clear and concise
- Monitor user update adoption

### ❌ DON'T
- Update version without deploying new code
- Use `forceUpdate: true` for minor updates
- Deploy without testing
- Forget to update all version references
- Leave old files on server (breaks app)

## Monitoring

Add analytics to track update adoption:
```typescript
// In UpdateNotification.tsx
const handleUpdate = async () => {
  // Log to analytics
  analytics.track('update_started', {
    fromVersion: updateService.getCurrentVersion(),
    toVersion: latestVersion.version
  });
  
  await updateService.performUpdate();
};
```

## Summary

1. **After fixing bug**: Update code + test
2. **Increment version**: Update package.json & vite.config.ts
3. **Update version.json**: Add release notes
4. **Build & Deploy**: `npm run build && deploy`
5. **Users see update**: Dialog appears automatically
6. **Users click Update**: They get latest version

That's it! Your users will always be on the latest version automatically.
