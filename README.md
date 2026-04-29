# AgroLink — Farm-to-Consumer Marketplace

A premium marketplace connecting independent European farms directly with consumers.

## Quick Start

```bash
cd agrolink
npm run install:all   # Install all dependencies (root + server + client)
npm run dev           # Start both server and client
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| 🌾 Farmer | marko@novakfarm.si | password123 |
| 🌾 Farmer | ana@horvat.si | password123 |
| 🌾 Farmer | josef@mayer.at | password123 |
| 🛒 Consumer | test@consumer.com | password123 |

## Stripe Setup (Optional)

The app runs in **demo mode** without Stripe keys — payments are simulated.

To enable real Stripe payments:

1. Create a free account at [stripe.com](https://stripe.com)
2. Copy your **test** keys from the Dashboard
3. Update `server/.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_your_actual_key
   ```
4. Update `client/.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
   ```
5. Use test card: `4242 4242 4242 4242` · Any future date · Any CVC

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Fonts:** Playfair Display (headings) + DM Sans (body)
- **Backend:** Node.js + Express
- **Database:** SQLite (better-sqlite3) — no setup required
- **Auth:** JWT stored in localStorage
- **Payments:** Stripe (test mode)
- **File Uploads:** Multer

## Features

- 🌾 Farmer dashboard with product + order management
- 🛒 Full marketplace with filtering, search, pagination
- 💳 Stripe checkout (or demo mode)
- 📦 Order tracking with status updates
- 🔐 Role-based auth (farmer vs consumer)
- 📱 Fully mobile responsive
- 🎨 Organic luxury design system
