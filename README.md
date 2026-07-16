# CarePulse Frontend Client

The frontend client for the CarePulse Healthcare Dashboard is a Single Page Application (SPA) built using React, Vite, and Tailwind CSS. It connects to the Node.js API server to provide interactive patient dashboards and administrative interfaces.

---

## 🚀 Local Setup & Installation

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed on your system.

### 2. Install Package Dependencies
Navigate into the `frontend` directory and install the packages:
```bash
cd frontend
npm install
```

### 3. Configure Local Environment Variables
Create a file named `.env` in the root of the `frontend/` directory to point the React client to your local development backend:
```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Launch Development Server
Start the Vite local development server:
```bash
npm run dev
```
*   Vite will spin up the server (usually on **`http://localhost:5173`** or **`http://localhost:5174`** if `5173` is busy).
*   Open the link in your browser to verify the login interface.

---

## 🌐 Vercel Production Deployment

The project is pre-configured with a **`vercel.json`** file at the root of the `frontend/` directory to handle React Router client-side pathing rewrites.

### Steps to Deploy:
1.  Connect your GitHub repository to **Vercel**.
2.  Set the **Root Directory** setting to `frontend` in your Vercel project settings.
3.  Configure the **Environment Variables** in Vercel:
    *   `VITE_API_URL` = `https://healthcare-back-9fqc.onrender.com/api` (Points to your live Render backend API URL).
4.  Vercel will build the production bundle (`npm run build`) and host the site at your custom domain: **`https://health-care-front.vercel.app`**.

---

## 📂 Key Directory Outline

*   `/src/components`: Reusable layout layouts (Navbar, ProtectedRoute wrapper).
*   `/src/context`: AuthContext session provider (stores tokens and active user profiles).
*   `/src/pages`: 
    *   `Login.jsx` (Form wrapper with demo login credentials).
    *   `UserDashboard.jsx` (Metric card dashboard with biological indicators).
    *   `AdminDashboard.jsx` (Search filters, paginated grids, drag-and-drop CSV parser, and patient registration modals).
*   `/src/services/api.js`: Centralized Axios HTTP controller mapping authorization header interceptors.
