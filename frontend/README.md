# SmartTracker — Budget & Expense Frontend

A minimal, modern React frontend for the Smart Budget & Expense Tracker backend.

## Tech Stack
- **React 18** (Vite)
- **Tailwind CSS** — custom dark theme with sage green accent
- **Axios** — API layer with JWT interceptors
- **React Router DOM v6** — protected routing
- **Recharts** — pie + bar charts

## Project Structure

```
src/
  components/
    ProtectedRoute.jsx   — redirects unauthenticated users
    Navbar.jsx           — sticky header with user info + logout
    Spinner.jsx          — loading indicator
    ErrorAlert.jsx       — dismissible error banner
    StatCard.jsx         — metric display card
    BudgetProgress.jsx   — animated progress bar + warnings
    AddExpenseForm.jsx   — validated expense form
    ExpenseList.jsx      — per-expense rows with delete
    ExpenseChart.jsx     — pie / bar chart toggle (Recharts)
    categories.js        — category list, colors, icons
  pages/
    Login.jsx            — JWT login form
    Register.jsx         — registration with budget input
    Dashboard.jsx        — main app view
  context/
    AuthContext.jsx      — global auth state + helpers
  services/
    api.js               — Axios instance with auth interceptor
  App.jsx                — BrowserRouter + route definitions
  main.jsx               — React entry point
  index.css              — Tailwind + custom design tokens
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

Make sure your backend is running at `http://localhost:5000/smarttracker`.

## Features
- ✅ JWT login & registration with persistent sessions (localStorage)
- ✅ Protected routes — auto-redirect to /login if not authenticated
- ✅ Dashboard with stat cards (budget / spent / remaining)
- ✅ Animated budget progress bar with danger/warning states
- ✅ Add expense with category picker, amount, and optional note
- ✅ Delete expense with per-row loading state
- ✅ Category-wise charts (pie + bar toggle) via Recharts
- ✅ Loading states + dismissible error messages everywhere
- ✅ Auto-logout on 401 Unauthorized from backend
- ✅ Fully responsive layout (mobile + desktop)
