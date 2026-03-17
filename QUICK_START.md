# BizFlow POS - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Create Supabase Account
- Go to [supabase.com](https://supabase.com)
- Click "Start your project"
- Sign up with email/GitHub
- Create a new project (free tier is perfect)

### Step 2: Get Your Credentials
- In Supabase dashboard, go to **Settings → API**
- Copy:
  - **Project URL** (looks like: `https://xxxxx.supabase.co`)
  - **Anon Key** (public key, safe to use in frontend)

### Step 3: Create Database Tables
- In Supabase, go to **SQL Editor**
- Click **New Query**
- Open `SUPABASE_SCHEMA.sql` from this project
- Copy all content into the editor
- Click **Run**

✅ Your database is ready!

### Step 4: Setup Project
```bash
# Install dependencies
npm install --legacy-peer-deps

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your credentials:
# VITE_SUPABASE_URL=your_url_here
# VITE_SUPABASE_ANON_KEY=your_key_here
```

### Step 5: Run App
```bash
npm run dev
```

Visit `http://localhost:5173` and enjoy! 🎉

---

## 📋 Quick Feature Guide

### User Management
```
Homepage → Sign Up → Create Account → Set Store Name → Done!
```

### Creating Sales
```
1. Click "Billing" in sidebar
2. Search for products (or type barcode)
3. Click product to add (or type quantity)
4. Select payment method
5. For UPI: Show QR code to customer
6. Mark as paid → Invoice generated!
```

### Managing Inventory
```
Inventory → Add Product → Fill details → Done!
```

### Viewing Reports
```
Dashboard → See daily sales, top products
Reports → Detailed analytics
```

---

## 🔐 Default Demo Account

After setup, create your account. For testing:
- Email: `test@example.com`
- Password: `Test1234!`

(Change immediately after testing!)

---

## 📲 UPI Payment Setup

1. **Go to Settings page**
2. **Add your UPI ID** (e.g., `mystore@upi` or `9876543210@okhdfcbank`)
3. **When creating sale:**
   - Select "UPI" payment method
   - QR code auto-generates
   - Customer scans with their UPI app
   - Amount auto-fills
   - Customer confirms and pays
   - You mark as confirmed → Done!

---

## 🗄️ Database Breakdown

| Table | Purpose | Auto-Updated |
|-------|---------|---|
| store_settings | Your store info | Timestamps |
| products | Inventory | Stock after sale |
| customers | Customer list | Purchase total |
| invoices | Sales records | Payment status |
| invoice_items | Line items | - |

All data is **encrypted** and **isolated per user**.

---

## 🆘 Troubleshooting

**Q: "Cannot connect to Supabase"**
- Check .env.local has correct URL and key
- Paste exact values (no extra spaces)

**Q: "Products not showing"**
- Add products in Inventory page first
- Use unique barcodes

**Q: "UPI QR not working"**
- Set UPI ID in Settings
- Check amount > 0

**Q: "Login not working"**
- Verify email is correct
- Check password (case-sensitive)

**Q: "Stock not updating"**
- Check database connection
- Verify invoice was created successfully

---

## 📚 What's Next?

1. **Add your real store data**
   - Products and prices
   - Customer list
   - Tax settings

2. **Configure Settings**
   - Store name and address
   - GST number
   - UPI payment ID
   - Invoice prefix

3. **Start selling!**
   - Use Billing page for daily sales
   - Track in Invoices page
   - View analytics in Reports

4. **Customize**
   - Change colors (tailwind.config.ts)
   - Add logo in AppHeader
   - Modify product categories

---

## 🚢 Ready to Deploy?

### Vercel (Easiest)
```bash
# Push to GitHub
# Connect repo to Vercel
# Add env variables
# Deploy with one click
```

### Docker
```bash
docker build -t bizflow-pos .
docker run -p 5173:5173 bizflow-pos
```

### Any Node.js Host
```bash
npm run build
# Upload dist/ folder
```

---

## 💡 Pro Tips

✅ Regular backups via Supabase dashboard
✅ Use strong passwords for accounts
✅ Test with sample data first
✅ Monitor low stock alerts
✅ Review sales reports weekly
✅ Keep UPI ID updated

---

**You're all set! 🎊**

For detailed docs, check `SETUP_GUIDE.md`

Have questions? Check the troubleshooting section or create an issue on GitHub.

Happy selling! 📊💰
