# 📊 ProfitTracker — eCommerce Order Profitability Tracker

> Track every rupee. Know your real profit from Flipkart orders.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://profit-tracker-frontend-cyan.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-purple?style=for-the-badge&logo=railway)](https://profit-tracker-backend-production.up.railway.app/api/health)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

---

## ✨ Features

- 🔐 **Auth** — Secure email/password login with JWT
- 📤 **Upload Reports** — Pickup CSV + Flipkart Settlement Excel
- 🔗 **Auto Matching** — Orders matched by Order Item ID automatically
- 💰 **Profit Calculation** — Bank Settlement − Purchase Price
- ⚠️ **Smart SKU Alerts** — Detects SKUs with missing prices instantly
- 📊 **Dashboard** — Profit & revenue charts, summary cards
- 📋 **Orders Table** — Search, filter by date, sort by profit
- 🟢🔴 **Visual Highlights** — Green = profit, Red = loss
- ⬇️ **Export** — Download profit report as Excel/CSV
- 🏷️ **SKU Management** — Add/edit/delete prices, bulk upload CSV

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Recharts, Axios |
| **Backend** | Node.js, Express |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT (JSON Web Tokens) |
| **File Parsing** | XLSX (SheetJS) |
| **Deployment** | Vercel (frontend) + Railway (backend + DB) |

---

## 📂 Project Structure

```
profitability-tracker/
├── backend/
│   ├── middleware/auth.js        ← JWT protection
│   ├── prisma/schema.prisma      ← Database models
│   ├── routes/
│   │   ├── auth.js              ← Login / Signup
│   │   ├── dashboard.js         ← Summary + Charts API
│   │   ├── orders.js            ← Orders table + Export
│   │   ├── sku.js               ← SKU CRUD + Missing detection
│   │   └── upload.js            ← File upload + Processing
│   ├── utils/
│   │   ├── fileParser.js        ← CSV/Excel parser
│   │   └── matcher.js           ← Match + Profit calculator
│   └── server.js                ← Express entry point
│
└── frontend/
    └── src/
        ├── components/layout/   ← Sidebar navigation
        ├── pages/
        │   ├── Login.js         ← Auth pages
        │   ├── Dashboard.js     ← Charts + Summary
        │   ├── Upload.js        ← File upload UI
        │   ├── Orders.js        ← Orders table
        │   └── SKUPricing.js    ← SKU management
        └── utils/
            ├── api.js           ← Axios with JWT
            └── AuthContext.js   ← Auth state
```

---

## 📋 Report Format

### Pickup Report (CSV)
| Column | Description |
|---|---|
| `ORDER ITEM ID` | Unique item ID **(Join Key)** |
| `Order Id` | Order ID |
| `SKU` | Product SKU code |
| `Dispatch by date` | Dispatch date |

### Settlement Report (Flipkart Excel → Orders Sheet)
| Column | Description |
|---|---|
| `Order item ID` (col 7) | **(Join Key)** |
| `Order ID` (col 6) | Order ID |
| `Bank Settlement Value` (col 2) | Amount received |
| `Payment Date` (col 1) | Settlement date |

### Profit Formula
```
Profit = Bank Settlement − Purchase Price
```

---

## 🚀 Local Setup

### Prerequisites
- [Node.js](https://nodejs.org) v18+
- [PostgreSQL](https://www.postgresql.org/download/) v14+

### 1. Setup Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/profitability_tracker"
JWT_SECRET="your-secret-key-here"
PORT=5001
FRONTEND_URL="http://localhost:3000"
NODE_ENV=development
```

```bash
npx prisma generate
npx prisma db push
npm run dev
# ✅ Server running at http://localhost:5001
```

### 2. Setup Frontend

```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:5001/api" > .env
npm start
# ✅ Opens http://localhost:3000
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub → Import on [vercel.com](https://vercel.com)
2. Add env variable: `REACT_APP_API_URL = https://your-railway-url.up.railway.app/api`
3. Deploy ✅

### Backend → Railway
1. Push to GitHub → New project on [railway.app](https://railway.app)
2. Add PostgreSQL plugin
3. Add env variables: `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL`
4. Start command: `node server.js`
5. Deploy ✅

---

## 📦 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/dashboard/summary` | Dashboard stats |
| GET | `/api/dashboard/chart/profit` | Profit chart data |
| GET | `/api/dashboard/chart/orders` | Orders chart data |
| POST | `/api/upload/pickup` | Upload pickup report |
| POST | `/api/upload/settlement` | Upload settlement report |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/export` | Export as Excel |
| GET | `/api/sku` | List SKUs |
| GET | `/api/sku/missing` | SKUs with no price |
| POST | `/api/sku` | Add/update SKU |
| PUT | `/api/sku/:id` | Edit SKU price |
| DELETE | `/api/sku/:id` | Delete SKU |
| POST | `/api/sku/bulk` | Bulk upload SKU prices |

---

## 🗃️ Database Schema

```prisma
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String
  skus     SKU[]
  orders   Order[]
}

model SKU {
  id            Int    @id @default(autoincrement())
  skuId         String
  purchasePrice Float
  userId        Int
}

model Order {
  id             Int       @id @default(autoincrement())
  orderItemId    String    // JOIN KEY
  orderId        String?
  skuId          String?
  dispatchDate   DateTime?
  bankSettlement Float?
  paymentDate    DateTime?
  purchasePrice  Float?
  profit         Float?
  hasPickup      Boolean
  hasSettlement  Boolean
  isMatched      Boolean
  userId         Int
}
```

---

## 💰 Hosting Cost

| Service | Cost |
|---|---|
| Vercel (Frontend) | **₹0/month** |
| Railway (Backend + DB) | **~₹420/month** |
| Local machine | **₹0 forever** |

---

## 👤 Author

**Akshit** — [@Akshit0091](https://github.com/Akshit0091)

---

<div align="center">
  <strong>Built for Flipkart sellers who want to know their real profit 📈</strong>
</div>
