# AssetHub — Asset Management System (Testing Guide)

AssetHub is a full-stack asset booking and allocation platform. Employees browse available company assets, request bookings, and track their reservations. Administrators manage inventory, approve requests, issue and return items, and monitor system activity through an analytics dashboard.

This repository contains the complete environment configured to talk to a **live database cluster backend**. Follow the steps below to build, run, and review the web application on your local machine.

##  Prerequisites for Testing

Before running the application, please ensure your computer has the following tools installed:

1. **Git:** To download the codebase.
2. **Docker Desktop:** This handles all the installation and server setup for you. You can download it at [docker.com](https://www.docker.com/products/docker-desktop/).
   *  **Crucial:** You must actually open the Docker Desktop application and let it run in the background before typing any commands!

---

##  Step-by-Step Setup Instructions

### Step 1: Download the Project
Open your computer's terminal (or Command Prompt / PowerShell on Windows), navigate to where you want to save the project, and run these commands:

```bash
git clone https://github.com/Pranav-afk-ctrl/AssetHub.git
cd frontend
```

### Step 2: Start the Server
Now, let Docker do the heavy lifting. In your terminal (make sure you are inside the `frontend` folder), run:

```bash
docker compose up --build
```
*Wait a few moments. When you see a green message saying something like `VITE ready in 1200 ms`, the app is live!*

### Step 3: Open the Application
Open Google Chrome or Firefox and navigate to:
 **http://localhost:5173**

*(Leave the terminal running in the background while you test. When you are completely finished testing, click into the terminal and press `Ctrl + C` to shut the server down).*

---

##  Test Accounts & Credentials

To test the different experiences without needing to set up a database or confirm emails, use these pre-configured accounts:

###  Administrator Account
Use this to bypass security constraints, grant complete administrative control to manage inventory, approve or reject requests, and view analytics.
* **Email:** `admintester@gmail.com`
* **Password:** `admin@123`  
***(Use exactly these for admin login)***

###  Standard Employee Account

* Use your email id to register a new standard user account and login using the same

---

##  Troubleshooting

If the app isn't loading, check this list:

* **Error: "Cannot connect to the Docker daemon"**
  * **The Fix:** You forgot to open the Docker Desktop app! Open it, wait for the icon to turn green ("Engine Running"), and try the terminal command again.
* **Error: "Address already in use" or "Failed to bind port 5173"**
  * **The Fix:** You have another server running in the background taking up the port. Type `docker compose down` to clear any ghost containers, or simply restart your computer and try again.
* **Browser says: "Unable to connect" or "Site cannot be reached"**
  * **The Fix:** Modern browsers will sometimes aggressively auto-correct your address to `https://localhost:5173`. Because this is a local server, it does not have an HTTPS security certificate. Click into your address bar and delete the "s". It must be exactly `http://`.
* **Browser shows a giant wall of red text (React Error Boundary)**
  * **The Fix:** This means your `.env` file is missing or named incorrectly. Double-check that it is named `.env` (not `.env.txt`) and that you included the `VITE_SUPABASE_PUBLISHABLE_KEY` exactly as shown in Step 2. If you change the `.env` file, you must stop the terminal (`Ctrl + C`) and run `docker compose up --build` again to apply the changes.

---

##  Features & Tech Stack

### Tech Stack
* **Frontend:** React 19, TypeScript, Vite 7
* **Routing / SSR:** TanStack Router, TanStack Start
* **Backend / DB:** Supabase Cloud (PostgreSQL, Real Auth, RLS)
* **Styling:** Tailwind CSS 4, shadcn/ui, Radix UI
* **Charts & Tools:** Recharts, qrcode.react, Docker Compose

### Core Features
- **Role-Based Access:** Separate user and admin experiences with RLS policies.
- **Asset Catalog & Booking:** Browse active assets, filter by category, and request items with specific quantities and dates.
- **Atomic Approvals:** `approve_booking` RPC safely decrements inventory and logs audit entries in one secure transaction.
- **Overdue Detection:** Issued bookings past their due date are automatically highlighted.
- **Admin Dashboard:** Full CRUD operations for asset inventory and pending approval queues.
- **Analytics:** Stats row, top assets chart, booking status pie chart, and 30-day trend lines.
- **QR Generation:** Auto-generated, downloadable JSON payload QR codes for physical asset tagging.
- **Audit Logs:** Complete admin activity feed tracking every system action.