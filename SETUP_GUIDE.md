# BizFlow POS - Modern Point of Sale System

A complete point-of-sale (POS) system built with React, TypeScript, and Supabase. Designed for small to medium businesses to manage inventory, customers, and process payments seamlessly.

## Features

✨ **Core Features**
- 🔐 User Authentication & Authorization (Supabase Auth)
- 📦 Inventory Management with barcode scanning
- 👥 Customer Management & Purchase History
- 💳 Multi-payment methods (Cash, Card, UPI)
- 🔳 Automatic UPI QR Code generation for instant payments
- 📋 Digital Invoice generation with GST details
- 📊 Real-time Sales Analytics & Reports
- 📱 Responsive design for desktop and tablet
- 🔔 Low stock alerts
- 💰 Sales tracking and revenue analysis

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Shadcn/ui + Tailwind CSS
- **State Management**: React Query + Context API
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Authentication**: Supabase Auth
- **Payments**: UPI QR Code Generation
- **Charts**: Recharts
- **Icons**: Lucide React

## Prerequisites

- Node.js 16+ and npm/yarn
- A Supabase account (free tier available)
- Modern web browser

## Setup Instructions

### 1. Clone & Install Dependencies

```bash
cd bizflow-pos-main
npm install --legacy-peer-deps
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Copy your project URL and Anon Key from Settings → API

### 3. Create Supabase Database Schema

1. In your Supabase project, go to SQL Editor
2. Click "New Query"
3. Copy and paste the entire contents of `SUPABASE_SCHEMA.sql`
4. Click "Run" to create all tables, policies, and triggers

### 4. Environment Configuration

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Usage

### First Time Setup

1. **Landing Page**: Navigate to the home page
2. **Sign Up**: Create a new account with your email and store name
3. **Complete Setup**: Configure store details in Settings page
   - Store address, phone, GST number
   - UPI ID for automatic payment QR codes

### Creating Your First Sale

1. **Go to Billing**: Add products by searching or barcode
2. **Adjust Quantity**: Use +/- buttons
3. **Add Customer**: Optional but recommended for history tracking
4. **Apply Discount**: If needed
5. **Select Payment Method**: Cash, Card, UPI, or Split
6. **For UPI**: 
   - A QR code is auto-generated with your amount
   - Customer scans with their UPI app
   - Mark as paid after verification

### Managing Inventory

1. **Products Page**: Add/edit/delete products
2. **Barcode Setup**: Each product should have a unique barcode
3. **Stock Tracking**: Real-time stock updates after each sale
4. **Low Stock Alerts**: Dashboard shows items below minimum quantity

### Customer Management

1. **Customers Page**: View all customer records
2. **Purchase History**: See all transactions per customer
3. **Contact Info**: Maintain email and phone for invoicing

### Reports & Analytics

1. **Dashboard**: Daily sales overview
2. **Reports Page**: 
   - Weekly/Monthly sales trends
   - Top-selling products
   - Revenue analysis
   - Customer insights

## Database Schema

### Main Tables

- **store_settings**: Store configuration per user
- **products**: Inventory items with pricing and stock
- **customers**: Customer records with purchase tracking
- **invoices**: Transaction records with payment details
- **invoice_items**: Line items for each invoice

### Key Features

- Row-Level Security (RLS) ensures data isolation
- Automatic timestamps with update triggers
- Referential integrity with cascading deletes
- Unique constraints for barcodes and invoice numbers

## File Structure

```
src/
├── pages/               # Page components
│   ├── LandingPage.tsx     # Public landing page
│   ├── LoginPage.tsx       # User authentication
│   ├── SignupPage.tsx      # Account creation
│   ├── DashboardPage.tsx   # Sales overview
│   ├── BillingPage.tsx     # POS terminal
│   ├── InventoryPage.tsx   # Product management
│   ├── CustomersPage.tsx   # Customer management
│   ├── InvoicesPage.tsx    # Invoice history
│   ├── ReportsPage.tsx     # Analytics
│   ├── SettingsPage.tsx    # Configuration
│   └── NotFound.tsx        # 404 page
├── components/          # Reusable components
│   ├── DashboardLayout.tsx # Main layout
│   ├── AppHeader.tsx       # Header with user menu
│   ├── AppSidebar.tsx      # Navigation sidebar
│   ├── ProtectedRoute.tsx  # Auth wrapper
│   └── ui/                 # Shadcn/ui components
├── lib/                 # Utilities and services
│   ├── supabase.ts         # Supabase client & types
│   ├── auth-context.tsx    # Authentication context
│   ├── db-service.ts       # Database operations
│   ├── upi-service.ts      # UPI QR generation
│   └── utils.ts            # Helper functions
├── hooks/               # Custom React hooks
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## API Reference

### Auth Service

```typescript
// Sign up new user
await signUp(email, password, storeName);

// Sign in user
await signIn(email, password);

// Sign out
await signOut();
```

### Database Service

```typescript
// Products
getProducts(storeId)
addProduct(storeId, productData)
updateProduct(productId, updates)
deleteProduct(productId)
searchProducts(storeId, query)

// Customers
getCustomers(storeId)
addCustomer(storeId, customerData)
updateCustomer(customerId, updates)

// Invoices
getInvoices(storeId)
createInvoice(storeId, invoiceData, items)
updateInvoicePaymentStatus(invoiceId, status, upiRef?)

// Store Settings
getStoreSettings(userId)
updateStoreSettings(userId, updates)
```

### UPI Service

```typescript
// Generate UPI string for QR
generateUPIString(upiDetails)

// Generate transaction reference
generateTransactionRef(invoiceNumber)

// Format amount for UPI
formatUPIAmount(amount)

// Validate UPI ID format
isValidUPIId(upiId)
```

## Payment Integration

### UPI Payment Flow

1. **QR Generation**: Automatic UPI string creation
   - UPI ID from store settings
   - Amount from invoice total
   - Transaction reference for tracking
   - Store name and description

2. **Customer Payment**: Customer scans QR with UPI app
   - Automatically fills amount and payee
   - Shows transaction details
   - User confirms and completes payment

3. **Confirmation**: Mark as paid after verification
   - Payment status updated in database
   - Invoice marked as complete
   - Stock updated automatically

### Payment Methods

- **Cash**: Manual entry, no verification
- **Card**: Manual payment reference entry
- **UPI**: Automatic QR code generation
- **Split**: Combination of payment methods

## Security

### Data Protection

- Row-Level Security (RLS) on all tables
- User data isolation per store
- Encrypted password handling via Supabase Auth
- HTTPS-only communication

### Best Practices

- Never commit `.env.local` with real credentials
- Regularly update dependencies
- Use strong passwords for accounts
- Enable 2FA in Supabase dashboard
- Regular database backups via Supabase

## Troubleshooting

### Cannot connect to Supabase

- Verify Supabase URL and key in `.env.local`
- Check internet connection
- Ensure Supabase project is active

### Products not appearing

- Confirm products are added to your store
- Check barcode is unique per store
- Verify store_id matches in database

### UPI QR not generating

- Ensure UPI ID is set in Store Settings
- Check that amount is formatted correctly
- Verify qrcode.react package is installed

### Invoice not saving

- Confirm all required fields are filled
- Check invoice number is unique per store
- Verify customer (if selected) exists

## Build & Deployment

### Build for Production

```bash
npm run build
```

### Preview Build Locally

```bash
npm run preview
```

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy with one click

### Deploy to Other Platforms

Works with any Node.js/static hosting:
- Netlify
- AWS Amplify
- GitHub Pages
- Docker containers

## Development

### Run Tests

```bash
npm run test
```

### Lint Code

```bash
npm run lint
```

### Watch Mode

```bash
npm run dev
```

## Support & Feedback

For issues or feature requests, please create an issue in the repository.

## License

MIT License - Feel free to use for commercial projects

## Changelog

### Version 1.0.0
- Initial release with core POS features
- Supabase backend integration
- UPI QR code generation
- Multi-tenant support
- Real-time inventory tracking

## Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Offline mode with sync
- [ ] Multi-language support
- [ ] Advanced tax configurations
- [ ] Return management
- [ ] Supplier management
- [ ] Expense tracking
- [ ] Employee management
- [ ] Integration with accounting software
- [ ] API for third-party integrations

---

**Built with ❤️ for small business owners**
