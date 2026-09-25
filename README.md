# KhataEase - Digital Khata & Quick Billing

"Diary band. Khata shuru." 

KhataEase is a modern, mobile-first web application designed for Indian shopkeepers to replace their paper diaries. It allows merchants to track customer balances (Udhaar), generate bills with instant UPI QR codes, and collect payments faster via WhatsApp reminders.

## Features

- **Customer Management**: Add and track customers and their pending udhaar.
- **Smart Billing**: Generate bills (itemized or lump-sum).
- **Instant UPI QR**: Every pending bill gets a unique, exact-amount UPI QR code linked to the shopkeeper's UPI ID.
- **Ledger System (Khata)**: Double-entry-like ledger. Bills increase customer balance, payments decrease it.
- **Public Bill View**: Send a unique link to customers to view their bill and pay via QR without logging in.
- **WhatsApp Reminders**: 1-tap WhatsApp sharing with pre-filled messages (Pro feature).
- **Dashboard Analytics**: Track daily sales, monthly collections, and top owing customers.
- **Razorpay Integration**: Upgrade to the Pro plan seamlessly using Razorpay (Test mode enabled).
- **Mobile-First Design**: Optimized for mobile browsers with a bottom navigation bar and native-like feel.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Framer Motion
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: Custom JWT in HttpOnly Cookies
- **Payments**: Razorpay Node SDK
- **Utilities**: Zod (Validation), Recharts (Charts), qrcode (UPI QR Generation)

## Architecture & Ledger Explanation

KhataEase uses a simplified ledger system to maintain exact customer balances.
- **Money Handling**: All money values (prices, totals, balances) are stored and calculated in **paise (integers)** to avoid floating-point inaccuracies. Display values are divided by 100.
- **Ledger Entries**:
  - `type: "BILL"`: Increases a customer's pending balance.
  - `type: "PAYMENT"`: Decreases a customer's pending balance.
- **Balance Calculation**: A customer's current balance is calculated on-the-fly by summing their ledger entries (`BILL` amount - `PAYMENT` amount).

## How Payments Work

1. **UPI QR Codes (Free & Pro)**: When a bill is generated, KhataEase uses standard UPI deep linking (`upi://pay?pa=...`) to generate a QR code. Customers scan this QR to pay directly to the shopkeeper's bank account. Zero transaction fees.
2. **App Upgrades (Razorpay)**: Shopkeepers can upgrade to the "PRO" plan (₹199/month) to unlock unlimited limits and WhatsApp reminders. This uses the Razorpay payment gateway in Test Mode.

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up Environment Variables**:
   Copy `.env.example` to `.env` and fill in the values.
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_jwt_secret_key_here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   # Razorpay Credentials (Test mode)
   RAZORPAY_KEY_ID="rzp_test_xxxxxx"
   RAZORPAY_KEY_SECRET="xxxxxx"
   RAZORPAY_WEBHOOK_SECRET="whsec_xxxxxx"
   ```
4. **Push Database Schema**:
   ```bash
   npm run db:push
   ```
5. **(Optional) Seed Database**:
   ```bash
   npm run db:seed
   ```
6. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Deployment (Vercel)

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Set the Environment Variables (`DATABASE_URL`, `JWT_SECRET`, etc.) in Vercel settings.
   - *Note: Since SQLite is file-based and ephemeral on Vercel, it is highly recommended to change `DATABASE_URL` to a hosted PostgreSQL database (like Supabase, Neon, or Vercel Postgres) for production.*
4. Deploy! Next.js and Prisma build steps are automatically configured in `package.json`.

## Manual Test Checklist

- [ ] **Signup**: Create a new account, ensure phone validation works, verify dashboard redirects.
- [ ] **Add Customer**: Add a customer (try hitting the 15 limit on free plan to see the upgrade modal).
- [ ] **Create Bill**: Go to "New Bill", add items, save. Verify the generated bill shows the exact amount and a UPI QR.
- [ ] **Partial Payment**: Record a partial payment on the bill. Check that the remaining balance updates on the QR code and ledger.
- [ ] **Dashboard**: Verify the Total Udhaar, Today's Sales, and Month's Collection reflect the new bill and payment.
- [ ] **Razorpay Upgrade**: Go to Billing, click Upgrade, complete the Razorpay test flow, and ensure the plan updates to PRO.
