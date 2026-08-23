# 🏪 Sadguru Mart - Smart Inventory Management System

A complete, modern, responsive full-stack **Inventory, POS Billing, Stock & Profit Management System** designed for local shopkeepers and retail stores.

---

## ⚡ Quick Start (Double-Click to Run - No Antigravity or VS Code Needed)

You can run the entire system directly from Windows File Explorer without opening any code editor:

### 1. Start the Application
- Open the project folder.
- **Double-click `START.bat`**.
- It will automatically:
  1. Check Node.js and npm.
  2. Install missing dependencies if needed.
  3. Start the backend API server (`http://localhost:5000`) in its own window.
  4. Start the frontend Vite server (`http://localhost:3000`) in its own window.
  5. Automatically launch your default web browser to `http://localhost:3000`.

### 2. Stop the Application
- **Double-click `STOP.bat`** whenever you want to close both frontend and backend servers safely.

---

## 🖥️ Create a Windows Desktop Shortcut

To launch Sadguru Mart directly from your Windows Desktop like a standard desktop application:

### Option A: One-Click Generator (Easiest)
- Double-click **`CREATE_SHORTCUT.bat`** in the project folder.
- A shortcut named **`Inventory Management System`** will appear on your desktop.

### Option B: Manual Creation
1. Right-click on **`START.bat`** in this folder.
2. Select **Show more options** (on Windows 11) → **Send to** → **Desktop (create shortcut)**.
3. Rename the shortcut on your desktop to **`Inventory Management System`**.
4. *(Optional)* Right-click the shortcut → **Properties** → **Change Icon...** to pick a custom store icon.

---

## 🔑 Pre-Seeded Demo Login Credentials

The system comes pre-seeded with realistic grocery & retail inventory items:

### 1. Shopkeeper Account (Store POS & Inventory)
- **URL**: [http://localhost:3000/login](http://localhost:3000/login)
- **Email**: `shopkeeper@sadgurumart.com`
- **Password**: `Shop@123`

### 2. Second Shopkeeper Account (Multi-Tenant Test Store)
- **URL**: [http://localhost:3000/login](http://localhost:3000/login)
- **Email**: `ganesh@sadgurumart.com`
- **Password**: `Shop@123`

### 3. Super Administrator Account (Platform Admin Portal)
- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Email**: `admin@sadgurumart.com`
- **Password**: `Admin@123`

---

## 📋 System Requirements & First-Time Setup

1. **Node.js LTS** (v18 or newer):
   - Download & install from: [https://nodejs.org/](https://nodejs.org/)
2. **MongoDB Database (Optional)**:
   - **Standalone Embedded Mode**: If you do not have MongoDB installed, the application automatically launches an embedded memory database fallback for instant plug-and-play operation.
   - **Local MongoDB**: `mongodb://127.0.0.1:27017/sadguru_mart`
   - **MongoDB Atlas Cloud**: Paste your MongoDB connection URI into `backend/.env`.
3. **Environment Configuration**:
   - `START.bat` will automatically copy `.env.example` to `backend/.env` if not present.
   - You can edit `backend/.env` to configure your custom port or MongoDB Atlas URI:
     ```env
     PORT=5000
     NODE_ENV=development
     MONGODB_URI=mongodb://127.0.0.1:27017/sadguru_mart
     JWT_SECRET=your_secret_key
     JWT_EXPIRE=30d
     ```

---

## 🛠️ Manual Startup Commands (For Developers / VS Code)

If you prefer to run manually in a terminal or VS Code:

### Backend:
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

### Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

### Re-seed Sample Data:
```bash
cd backend
npm run seed
```

---

## 📁 Project Structure

```
inventory-management-system/
│
├── START.bat                  # One-click Windows startup script
├── STOP.bat                   # Safe server shutdown script
├── CREATE_SHORTCUT.bat        # Desktop shortcut creator utility
├── README.md                  # Documentation & user manual
├── .env.example               # Root configuration template
├── package.json               # Root scripts
│
├── backend/                   # Node.js + Express API server
│   ├── config/                # Database connection & fallback
│   ├── controllers/           # Business logic (Auth, POS, Inventory, etc.)
│   ├── middleware/            # JWT auth, RBAC & error handlers
│   ├── models/                # Mongoose database models
│   ├── routes/                # Express API endpoints
│   ├── seeders/               # Indian FMCG demo grocery dataset
│   ├── .env.example           # Backend environment template
│   ├── package.json           # Backend dependencies & npm scripts
│   └── server.js              # Server entry point
│
└── frontend/                  # React 18 + Vite Web Application
    ├── src/
    │   ├── components/        # UI elements, POS Invoice modal, Language selector
    │   ├── context/           # AuthContext, LanguageContext (10 Indian languages)
    │   ├── pages/             # Dashboard, POS, Products, Inventory, Reports, Admin
    │   ├── services/          # Axios API communication layer
    │   ├── translations/      # 10 Indian language dictionaries
    │   └── utils/             # ₹ currency formatters, CSV/PDF export helpers
    ├── package.json           # Frontend dependencies & npm scripts
    └── vite.config.js         # Vite configuration (port 3000 & API proxy)
```

---

## 🌟 Key Features

- 🏬 **Multi-Tenant Shop Data Isolation**: Every shopkeeper has an independent, private store workspace.
- 🌐 **10 Indian Languages**: English, Marathi, Hindi, Gujarati, Bengali, Tamil, Telugu, Kannada, Malayalam, and Punjabi.
- ⚡ **POS Billing Terminal**: Fast point-of-sale checkout, instant stock decrement, barcode search, and printable invoices.
- 💰 **Profit & Loss Tracking**: True P&L calculations factoring selling price, purchase cost, and operating overheads.
- 📊 **Visual Analytics**: Interactive stock health charts, 7-day revenue/profit breakdown, and low-stock alerts.
- 👑 **Super Admin Dashboard**: Track registered stores, platform activity logs, and system metrics.

---

## 📄 License
MIT License. Built for local retailers and modern businesses.
>>>>>>> 84b31c2 (feat: complete Sadguru Mart Smart Inventory Management System)
