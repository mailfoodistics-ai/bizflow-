# BizFlow POS - Modern Point of Sale System

A comprehensive Point of Sale application built with React, TypeScript, Vite, and Capacitor. Features real-time inventory management, customer management, invoice generation, and automatic update notifications.

## Features

- 📊 **Dashboard** - Sales analytics and business metrics
- 🛍️ **Inventory Management** - Track products and stock levels
- 👥 **Customer Management** - Maintain customer database
- 📄 **Invoice Generation** - Create and manage invoices
- 💳 **Billing System** - Process payments
- 📈 **Reports** - Sales and business reports
- ⚙️ **Settings** - Configurable app settings
- 🔄 **Auto Updates** - Automatic app update notifications
- 📱 **Cross-Platform** - Web, iOS, and Android support via Capacitor

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Mobile**: Capacitor (iOS/Android)
- **Testing**: Vitest + Playwright
- **Deployment**: Vercel (Web) + App Stores (Mobile)

## Quick Start

### Web Development

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Build for Web

```bash
npm run build
npm run preview
```

### Mobile Development

See [ANDROID_SETUP.md](./ANDROID_SETUP.md) for detailed Android setup instructions.

```bash
npm run build
npx cap sync android
npx cap open android
```

## Environment Setup

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_APP_NAME=BizFlow POS
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Feature components
├── pages/           # Page components
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
└── test/            # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Check code quality

## Deployment

### Web (Vercel)

1. Push to GitHub: `https://github.com/mailfoodistics-ai/bizflow-.git`
2. Connect to Vercel
3. Auto-deploys on push to main branch

### Mobile (Android)

See [ANDROID_SETUP.md](./ANDROID_SETUP.md) for building APK and distribution.

## Auto-Update System

The app includes an automatic update notification system that:
- Checks for new versions on app startup
- Shows a notification when updates are available
- Allows users to download and install updates
- Handles update installation gracefully

See `src/components/UpdateNotification.tsx` for implementation.

## Git Repository

- **Repository**: https://github.com/mailfoodistics-ai/bizflow-.git
- **Organization**: Foodistics AI (mail.foodistics@gmail.com)
- **Main Branch**: main

## License

All rights reserved © 2026 Foodistics AI
